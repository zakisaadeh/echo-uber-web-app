var express = require('express');
var cookieParser = require('cookie-parser');
var app = express();
var amazonSvc = require('./services/amazon');
var uberSvc = require('./services/uber');
var settingsHelper = require('./helpers/settings');

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(cookieParser());

app.get('/', function(request, response) {
  
  var host = settingsHelper.getSetting('host')
  
  response.render('pages/login', {host: host});
  
});

app.get('/login', function(request, response) {
  
  var host = settingsHelper.getSetting('host')
  
  response.render('pages/login', { host : host });
});

app.get('/login_redirect', function(request, response){
  
  var accessToken = request.query.access_token;
  
  var clientId = settingsHelper.getEnvVar("UBER_CLIENT_ID");
  
  amazonSvc.getUserProfile(accessToken, function(err, authMessage){
    response.cookie("amazonUserId", authMessage.user_id);
    response.render('pages/member_area', 
      {
        message : authMessage,
        amazonUserId: authMessage.user_id,
        uberLoginLink: "https://login.uber.com/oauth/v2/authorize?response_type=code&client_id="+clientId+"&scope=profile request"
      });  
  });
  
});

// app.get('/test', function(request, response){
//   amazonSvc.storeUser({
//     amazonUserId : "amzn1.account.AGI6WWJDINNNS5DCVI4KZQKR62HA"
//   }, function(err, data){
//       response.json({
//         "error" : err,
//         "data" : data
//       });
//   });
// });


app.get('/uber_redirect', function(request, response){
  
  var oauthCode = request.query.code;
  
  var amazonUserId = request.cookies["amazonUserId"];    
   
   
  uberSvc.exchangeAuthCodeWithAccessToken(oauthCode, function(err, accessToken){
    
    var user = {
      "amazonUserId" : amazonUserId,
      "uberAccessToken" : accessToken
    };
    
    amazonSvc.storeUser(user, function(dberr, data){
      response.render('pages/member_area', 
      {
        message : err ? "Connecting to Uber Failed." : "You have successfully connected Uber account."
      });
    });
  
  });
  
});


app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


