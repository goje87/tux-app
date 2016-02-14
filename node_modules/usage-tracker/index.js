/**
 * @since 15-08-24 20:49
 * @author vivaxy
 */
'use strict';
var util = require('util'),
    https = require('https'),
    events = require('events'),

    EventEmitter = events.EventEmitter,

    log = require('log-util'),
    dateFormat = require('dateformat'),

    UsageTracker = function (options) {

        EventEmitter.apply(this, arguments);

        this.host = 'api.github.com';
        this.port = 443;
        this.defaultReport = {
            time: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l o'),
            arch: process.arch,
            platform: process.platform,
            'node-version': process.version,
            argv: process.argv,
            cwd: process.cwd(),
            'usage-tracker-version': require('./package.json').version
        };
        this.initialize(options);
    };

util.inherits(UsageTracker, EventEmitter);
var p = UsageTracker.prototype;
p.constructor = UsageTracker;

p.send = function (o) {
    var _this = this,
        log = _this.log,
        postData = JSON.stringify({
            body: this.getRequestBody(o)
        }),
        options = {
            host: this.host,
            port: this.port,
            path: this.path,
            method: 'POST',
            headers: {
                'Authorization': 'token ' + this.token,
                'Accept': 'application/json; charset=utf-8',
                'Content-Type': 'application/json; charset=utf-8',
                // http://stackoverflow.com/questions/17922748/what-is-the-correct-method-for-calculating-the-content-length-header-in-node-js
                // Buffer.byteLength instead of String.prototype.length
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': require('./package.json').name + '/' + require('./package.json').version
            }
        },
        req = https.request(options, function (res) {
            var responseData = '';
            log.debug('status code', res.statusCode);
            if (res.statusCode === 201) {
                log.debug('usage sent');
                _this.emit('success');
            }
            res.on('data', function (data) {
                responseData += data;
            });
            // there is event `close`
            res.on('end', function () {
                log.verbose('response end', responseData);
                _this.emit('end');
            });
        });
    log.verbose('Authorization', options.headers['Authorization']);
    log.verbose('Content-Length', options.headers['Content-Length']);
    log.verbose('User-Agent', options.headers['User-Agent']);
    log.verbose('post data', postData);
    req.on('error', function (e) {
        log.debug(e.stack);
        // cannot use `error` in nodejs
        _this.emit('err', e);
    });
    req.end(postData);
    return this;
};

p.prettify = function (o) {
    var output = '\n';
    for (var i in o) {
        if (o.hasOwnProperty(i)) {
            output += '"' + i + '": ' + JSON.stringify(o[i], null, '    ') + ',\n';
        }
    }
    return output;
};

p.getRequestBody = function (o) {
    return '```json' +
        '\n' +
        this.prettify(this.defaultReport) +
        this.prettify(this.report) +
        this.prettify(o).slice(0, -2) +
        '\n' +
        '```'
};

p.initialize = function (options) {
    this.log = options.log || log;
    this.owner = options.owner || 'vivaxy';
    this.repo = options.repo || 'usage-tracker';
    this.number = options.number || 1;
    this.token = options.token || '';
    this.report = options.report || {};
    this.path = '/repos/' + this.owner + '/' + this.repo + '/issues/' + this.number + '/comments';
    return this;
};

var usageTracker = new UsageTracker({});
usageTracker.UsageTracker = UsageTracker;
module.exports = usageTracker;
