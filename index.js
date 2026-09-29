const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './backend/.env') });
require('dotenv').config({ path: path.resolve(__dirname, './.env') });
require('dotenv').config();

const { app, startServer } = require('./backend/src/app');

startServer();

module.exports = app;
