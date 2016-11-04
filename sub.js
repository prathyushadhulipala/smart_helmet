var mqtt = require('mqtt');

var event_id = "/node/smarthell/fromNode";

var options = {
	host:"m10.cloudmqtt.com",
  port: 16019,
  username:"nodemcu",
  password:"pass01@23"
};

var client  = mqtt.connect(options);
var db = require('./core/db.js');


client.on('message', function(topic, data){
     console.log('>>>>> inside on message + ' + topic + data);
	 	 
	 var dataObj = JSON.parse(data);
	 console.log(">>>> data from the pubsub is:" + dataObj);
        
    	 db.insertAlerts(data, function(err, insertId)
                        {
            if(err) throw err;
             if(insertId){ console.log('Alert inserted successfully');}
         });
		// use the device id to call twilio service
	 
});
 
client.on('connect', function(){
    console.log('>>>>>>> inside on connect. Connected to MQTT IBM IoT Cloud.');
    client.subscribe(event_id,0);
});

client.on('close', function() {
    console.log('>>>>>>> inside on close.');
    process.exit(1);
});

client.on('error', function(err) {
     console.log('>>>>> inside on error' + err);
     process.exit(1);
});