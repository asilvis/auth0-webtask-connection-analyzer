var AuthenticationClient = require('auth0').AuthenticationClient;
var ManagementClient = require('auth0').ManagementClient;
var _ = require('lodash');
var moment = require('moment');

/**
 * @param context {WebtaskContext}
 */
module.exports = function (context, req, res) {
    var domain = context.data.domain;
    var clientId = context.data.clientId;
    var clientSecret = context.data.clientSecret;
    var identity = context.data.identity;

    var stats = { };

    var getManagementClient = function (idToken) {
        var management = new ManagementClient({
            token: idToken.access_token,
            'domain': domain + '.auth0.com'
        });

        management.getUsers({"q": 'identities.provider:"' + identity + '"', "search_engine": 'v2'}).then(function(users) {
            function filterByAge(targetUsers, daysBehind) {
                var date = moment().add(-daysBehind, 'days');
                return _.filter(targetUsers, function (user) {
                    return new Date(user.last_login) > date;
                });
            }

            var activeThisYear = filterByAge(users, 365);
            var activeThisMonth = filterByAge(activeThisYear, 30);
            var activeThisWeek = filterByAge(activeThisMonth,7);

            stats.identity = identity;
            stats.total = users.length;
            stats.activeThisYear = activeThisYear.length;
            stats.activeThisMonth = activeThisMonth.length;
            stats.activeThisWeek = activeThisWeek.length;

            res.writeHead(200, { 'Content-Type': 'text/json '});
            res.end(JSON.stringify(stats));
        });
    };

    var auth0 = new AuthenticationClient({
        'domain': domain + '.auth0.com',
        'clientId': clientId,
        'clientSecret': clientSecret
    });

    auth0.clientCredentialsGrant({
        audience: 'https://' + domain + '.auth0.com/api/v2/',
        scope: 'read:users read:connections'
    }).then(getManagementClient).catch(function(err){
        res.writeHead(500, { 'Content-Type': 'text/json '});
        res.end(JSON.stringify(err));
    });
};
