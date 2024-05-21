// redisClient.js
const Redis = require('ioredis');

const redis = new Redis({
  host: process.env.REDIS_HOST, // Redis server hostname
  port: process.env.REDIS_PORT, // Redis server port
  password: process.env.REDIS_PASSWORD, // Redis password
  db: 0, // Default DB number
});

// Event listeners for connection events

// Function to test the connection
const startRedis = async () => {
  try {
    redis.on('connect', () => {
      console.log('Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('Redis connection Error:', err);
      process.exit(1);
    });

    await redis.set('testKey', 'testValue');
    await redis.get('testKey');
    await redis.del('testKey');
  } catch (err) {
    console.error('Error during Redis test:', err);
    process.exit(1);
  }
};

module.exports = { startRedis, redis };
