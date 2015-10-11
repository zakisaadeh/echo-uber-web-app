var needle = require('needle');
var settings = require("../settings.json");

var getUserProfile = function(access_token, cb){

	needle.get('https://api.amazon.com/auth/o2/tokeninfo?access_token=' + encodeURIComponent(access_token), function(error, response) {
		if (!error && response.statusCode == 200)
			
			if (!settings.amazonClientId === response.body.aud) {
				
				var errorMsg = "the access token does not belong to us";
				
				console.error(errorMsg);
				
				return cb(errorMsg);
			}
			else{
				
				var options = {
					headers: { 'Authorization': 'bearer ' + access_token }
				}
				
				needle.get('https://api.amazon.com/auth/o2/tokeninfo?access_token=' + encodeURIComponent(access_token), options, function(user_profile_error, user_profile_response){
						console.log(user_profile_response.body);
						return cb(user_profile_response.body);
				});
			}
			
		});
	
};


module.exports = {
	getUserProfile : getUserProfile	
};
