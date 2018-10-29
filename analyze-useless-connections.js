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

    var getManagementClient = function (idToken) {
        var management = new ManagementClient({
            token: idToken.access_token,
            'domain': domain + '.auth0.com'
        });

        management.getConnections().then(function (connections) {
            management.getUsers().then(function(users) {
                var useless = _.filter(connections, function(connection) {
                    function filterByAge(targetUsers, daysBehind) {
                        var date = moment().add(-daysBehind, 'days');
                        return _.filter(targetUsers, function (user) {
                            return new Date(user.last_login) > date && connection.strategy === user.identities[0].provider;
                        });
                    }

                    var activeThisMonth = filterByAge(users, 30);
                    return activeThisMonth.length === 0;
                });

                var result = _.map(useless, _.partialRight(_.pick, 'strategy'));

                res.writeHead(200, { 'Content-Type': 'text/json '});
                res.end(JSON.stringify(result));
            });
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
