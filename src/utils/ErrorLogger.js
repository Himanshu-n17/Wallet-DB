const fs = require("fs");
const path = require("path");

const logFile = path.join(__dirname, "logs", "errors.log");

fs.mkdirSync(path.dirname(logFile), { recursive: true });

const errorLogger = (err, req, res, next) => {
  console.log(err.message);

  const logEntry = `[${new Date().toISOString()}] ERROR: ${
    err.message
  }\nStack: ${err.stack}\n\n`;

  fs.appendFile(logFile, logEntry, (fsErr) => {
    if (fsErr) {
      console.error("Failed to log error:", fsErr);
    }
  });

  res.status(500).json({ error: "Something went wrong!" });
};

module.exports = errorLogger;
