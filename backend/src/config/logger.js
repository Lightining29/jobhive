const env = require('./env');

const LEVEL_COLORS = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
};
const RESET = '\x1b[0m';

const format = (level, message, meta) => {
  const ts = new Date().toISOString();
  const color = LEVEL_COLORS[level] || '';
  let line = `[${ts}] ${color}${level.toUpperCase()}${RESET} ${message}`;
  if (meta && Object.keys(meta).length) line += ` ${JSON.stringify(meta)}`;
  return line;
};

const logger = {
  error: (message, meta) => console.error(format('error', message, meta)),
  warn: (message, meta) => console.warn(format('warn', message, meta)),
  info: (message, meta) => console.log(format('info', message, meta)),
  debug: (message, meta) => {
    if (env.nodeEnv !== 'production') console.log(format('debug', message, meta));
  },
};

module.exports = logger;
