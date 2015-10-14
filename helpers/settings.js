var settings = require("../settings.json");


var getSetting  = function (key){
	if(process.env.NODE_ENV === 'development'){
		
		var value = settings[key+'-'+process.env.NODE_ENV]
		
		if(value){
			return value; 
		}
		else{
			return settings[key];
		}
	}
};

var getEnvVar  = function (key){
	return process.env[key];
};


module.exports = {
	getSetting : getSetting,
	getEnvVar : getEnvVar 
};