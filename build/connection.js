"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mysql = require("mysql");
var Connection = (function () {
    function Connection(host, user, password, database) {
        this._connection = mysql.createConnection({ host: host, user: user, password: password, database: database });
    }
    Connection.prototype.connect = function () {
        this._connection.connect();
    };
    Connection.prototype.query = function (query, values) {
        var _this = this;
        if (values === void 0) { values = []; }
        return new Promise(function (resolve, reject) {
            _this._connection.query(query, values, function (error, rows) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(rows);
                }
            });
        });
    };
    Connection.prototype.querySingleRow = function (query, values) {
        if (values === void 0) { values = []; }
        return this.query(query, values)
            .then(function (rows) {
            if (!rows.length) {
                throw 'No rows';
            }
            return rows[0];
        });
    };
    Connection.prototype.queryNoReturn = function (query, values) {
        var _this = this;
        if (values === void 0) { values = []; }
        return new Promise(function (resolve, reject) {
            _this._connection.query(query, values, function (error, value) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(value ? value.insertId : -1);
                }
            });
        });
    };
    return Connection;
}());
var connection = new Connection('localhost', 'root', 'xyzzyy', 'bridge');
exports.default = connection;
