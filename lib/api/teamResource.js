var apiServer   = require('./apiServer');
var teamService = require('../services/teamService');

apiServer.get({ path: '/cgi-bin/team/reviewsToReview', name: 'getTeamWithReviewsToReview' }, function(req, res, next) {
    teamService.getTeamMembersWithReviewsToReview()
        .then(function(teamMembersWithReviewsToReview) {
            res.send(teamMembersWithReviewsToReview);
        })
        .fail(next);
});