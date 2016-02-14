/**
 * @since 15-08-25 10:43
 * @author vivaxy
 */
'use strict';
var path = require('path');
var usageTracker = require('../index.js');

usageTracker.initialize({
    owner: 'vivaxy',
    repo: 'usage-tracker',
    number: 1,
    token: require(path.join(__dirname, '../package.json'))['usage-tracker-id'].split('').reverse().join(''),
    report: {
        // time
        timestamp: new Date().getTime()
    }
}).on('end', function () {
    console.log('request end');
}).on('success', function () {
    console.log('request success');
}).on('err', function (e) {
    console.log(e.stack);
});

usageTracker.send({
    // event
    event: 'test',
    data: {
        '测试': '中文',
        'object': 'string',
        'array': [1, 2, 3],
        'anotherArray': ['string', 'another', 'other']
    }
});
