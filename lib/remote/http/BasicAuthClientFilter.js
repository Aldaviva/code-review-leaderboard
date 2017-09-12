var _     = require('lodash');
var JaxJs = require('@bluejeans/jax-js');
var my    = require('myclass');

var BasicAuthClientFilter = my.Class(JaxJs.ClientRequestFilter, {

    constructor: function(username, password) {
        _.bindAll(this);

        this.authHeader = this.createAuthHeader(username, password);
    },

    createAuthHeader: function(username, password) {
        var unencoded = new Buffer(username + ":" + password);
        var encoded = unencoded.toString("base64");
        return { "Authorization": "Basic " + encoded };
    },

    filterRequest: function(request) {
        if (!this.hasHeader(request, "Authorization")) {
            _.extend(request.headers, this.authHeader);
        }

        return request;
    }

});

module.exports = BasicAuthClientFilter;