const { sequelize, connectMySQL } = require('./config/mysql');
const connectMongoDB = require('./config/db');
const logger = require('./config/logger');

// Models export
const User = require('./models/sql/User.sql');
const Job = require('./models/sql/Job.sql');
const Card = require('./models/sql/Card.sql');
const SystemSetting = require('./models/sql/SystemSetting.sql');

// Establish associations
User.hasMany(Job, { foreignKey: 'postedBy', as: 'postedJobs' });
Job.belongsTo(User, { foreignKey: 'postedBy', as: 'recruiter' });

User.hasMany(Card, { foreignKey: 'userId', as: 'cards' });
Card.belongsTo(User, { foreignKey: 'userId', as: 'owner' });

const initDatabases = async () => {
  const dbDriver = process.env.DB_DRIVER || (process.env.DB_HOST || process.env.MYSQL_HOST ? 'mysql' : 'mongo');

  if (dbDriver === 'mysql') {
    logger.info('🔌 Initializing MySQL Database Engine (Hostinger/Local)...');
    await connectMySQL();
  } else {
    logger.info('🔌 Initializing MongoDB Database Engine...');
    await connectMongoDB();
  }
};

module.exports = {
  initDatabases,
  sequelize,
  models: {
    User,
    Job,
    Card,
    SystemSetting,
  },
};
