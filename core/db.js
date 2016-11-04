var mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysql',
  database:'smart_helmet'
});

function createConnection()
{
connection.connect();
};

exports.insertAlerts = function(data, callback)
{
    var userId;
    var locationId;
    retrieveUserId(data, function(err, userIdDb){
       if(err) throw err;
       userId = userIdDb;
        console.log('userId in callback'+userId);
  
    retrieveLocationId(data, function(err, locationIdDb){
        if(err) throw err;
       locationId = locationIdDb;
        console.log('locationId in callback'+locationId);
        var alertId = Math.floor(Math.random()*(1000-100)+100);
        var dataJson = JSON.parse(data);
        var altitude = 123; //To be calculated using pressure
        var post  = {alertId: alertId,alertType: dataJson.alertType, helmetId: dataJson.helmetId, userId: userId, temperature: dataJson.temperature, pressure: dataJson.pressure, humidity: dataJson.humidity, panic:dataJson.panic, locationId:locationId, altitude:altitude};
        connection.query('INSERT INTO alerts SET ?', post, function (err, result) {
          if (err) throw err;

          console.log('The solution is: ', result.insertId);
            callback(err, result.insertId);
        });
    });
    });
}

function retrieveUserId(data, callback)
{
    
    connection.query('SELECT userId FROM users WHERE helmetId=?',[JSON.parse(data).helmetId], function (err, rows, fields) {
      if (err) throw err;
        
      console.log('The userId is: ', rows[0].userId);
        callback(err, rows[0].userId);
    });
}
function retrieveLocationId(data, callback)
{
    connection.query('SELECT locationId FROM locations WHERE locationQuadrants=?',[JSON.stringify(JSON.parse(data).location)], function (err, rows, fields) {
      if (err) throw err;

      console.log('The locationId is: ', rows[0].locationId);
        callback(err, rows[0].locationId);
    });
}
exports.retrieveUserDetails = function(userId, callback){
   
    connection.query('SELECT * FROM users WHERE userId=?',userId, function (err, rows, fields) {
      if (err) throw err;

      console.log('The helmetId is: ', rows[0].helmetId);
        callback(err, rows[0]);
    });
}

exports.retrieveAlertDetails = function(alertId, callback){
   
    connection.query('SELECT * FROM alerts WHERE alertId=?',alertId, function (err, rows, fields) {
      if (err) throw err;

      console.log('The helmetId is: ', rows[0].helmetId);
        callback(err, rows[0]);
    });
}

exports.retrieveAllHelmets = function(callback){
    connection.query('SELECT helmetId, userName, workExperience, bloodPressure, pulse, overallHealthCondition FROM users', function (err, rows, fields) {
      if (err) throw err;

      console.log('The helmetId is: ', rows[0].helmetId);
        callback(err, rows);
    });
}
function closeConnection()
{
    connection.end();
}