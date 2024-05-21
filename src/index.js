const dotenv = require('dotenv');
dotenv.config({
  path: './.env',
});

const { app, startApp } = require('./app.js');
const connectDB = require('./db');
const { startRedis } = require('./config/redis.config.js');

(async () => {
  try {
    //  connecting redis database
    await startRedis();

    // connecting mongoDB database
    await connectDB();

    startApp();

    app.listen(process.env.PORT, () => {
      console.info(`🚝 Server is running at port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Error Occur while starting the server : ' + error);
    process.exit(1);
  }
})();
