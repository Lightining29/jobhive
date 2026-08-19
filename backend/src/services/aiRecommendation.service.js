const User = require('../models/User');

const getUserSkills = (user) =>
  (user.skills || []).map((s) => String(s).toLowerCase().trim()).filter(Boolean);

const getUserProfileVector = (user) => {
  const skills = new Set(getUserSkills(user));
  const totalExperience = User.computeYearsOfExperience(user.experience || []);
  const prefs = user.preferences || {};
  return {
    skills,
    totalExperience,
    preferredLocations: (prefs.preferredLocations || []).map((l) => l.toLowerCase().trim()),
    preferredSalary: Number(prefs.preferredSalary) || 0,
    preferredWorkMode: prefs.preferredWorkMode || '',
    preferredEmploymentType: prefs.preferredEmploymentType || '',
    preferredCategory: prefs.preferredCategory || '',
  };
};

const skillScore = (profile, job) => {
  const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase().trim());
  if (!profile.skills.size && !jobSkills.length) return 0.5;

  const skillText = [
    job.jobTitle,
    job.description,
    job.subCategory,
    job.industry,
    ...jobSkills,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  let matched = 0;
  profile.skills.forEach((skill) => {
    if (skillText.includes(skill)) matched += 1;
  });

  if (!jobSkills.length) {
    return profile.skills.size === 0 ? 0.5 : Math.min(matched / profile.skills.size, 1) * 0.7 + 0.3;
  }

  const explicitHits = jobSkills.filter((js) => profile.skills.has(js)).length;
  const coverage = explicitHits / jobSkills.length;
  const userCoverage = profile.skills.size ? matched / profile.skills.size : 0;
  return coverage * 0.7 + userCoverage * 0.3;
};

const experienceScore = (profile, job) => {
  const jobMin = Number(job.experience && job.experience.min) || 0;
  const jobMax = Number(job.experience && job.experience.max) || jobMin || 5;
  const userExp = profile.totalExperience;
  const level = job.experienceLevel || '';

  if (level === 'internship') return userExp <= 1 ? 1 : Math.max(0.3, 1 - (userExp - 1) * 0.2);
  if (level === 'fresher') return userExp <= 2 ? 1 : Math.max(0.3, 1 - (userExp - 2) * 0.2);

  if (userExp >= jobMin && userExp <= jobMax + 2) return 1;
  if (userExp < jobMin) return Math.max(0.3, userExp / Math.max(jobMin, 1));
  return Math.max(0.3, 1 - (userExp - (jobMax + 2)) * 0.1);
};

const locationScore = (profile, job) => {
  if (!profile.preferredLocations.length) return 0.6;
  const jobLocation = [
    job.city,
    job.state,
    job.country,
    job.location,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  if (job.workMode === 'remote') return 0.9;

  return profile.preferredLocations.some((loc) => jobLocation.includes(loc)) ? 1 : 0.4;
};

const salaryScore = (profile, job) => {
  const preferred = profile.preferredSalary;
  if (!preferred) return 0.7;
  const jobMax = Number(job.salaryMax) || Number(job.salary) || 0;
  const jobMin = Number(job.salaryMin) || 0;
  if (!jobMax && !jobMin) return 0.6;
  if (jobMax >= preferred) return 1;
  return Math.max(0.3, jobMax / preferred);
};

const workModeScore = (profile, job) => {
  const preferred = profile.preferredWorkMode;
  if (!preferred) return 0.7;
  return job.workMode === preferred ? 1 : 0.35;
};

const employmentTypeScore = (profile, job) => {
  const preferred = profile.preferredEmploymentType;
  if (!preferred) return 0.7;
  return job.employmentType === preferred ? 1 : 0.35;
};

const WEIGHTS = {
  skills: 0.5,
  experience: 0.2,
  location: 0.1,
  salary: 0.1,
  workMode: 0.05,
  employmentType: 0.05,
};

const matchScoreCache = new Map();
const MATCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const computeMatchScore = (user, job) => {
  if (!user || !job) return { score: 0, matchingSkills: [], missingSkills: [], reason: '' };
  const userKey = user.id || user._id || user.email || 'user';
  const jobKey = job._id || job.id || job.jobTitle;
  const cacheKey = `${userKey}:${jobKey}`;
  const now = Date.now();
  const cached = matchScoreCache.get(cacheKey);
  if (cached && now < cached.expiresAt) {
    return cached.result;
  }

  const profile = getUserProfileVector(user);

  if (profile.preferredCategory && job.category !== profile.preferredCategory) {
    const res = {
      score: 0,
      matchingSkills: [],
      missingSkills: [],
      reason: `Job category does not match your preferred category (${profile.preferredCategory}).`,
    };
    matchScoreCache.set(cacheKey, { result: res, expiresAt: now + MATCH_CACHE_TTL });
    return res;
  }

  const scores = {
    skills: skillScore(profile, job),
    experience: experienceScore(profile, job),
    location: locationScore(profile, job),
    salary: salaryScore(profile, job),
    workMode: workModeScore(profile, job),
    employmentType: employmentTypeScore(profile, job),
  };

  const score = Math.round(
    scores.skills * WEIGHTS.skills +
      scores.experience * WEIGHTS.experience +
      scores.location * WEIGHTS.location +
      scores.salary * WEIGHTS.salary +
      scores.workMode * WEIGHTS.workMode +
      scores.employmentType * WEIGHTS.employmentType
  ) * 100;

  const profileSkills = profile.skills;
  const jobSkills = (job.requiredSkills || []).map((s) => s.toLowerCase().trim());
  const jobSkillText = `${job.jobTitle} ${job.description || ''} ${job.subCategory || ''} ${job.industry || ''}`.toLowerCase();

  const matchingSkills = Array.from(profileSkills).filter((s) => jobSkillText.includes(s));
  const missingSkills = jobSkills.filter((s) => !profileSkills.has(s) && !matchingSkills.includes(s));

  let reason = 'No clear match basis was found.';
  if (matchingSkills.length) {
    reason = `Matches your skills: ${matchingSkills.slice(0, 5).join(', ')}.`;
  } else if (missingSkills.length) {
    reason = `Missing skills: ${missingSkills.slice(0, 5).join(', ')}.`;
  }
  if (profile.totalExperience >= (job.experience?.min || 0)) {
    reason += ` Experience requirement met (${profile.totalExperience} yrs).`;
  }

  const result = {
    score,
    matchingSkills: matchingSkills.slice(0, 10),
    missingSkills: missingSkills.slice(0, 10),
    reason,
  };

  matchScoreCache.set(cacheKey, { result, expiresAt: now + MATCH_CACHE_TTL });
  return result;
};

module.exports = { computeMatchScore, getUserProfileVector, getUserSkills };
