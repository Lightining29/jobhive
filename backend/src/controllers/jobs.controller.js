const Job = require('../models/Job');
const Application = require('../models/Application');
const Company = require('../models/Company');
const Notification = require('../models/Notification');
const Report = require('../models/Report');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { paginate, buildPagination, parseSalary, parseArray, parseBool, toObjectId } = require('../utils/query');
const { computeMatchScore } = require('../services/aiRecommendation.service');
const { formatCurrency } = require('../utils/helpers');
const { parseNaturalQuery } = require('../services/semanticSearch.service');
const { fetchAllJobs, cleanupExpiredJobs } = require('../services/jobIngestion.service');

const baseJobFilter = () => ({
  isActive: true,
  isExpired: false,
});

const indiaScopeFilter = () => ({
  $or: [
    { remote: true },
    { country: { $regex: 'india', $options: 'i' } },
    { location: { $regex: 'india', $options: 'i' } },
  ],
});

const applyIndiaScope = (filter, query) => {
  if (query.country) {
    filter.country = new RegExp(query.country, 'i');
  } else if (query.scope === 'india') {
    filter.$and = [...(filter.$and || []), indiaScopeFilter()];
  }
};

const TECH_SYNONYMS = {
  mern: ['mern', 'node.js', 'nodejs', 'react', 'mongodb', 'express', 'full stack', 'fullstack'],
  mean: ['mean', 'node.js', 'nodejs', 'angular', 'mongodb', 'express', 'full stack', 'fullstack'],
  'node js': ['node.js', 'nodejs', 'node', 'express'],
  nodejs: ['node.js', 'nodejs', 'node', 'express'],
  node: ['node.js', 'nodejs', 'node', 'express'],
  'react js': ['react', 'react.js', 'reactjs', 'next.js'],
  reactjs: ['react', 'react.js', 'reactjs', 'next.js'],
  react: ['react', 'react.js', 'reactjs', 'next.js', 'react native'],
  python: ['python', 'django', 'fastapi', 'flask', 'pyspark'],
  java: ['java', 'spring boot', 'spring framework', 'hibernate', 'j2ee', 'jvm'],
  golang: ['golang', 'go'],
  go: ['golang', 'go'],
  vue: ['vue', 'vue.js', 'vuejs', 'nuxt'],
  angular: ['angular', 'angularjs', 'angular.js'],
  devops: ['devops', 'docker', 'kubernetes', 'aws', 'ci/cd', 'terraform', 'sre'],
  qa: ['qa', 'selenium', 'automation test', 'sdet', 'cypress', 'testing'],
  sdet: ['sdet', 'qa', 'selenium', 'cypress', 'test automation'],
  ai: ['ai', 'artificial intelligence', 'machine learning', 'ml', 'nlp', 'llm', 'deep learning'],
  ml: ['machine learning', 'ml', 'ai', 'deep learning', 'data science'],
  fullstack: ['full stack', 'fullstack', 'mern', 'mean'],
  'full stack': ['full stack', 'fullstack', 'mern', 'mean'],
  frontend: ['frontend', 'front end', 'react', 'angular', 'vue', 'ui/ux'],
  backend: ['backend', 'back end', 'node.js', 'java', 'python', 'golang'],
};

const getSearchTerms = (input) => {
  const cleanInput = input.trim().toLowerCase();
  const synonyms = new Set([cleanInput]);

  if (TECH_SYNONYMS[cleanInput]) {
    TECH_SYNONYMS[cleanInput].forEach((t) => synonyms.add(t));
  }

  const words = cleanInput.split(/\s+/).filter((w) => w.length > 1);
  words.forEach((w) => {
    synonyms.add(w);
    if (TECH_SYNONYMS[w]) {
      TECH_SYNONYMS[w].forEach((t) => synonyms.add(t));
    }
  });

  return Array.from(synonyms);
};

const buildFilters = (query) => {
  const filter = baseJobFilter();
  const search = (query.search || query.q || '').trim();

  if (query.headline) {
    const escH = query.headline.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$and = [...(filter.$and || []), { headline: { $regex: escH, $options: 'i' } }];
  }

  if (query.postedWithinDays) {
    const days = parseInt(query.postedWithinDays, 10);
    if (!isNaN(days) && days > 0) {
      filter.postedDate = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }
  }

  if (search) {
    const searchTerms = getSearchTerms(search);
    const searchOrConditions = [];

    for (const term of searchTerms) {
      const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // For short keywords (e.g. java, go, qa, ai, ml), enforce word boundaries
      const regexPattern = term.length <= 4 && /^[a-z0-9+#.]+$/i.test(term)
        ? `\\b${escaped}\\b`
        : escaped;

      searchOrConditions.push(
        { headline: { $regex: regexPattern, $options: 'i' } },
        { jobTitle: { $regex: regexPattern, $options: 'i' } }
      );
    }

    filter.$and = [
      ...(filter.$and || []),
      { $or: searchOrConditions },
    ];
  }

  if (query.company) filter.companyName = { $regex: new RegExp(query.company, 'i') };

  if (query.skills) {
    const skills = parseArray(query.skills).map((s) => s.toLowerCase().trim()).filter(Boolean);
    if (skills.length) {
      const skillMatches = skills.map((sk) => {
        const escaped = sk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return {
          $or: [
            { requiredSkills: sk },
            { jobTitle: { $regex: new RegExp(escaped, 'i') } },
            { headline: { $regex: new RegExp(escaped, 'i') } },
          ],
        };
      });
      filter.$and = [...(filter.$and || []), { $or: skillMatches }];
    }
  }

  if (query.category) {
    filter.category = query.category;
    if (query.category === 'technical') {
      const nonTechExclusion = /\b(marketing|marketer|growth marketer|digital marketing|brand manager|campaign manager|seo|sem|social media|affiliate marketing|advertising|translator|translation|interpreter|localization|linguist|language specialist|transcriptionist|business executive|business development|account executive|sales executive|sales representative|sales rep|sales manager|client executive|operations executive|operations lead|operations manager|executive assistant|relationship manager|bdr|sdr|bde|recruiter|recruitment|talent acquisition|human resource|hr executive|hr manager|people operations|copywriter|content writer|content creator|journalist|editor|accountant|accounting|financial analyst|auditor|tax specialist|bookkeeper|legal counsel|paralegal|lawyer|customer support|customer service|customer success|telecaller|call center|receptionist|store manager|nurse|chef|producer|programs manager|event manager)\b/i;
      filter.$and = [
        ...(filter.$and || []),
        { jobTitle: { $not: nonTechExclusion } },
      ];
    } else if (query.category === 'non-technical') {
      const techExclusion = /\b(developer|software engineer|software developer|programmer|coder|frontend|front-end|backend|back-end|fullstack|full-stack|full stack|web developer|devops|sre|cloud engineer|cloud architect|database administrator|dba|data scientist|data engineer|machine learning|deep learning|artificial intelligence|ai engineer|ml engineer|cybersecurity|security engineer|infosec|soc analyst|pentester|qa engineer|test engineer|software tester|sdet|mobile developer|ios developer|android developer|flutter developer|react native|systems engineer|firmware|embedded|iot|robotics|network engineer|blockchain|smart contract|solidity|tech lead|cto)\b/i;
      filter.$and = [
        ...(filter.$and || []),
        { jobTitle: { $not: techExclusion } },
      ];
    }
  }
  if (query.subCategory) filter.subCategory = query.subCategory;
  if (query.workMode) filter.workMode = query.workMode;
  if (query.employmentType) filter.employmentType = query.employmentType;
  if (query.country) filter.country = new RegExp(query.country, 'i');
  if (query.state) filter.state = new RegExp(query.state, 'i');
  if (query.city) filter.city = new RegExp(query.city, 'i');
  if (query.source) filter.source = query.source;

  applyIndiaScope(filter, query);

  const remote = parseBool(query.remote);
  const hybrid = parseBool(query.hybrid);
  const onsite = parseBool(query.onsite);
  if (remote !== undefined || hybrid !== undefined || onsite !== undefined) {
    filter.$or = [];
    if (remote !== undefined) filter.$or.push({ remote });
    if (hybrid !== undefined) filter.$or.push({ hybrid });
    if (onsite !== undefined) filter.$or.push({ onsite });
  }

  if (query.experience !== undefined) {
    const raw = String(query.experience).trim().toLowerCase();
    const LEVELS = ['internship', 'fresher', 'junior', 'mid', 'senior', 'lead'];
    if (LEVELS.includes(raw)) {
      filter.experienceLevel = raw;
    } else {
      const exp = Number(raw);
      if (Number.isFinite(exp) && exp >= 0) {
        filter.experienceLevel = exp <= 1 ? 'internship' : exp <= 2 ? 'fresher' : exp <= 4 ? 'junior' : exp <= 7 ? 'mid' : 'senior';
      }
    }
  }
  if (query.fresher === 'true') filter.experienceLevel = { $in: ['fresher', 'internship'] };
  if (query.internship === 'true') filter.experienceLevel = 'internship';

  if (query.salaryMin !== undefined) {
    const min = parseSalary(query.salaryMin);
    if (min !== undefined) filter.salaryMax = { $gte: min };
  }
  if (query.salaryMax !== undefined) {
    const max = parseSalary(query.salaryMax);
    if (max !== undefined) filter.$and = [...(filter.$and || []), { salaryMin: { $lte: max } }];
  }

  if (query.postedWithinDays !== undefined) {
    const days = Number(query.postedWithinDays);
    if (Number.isFinite(days) && days > 0) {
      filter.postedDate = { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) };
    }
  }

  return filter;
};

const sortOptions = (sort) => {
  switch (sort) {
    case 'salary':
      return { salaryMax: -1, salaryMin: -1 };
    case 'oldest':
      return { postedDate: 1 };
    case 'trending':
      return { trendingScore: -1, postedDate: -1 };
    case 'relevance':
      return { postedDate: -1 };
    default:
      return { postedDate: -1 };
  }
};

const listJobs = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = buildFilters(req.query);
  const sort = sortOptions(req.query.sort);

  const baseQuery = Job.find(filter);
  if (filter.$text) baseQuery.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  else baseQuery.sort(sort);

  const nonTechExclusion = /\b(marketing|marketer|translator|translation|interpreter|localization|linguist|language specialist|business executive|business development|account executive|sales executive|sales representative|sales rep|sales manager|client executive|executive assistant|operations executive|relationship manager|recruiter|recruitment|talent acquisition|human resource|hr executive|hr manager|people operations|copywriter|content writer|content creator|journalist|editor|accountant|accounting|financial analyst|auditor|tax specialist|bookkeeper|legal counsel|paralegal|lawyer|customer support|customer service|customer success|telecaller|call center|receptionist|store manager|nurse|chef)\b/i;

  const baseFilter = baseJobFilter();
  const indiaFilter = indiaScopeFilter();

  const isDefaultSort = !req.query.sort || req.query.sort === 'relevance' || req.query.sort === 'default';
  const isSearchQuery = Boolean(req.query.search || req.query.q);

  const priorityCond = {
    $or: [
      { jobTitle: { $regex: /\b(java|mern|react|node|nodejs|python|django|fastapi|mongodb|express|spring boot)\b/i } },
      { headline: { $regex: /\b(java|mern|react|node|nodejs|python|django|fastapi|mongodb|express|spring boot)\b/i } },
      { requiredSkills: { $in: ['java', 'react', 'react.js', 'reactjs', 'node', 'node.js', 'nodejs', 'mern', 'python', 'django', 'fastapi', 'mongodb', 'express', 'spring boot'] } },
    ],
  };

  let jobs = [];
  if (isDefaultSort && !isSearchQuery && req.query.category !== 'non-technical') {
    const priorityFilter = { ...filter, $and: [...(filter.$and || []), priorityCond] };
    const priorityJobsCount = await Job.countDocuments(priorityFilter);

    if (skip < priorityJobsCount) {
      const priorityJobs = await Job.find(priorityFilter)
        .sort({ trendingScore: -1, postedDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      if (priorityJobs.length < limit) {
        const remainingLimit = limit - priorityJobs.length;
        const generalFilter = { ...filter, $and: [...(filter.$and || []), { $nor: [priorityCond] }] };
        const generalJobs = await Job.find(generalFilter)
          .sort({ trendingScore: -1, postedDate: -1 })
          .skip(0)
          .limit(remainingLimit)
          .lean();
        jobs = [...priorityJobs, ...generalJobs];
      } else {
        jobs = priorityJobs;
      }
    } else {
      const generalSkip = skip - priorityJobsCount;
      const generalFilter = { ...filter, $and: [...(filter.$and || []), { $nor: [priorityCond] }] };
      jobs = await Job.find(generalFilter)
        .sort({ trendingScore: -1, postedDate: -1 })
        .skip(generalSkip)
        .limit(limit)
        .lean();
    }
  } else if (isSearchQuery) {
    const rawJobs = await baseQuery.skip(skip).limit(limit * 3).lean();
    const searchTerms = getSearchTerms(req.query.search || req.query.q || '');

    const scoredJobs = rawJobs.map((j) => {
      let score = 0;
      const titleLower = (j.jobTitle || '').toLowerCase();
      const headlineLower = (j.headline || '').toLowerCase();
      const skillsLower = (j.requiredSkills || []).map((s) => s.toLowerCase());

      for (const term of searchTerms) {
        const t = term.toLowerCase();
        if (titleLower.includes(t)) score += 100;
        if (headlineLower.includes(t)) score += 80;
        if (skillsLower.includes(t)) score += 50;
      }
      return { ...j, _searchScore: score };
    });

    scoredJobs.sort((a, b) => b._searchScore - a._searchScore || new Date(b.postedDate) - new Date(a.postedDate));
    jobs = scoredJobs.slice(0, limit);
  } else {
    jobs = await baseQuery.skip(skip).limit(limit).lean();
  }

  const [
    total,
    technicalCount,
    nonTechnicalCount,
    remoteCount,
    hybridCount,
    onsiteCount,
    fullTimeCount,
    partTimeCount,
    contractCount,
    internshipCount,
  ] = await Promise.all([
    Job.countDocuments(filter),
    Job.countDocuments({
      ...baseFilter,
      $and: [indiaFilter, { category: 'technical', jobTitle: { $not: nonTechExclusion } }],
    }),
    Job.countDocuments({
      ...baseFilter,
      $and: [indiaFilter, { category: 'non-technical' }],
    }),
    Job.countDocuments({ ...baseFilter, $and: [indiaFilter], workMode: 'remote' }),
    Job.countDocuments({ ...baseFilter, $and: [indiaFilter], workMode: 'hybrid' }),
    Job.countDocuments({ ...baseFilter, $and: [indiaFilter], workMode: 'onsite' }),
    Job.countDocuments({ ...baseFilter, $and: [indiaFilter], employmentType: 'full-time' }),
    Job.countDocuments({ ...baseFilter, $and: [indiaFilter], employmentType: 'part-time' }),
    Job.countDocuments({ ...baseFilter, $and: [indiaFilter], employmentType: 'contract' }),
    Job.countDocuments({ ...baseFilter, $and: [indiaFilter], employmentType: 'internship' }),
  ]);

  res.json({
    success: true,
    jobs,
    pagination: buildPagination(page, limit, total),
    counts: {
      technical: technicalCount,
      'non-technical': nonTechnicalCount,
      remote: remoteCount,
      hybrid: hybridCount,
      onsite: onsiteCount,
      'full-time': fullTimeCount,
      'part-time': partTimeCount,
      contract: contractCount,
      internship: internshipCount,
    },
  });
});

const getJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, isActive: true, isExpired: false }).lean();
  if (!job) return next(new ApiError(404, 'Job not found.'));

  let match = null;
  let applied = false;
  if (req.user) {
    applied = await Application.exists({ job: job._id, candidate: req.user._id });
    match = computeMatchScore(req.user, job);
  }
  const related = await Job.find({
    _id: { $ne: job._id },
    isActive: true,
    isExpired: false,
    postedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    $or: [{ category: job.category }, { requiredSkills: { $in: job.requiredSkills.slice(0, 5) } }],
  })
    .limit(4)
    .lean();

  res.json({ success: true, job: { ...job, formattedSalary: formatCurrency(job.salaryMax || job.salary, job.currency) }, match, applied, related });
});

const getStats = asyncHandler(async (req, res) => {
  const scope = indiaScopeFilter();
  const total = await Job.countDocuments({ ...baseJobFilter(), ...scope });
  const remote = await Job.countDocuments({ ...baseJobFilter(), ...scope, workMode: 'remote' });
  const fullTime = await Job.countDocuments({ ...baseJobFilter(), ...scope, employmentType: 'full-time' });
  const internship = await Job.countDocuments({ ...baseJobFilter(), ...scope, employmentType: 'internship' });
  const fresher = await Job.countDocuments({ ...baseJobFilter(), ...scope, experienceLevel: { $in: ['fresher', 'internship'] } });
  const companies = await Company.countDocuments({ verified: true });

  res.json({ success: true, stats: { total, remote, fullTime, internship, fresher, companies } });
});

const homeFeed = asyncHandler(async (req, res) => {
  const base = baseJobFilter();
  const scoped = { ...base, $and: [indiaScopeFilter()] };

  const sections = {};
  const userSkills = req.user ? (req.user.skills || []).map((s) => s.toLowerCase()) : [];
  const userPrefs = req.user?.preferences || {};
  const preferredCategory = userPrefs.preferredCategory || '';
  const jobTitlePref = userPrefs.preferredJobTitle || '';

  // Build preference filter: matches user's skills OR job title keywords OR category
  const buildPreferredFilter = () => {
    const conditions = [];
    if (userSkills.length) {
      conditions.push({ requiredSkills: { $in: userSkills } });
    }
    if (jobTitlePref) {
      const keywords = jobTitlePref.split(/[,\s]+/).filter(Boolean);
      if (keywords.length) {
        const escaped = keywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        conditions.push({ jobTitle: { $regex: escaped.join('|'), $options: 'i' } });
      }
    }
    if (preferredCategory) {
      conditions.push({ category: preferredCategory });
    }
    if (!conditions.length) return null;
    return conditions.length === 1 ? conditions[0] : { $or: conditions };
  };

  const preferred = buildPreferredFilter();

  // Fetch section jobs: prefer matching user profile or Java/MERN/Python, fill remaining with general
  const fetchSection = async (extraFilter, limit = 8) => {
    const priorityCond = {
      $or: [
        { jobTitle: { $regex: /\b(java|mern|react|node|nodejs|python|django|fastapi|mongodb|express|spring boot)\b/i } },
        { headline: { $regex: /\b(java|mern|react|node|nodejs|python|django|fastapi|mongodb|express|spring boot)\b/i } },
        { requiredSkills: { $in: ['java', 'react', 'react.js', 'reactjs', 'node', 'node.js', 'nodejs', 'mern', 'python', 'django', 'fastapi', 'mongodb', 'express', 'spring boot'] } },
      ],
    };

    const targetFilter = preferred || priorityCond;
    const matched = await Job.find({ ...scoped, ...extraFilter, ...targetFilter })
      .sort({ trendingScore: -1, postedDate: -1 })
      .limit(limit)
      .lean();

    if (matched.length >= limit) return matched;
    const remaining = limit - matched.length;
    const excludeIds = matched.map((j) => j._id);
    const general = await Job.find({
      ...scoped,
      ...extraFilter,
      _id: { $nin: excludeIds },
    })
      .sort({ postedDate: -1 })
      .limit(remaining)
      .lean();
    return [...matched, ...general];
  };

  // Build recommended section for logged-in users with skills
  if (req.user && (userSkills.length || preferredCategory || jobTitlePref)) {
    const matched = await Job.find({ ...scoped, ...preferred })
      .sort({ postedDate: -1 })
      .limit(10)
      .lean();
    sections.recommended = matched.map((job) => ({
      ...job,
      match: computeMatchScore(req.user, job),
    }));
  }

  const [latest, technical, nonTechnical, remote, internship, fresher, topCompanies, highestPaying, trending] = await Promise.all([
    fetchSection({}),
    fetchSection({ category: 'technical' }),
    fetchSection({ category: 'non-technical' }),
    fetchSection({ workMode: 'remote' }),
    fetchSection({ employmentType: 'internship' }),
    fetchSection({ experienceLevel: { $in: ['fresher', 'internship'] } }),
    Company.find({ verified: true }).limit(6).lean(),
    fetchSection({ salaryMax: { $gt: 0 } }).then((jobs) => {
      const sorted = [...jobs].sort((a, b) => (b.salaryMax || 0) - (a.salaryMax || 0));
      return sorted.slice(0, 8);
    }),
    Job.find({ ...scoped, trendingScore: { $gt: 0 } }).sort({ trendingScore: -1, postedDate: -1 }).limit(8).lean(),
  ]);

  const hotLocations = await Job.aggregate([
    { $match: scoped },
    { $match: { city: { $ne: '', $exists: true }, country: { $ne: '', $exists: true } } },
    { $group: { _id: '$city', country: { $first: '$country' }, count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  sections.latest = latest;
  sections.technical = technical;
  sections.nonTechnical = nonTechnical;
  sections.remote = remote;
  sections.internship = internship;
  sections.fresher = fresher;
  sections.topCompanies = topCompanies;
  sections.highestPaying = highestPaying;
  sections.trending = trending;
  sections.jobsNearMe = hotLocations.map((l) => ({
    city: l._id,
    country: l.country,
    count: l.count,
  }));

  res.json({ success: true, sections });
});

const getRecommendations = asyncHandler(async (req, res, next) => {
  if (!req.user) return next(new ApiError(401, 'Login required for recommendations.'));
  const { page, limit, skip } = paginate(req.query);
  const filter = baseJobFilter();

  const skills = (req.user.skills || []).map((s) => String(s).toLowerCase()).filter(Boolean);
  const preferredCategory = req.user.preferences && req.user.preferences.preferredCategory;
  if (preferredCategory) filter.category = preferredCategory;

  if (skills.length) {
    const escaped = skills.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    filter.$and = [
      indiaScopeFilter(),
      {
        $or: [
          { requiredSkills: { $in: skills } },
          { jobTitle: { $regex: escaped.join('|'), $options: 'i' } },
          { subCategory: { $regex: escaped.join('|'), $options: 'i' } },
        ],
      },
    ];
  } else {
    filter.$and = [...(filter.$and || []), indiaScopeFilter()];
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter).skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const scored = jobs
    .map((job) => ({ job, match: computeMatchScore(req.user, job) }))
    .sort((a, b) => b.match.score - a.match.score);

  res.json({
    success: true,
    jobs: scored.map(({ job, match }) => ({ ...job, match })),
    pagination: buildPagination(page, limit, total),
  });
});

const applyToJob = asyncHandler(async (req, res, next) => {
  const job = await Job.findOne({ _id: req.params.id, isActive: true, isExpired: false });
  if (!job) return next(new ApiError(404, 'Job not found.'));

  const existing = await Application.findOne({ job: job._id, candidate: req.user._id });
  if (existing) return next(new ApiError(409, 'You have already applied to this job.'));

  const application = await Application.create({
    job: job._id,
    candidate: req.user._id,
    coverLetter: req.body.coverLetter || '',
    resumeUrl: (req.user.resume && req.user.resume.url) || '',
    appliedSource: job.source === 'recruiter' ? 'portal' : 'external',
  });

  if (job.postedBy) {
    await Notification.create({
      user: job.postedBy,
      type: 'application',
      title: 'New application received',
      message: `${req.user.name} applied to "${job.jobTitle}"`,
      link: `/recruiter/applications/${application._id}`,
    });
  }

  const isExternal = job.source !== 'recruiter';
  res.status(201).json({
    success: true,
    message: isExternal ? 'Application recorded. Redirecting to the employer\'s application page...' : 'Application submitted.',
    application,
    redirectUrl: isExternal && job.applicationUrl ? job.applicationUrl : '',
  });
});

const myApplications = asyncHandler(async (req, res) => {
  const { page, limit, skip } = paginate(req.query);
  const filter = { candidate: req.user._id };
  if (req.query.status) filter.status = req.query.status;

  const [apps, total] = await Promise.all([
    Application.find(filter)
      .populate({ path: 'job', select: 'jobTitle companyName companyLogo salary salaryMax currency location workMode employmentType postedDate' })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Application.countDocuments(filter),
  ]);

  res.json({ success: true, applications: apps, pagination: buildPagination(page, limit, total) });
});

const reportJob = asyncHandler(async (req, res, next) => {
  const targetId = toObjectId(req.body.targetId || req.params.id);
  if (!targetId) return next(new ApiError(400, 'Invalid target id.'));
  const exists = await Job.exists({ _id: targetId });
  if (!exists) return next(new ApiError(404, 'Job not found.'));

  await Report.create({
    type: 'job',
    targetId,
    reportedBy: req.user._id,
    reason: req.body.reason,
    details: req.body.details || '',
  });
  res.status(201).json({ success: true, message: 'Report submitted. Our team will review it.' });
});

const semanticSearch = asyncHandler(async (req, res) => {
  const { query } = req.body;
  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ success: false, message: 'query is required.' });
  }

  // Parse natural language → structured params
  const parsed = await parseNaturalQuery(query.trim());

  // Feed into existing buildFilters pipeline — zero duplication
  const { page, limit, skip } = paginate({ page: req.body.page || 1, limit: 12 });
  const filter = buildFilters({ ...parsed, scope: parsed.city || parsed.country ? 'global' : undefined });
  const sort   = sortOptions(parsed.sort);

  const baseQuery = Job.find(filter);
  if (filter.$text) baseQuery.select({ score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
  else baseQuery.sort(sort);

  const [jobs, total] = await Promise.all([
    baseQuery.skip(skip).limit(limit).lean(),
    Job.countDocuments(filter),
  ]);

  const scored = req.user
    ? jobs.map(job => ({ ...job, match: computeMatchScore(req.user, job) }))
    : jobs;

  res.json({
    success: true,
    query: query.trim(),
    parsed,          // send back so frontend can show what was understood
    jobs: scored,
    pagination: buildPagination(page, limit, total),
  });
});

const refreshJobs = asyncHandler(async (req, res) => {
  if (req.query.async === 'true' || req.body?.async) {
    fetchAllJobs().catch((err) => logger.error(`[jobs] Background refresh failed: ${err.message}`));
    return res.json({
      success: true,
      message: 'Job sync initiated in background. Fresh jobs are syncing across all portals.',
    });
  }

  const results = await fetchAllJobs();
  const totalSaved = results.reduce((acc, r) => acc + (r.saved || 0), 0);
  res.json({
    success: true,
    message: `Job refresh complete. Saved/updated ${totalSaved} jobs across providers.`,
    results,
  });
});

module.exports = {
  listJobs,
  getJob,
  getStats,
  homeFeed,
  getRecommendations,
  applyToJob,
  myApplications,
  reportJob,
  semanticSearch,
  refreshJobs,
  buildFilters,
  sortOptions,
  baseJobFilter,
  indiaScopeFilter,
};
