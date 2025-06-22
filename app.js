const express = require('express');
const requestLogger = require('./src/utils/RequestLogger');
const errorLogger = require('./src/utils/ErrorLogger');
const routes = require('./src/routes'); 

const app = express();
require('dotenv').config();

app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);

app.use(errorLogger);
module.exports = app;
