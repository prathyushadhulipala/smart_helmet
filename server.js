var http = require("http");
var port = process.env.PORT || 8080;
var express = require('express');
var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.bodyParser());
var db = require('./core/db.js');
var mqtt = require('mqtt');

var event_id = "/node/smarthell/fromNode";
var options = {
	host:"m10.cloudmqtt.com",
  port: 16019,
  username:"nodemcu",
  password:"pass01@23"
};
var client  = mqtt.connect(options);

app.post('/alert', function(request, response){
        console.log("Server.js invoked with alert url");
		console.log("from request",request.body);
        var request = {
        "alertByMarshal":"yes",
        "alertType": "Yes",
        "helmetId": "H0001",
        "temperature": "24", 
        "pressure": "1", 
        "humidity": "60%",
        "altitude": "134",
        "location":"X:12,Y:13,Z:14"
        };
        client.publish(event_id, JSON.stringify(request), function() {
        console.log('publish event completed');
        response.send("Message successfully published to queue");    
    
        });
});

app.get('/userdetails', function(request, response){
console.log("Server.js invoked with userdetails url");
		  db.retrieveUserDetails(request.query.userId, function(err, data)
          {
              if(err) throw err;
             response.send(data); 
          });
    
});

app.get('/alertdetails', function(request, response){
console.log("Server.js invoked with userdetails url");
		  db.retrieveAlertDetails(request.query.alertId, function(err, data)
          {
              if(err) throw err;
             response.send(data); 
          });
    
});

app.get('/helmetdetails', function(request, response){
console.log("Server.js invoked with userdetails url");
		  db.retrieveAllHelmets(function(err, data)
          {
              if(err) throw err;
             response.send(data); 
          });
    
});

app.listen(port, function(){
    console.log('Listening on port number'+port);
});