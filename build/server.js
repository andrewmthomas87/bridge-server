"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var app = express();
app.get('/', function (_, response) {
    response.write('Hello world');
    response.end();
});
app.listen(7777, function () {
    console.log('Server listening on port 7777');
});
