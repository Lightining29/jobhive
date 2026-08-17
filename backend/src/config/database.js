const { sequelize, connectMySQL } = require('./mysql');
const logger = require('./logger');

// MySQL Models export
const User = require('../models/sql/User.sql');
const Job = require('../models/sql/Job.sql');
const Company = require('../models/sql/Company.sql');
const Application = require('../models/sql/Application.sql');
const Card = require('../models/sql/Card.sql');
const SystemSetting = require('../models/sql/SystemSetting.sql');

// Establish associations
User.hasMany(Company, { foreignKey: 'ownerId', as: 'companies' });
Company.belongsTo(User, { foreignKey: 'ownerId', as: 'owner' });

Company.hasMany(Job, { foreignKey: 'companyId', as: 'jobs' });
Job.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

User.hasMany(Job, { foreignKey: 'postedBy', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'recruiter' });

Job.hasMany(Application, { foreignKey: 'jobId', as: 'applications' });
Application.belongsTo(Job, { foreignKey: 'jobId', as: 'job' });

User.hasMany(Application, { foreignKey: 'candidateId', as: 'applications' });
Application.belongsTo(User, { foreignKey: 'candidateId', as: 'candidate' });

User.hasMany(Card, { foreignKey: 'userId', as: 'cards' });
Card.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

const connectMongoDB = require('./db');

const initDatabases = async () => {
  logger.info('🔌 Initializing MySQL Database Engine (Hostinger/Local)...');
  await connectMySQL();

  // Auto-seed Super Admin user into MySQL if not present
  try {
    const adminEmail = 'brayw433@gmail.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await User.create({
        name: 'Manish Kumar',
        email: adminEmail,
        password: 'Manish@123', // hooks will bcrypt hash it
        role: 'admin',
        emailVerified: true,
      });
      logger.info(`✅ Default Super Admin created in MySQL: ${adminEmail}`);
    }
  } catch (seedErr) {
    logger.warn(`[admin-seed] Notice: ${seedErr.message}`);
  }

  if (process.env.MONGO_URI) {
    try {
      await connectMongoDB();
    } catch (err) {
      logger.warn(`[mongo] Mongo connection notice: ${err.message}`);
    }
  }
};

module.exports = {
  initDatabases,
  sequelize,
  models: {
    User,
    Job,
    Company,
    Application,
    Card,
    SystemSetting,
  },
};
