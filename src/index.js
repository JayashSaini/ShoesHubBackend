const dotenv = require('dotenv');
dotenv.config({
  path: './.env',
});

const { app } = require('./app.js');
const connectDB = require('./db');

(async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.info(`🚝 Server is running at port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('MongoDB conection error : ' + error);
    process.exit(1);
  }
})();
