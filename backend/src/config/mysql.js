const { Sequelize } = require('sequelize');
const logger = require('./logger');

const DB_DIALECT = process.env.DB_DIALECT || 'mysql';
const DB_HOST = process.env.DB_HOST || '127.0.0.1';
const DB_PORT = parseInt(process.env.DB_PORT, 10) || 3306;
const DB_NAME = 'u375016581_ishika';
const DB_USER = 'u375016581_ishika';
const DB_PASSWORD = 'Ishika@333';

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
  }
};

module.exports = {
  sequelize,
  connectMySQL,
};
