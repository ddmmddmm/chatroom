let redis = {};
let r = require('redis');
let redisConfig = require('../config/redis-prod');
let client;
redis.init = function (callback) {
    // redis初始化
    let RDS_PORT = redisConfig.RDS_PORT;
    let RDS_HOST = redisConfig.RDS_HOST;
    let RDS_PWD = redisConfig.RDS_PWD;
    let RDS_OPTS = {'auth_pass': RDS_PWD};
    client = r.createClient(RDS_PORT, RDS_HOST, RDS_OPTS);
    client.on('ready', function (res) {
        console.log('redis client ready');
        callback && callback();
    });
};

redis.rpushRedis = function (key, data, callback) {
    var multi = client.multi();
    var rpushArr = [data];
    multi.rpush(key, rpushArr);
    // redis事务 https://redisbook.readthedocs.io/en/latest/feature/transaction.html
    multi.exec(function (errors, results) {
        'function' === typeof callback && callback(results);
    });
};

redis.lrangeRedis = function (key, callback) {
    client.lrange(key, 0, -1, function (err, res) {
        if (err) {
            console.log('Error:' + err);
            return;
        }
        'function' === typeof callback && callback(res);
    });
};

module.exports = redis;