var _     = require('lodash');
var JaxJs = require('@bluejeans/jax-js');
var my    = require('myclass');
var logger = require('../../common/logger')(module);

var AcceptClientFilter = my.Class(JaxJs.ClientRequestFilter, {

    /**
     * Make a new client request filter that can add Accept headers to outgoing requests.
     * @param {String|List<String>} mediaTypes One or more strings of acceptable media types
     * @example httpClient.register(new AcceptClientFilter([
     *              "application/json",
     *              "text/xml;q=0.8"
     *          ]))
     */
    constructor: function(mediaTypes) {
        _.bindAll(this);

        this.mediaTypes = _.flatten([mediaTypes]);
    },

    filterRequest: function(request) {
        if (!this.hasHeader(request, "Accept")) {
            _.extend(request.headers, {
                "Accept": this.mediaTypes
            });
        }

        return request;
    }

});

module.exports = AcceptClientFilter;