/**
 * Database Migration Script: MongoDB -> Hostinger MySQL
 * Usage: node scripts/migrateMongoToMySQL.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const { sequelize } = require('../src/config/mysql');
const logger = require('../src/config/logger');

// Mongoose Models
const MongoUser = require('../src/models/User');
const MongoJob = require('../src/models/Job');
const MongoCompany = require('../src/models/Company');
const MongoApplication = require('../src/models/Application');
const MongoCard = require('../src/models/Card');
const MongoSystemSetting = require('../src/models/SystemSetting');

// Sequelize MySQL Models
const UserSQL = require('../src/models/sql/User.sql');
const JobSQL = require('../src/models/sql/Job.sql');
const CompanySQL = require('../src/models/sql/Company.sql');
const ApplicationSQL = require('../src/models/sql/Application.sql');
const CardSQL = require('../src/models/sql/Card.sql');
const SystemSettingSQL = require('../src/models/sql/SystemSetting.sql');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/jobhive';

async function migrate() {
  console.log('🚀 Starting Data Migration: MongoDB ➔ Hostinger MySQL...\n');

  try {
    // 1. Connect MongoDB
    console.log(`🔌 Connecting to MongoDB: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB.');

    // 2. Connect & Sync MySQL
    console.log('🔌 Connecting to Hostinger MySQL...');
    await sequelize.authenticate();
    console.log('✅ Connected to Hostinger MySQL.');
    await sequelize.sync({ alter: true });
    console.log('✅ MySQL Tables Synced.\n');

    // Tracking maps for MongoDB _id -> MySQL auto-increment ID
    const userMap = new Map();
    const companyMap = new Map();
    const jobMap = new Map();

    // ── 1. MIGRATE USERS ───────────────────────────────────────────────────
    console.log('📦 Migrating Users...');
    const mongoUsers = await MongoUser.find().lean();
    let userCount = 0;

    for (const u of mongoUsers) {
      try {
        const [userSql] = await UserSQL.findOrCreate({
          where: { email: u.email.toLowerCase() },
          defaults: {
            name: u.name || 'User',
            email: u.email.toLowerCase(),
            password: u.password,
            googleId: u.googleId || null,
            role: u.role || 'candidate',
            phone: u.phone || '',
            headline: u.headline || '',
            bio: u.bio || '',
            avatar: u.avatar || '',
            skills: u.skills || [],
            education: u.education || [],
            experience: u.experience || [],
            certifications: u.certifications || [],
            socialLinks: u.socialLinks || {},
            preferences: u.preferences || {},
            resume: u.resume || {},
            subscription: u.subscription || {},
            contactCredits: u.contactCredits ?? 5,
            isEmailVerified: Boolean(u.isEmailVerified),
            isActive: u.isActive !== undefined ? Boolean(u.isActive) : true,
            status: u.status || 'active',
          },
        });
        userMap.set(String(u._id), userSql.id);
        userCount++;
      } catch (err) {
        console.warn(`⚠️ Skipped User ${u.email}: ${err.message}`);
      }
    }
    console.log(`✅ Migrated ${userCount} Users.\n`);

    // ── 2. MIGRATE COMPANIES ───────────────────────────────────────────────
    console.log('📦 Migrating Companies...');
    const mongoCompanies = await MongoCompany.find().lean();
    let companyCount = 0;

    for (const c of mongoCompanies) {
      try {
        const ownerId = userMap.get(String(c.owner)) || 1;
        const [companySql] = await CompanySQL.findOrCreate({
          where: { name: c.name },
          defaults: {
            name: c.name,
            slug: c.slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            website: c.website || '',
            logo: c.logo || { url: '', publicId: '' },
            description: c.description || '',
            industry: c.industry || '',
            size: c.size || '',
            foundedYear: c.foundedYear || null,
            headquarters: c.headquarters || '',
            country: c.country || '',
            city: c.city || '',
            email: c.email || '',
            phone: c.phone || '',
            socialLinks: c.socialLinks || {},
            verified: Boolean(c.verified),
            verifiedAt: c.verifiedAt || null,
            documents: c.documents || [],
            ownerId: ownerId,
          },
        });
        companyMap.set(String(c._id), companySql.id);
        companyCount++;
      } catch (err) {
        console.warn(`⚠️ Skipped Company ${c.name}: ${err.message}`);
      }
    }
    console.log(`✅ Migrated ${companyCount} Companies.\n`);

    // ── 3. MIGRATE JOBS ────────────────────────────────────────────────────
    console.log('📦 Migrating Jobs...');
    const mongoJobs = await MongoJob.find().lean();
    let jobCount = 0;

    for (const j of mongoJobs) {
      try {
        const postedBy = j.postedBy ? userMap.get(String(j.postedBy)) : null;
        const companyId = j.companyId ? companyMap.get(String(j.companyId)) : null;

        const [jobSql] = await JobSQL.findOrCreate({
          where: { jobId: j.jobId || `job_${j._id}` },
          defaults: {
            jobId: j.jobId || `job_${j._id}`,
            source: j.source || 'recruiter',
            companyName: j.companyName || 'Company',
            companyLogo: j.companyLogo || '',
            companyWebsite: j.companyWebsite || '',
            jobTitle: j.jobTitle || 'Job Position',
            headline: j.headline || '',
            description: j.description || '',
            requiredSkills: j.requiredSkills || [],
            category: j.category || 'technical',
            subCategory: j.subCategory || '',
            experienceMin: j.experience?.min || 0,
            experienceMax: j.experience?.max || 0,
            experienceLevel: j.experienceLevel || '',
            salary: j.salary || 0,
            salaryMin: j.salaryMin || 0,
            salaryMax: j.salaryMax || 0,
            currency: j.currency || 'USD',
            salaryPeriod: j.salaryPeriod || 'yearly',
            employmentType: j.employmentType || 'full-time',
            location: j.location || '',
            city: j.city || '',
            state: j.state || '',
            country: j.country || '',
            workMode: j.workMode || 'onsite',
            remote: Boolean(j.remote),
            hybrid: Boolean(j.hybrid),
            onsite: j.onsite !== undefined ? Boolean(j.onsite) : true,
            industry: j.industry || '',
            postedDate: j.postedDate || new Date(),
            expiresAt: j.expiresAt || null,
            applicationUrl: j.applicationUrl || '',
            applicationEmail: j.applicationEmail || '',
            postedBy: postedBy || null,
            companyId: companyId || null,
            isActive: j.isActive !== undefined ? Boolean(j.isActive) : true,
            isVerified: j.isVerified !== undefined ? Boolean(j.isVerified) : true,
            isExpired: Boolean(j.isExpired),
            trendingScore: j.trendingScore || 0,
          },
        });
        jobMap.set(String(j._id), jobSql.id);
        jobCount++;
      } catch (err) {
        console.warn(`⚠️ Skipped Job ${j.jobTitle}: ${err.message}`);
      }
    }
    console.log(`✅ Migrated ${jobCount} Jobs.\n`);

    // ── 4. MIGRATE APPLICATIONS ────────────────────────────────────────────
    console.log('📦 Migrating Applications...');
    const mongoApps = await MongoApplication.find().lean();
    let appCount = 0;

    for (const a of mongoApps) {
      try {
        const jobId = jobMap.get(String(a.job));
        const candidateId = userMap.get(String(a.candidate));

        if (jobId && candidateId) {
          await ApplicationSQL.findOrCreate({
            where: { jobId, candidateId },
            defaults: {
              jobId,
              candidateId,
              resumeUrl: a.resumeUrl || '',
              coverLetter: a.coverLetter || '',
              status: a.status || 'pending',
              interview: a.interview || { scheduled: false },
              notes: a.notes || '',
              appliedSource: a.appliedSource || 'portal',
            },
          });
          appCount++;
        }
      } catch (err) {
        console.warn(`⚠️ Skipped Application: ${err.message}`);
      }
    }
    console.log(`✅ Migrated ${appCount} Applications.\n`);

    // ── 5. MIGRATE I-CARDS ─────────────────────────────────────────────────
    console.log('📦 Migrating Identity Cards...');
    const mongoCards = await MongoCard.find().lean();
    let cardCount = 0;

    for (const card of mongoCards) {
      try {
        const cardId = card._id ? String(card._id) : `card_${Date.now()}`;
        const userId = card.user ? userMap.get(String(card.user)) : null;

        await CardSQL.findOrCreate({
          where: { cardId },
          defaults: {
            cardId,
            personal: card.personal || {},
            contact: card.contact || {},
            media: card.media || {},
            design: {
              themeId: card.theme?.themeId || 'clean-geometric-wedge',
              orientation: card.orientation || 'vertical',
              primaryColor: '#0b1d3a',
              accentColor: '#3b6fb6',
              cardScale: 100,
              showBarcode: true,
              showQrCode: true,
              showPunchHole: true,
            },
            security: card.security || { barcodeNumber: '89845653208871', isVerified: true },
            userId: userId || null,
            status: card.status || 'published',
          },
        });
        cardCount++;
      } catch (err) {
        console.warn(`⚠️ Skipped Card ${card.personal?.fullName}: ${err.message}`);
      }
    }
    console.log(`✅ Migrated ${cardCount} Identity Cards.\n`);

    // ── 6. MIGRATE SYSTEM SETTINGS ─────────────────────────────────────────
    console.log('📦 Migrating System Settings...');
    const mongoSettings = await MongoSystemSetting.findOne({ key: 'global_settings' }).lean();
    if (mongoSettings) {
      await SystemSettingSQL.upsert({
        key: 'global_settings',
        siteName: mongoSettings.siteName || 'Job Workplace',
        tagline: mongoSettings.tagline || 'Find Your Dream Career with AI Precision',
        supportEmail: mongoSettings.supportEmail || 'support@jobworkplace.com',
        contactPhone: mongoSettings.contactPhone || '+1 (800) 555-0199',
        currency: mongoSettings.currency || 'USD',
        currencySymbol: mongoSettings.currencySymbol || '$',
        defaultTaxRate: mongoSettings.defaultTaxRate || 18,
        taxName: mongoSettings.taxName || 'GST',
        invoicePrefix: mongoSettings.invoicePrefix || 'JW-INV',
        invoiceFooterNote: mongoSettings.invoiceFooterNote || 'Thank you for choosing Job Workplace.',
        stripeEnabled: Boolean(mongoSettings.stripeEnabled),
        razorpayEnabled: Boolean(mongoSettings.razorpayEnabled),
        paypalEnabled: Boolean(mongoSettings.paypalEnabled),
        maintenanceMode: Boolean(mongoSettings.maintenanceMode),
        maintenanceMessage: mongoSettings.maintenanceMessage || 'Job Workplace is undergoing scheduled maintenance.',
      });
      console.log('✅ Migrated Global System Settings.\n');
    }

    console.log('🎉 ═══════════════════════════════════════════════ 🎉');
    console.log('🎉 ALL DATA SUCCESSFULLY TRANSFERRED TO MYSQL! 🎉');
    console.log('🎉 ═══════════════════════════════════════════════ 🎉');
  } catch (error) {
    console.error('❌ Migration Failed:', error);
  } finally {
    await mongoose.disconnect();
    await sequelize.close();
    process.exit(0);
  }
}

migrate();
