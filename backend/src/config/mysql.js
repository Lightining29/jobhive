const { Sequelize } = require('sequelize');
const logger = require('./logger');

const DB_DIALECT = process.env.DB_DIALECT || 'mysql';
const DB_HOST = process.env.DB_HOST || process.env.MYSQL_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || process.env.MYSQL_PORT, 10) || 3306;
let DB_NAME = (process.env.DB_NAME || process.env.MYSQL_DATABASE || 'u375016581_ishika').trim();
let DB_USER = (process.env.DB_USER || process.env.MYSQL_USER || 'u375016581_ishika').trim();
let DB_PASSWORD = process.env.DB_PASSWORD || process.env.MYSQL_PASSWORD || '';

// Auto-correct dummy placeholder if injected by host panel
if (DB_NAME.includes('u123456789') || !DB_NAME) {
  DB_NAME = 'u375016581_ishika';
}
if (DB_USER.includes('u123456789') || !DB_USER) {
  DB_USER = 'u375016581_ishika';
}

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASSWORD, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
  logging: process.env.NODE_ENV === 'development' ? (msg) => logger.debug(msg) : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: {
    connectTimeout: 60000,
    // Enable SSL if connecting to remote cloud MySQL that requires it
    ssl: process.env.DB_SSL === 'true' ? { require: true, rejectUnauthorized: false } : false,
  },
});

const connectMySQL = async () => {
  try {
    await sequelize.authenticate();
    logger.info(`✅ MySQL Connected: ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    
    // Sync models with database tables
    if (process.env.DB_SYNC === 'true' || process.env.NODE_ENV === 'development') {
      await sequelize.sync({ alter: true });
      logger.info('✅ MySQL Models Synchronized.');
    }
  } catch (error) {
    logger.error(`❌ MySQL Connection Error: ${error.message}`);
    // Don't crash immediately in dev to allow configuration
  }
};

module.exports = {
  sequelize,
  connectMySQL,
};
