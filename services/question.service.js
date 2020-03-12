var config = require('config.json');
var _ = require('lodash');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
var Q = require('q');
var mongo = require('mongoskin');
var db = mongo.db(config.connectionString, { native_parser: true });
db.bind('questions');

var service = {};

service.getAll = getAll;
service.create = create;

module.exports = service;

function getAll() {
    var deferred = Q.defer();

    db.questions.find({}).toArray(function (err, questions) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        deferred.resolve(questions);
    });

    return deferred.promise;
}

function create(questionParam) {
    var deferred = Q.defer();

    db.questions.findOne(
        { subject: questionParam.subject },
        function (err, user) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            if (user) {
                deferred.reject('Question "' + questionParam.subject + '" is already taken');
            } else {
                createQuestion();
            }
        });

    function createQuestion() {
        db.questions.insert(
            questionParam,
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}