# Analyze Auth0 Connection Providers on WebTask

Basically this module objective is to analyze your account connections and see what is being used and what is not.

There are two services:
* analyze-connection
   * **Arguments** clientId, clientSecret, identity and domain
   * **Returns** stats with identity, total users, users active this year, month and week.
* analyze-useless-connections
  * **Arguments** clientId, clientSecret and domain
  * **Returns** the identity(ies) name(s) without activity in the last month.
  
## Building and Testing

1. `wt init` and follow the steps to login
2. `wt create analyze-connection.js` or `wt create analyze-useless-connections.js` 
3. access `https://webtask.io/make` and test it, or curl with authorization headers.