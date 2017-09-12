var AcceptClientFilter    = require('../remote/http/AcceptClientFilter');
var BasicAuthClientFilter = require('../remote/http/BasicAuthClientFilter');
var config                = require('../common/config');
var httpClient            = require("../common/httpClient");

module.exports = httpClient.target(config.crucible.baseUri)
    .path("rest-service")
    .register(new BasicAuthClientFilter(config.crucible.username, config.crucible.password))
    .register(new AcceptClientFilter("application/json"));