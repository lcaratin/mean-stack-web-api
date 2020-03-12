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
service.getById = getById;
service.update = update;
service.delete = _delete;

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

function getById(_id) {
    var deferred = Q.defer();

    db.questions.findById(_id, function (err, question) {
        if (err) deferred.reject(err.name + ': ' + err.message);

        if (question) {
            deferred.resolve(question);
        } else {
            deferred.resolve();
        }
    });

    return deferred.promise;
}

function update(_id, questionParam) {
    var deferred = Q.defer();

    db.questions.findById(_id, function (err, question) {
        if (err) deferred.reject(err.name + ': ' + err.message);
        if (question.subject !== questionParam.subject) {
            db.questions.findOne(
                { subject: questionParam.subject },
                function (err, question) {
                    if (err) deferred.reject(err.name + ': ' + err.message);
                    if (question) {
                        deferred.reject('Subject "' + question.subject + '" is already taken')
                    } else {
                        updateQuestion();
                    }
                });
        } else {
            updateQuestion();
        }
    });

    function updateQuestion() {
        // fields to update
        var set = {
            subject: questionParam.subject,
            description: questionParam.description
        };

        db.questions.update(
            { _id: mongo.helper.toObjectID(_id) },
            { $set: set },
            function (err, doc) {
                if (err) deferred.reject(err.name + ': ' + err.message);

                deferred.resolve();
            });
    }

    return deferred.promise;
}
function _delete(_id) {
    var deferred = Q.defer();

    db.questions.remove(
        { _id: mongo.helper.toObjectID(_id) },
        function (err) {
            if (err) deferred.reject(err.name + ': ' + err.message);

            deferred.resolve();
        });

    return deferred.promise;
}