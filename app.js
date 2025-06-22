const express = require('express');
const requestLogger = require('./src/utils/RequestLogger');
const errorLogger = require('./src/utils/ErrorLogger');
const routes = require('./src/routes'); // Assuming an index.js exporting all routes

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(requestLogger);
app.use('/api', routes); // example: api/wallet

app.use(errorLogger); // must be after all routes
module.exports = app;
