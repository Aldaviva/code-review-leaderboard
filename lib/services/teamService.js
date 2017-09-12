var _              = require('lodash');
var config         = require('../common/config');
var crucibleTarget = require('../remote/crucibleTarget');
var logger         = require('../common/logger')(module);
var my             = require('myclass');
var Q              = require('q');
var TeamMember     = require('../data/TeamMember');
var URI            = require('urijs');

var TeamService = my.Class({

    constructor: function() {
        _.bindAll(this);

        this.membersPromise = null;

        this.populateTeam();
    },

    /**
     * https://docs.atlassian.com/fisheye-crucible/2.1.0/wadl/crucible.html#d2e52
     */
    populateTeam: function() {
        logger.debug("Populating static team member data...");

        var userTarget = crucibleTarget
            .path("users-v1")
            .path("{username}");

        this.membersPromise = Q.all(_.map(config.team.members, _.bind(function(username) {
            return userTarget
                .resolveTemplates({ username: username })
                .request()
                .get(JSON)
                .then(function(restUserProfileData) {
                    var member = new TeamMember(username);
                    member.fullName = restUserProfileData.userData.displayName;
                    member.avatarUri = new URI(restUserProfileData.avatarUrl);
                    member.emailAddress = restUserProfileData.email;
                    member.profileUri = new URI(restUserProfileData.userData.url, restUserProfileData.avatarUrl);
                    return member;
                })
                .fail(function(err) {
                    logger.error({ err: err.toString(), stack: err.stack, username: username }, "Failed to fetch user profile");
                    throw err;
                });
        }, this)))
        .then(function(members) {
            logger.debug({ members: members }, "Static team member data populated.");
            return members;
        });
    },

    getTeamMembersWithReviewsToReview: function() {
        logger.debug("Counting how many views each team member has to review...");

        var reviewsTarget = crucibleTarget
            .path("reviews-v1")
            .path("filter")
            .queryParam("reviewer", "{username}")
            .queryParam("complete", false)
            .queryParam("states", ["Review"].join(","));

        return this.membersPromise.then(_.bind(function(members) {
            return Q.all(_.map(members, _.bind(function(member) {
                return reviewsTarget
                    .resolveTemplates({ username: member.username })
                    .request()
                    .get(JSON)
                    .then(function(reviews) {
                        return _.extend({
                            reviewsToReviewCount: reviews.reviewData.length
                        }, member);
                    });
            }, this)))
            .then(function(membersWithReviews) {
                return _.orderBy(membersWithReviews, ["reviewsToReviewCount", "fullName"], ["asc", "asc"]);
            })
            .then(function(sortedMembersWithReviews) {
                logger.debug({ members: sortedMembersWithReviews }, "Retrieved count of reviews to review for all team members.");
                return sortedMembersWithReviews;
            })
        }, this));
    }

});

module.exports = new TeamService();