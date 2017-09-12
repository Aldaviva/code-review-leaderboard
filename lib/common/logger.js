var bunyan = require('bunyan');
var path = require('path');

var rootLogger = bunyan.createLogger({
    name: "code-review-leaderboard",
    level: "trace",
    streams: [
        //{ path: '/var/log/medivac' },
        { stream: process.stdout }
    ]
});

module.exports = function(module) {
    if (module) {
        return rootLogger.child({ module: path.basename(module.filename, '.js') });
    } else {
        return rootLogger;
    }
};
