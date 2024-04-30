const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const helmet = require('helmet');
const morgan = require('morgan');
const passport = require('passport');
const morganMiddleware = require('./logger/morgan.logger.js');
const { errorHandler } = require('./middlewares/error.middleware.js');
const scheduleCronJob = require('./utils/cron.js');
const app = express();

function startApp() {
  // App Routers
  const userRouter = require('./routes/auth/user.routes.js');
  const healthCheckRouter = require('./routes/healthcheck.routes.js');
  const productRouter = require('./routes/product.routes.js');
  const categoryRouter = require('./routes/category.routes.js');
  const profileRouter = require('./routes/profile.routes.js');
  const addressRouter = require('./routes/address.routes.js');
  const cartRouter = require('./routes/cart.routes.js');
  const couponRouter = require('./routes/coupon.routes.js');

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true,
    })
  );

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use(cookieParser());

  // schedule a cron job
  (async () => {
    try {
      await scheduleCronJob();
    } catch (error) {
      console.error('Error scheduling cron jobs:', error);
    }
  })();

  // required for passport
  app.use(
    session({
      secret: process.env.EXPRESS_SESSION_SECRET,
      resave: true,
      saveUninitialized: true,
    })
  );

  // session secret
  app.use(passport.initialize());
  app.use(passport.session());

  // Set security headers with Helmet middleware
  app.use(helmet());

  // Log requests with Morgan middleware (use 'combined' format for production)
  app.use(morgan('dev'));
  app.use(morganMiddleware);

  // // App Api
  app.use('/api/v1/users', userRouter);
  app.use('/api/v1/healthcheck', healthCheckRouter);
  app.use('/api/v1/product', productRouter);
  app.use('/api/v1/category', categoryRouter);
  app.use('/api/v1/profile', profileRouter);
  app.use('/api/v1/address', addressRouter);
  app.use('/api/v1/cart', cartRouter);
  app.use('/api/v1/coupon', couponRouter);

  // Error handler
  app.use(errorHandler);
}

module.exports = { app, startApp };
