var needle = require('needle');
var settingsHelper = require("../helpers/settings");

var exchangeAuthCodeWithAccessToken = function(authCode, cb){

    var params = {
        code: authCode,
        grant_type: 'authorization_code',
        client_secret: settingsHelper.getEnvVar("UBER_CLIENT_SECRET"),
        client_id: settingsHelper.getEnvVar("UBER_CLIENT_ID"),
        redirect_uri : settingsHelper.getSetting("host") + '/uber_redirect'
    };
    
    needle.post('https://login.uber.com/oauth/token', params, function(err, resp) {
         
         if(err){
             return cb(err);
         }
         
         console.log("exchangeAuthCodeWithAccessToken");
         console.log(resp.body);
         
         var accessToken = resp.body.access_token;
         return cb(null, accessToken);
    });  
};

module.exports = {
    exchangeAuthCodeWithAccessToken: exchangeAuthCodeWithAccessToken	
};