const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const morgan = require('morgan');
const morganMiddleware = require('./logger/morgan.logger.js');
const { errorHandler } = require('./middlewares/error.middleware.js');
const app = express();

function startApp() {
  // App Routers
  const userRouter = require('./routes/auth/user.routes.js');

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

  // App Api
  app.use('/api/v1/users', userRouter);

  app.use(errorHandler);
}

module.exports = { app, startApp };
