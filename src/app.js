const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const morganMiddleware = require('./logger/morgan.logger.js');
const app = express();

function startApp() {
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  app.use(cookieParser());

  // Set security headers with Helmet middleware
  app.use(helmet());

  // Log requests with Morgan middleware (use 'combined' format for production)
  app.use(morgan('dev'));
  app.use(morganMiddleware);

  app.get('/api/v1/wow', (req, res) => {
    res.json({ wow: 'wow' });
  });
}

module.exports = { app, startApp };
