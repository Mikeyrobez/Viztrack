'use strict';
var debug = require('debug');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser')
var requirejs = require('requirejs');

///////////////Route Variables///////////////////
var routes = require('./routes/index');   /////////routes the / call to index.js
var users = require('./routes/users');
//var viz = require('./routes/viztrack'); /////////routes the /viztrack call to vistrack.js
//////////////////////////////////////////////


var app = express(); ///////Initializes the server

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

///////////////////module declaractions///////////////////////////
// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));        ////////allows us to access javascripts from html
//////////////////////////require js config, do not use for any modules in node_modules/
requirejs.config({
    noneRequire: require
});

////////////////////////////////////////////////////////////////

///////////////Set the router//////////////////////////////
app.use('/', routes);     //////////////routes the / call to index.js
app.use('/users', users);
app.use('/viztrack', routes);
app.use(express.static(path.join(__dirname, 'public')));///// allows me to use javascript in html
////////////////////////////////////////////////////////

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function () {
    debug('Express server listening on port ' + server.address().port);
});
