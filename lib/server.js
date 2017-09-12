var startTime   = new Date();

var fs          = require('fs');
fs.writeFile(".pid", process.pid);

require("./common/tweaks");

var Q           = require('q');
var logger      = require('./common/logger')(module);
var userConfig  = require('../config');

require('./common/config').init(userConfig);

var server = require('./api/apiServer');
require('./api/teamResource');
require('./api/staticServer');
var serverStartPromise = server.start();

/**
 * Shutdown handling
 */
var shutdownPromise;
var shutdown = module.exports.shutdown = function() {
    if (!shutdownPromise) {
        shutdownPromise = startedPromise
            .finally(function() {
                logger.info("Shutting down...");
                return Q()
                    .then(server.shutdown)
                    .fail(function(err) {
                        logger.error(err);
                        throw err;
                    })
                    .then(function() {
                        logger.info("Shut down.");
                        fs.unlinkSync(".pid");
                        process.exit(0);
                    })
                    .done();
            });
    }
    return shutdownPromise;
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/**
 * Startup complete
 */
var startedPromise = module.exports.startedPromise = Q.all([ serverStartPromise ])
    .then(function() {
        logger.info("Startup complete in %d ms.", (new Date() - startTime));
    })
    .fail(function(err) {
        logger.error("Failed to start: %s", err);
        shutdown();
        throw err;
    });
    
startedPromise.done();
