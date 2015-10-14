var needle = require('needle');
var settingsHelper = require("../helpers/settings");
var AWS = require('aws-sdk');
AWS.config.region = settingsHelper.getSetting("aws_region");

var getUserProfile = function(access_token, cb){

	needle.get('https://api.amazon.com/auth/o2/tokeninfo?access_token=' + encodeURIComponent(access_token), function(error, response) {
		if (!error && response.statusCode == 200)
			
			if (!settingsHelper.getSetting('amazonClientId') === response.body.aud) {
				
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
						return cb(null, user_profile_response.body);
				});
			}
			
		});
};


var storeUser = function (user, cb){
	
	var db = new AWS.DynamoDB();
	
	var params = {
		TableName : 'Users',
		Item: {
			"amazonUserId": {
            	"S": user.amazonUserId
        	}			
		}
	};
	
	if(user.uberUserId){
		params.Item["uberUserId"] = {
		  	"S": user.uberUserId	
		};
	}
	
	if(user.uberAccessToken){
		params.Item["uberAccessToken"] = {
		  	"S": user.uberAccessToken	
		};
	}
	
	if(user.uberRefreshToken){
		params.Item["uberRefreshToken"] = {
		  	"S": user.uberRefreshToken	
		};
	}

	db.putItem(params, function(err, data) {
		if (err) console.log(err, err.stack);
		else     console.log(data);           // successful response
		
		return cb(err, data);
	});
};


module.exports = {
	getUserProfile : getUserProfile,
	storeUser : storeUser	
};
