"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = require("body-parser");
var cookieParser = require("cookie-parser");
var express = require("express");
var path_1 = require("path");
var bcrypt_1 = require("bcrypt");
var jsonwebtoken_1 = require("jsonwebtoken");
var connection_1 = require("./connection");
var Validation_1 = require("./Validation");
var API_1 = require("./API");
var SALT_ROUNDS = 10;
var JWT_SECRET = 'so very secret secret';
var COOKIE_NAME = 'bridge-user';
var app = express();
var EMPTY_SUCCESS_RESPONSE = successResponseFor(undefined);
var EMPTY_ERROR_RESPONSE = errorResponseFor(undefined);
function errorResponseFor(error) {
    return {
        ok: false,
        error: error
    };
}
function successResponseFor(data) {
    return {
        ok: true,
        data: data
    };
}
app.use(express.static(path_1.join(__dirname, '../../bridge-client/static/')));
app.use(body_parser_1.json());
app.use(cookieParser());
app.get('/sign-out', function (_, response) {
    response.clearCookie(COOKIE_NAME);
    response.redirect('/');
});
app.get('/user*', function (request, response) {
    var token = getToken(request);
    if (token === null) {
        response.redirect('/');
        return;
    }
    response.sendFile(path_1.join(__dirname, "../../bridge-client/" + (token.isGroup ? 'group' : 'student') + ".html"));
});
app.get('/*', function (request, response) {
    var token = getToken(request);
    if (token !== null) {
        response.redirect('/user');
        return;
    }
    response.sendFile(path_1.join(__dirname, '../../bridge-client/home.html'));
});
app.post('/sign-in', function (request, response) {
    var data = request.body;
    if (!isValid(data, 'email', 'password')) {
        response.sendStatus(400);
        return;
    }
    var token;
    connection_1.default.querySingleRow('select id, isGroup, password from users where email=?', [data.email])
        .then(function (user) {
        token = tokenFor(user.id, user.isGroup);
        return bcrypt_1.compare(data.password, user.password);
    })
        .then(function (result) {
        if (!result) {
            throw false;
        }
        response.cookie(COOKIE_NAME, jsonwebtoken_1.sign(token, JWT_SECRET), {
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7
        });
        response.send(EMPTY_SUCCESS_RESPONSE);
    })
        .catch(function () {
        response.send(EMPTY_ERROR_RESPONSE);
    });
});
app.post('/sign-up', function (request, response) {
    var data = request.body;
    if (!isValid(data, 'isGroup', 'name', 'email', 'password', 'confirmPassword')) {
        response.sendStatus(400);
        return;
    }
    var errors = new Map();
    var error = Validation_1.default.errorsForName(data.name);
    if (error)
        errors.set('name', error);
    error = Validation_1.default.errorForEmail(data.email);
    if (error)
        errors.set('email', error);
    error = Validation_1.default.errorForPassword(data.password);
    if (error)
        errors.set('password', error);
    error = Validation_1.default.errorForConfirmPassword(data.password, data.confirmPassword);
    if (error)
        errors.set('confirmPassword', error);
    if (errors.size) {
        response.send(errorResponseFor({
            nameError: errors.get('name') || '',
            emailError: errors.get('email') || '',
            passwordError: errors.get('password') || '',
            confirmPasswordError: errors.get('confirmPassword') || ''
        }));
        return;
    }
    connection_1.default.querySingleRow('select id from users where email=?', [data.email])
        .then(function () {
        response.send(errorResponseFor({
            nameError: '',
            emailError: 'Email already in use',
            passwordError: '',
            confirmPasswordError: ''
        }));
    }).catch(function () {
        bcrypt_1.hash(data.password, SALT_ROUNDS)
            .then(function (hash) {
            return connection_1.default.queryNoReturn('insert into users (isGroup, name, email, password) values (?, ?, ?, ?)', [data.isGroup, data.name, data.email, hash]);
        }).then(function (id) {
            response.cookie(COOKIE_NAME, jsonwebtoken_1.sign(tokenFor(id, data.isGroup), JWT_SECRET), {
                httpOnly: true,
                maxAge: 1000 * 60 * 60 * 24 * 7
            });
            response.send(EMPTY_SUCCESS_RESPONSE);
        }).catch(function () {
            response.sendStatus(500);
        });
    });
});
var api = new API_1.default(app);
api.registerHandlers();
app.listen(7777, function () {
    console.log('Server listening on port 7777');
});
function tokenFor(id, isGroup) {
    return { id: id, isGroup: isGroup };
}
function getToken(request) {
    if (request.cookies && request.cookies[COOKIE_NAME]) {
        try {
            return jsonwebtoken_1.verify(request.cookies[COOKIE_NAME], JWT_SECRET);
        }
        catch (e) {
            request.clearCookie(COOKIE_NAME);
        }
    }
    return null;
}
exports.getToken = getToken;
function isValid(obj) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
        var key = keys_1[_a];
        if (!obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}
exports.isValid = isValid;
