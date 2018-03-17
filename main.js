exports = module.exports = {};
var db = require('./db.js');
var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var sha256 = require('sha256');
var cookieParser = require('cookie-parser')


exports.express = express;
exports.app = app;
exports.path = path;
exports.bodyParser = bodyParser;
exports.sha256 = sha256;
exports.cookieParser = cookieParser;


// Get Time (or data based on parameter -> ie, if month is passed return month)
exports.getCurrentTime = function(data = ""){
    var dateTime = new Date();
    var hours, minutes, seconds;
    // Year, month, day
    if (data === "year"){ return dateTime.getFullYear(); }
    else if (data === "month"){ return dateTime.getMonth() + 1; }
    else if (data === "day"){
        return parseInt(dateTime.getDate() > 9) ? dateTime.getDate() : "0" + dateTime.getDate();
    } else {
        hour = parseInt(dateTime.getHours() > 9) ? dateTime.getHours() : "0" + dateTime.getHours();
        minutes = parseInt(dateTime.getMinutes() > 9) ? dateTime.getMinutes() : "0" + dateTime.getMinutes();
        seconds = parseInt(dateTime.getSeconds() > 9) ? dateTime.getSeconds() : "0" + dateTime.getSeconds();
    }
    // Hours, minutes, seconds
    if (data === "hours"){
        return hours;
    } else if (data === "minutes"){
        return minutes;
    } else if (data === "seconds"){
        return seconds;
    }
    return hour + ":" + minutes + ":" + seconds;
}
