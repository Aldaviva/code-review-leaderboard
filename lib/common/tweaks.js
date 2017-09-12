require('any-promise/register/q');

var _   = require('lodash');
var Q   = require('q');
var URI = require('urijs');
var JaxJs = require('@bluejeans/jax-js');
var http = require('http');
var https = require('https');

lodashTemplatePlaceholders();
lodashBindAll();
qPassThrough();
popsiclePolyfills();
clientRequestFilterHasHeader();
uriToJson();
maxHttpSockets();

/**
 * Instead of the default EJS/ERB placeholders <% %>, make lodash use Java/ES6 placeholders ${ }
 * @see lodashTemplateSettings
 */
function lodashTemplatePlaceholders() {
    _.extend(_.templateSettings, {
        interpolate: /\${{([^{](?:[^{]|(?:{.*?})*?)+?)}}/g, // ${{ }}
        escape: /\${([^{](?:[^{]|(?:{.*?})*?)+?)}/g, // ${ }
        evaluate: /%{([^{](?:[^{]|(?:{.*?})*?)+?)}/g // %{ }
    });
}

/**
 * In lodash 3.x, you could call _.bindAll(this) in the constructor of an object and all of the object's
 * methods and inherited methods would be bound to the scope of the object, so you can call them without
 * worrying about this being undefined.
 *
 * This feature was removed in lodash 4.0.0 because of incorrect opinions, so this tweak restores the
 * original useful behavior.
 * 
 * Callers who aren't aware of this tweak should still be safe because we're just replacing a noop that
 * a lodash 4.x user wouldn't call anyway.
 *
 * Direct all hatred to jdalton: https://github.com/lodash/lodash/issues/1782#issuecomment-177342838
 */
function lodashBindAll() {
    var originalBindAll = _.bindAll;

    _.bindAll = function(object, methodNames) {
        if (arguments.length === 1) {
            return originalBindAll(object, _.functionsIn(object));
        } else {
            return originalBindAll.apply(null, arguments);
        }
    };
}

/**
 * Wrap a .then(func) function with Q.passThrough(func) to prevent the fullfilment value from getting
 * modified by func. This is useful if you need to add more observers the promise chain without messing
 * up the data flow, for example, you want to add some logging statements but don't want to worry about
 * always calling `return` in your logging functions. Better yet, this lets you use first-class
 * functions as chain handlers without interrupting the data flow.
 *
 * Lodash has a similar concept in method chains called .tap().
 *
 * Q(myData)
 *     .then(Q.passThrough(myLogger, "doing something with data: "))
 *     .then(function(myData){
 *         // do something with myData
 *     });
 *
 * I have had to write the following code enough times that the more concise form above is useful.
 *
 * Q(myData)
 *     .then(function(myData){ //if you ever rearrange this chain the data flow will break!
 *         myLogger("doing something with data: ", myData);
 *         return myData;
 *     })
 *     .then(function(myData){
 *         // do something with myData
 *     });
 */
function qPassThrough() {
    Q.passThrough = function(innerFunction /*, varargs */) {
        var varargs = _.tail(arguments);
        return function(previousFulfillmentValue) {
            return Q.fapply(innerFunction, _.concat(varargs, previousFulfillmentValue))
                .thenResolve(previousFulfillmentValue);
        };
    };
}

/**
 * TODO: add this to JAX-JS
 * Determine if a header value has already been set on the given request based on the name (case-insensitive).
 * @return {boolean} true if the request has a header with the specified name, false otherwise
 */
function clientRequestFilterHasHeader() {
    JaxJs.ClientRequestFilter.prototype.hasHeader = function(request, headerName) {
        return _(request.headers).keys().some(function(key) {
            return key.toLowerCase() === headerName.toLowerCase();
        });
    };
}

/**
 * The Popsicle HTTP client needs a few polyfills in ES5 environments like PhantomJS and older browsers.
 * This adds Object.assign (using lodash) and Promise (using Q), which should be close enough.
 * @see https://www.npmjs.com/package/popsicle#javascript
 */
function popsiclePolyfills() {
    _.defaults(Object, { assign: _.assign });
    _.defaults(global, { Promise: Q.Promise });
}

/**
 * By default, returning a URI instance in a JSON object (over Restify or using 
 * JSON.stringify) results in a large object with internal fields of URI.js.
 * This way, including a URI in a JSON document will just return the URI in a 
 * String.
 */
function uriToJson(){
    URI.prototype.toJSON = function() {
        return this.toString();
    };
}

function maxHttpSockets() {
    http.globalAgent.maxSockets = 64;
    https.globalAgent.maxSockets = http.globalAgent.maxSockets;
}