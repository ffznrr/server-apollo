if (process.env.NODE_ENV !== "production") {
    require('dotenv').config()
}

const Redis = require("ioredis");

const redis = new Redis({
    password: process.env.REDIS_PASS,
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

module.exports = redis