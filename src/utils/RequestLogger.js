const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'logs', 'requests.log');

// Ensure log directory exists
fs.mkdirSync(path.dirname(logFile), { recursive: true });

const requestLogger = (req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;

  fs.appendFile(logFile, logEntry, (err) => {
    if (err) {
      console.error('Failed to log request:', err);
    }
  });

  next();
};

module.exports = requestLogger;
