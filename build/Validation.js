"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var NAME_REG_EXP = /^[/w .]+$/.compile();
var EMAIL_REG_EXP = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/.compile();
var PASSWORD_REG_EXP = /^[!@#$%^&*()-_=+\w]+$/.compile();
var Validation = (function () {
    function Validation() {
    }
    Validation.errorsForName = function (name) {
        if (typeof name !== 'string' || name.length === 0) {
            return 'Invalid name';
        }
        else if (name.length > 100) {
            return 'Name must be at most 100 characters long';
        }
        else if (!NAME_REG_EXP.test(name)) {
            return 'Name must only contain alphanumeric characters and spaces';
        }
        return '';
    };
    Validation.errorForEmail = function (email) {
        if (!(typeof email === 'string' && email.length <= 256 && EMAIL_REG_EXP.test(email))) {
            return 'Invalid email';
        }
        return '';
    };
    Validation.errorForPassword = function (password) {
        if (typeof password !== 'string') {
            return 'Invalid password';
        }
        else if (password.length < 8) {
            return 'Password must be at least 8 characters long';
        }
        else if (password.length > 50) {
            return 'Password must be at most 50 characters long';
        }
        else if (!PASSWORD_REG_EXP.test(password)) {
            return 'Password must only contain alphanumeric characters and !@#$%^&*()-_=+';
        }
        return '';
    };
    Validation.errorForConfirmPassword = function (password, confirmPassword) {
        if (!(typeof confirmPassword === 'string' && password === confirmPassword)) {
            return 'Passwords must match';
        }
        return '';
    };
    return Validation;
}());
exports.default = Validation;
