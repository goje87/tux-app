# usage-tracker

node usage tracker


## usage

```
var usageTracker = require('usage-tracker');

usageTracker.initialize({
    owner: 'vivaxy',
    repo: 'usage-tracker',
    number: 1,
    token: 'github authorization token', // token should be encrypted
    log: log,
    report: {
        'usage-tracker-version': require('./package.json').version
    }
});

usageTracker.send({
    // event
    event: 'test',
    data: 'this is a test comment'
});

```

## api

### class `UsageTracker`

access by `usageTracker.UsageTracker`

### method `on`

```
usageTracker.on('eventType', function () {
    // callback goes on here
});
```

## event

### `end`

response end

### `success`

response end and report sent successfully

### `err`

request error

callback accepts one argument: `error` object, containing `error.message`, `error.stack`

## default report

```
time: dateFormat(new Date(), 'yyyy-mm-dd HH:MM:ss.l o'),
arch: process.arch,
platform: process.platform,
'node-version': process.version,
argv: process.argv,
cwd: process.cwd(),
'usage-tracker-version': require('./package.json').version
```
