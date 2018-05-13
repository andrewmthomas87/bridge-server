"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var body_parser_1 = require("body-parser");
var express = require("express");
var path_1 = require("path");
var Validation_1 = require("./Validation");
var app = express();
var EMPTY_SUCCESS_RESPONSE = successResponseFor(undefined);
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
app.get('/*', function (_, response) {
    response.sendFile(path_1.join(__dirname, '../../bridge-client/home.html'));
});
app.get('/user/*', function (_, response) {
    response.sendFile(path_1.join(__dirname, '../../bridge-client/user.html'));
});
app.post('/sign-up', function (request, response) {
    var data = request.body;
    if (!isValid(data, 'isGroup', 'email', 'password', 'confirmPassword')) {
        response.sendStatus(400);
        return;
    }
    var errors = new Map();
    var error = Validation_1.default.errorForEmail(data.email);
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
            emailError: errors.get('email') || '',
            passwordError: errors.get('passwordError') || '',
            confirmPasswordError: errors.get('confirmPassword') || ''
        }));
    }
    else {
        response.send(EMPTY_SUCCESS_RESPONSE);
    }
});
app.listen(7777, function () {
    console.log('Server listening on port 7777');
});
function isValid(obj) {
    var keys = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        keys[_i - 1] = arguments[_i];
    }
    for (var _a = 0, keys_1 = keys; _a < keys_1.length; _a++) {
        var key = keys_1[_a];
        if (obj.hasOwnProperty(key)) {
            return false;
        }
    }
    return true;
}
