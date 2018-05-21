"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var connection_1 = require("./connection");
var server_1 = require("./server");
var API = (function () {
    function API(app) {
        this._getUser = function (token) {
            return connection_1.default.querySingleRow('select name, email from users where id=?', [token.id]).then(function (row) {
                return {
                    id: token.id,
                    isGroup: token.isGroup,
                    name: row.name,
                    email: row.email
                };
            }).catch(function () {
                throw 500;
            });
        };
        this._createEvent = function (token, data) {
            if (!token.isGroup) {
                return Promise.reject(403);
            }
            return connection_1.default.queryNoReturn('insert into events (groupId, title, location, eventDate, description) values(?, ?, ?, date_add(date_add(makedate(?, 1), interval (?) month), interval (?)-1 day), ?)', [token.id, data.title, data.location, data.year, data.month, data.day, data.description])
                .then(function () { })
                .catch(function () {
                throw 500;
            });
        };
        this._app = app;
    }
    API.prototype.registerHandlers = function () {
        this._registerHandler('/get-user', this._getUser);
        this._registerHandler('/create-event', this._createEvent, ['title', 'location', 'month', 'year', 'day', 'description']);
    };
    API.prototype._registerHandler = function (route, handler, keys) {
        this._app.post("/api" + route, this._handleRequest.bind(this, handler, keys));
    };
    API.prototype._handleRequest = function (handler, keys, request, response) {
        var token = server_1.getToken(request);
        if (token === null) {
            response.sendStatus(403);
            return;
        }
        var data;
        if (keys) {
            data = request.body;
            if (!server_1.isValid.apply(void 0, [data].concat(keys))) {
                response.sendStatus(400);
                return;
            }
        }
        else {
            data = undefined;
        }
        handler(token, data, request, response).then(function (data) {
            response.send({
                ok: true,
                data: data
            });
        }).catch(function (error) {
            if (typeof error === 'number') {
                response.sendStatus(error);
            }
            else {
                response.send({
                    ok: false,
                    error: error
                });
            }
        });
    };
    return API;
}());
exports.default = API;
