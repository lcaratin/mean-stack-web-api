var config = require('config.json');
var express = require('express');
var router = express.Router();
var questionService = require('services/question.service');

router.get('/getAll', getQuestions);
router.post('/register', registerQuestion);

function getQuestions(req, res) {
    questionService.getAll()
        .then(function (questions) {
            res.send(questions);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}

function registerQuestion(req, res) {
    questionService.create(req.body)
        .then(function () {
            res.sendStatus(200);
        })
        .catch(function (err) {
            res.status(400).send(err);
        });
}