const Redis = require("ioredis");
const CONFIG = require('../config')



const redisClient = new Redis(CONFIG.REDIS);

redisClient.on('error', (err) => {
    console.log('Redis Client Error:', err);
});

async function redisInitialise(config) {
  const redis = new Redis(config);
  
  redis.on('connect', () => {
    console.log('Connected to Redis successfully');
  });

  redis.on('error', (err) => {
    console.error('Redis connection error:', err);
  });

  return redis;
}

async function getCacheValue(key) {
  try {
    const value = await redisClient.get(key);
    return value;
  } catch (error) {
    console.log("Redis Get Error:", error);
    return null;
  }
}

async function setCacheValue(key, value, expiry = 86400) {
  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.set(key, stringValue, "EX", expiry);
    return "success";
  } catch (error) {
    console.log("Redis Set Error:", error);
    return "error";
  }
}

async function rpushCacheList(key, value, expiry = 86400) {
  try {
    const type = await redisClient.type(key);
    if (type === 'string') {
      await redisClient.del(key);
    }
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    await redisClient.rpush(key, stringValue);
    await redisClient.expire(key, expiry);
    return "success";
  } catch (error) {
    console.log("Redis RPush Error:", error);
    return "error";
  }
}

async function getCacheList(key) {
  try {
    const type = await redisClient.type(key);
    if (type === 'string') {
      const val = await redisClient.get(key);
      if (val) {
          const parsed = JSON.parse(val);
          return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    }
    const values = await redisClient.lrange(key, 0, -1);
    return values.map(v => JSON.parse(v));
  } catch (error) {
    console.log("Redis LRange Error:", error);
    return [];
  }
}

async function ltrimCacheList(key, start, end) {
  try {
    const type = await redisClient.type(key);
    if (type !== 'list') return "success";
    await redisClient.ltrim(key, start, end);
    return "success";
  } catch (error) {
    console.log("Redis LTrim Error:", error);
    return "error";
  }
}

async function deleteCacheValue(key) {
  try {
    await redisClient.del(key);
    return "success";
  } catch (error) {
    console.log("Redis Delete Error:", error);
    return "error";
  }
}

async function flushCache() {
  try {
    await redisClient.flushdb();
    return "Cache cleared";
  } catch (error) {
    console.log("Redis Flush Error:", error);
    return "error";
  }
}

async function getKeysByPattern(pattern) {
  try {
    const keys = await redisClient.keys(pattern);
    return keys;
  } catch (error) {
    console.log("Redis Get Keys Error:", error);
    return [];
  }
}

module.exports = { 
  redisClient, 
  getCacheValue, 
  setCacheValue, 
  deleteCacheValue, 
  flushCache, 
  redisInitialise, 
  getKeysByPattern,
  rpushCacheList,
  getCacheList,
  ltrimCacheList
};
