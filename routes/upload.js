/**
 * 文件上传
 * https://github.com/expressjs/multer/blob/master/doc/README-zh-cn.md
 * https://www.cnblogs.com/chyingp/p/express-multer-file-upload.html
 */

var express = require('express');
var router = express.Router();
var common = require('../service/common');
var multer = require('multer');
var upload = multer({dest: 'uploads/'});
var path = require('path');
var fs = require('fs');
var redis = require('../service/redis');
var commonConfig = require('../config/common-prod');
var redisKey = commonConfig.REDIS_KEY_PREFIX.upload + '001';

router.get('/', function (req, res, next) {
    redis.lrangeRedis(redisKey, function (arr) {
        let resultArr = [];
        console.log('lrange: ' + arr);
        if (arr && arr.length > 0) {
            arr = arr.reverse();
            arr.forEach(function (obj, $k) {
                try {
                    var json = JSON.parse(obj)
                    resultArr.push(json);
                } catch (e) {
                }
            });
        }
        res.render('upload', {items: resultArr});
    });
});

router.post('/uploadOne', upload.single('myFile'), function (req, res, next) {
    // req.file 是 `avatar` 文件的信息
    // req.body 将具有文本域数据，如果存在的话
    /*{
        fieldname: 'avatar',
        originalname: '2021-01-27.xlsx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        destination: 'uploads/',
        filename: 'eb8bb81cbfeaeb142f05c0b572149382',
        path: 'uploads/eb8bb81cbfeaeb142f05c0b572149382',
        size: 1650
    }*/
    if('undefined' === typeof req.file){
        res.redirect('/upload');
        return ;
    }
    // 原文件名
    var originalName = req.file.originalname;
    // 后缀名
    var extName = path.extname(originalName);
    // 新路径名
    var newPath = req.file.path + extName;
    var newFileName = req.file.filename + extName;

    var info = {
        // 原始信息
        'ori': req.file,
        // 路径名
        'path': newPath,
        // 文件名
        'fileName': newFileName,
        // 后缀名
        'extName': extName,
        // 原文件名
        'originalName': originalName,
        'createTime': common.now()
    };

    // 重命名
    fs.rename(req.file.path, newPath, function (err) {
        if (err) {
            res.send('上传失败')
        } else {
            redis.rpushRedis(redisKey, JSON.stringify(info), function (pushResult) {
                res.redirect('/upload');
            });
        }
    });
});

module.exports = router;
