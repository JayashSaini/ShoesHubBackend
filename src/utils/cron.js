const cron = require('node-cron');
const { User } = require('../models/auth/user.model.js');

function scheduleCronJob() {
  return new Promise((resolve, reject) => {
    cron.schedule(
      '0 0 * * *', // Run once every day at midnight
      async () => {
        try {
          await User.deleteMany({ isEmailVerified: false });
          resolve();
        } catch (error) {
          console.error('Error in cron job function:', error);
          reject(error); // Reject the promise if there's an error
        }
      },
      {
        timezone: 'Asia/Kolkata',
      }
    );
  });
}

module.exports = scheduleCronJob;
