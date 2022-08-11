const redis = require("redis");
const bluebird = require("bluebird");

options = {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD || "",
    retry_strategy: function (options) {
        if (options.error && options.error.code === "ECONNREFUSED") {
            // End reconnecting on a specific error and flush all commands with
            // a individual error
            return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
            // End reconnecting after a specific timeout and flush all commands
            // with a individual error
            return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
            // End reconnecting with built in error
            return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
    },
};
if(process.env.REDIS_USER){
    options.user = process.env.REDIS_USER;
}

bluebird.promisifyAll(redis);
var client = redis.createClient(options);

module.exports.healthcheck = () => {
    return { "redisConnection": client.connected };
};

module.exports.client = client;