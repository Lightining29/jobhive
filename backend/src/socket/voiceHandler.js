/**
 * Voice AI Socket event handler.
 * Wires socket events → intent detection → existing job services → LLM → TTS.
 *
 * Events received  (client → server):
 *   voice:transcript   { text, sessionId }          – text from browser STT
 *   voice:chat         { text, sessionId }           – plain text message
 *   voice:clear        { sessionId }                 – reset conversation
 *   voice:context      { sessionId, jobId?, page? }  – set page context
 *
 * Events emitted   (server → client):
 *   voice:thinking                                   – LLM processing started
 *   voice:token        { token }                     – streaming LLM token
 *   voice:done         { text, jobs?, stats?, intent }  – complete response
 *   voice:error        { message }                   – error
 */

const memoryService = require('../services/voice/memory.service');
const intentService = require('../services/voice/intent.service');
const jobSearchService = require('../services/voice/jobSearch.service');
const llmService = require('../services/voice/llm.service');
const { parseNaturalQuery } = require('../services/semanticSearch.service');
const logger = require('../config/logger');
const Application = require('../models/Application');

// Per-socket rate limiting (30 messages / minute)
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 30;

function voiceHandler(socket, io) {
  const socketState = {
    pageContext: { page: 'home', jobId: null },
    rateBucket: [],
    processing: false,         // guard against concurrent requests
    lastText: '',              // deduplicate rapid duplicate sends
  };

  // ── Rate limiter ────────────────────────────────────────────────────────────
  function isRateLimited() {
    const now = Date.now();
    socketState.rateBucket = socketState.rateBucket.filter(
      (ts) => now - ts < RATE_WINDOW_MS
    );
    if (socketState.rateBucket.length >= RATE_MAX) return true;
    socketState.rateBucket.push(now);
    return false;
  }

  // ── Page context update ─────────────────────────────────────────────────────
  socket.on('voice:context', ({ page, jobId } = {}) => {
    socketState.pageContext = { page: page || 'home', jobId: jobId || null };
  });

  // ── Clear conversation ──────────────────────────────────────────────────────
  socket.on('voice:clear', ({ sessionId } = {}) => {
    const userId = socket.user?._id?.toString() || socket.id;
    const sid = sessionId || 'default';
    memoryService.deleteConversation(userId, sid);
    socket.emit('voice:cleared');
  });

  // ── Main message handler (text from browser STT or typed text) ──────────────
  async function handleMessage({ text, sessionId } = {}) {
    if (!text || typeof text !== 'string') return;

    const sanitised = text.trim().slice(0, 500);
    if (!sanitised) return;

    // Deduplicate — ignore identical message sent within 1s (double-tap prevention)
    if (sanitised === socketState.lastText && Date.now() - (socketState.lastTextTs || 0) < 1000) return;
    socketState.lastText = sanitised;
    socketState.lastTextTs = Date.now();

    // Prevent concurrent processing on the same socket
    if (socketState.processing) {
      socket.emit('voice:error', { message: 'Still processing previous request. Please wait.' });
      return;
    }

    if (isRateLimited()) {
      socket.emit('voice:error', { message: 'Too many messages. Please slow down.' });
      return;
    }

    socketState.processing = true;
    const userId = socket.user?._id?.toString() || socket.id;
    const sid = sessionId || 'default';
    const user = socket.user || null;

    // Store user message
    memoryService.addMessage(userId, sid, 'user', sanitised);

    // Signal thinking state to client
    socket.emit('voice:thinking');

    try {
      // ── 1. Intent + entity detection ──────────────────────────────────────
      const { intent, entities } = intentService.detectIntent(sanitised);

      // ── 2. Retrieve memory context ────────────────────────────────────────
      const memCtx = memoryService.getMemoryContext(userId, sid);
      const memPrompt = memoryService.buildMemoryPrompt(userId, sid);

      // ── 3. Build conversation history for LLM (last 8 turns) ─────────────
      const history = memCtx.recentMessages
        .slice(-8)
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      // ── 4. Fetch real data based on intent ────────────────────────────────
      let contextData = null;
      let parsedQuery = null;

      switch (intent) {
        case 'job_search': {
          const lastSearch = memCtx.searchHistory[memCtx.searchHistory.length - 1]?.params || {};
          const baseQuery = intentService.buildSearchQuery(intent, entities, {
            lastSearch,
            memoryContext: memCtx,
          });
          try {
            parsedQuery = await parseNaturalQuery(sanitised);
          } catch (_) {
            parsedQuery = {};
          }
          const mergedQuery = { ...baseQuery, ...parsedQuery, scope: baseQuery.scope || parsedQuery.scope };
          const results = await jobSearchService.searchJobs(mergedQuery, user);
          memoryService.addSearchContext(userId, sid, mergedQuery, results);
          contextData = {
            type: 'jobs',
            jobs: results.jobs.slice(0, 5),
            total: results.total,
            stats: await buildSalaryStats(results.jobs),
            query: mergedQuery,
            parsedQuery,
          };
          break;
        }

        case 'job_detail': {
          const jobId = socketState.pageContext.jobId || entities.jobId;
          if (jobId) {
            const job = await jobSearchService.getJobDetails(jobId);
            if (job) {
              memoryService.addViewedJob(userId, sid, String(jobId));
              contextData = { type: 'job_detail', job };
            }
          }
          break;
        }

        case 'company_info': {
          const jobId = socketState.pageContext.jobId;
          let company = null;
          if (jobId) {
            const job = await jobSearchService.getJobDetails(jobId);
            if (job?.companyId) {
              company = await jobSearchService.getCompanyInfo(String(job.companyId));
            } else if (job?.companyName) {
              company = await jobSearchService.getCompanyByName(job.companyName);
            }
          } else if (entities.company) {
            company = await jobSearchService.getCompanyByName(entities.company);
          } else if (entities.skills?.length) {
            company = await jobSearchService.getCompanyByName(entities.skills[0]);
          }
          if (company) contextData = { type: 'company', company };
          break;
        }

        case 'recommendation': {
          if (user) {
            try {
              parsedQuery = await parseNaturalQuery(sanitised);
            } catch (_) {
              parsedQuery = {};
            }
            const baseQuery = intentService.buildSearchQuery('job_search', entities, { memoryContext: memCtx });
            const mergedQuery = { ...baseQuery, ...parsedQuery, sort: 'relevance', limit: '5' };
            const results = await jobSearchService.searchJobs(mergedQuery, user);
            contextData = {
              type: 'recommendations',
              jobs: results.jobs.slice(0, 5),
              total: results.total,
              query: mergedQuery,
              parsedQuery,
            };
          }
          break;
        }

        case 'salary_insight': {
          const baseQuery = intentService.buildSearchQuery('job_search', entities, {});
          try {
            parsedQuery = await parseNaturalQuery(sanitised);
          } catch (_) {
            parsedQuery = {};
          }
          const mergedQuery = { ...baseQuery, ...parsedQuery };
          const stats = await jobSearchService.getJobStats(mergedQuery);
          contextData = { type: 'salary_stats', stats, query: mergedQuery, parsedQuery };
          break;
        }

        case 'saved_jobs': {
          if (user) {
            contextData = {
              type: 'saved_jobs',
              message: `You have ${user.savedJobs?.length || 0} saved jobs.`,
            };
          }
          break;
        }

        case 'applications': {
          if (user) {
            const appCount = await Application.countDocuments({ candidate: user._id });
            contextData = { type: 'applications', count: appCount };
          }
          break;
        }

        case 'resume_build': {
          contextData = {
            type: 'resume_build',
            link: '/candidate/resume',
            tab: 'builder',
          };
          break;
        }

        case 'ats_score': {
          contextData = {
            type: 'ats_score',
            link: '/candidate/resume',
            tab: 'ats',
          };
          break;
        }

        case 'resume_help': {
          contextData = {
            type: 'resume_help',
            link: '/candidate/resume',
          };
          break;
        }

        default:
          break;
      }

      // ── 5. Build prompt for LLM ───────────────────────────────────────────
      const dataBlock = buildDataBlock(intent, contextData, entities, user, socketState.pageContext);
      const userMessage = buildUserPrompt(sanitised, intent, dataBlock, memPrompt);

      // ── 6. Stream LLM response ────────────────────────────────────────────
      let fullResponse = '';
      let llmFailed = false;

      // Helper — only emit if socket is still connected
      const safeEmit = (event, data) => {
        if (socket.connected) socket.emit(event, data);
      };

      try {
        fullResponse = await llmService.generateStreamingResponse(
          [...history, { role: 'user', content: userMessage }],
          (token) => {
            safeEmit('voice:token', { token });
          },
          { maxTokens: 120 }
        );
      } catch (llmErr) {
        llmFailed = true;
        logger.warn('[voice] LLM unavailable — using data-aware fallback', {
          message: llmErr.message,
          provider: llmService.USE_QWEN_API ? 'qwen-api' : 'ollama',
        });
      }

      // If LLM failed or returned nothing, build a smart data-aware response
      if (llmFailed || !fullResponse.trim()) {
        fullResponse = buildSmartFallback(intent, contextData, sanitised, user);
        const words = fullResponse.split(' ');
        for (const word of words) {
          safeEmit('voice:token', { token: word + ' ' });
          await new Promise((r) => setTimeout(r, 18));
        }
      }

      // Store assistant message
      memoryService.addMessage(userId, sid, 'assistant', fullResponse, { intent });

      // ── 7. Emit final done event ──────────────────────────────────────────
      safeEmit('voice:done', {
        text: fullResponse,
        intent,
        jobs: contextData?.type === 'jobs' || contextData?.type === 'recommendations'
          ? contextData.jobs
          : undefined,
        total: contextData?.total,
        stats: contextData?.stats,
        jobDetail: contextData?.type === 'job_detail' ? contextData.job : undefined,
        company: contextData?.type === 'company' ? contextData.company : undefined,
        link: contextData?.link || undefined,
        linkTab: contextData?.tab || undefined,
        parsedQuery: contextData?.parsedQuery || parsedQuery || undefined,
        rawQuery: contextData?.query || undefined,
      });
    } catch (err) {
      logger.error('[voice] handler error', { message: err.message, stack: err.stack });
      if (socket.connected) {
        socket.emit('voice:error', { message: 'Something went wrong. Please try again.' });
      }
    } finally {
      socketState.processing = false;
    }
  }

  socket.on('voice:transcript', handleMessage);
  socket.on('voice:chat', handleMessage);
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildSalaryStats(jobs) {
  const withSalary = jobs.filter((j) => j.salaryMax > 0);
  if (!withSalary.length) return null;
  const avg =
    withSalary.reduce((s, j) => s + (j.salaryMax || j.salaryMin || 0), 0) / withSalary.length;
  const max = Math.max(...withSalary.map((j) => j.salaryMax || 0));
  const min = Math.min(...withSalary.map((j) => j.salaryMin || j.salaryMax || 0).filter(Boolean));
  return { avg: Math.round(avg), max, min };
}

function formatParsedQuery(pq) {
  if (!pq || Object.keys(pq).length === 0) return '';
  const parts = [];
  if (pq.search) parts.push(`Role: "${pq.search}"`);
  if (pq.skills) parts.push(`Skills: ${pq.skills}`);
  if (pq.workMode) parts.push(`Mode: ${pq.workMode}`);
  if (pq.employmentType) parts.push(`Type: ${pq.employmentType}`);
  if (pq.experience) parts.push(`Experience: ${pq.experience}`);
  if (pq.city) parts.push(`City: ${pq.city}`);
  if (pq.country) parts.push(`Country: ${pq.country}`);
  if (pq.company) parts.push(`Company: ${pq.company}`);
  if (pq.salaryMin) parts.push(`Min salary: ${pq.salaryMin}`);
  if (pq.category) parts.push(`Category: ${pq.category}`);
  if (pq.sort) parts.push(`Sort: ${pq.sort}`);
  if (pq.scope) parts.push(`Scope: ${pq.scope}`);
  if (pq.postedWithinDays) parts.push(`Posted within: ${pq.postedWithinDays}d`);
  return parts.length ? `Query understood: ${parts.join(' | ')}` : '';
}

function buildDataBlock(intent, contextData, entities, user, pageCtx) {
  if (!contextData) return '';

  switch (contextData.type) {
    case 'jobs':
    case 'recommendations': {
      const pqStr = formatParsedQuery(contextData.parsedQuery || contextData.query);
      const jobLines = contextData.jobs
        .slice(0, 5)
        .map((j, i) => {
          const sal =
            j.salaryMax > 0
              ? `salary up to ${j.salaryMax.toLocaleString()} ${j.currency || 'USD'}`
              : 'salary not disclosed';
          return `${i + 1}. "${j.jobTitle}" at ${j.companyName} — ${j.workMode || 'onsite'}, ${j.employmentType || 'full-time'}, ${sal}, location: ${j.city || j.country || 'N/A'}`;
        })
        .join('\n');

      const salStr = contextData.stats
        ? `Average salary: ${contextData.stats.avg?.toLocaleString()} ${contextData.jobs[0]?.currency || 'USD'}.`
        : '';

      return `REAL JOB DATA (${contextData.total} total matches)${pqStr ? `\n${pqStr}` : ''}:\n${jobLines}\n${salStr}`;
    }

    case 'job_detail': {
      const j = contextData.job;
      return `CURRENT JOB DETAILS:\nTitle: ${j.jobTitle}\nCompany: ${j.companyName}\nLocation: ${j.city || j.country || j.location}\nMode: ${j.workMode}\nType: ${j.employmentType}\nSkills: ${(j.requiredSkills || []).join(', ')}\nSalary: ${j.salaryMin}–${j.salaryMax} ${j.currency}\nDescription summary: ${String(j.description || '').slice(0, 300)}`;
    }

    case 'company': {
      const c = contextData.company;
      return `COMPANY INFO:\nName: ${c.name}\nIndustry: ${c.industry || 'N/A'}\nSize: ${c.size || 'N/A'}\nHeadquarters: ${c.headquarters || c.city || 'N/A'}\nWebsite: ${c.website || 'N/A'}\nAbout: ${String(c.description || '').slice(0, 300)}`;
    }

    case 'salary_stats': {
      const s = contextData.stats;
      const pqStr = formatParsedQuery(contextData.parsedQuery || contextData.query);
      const avg = s.salary?.avgSalary ? Math.round(s.salary.avgSalary) : 0;
      const min = s.salary?.minSalary || 0;
      const max = s.salary?.maxSalary || 0;
      const med = s.salary?.medianSalary ? Math.round(s.salary.medianSalary) : null;
      return `SALARY DATA${pqStr ? ` — ${pqStr}` : ''}:\nTotal jobs: ${s.total}\nAverage: ${avg}\nMedian: ${med || 'N/A'}\nMin: ${min}\nMax: ${max}`;
    }

    case 'applications': {
      return `USER APPLICATION DATA:\nTotal applications: ${contextData.count}`;
    }

    case 'saved_jobs': {
      return contextData.message;
    }

    case 'resume_build': {
      return `ACTION: User wants to build their resume with AI. Direct them to the Resume Hub — AI Builder tab at ${contextData.link}. It generates a polished resume from their profile automatically.`;
    }

    case 'ats_score': {
      return `ACTION: User wants to check their ATS score. Direct them to the Resume Hub — ATS Optimizer tab at ${contextData.link}. They can paste a job description to see how well their profile matches.`;
    }

    case 'resume_help': {
      return `ACTION: User wants resume help. Direct them to the Resume Hub at ${contextData.link} which has an AI Builder and ATS Optimizer.`;
    }

    default:
      return '';
  }
}

function buildUserPrompt(userText, intent, dataBlock, memPrompt) {
  const parts = [];

  if (memPrompt) parts.push(memPrompt);
  if (dataBlock) parts.push(`\n\nData retrieved from the live database:\n${dataBlock}`);

  parts.push(`\n\nUser said: "${userText}"`);

  const intentHints = {
    job_search:       'State total count and top 1-2 results only. One sentence.',
    salary_insight:   'Give one salary range. One sentence.',
    interview_prep:   'Give one specific tip. One sentence.',
    resume_help:      'Give one actionable fix. One sentence.',
    skill_gap:        'Name the top missing skill. One sentence.',
    learning_roadmap: 'Give next one step only. One sentence.',
    career_coach:     'Give one concrete action. One sentence.',
    job_detail:       'State role, company, and top requirement. One sentence.',
    company_info:     'State what the company does and size. One sentence.',
    recommendation:   'Name top match and why. One sentence.',
    resume_build:     'Tell them to click the button below. One sentence.',
    ats_score:        'Tell them to click the button below. One sentence.',
    greeting:         'Greet by name and ask what they need. One sentence.',
    help:             'List 3 things you can do. One sentence.',
  };

  const hint = intentHints[intent];
  if (hint) parts.push(`\nInstruction: ${hint} No markdown.`);

  return parts.join('');
}

function buildLocalFallback(intent, contextData, user) {
  if (contextData?.type === 'jobs') {
    const count = contextData.total || 0;
    const top = contextData.jobs[0];
    return top
      ? `I found ${count} matching jobs. The top result is "${top.jobTitle}" at ${top.companyName}. Would you like more details?`
      : 'I searched but found no matching jobs right now. Try adjusting your filters.';
  }
  if (intent === 'greeting') {
    return `Hello${user ? ` ${user.name}` : ''}! I'm JobHive AI. Ask me to find jobs, prepare for interviews, review your resume, or explore career paths.`;
  }
  return "I'm processing your request. Please try again in a moment.";
}

/**
 * buildSmartFallback — used when the LLM is offline.
 * Returns a real, data-driven answer using the contextData already fetched from MongoDB.
 * Never returns the generic "AI model is loading" message.
 */
function buildSmartFallback(intent, contextData, userText, user) {
  const name = user?.name ? ` ${user.name.split(' ')[0]}` : '';

  if (contextData?.type === 'jobs' || contextData?.type === 'recommendations') {
    const { jobs = [], total = 0, stats } = contextData;
    if (!jobs.length) return `No matching jobs found — try different keywords or location.`;
    const top = jobs[0];
    const sal = stats?.avg > 0 ? ` Avg salary ${(stats.avg / 100000).toFixed(1)} LPA.` : '';
    return `Found ${total} jobs — top match is ${top.jobTitle} at ${top.companyName} (${top.workMode || 'onsite'}).${sal}`;
  }

  if (contextData?.type === 'job_detail') {
    const j = contextData.job;
    const sal = j.salaryMax > 0 ? ` ${(j.salaryMax / 100000).toFixed(1)} LPA.` : '';
    return `${j.jobTitle} at ${j.companyName} — ${j.workMode || 'onsite'}, skills: ${(j.requiredSkills || []).slice(0, 3).join(', ')}.${sal}`;
  }

  if (contextData?.type === 'company') {
    const c = contextData.company;
    return `${c.name} is a ${c.industry || 'tech'} company based in ${c.headquarters || c.city || 'N/A'}.`;
  }

  if (contextData?.type === 'salary_stats') {
    const s = contextData.stats;
    const avg = s.salary?.avgSalary ? (s.salary.avgSalary / 100000).toFixed(1) : null;
    const max = s.salary?.maxSalary ? (s.salary.maxSalary / 100000).toFixed(1) : null;
    if (avg) return `Average salary is ${avg} LPA, up to ${max} LPA based on ${s.total} live jobs.`;
    return `Found ${s.total} jobs but salary data isn't available for this search.`;
  }

  if (contextData?.type === 'applications') {
    return `You have ${contextData.count} application${contextData.count !== 1 ? 's' : ''} submitted.`;
  }

  if (contextData?.type === 'saved_jobs') {
    return contextData.message;
  }

  if (contextData?.type === 'resume_build') {
    return `Click the button below to open the AI Resume Builder${name}.`;
  }

  if (contextData?.type === 'ats_score') {
    return `Click the button below to open the ATS Optimizer${name} and paste a job description.`;
  }

  if (contextData?.type === 'resume_help') {
    return `Open the Resume Hub below — it has an AI builder and ATS scorer${name}.`;
  }

  const intentResponses = {
    greeting:         `Hello${name}! Ask me to find jobs, check salaries, prep for interviews, or build your resume.`,
    help:             `I can find jobs, give salary data, prep you for interviews, or optimize your resume — just ask.`,
    resume_build:     `Click below to open the AI Resume Builder${name}.`,
    ats_score:        `Click below to check your ATS score against any job description${name}.`,
    resume_help:      `Click below to open the Resume Hub${name}.`,
    interview_prep:   `Prepare STAR-format answers, research the company, and have 2 questions ready for the interviewer.`,
    resume_tips:      `Quantify achievements, match keywords from the job description, and keep it to one page.`,
    skill_gap:        `Ask me to search for jobs in your target role and I'll show exactly what skills are required.`,
    learning_roadmap: `For most dev roles: master the core language first, then one framework, then Git and deployment basics.`,
    career_coach:     `Apply to roles where you meet 70% of requirements and tailor your resume for each one.`,
    salary_insight:   `Ask me "salary for [role] in [city]" and I'll pull real figures from live job listings.`,
  };

  if (intentResponses[intent]) return intentResponses[intent];

  return `Hello${name}! Ask me to find jobs, check salaries, or help with your resume.`;
}

module.exports = voiceHandler;
