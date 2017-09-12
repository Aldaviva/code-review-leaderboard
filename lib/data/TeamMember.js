var _  = require('lodash');
var my = require('myclass');

var TeamMember = my.Class({

    constructor: function(username) {
        _.bindAll(this);

        this.username = username;
        this.fullName = null;
        this.avatarUri = null;
        this.emailAddress = null;
        this.profileUri = null;
    }

});

module.exports = TeamMember;