var needle = require('needle');
var settingsHelper = require("../helpers/settings");
var AWS = require('aws-sdk');

AWS.config.region = settingsHelper.getSetting("awsRegion");

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
	
	if(user.uberRequestId){
		params.Item["uberRequestId"] = {
		  	"S": user.uberRequestId	
		};
	}
	
	if(user.lat){
		params.Item["lat"] = {
		  	"S": user.lat	
		};
	}		
	
	if(user.lon){
		params.Item["lon"] = {
		  	"S": user.lon	
		};
	}			
	

	db.putItem(params, function(err, data) {
		if (err) console.log(err, err.stack);
		else     console.log(data);           // successful response
		
		return cb(err, data);
	});
};

var getUser = function (amazonUserId, cb){
	
	var db = new AWS.DynamoDB();
	
	var params = {
		TableName : 'Users',
		Key: {
			"amazonUserId": {
            	"S": amazonUserId
        	}			
		}
	};
	
	db.getItem(params, function(err, data) {
		if (err){
			console.log(err, err.stack); // an error occurred
			return cb(err);
		} 
		else{
			console.log(data);           // successful response
			return cb(null, flattenItem(data));
		}     
	});
};

function flattenItem(result){
    var item = result.Item;
	
    var flattenedItem = {};
 
    for (var property in item) {
        if (item.hasOwnProperty(property)) {
            
            var itemProp = item[property];
            
            for (var innerProperty in itemProp) {
                if (itemProp.hasOwnProperty(innerProperty)) {
                    flattenedItem[property] = itemProp[innerProperty];
					break;
                }
            }       
        }
    }
	
	return flattenedItem;	
}


module.exports = {
	getUserProfile : getUserProfile,
	storeUser : storeUser,
	getUser: getUser
};
