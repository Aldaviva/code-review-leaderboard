var JaxJs = require('@bluejeans/jax-js');
var popsicle = require('popsicle');

var client = new JaxJs.Client({
    httpClient: popsicle
});

module.exports = client;