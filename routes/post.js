'use strict';
var router = require('express').Router();

var Post = require('../models/post');

var fetch = require('../utils/fetch');
var parser = require('../utils/parser');

router.get('/', function (req, res, next) {
    Post.list().then(function (results) {
        res.render('post', {
            title: '文章列表',
            posts: results
        });
    }, function (err) {
        if (err.code === 101) {
            res.render('post', {
                title: '文章列表',
                post: results
            });
        } else {
            next(err);
        }
    }).catch(next);
}).post('/', function (req, res, next) {
    var url = req.body.url;
    if (url) {
        fetch(url).then(function (html) {
            var title = req.body.title;
            var thumb = req.body.thumb;
            var description = req.body.description;
            parser(html, {
                title: !title,
                thumb: !thumb,
                description: !description,
                url: url
            }).then(function (result) {
                result.title = title || result.title;
                result.thumb = thumb || result.thumb;
                result.description = description || result.description;
                result.url = url;
                Post.insert(result).then(function (article) {
                    res.redirect('/post');
                }).catch(next);
            });
        });
    } else {
        res.redirect('/post/recommend');
    }
}).get('/recommend', function (req, res, next) {
    res.render('recommend', {
        title: '推荐文章'
    });
});

module.exports = router;