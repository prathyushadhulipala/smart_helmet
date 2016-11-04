var db = require("./db");
var extend = require('util')._extend;
var Age = require('machinepack-age');
var date = require('date-and-time');
exports.createDocument = function(doc, callback) {
db.getConnection(function(mydb) {
		console.log("mydb value from db is "+mydb);
		mydb.insert(doc, function(err, data) {
			console.log("Error:", err);
			console.log("Data:", data);
			callback(err, data);
		});
	});
};
function readDocument(docname, callback)
{
	console.log("read document invoked with docname "+docname);
	db.getConnection(function(mydb) {
		console.log("mydb value from db is "+mydb);
		mydb.get(docname, function(err, data) {
			console.log("Error:", err);
			console.log("Data:", data);
			callback(err, data);
		});
	});
};
exports.readDocument = readDocument;
exports.updateDocument = updateDocument;
function updateDocument(data,id, callback)
{
	db.getConnection(function(mydb) {
		var doc = readDocument(id,function(err, dbdata){
			if(err)
			{
			console.log("Data retrieval failed");
			}
		else if(dbdata)
			{
			console.log("Data retrieved"+JSON.stringify(dbdata));
			//data.c  = true;
			console.log("mydb value from db is "+mydb);
			var revid = dbdata._rev;
			console.log("Revid from db"+revid);
			//delete data['_id'];
			//console.log("data before merge"+JSON.stringify(data));
			
			/*for(var dbobj in dbdata)
				{
					for(var uiobj in data)
						{
							if(dbobj === uiobj && data.hasOwnProperty(dbobj))
								{
								console.log(dbobj+"Being modified");
									dbdata[dbobj] = data[uiobj];
								}
						}
				};*/
			//console.log("data after merge"+JSON.stringify(dbdata));
			//updateJSON(data, revid, id, function(data){
			data['_rev'] = revid;
				mydb.insert(data, function(err, data) {
				    console.log("Error:", err);
				    console.log("Data:", data);
				    // keep the revision of the update so we can delete it
				    //doc._rev = data.rev;
				    callback(err, data);
				});
			//});
			
			}
	});
		
	});
};

exports.deleteDocument = function(docname, callback)
{
	db.getConnection(function(mydb) {
		
		readDocument(docname, function(err, data){
			if(err)
			{
			console.log("Data read failed");
			}
		else if(data)
			{
			console.log("mydb value from db is "+mydb);
			mydb.destroy(data._id, data._rev, function(err, data) {
				console.log("Error:", err);
				console.log("Data:", data);
				callback(err, data);
			});
			}
	});
		
		
		});
};

exports.updateVaccination = function(data, rfid, callback)
{
var cattle = data['cattleDetails'];
console.log("cattle details from ui"+JSON.stringify(cattle));

//Updating database with given document for any new cattle added
updateDocument(data, data['_id'], function(err, data) {
    console.log("Error:", err);
    console.log("Data:", data);
    callback(err, data);
});

var nextVaccine = "";
var nextVaccineTime = "";
var nextVaccineDueDate = "";
var cattleAge = 0;
var cattleDOB = "";

//Retrieving date of birth of given RFID cattle in order to calculate age
for(var i=0; i<cattle.length; i++)
	{
	console.log("rfid from ui"+cattle[i].rfid);
	if(cattle[i].rfid === rfid)
		{
			cattleDOB = cattle[i].dob;
			console.log("DOB"+cattleDOB);
		}
	}

//Function to convert string to date format
function stringToDate(_date,_format,_delimiter)
{
            var formatLowerCase=_format.toLowerCase();
            var formatItems=formatLowerCase.split(_delimiter);
            var dateItems=_date.split(_delimiter);
            var monthIndex=formatItems.indexOf("mm");
            var dayIndex=formatItems.indexOf("dd");
            var yearIndex=formatItems.indexOf("yyyy");
            var month=parseInt(dateItems[monthIndex]);
            month-=1;
            var formatedDate = new Date(dateItems[yearIndex],month,dateItems[dayIndex]);
            return formatedDate;
}
var formdob = stringToDate(cattleDOB,"YYYY-MM-DD","-");

//Function to calculate age in months
function getAge(dateString){
	var birthdate = new Date(dateString).getTime();
	  var now = new Date().getTime();
	  // now find the difference between now and the birthdate
	  
	  console.log("Birth date for age calculation"+birthdate);
	  var n = (now - birthdate)/1000;
	  
		    var month_n = Math.floor(n/2629743);
		    console.log("date difference"+month_n);
		    return month_n;
}
console.log("**********Sending formdob************"+formdob);

cattleAge = getAge(formdob);
console.log("cattleAge"+cattleAge);

// Retrieving vaccination document to determine next vaccine name and time for given cattle based on its age
	var doc = readDocument("VACCINATION",function(err, dbdata){
		if(err)
		{
		console.log("Data retrieval failed");
		}
	else if(dbdata)
		{
		console.log("Data retrieved"+JSON.stringify(dbdata.vaccineDetails));
		var vaccineDetails = dbdata.vaccineDetails;
		console.log("vaccineDetails from database"+JSON.stringify(vaccineDetails));
		for(var i=0; i<vaccineDetails.length; i++)
			{
			//console.log("dbobj"+dbobj);
			
			console.log("inside for loop with vaccin details as "+JSON.stringify(vaccineDetails[i])+" and vaccine time as "+JSON.stringify(vaccineDetails[i].vaccineTime));
			
			//Iterate through the list of vaccines available and retrieve the next available vaccine details
			if(dbdata.vaccineDetails[i].vaccineTime > cattleAge)
				{
				console.log("dbdata.vaccineDetails[i].vaccineTime"+dbdata.vaccineDetails[i].vaccineTime);
				nextVaccine = dbdata.vaccineDetails[i].vaccineName;
				console.log("nextVaccine"+nextVaccine);
				nextVaccineTime = dbdata.vaccineDetails[i].vaccineTime;
				console.log("nextVaccineTime"+nextVaccineTime);
				break;
				}
			}
		
		//Calculating date of next vaccination by adding months to date of birth
		var nextVaccineDueDate = date.addMonths(formdob, nextVaccineTime);
		console.log("nextVaccineDueDate"+nextVaccineDueDate);
		
		//Converting next vaccination due date to required format to store to database
		nextVaccineDueDate = date.format(nextVaccineDueDate, 'YYYY-MM-DD');
		console.log('Formatted nextVaccineDueDate'+nextVaccineDueDate);
		cattle = data['cattleDetails'];
		
		//Iterate through the farmer document to update the next vaccine name and due date to the given RFID cattle
		for(var i=0; i<cattle.length; i++)
		{
		console.log("rfid from ui"+cattle[i].rfid);
		if(cattle[i].rfid === rfid)
			{
		cattle[i].nextVac	= nextVaccine;
		cattle[i].nextVacDue = nextVaccineDueDate;
			}
		}
		data['cattleDetails'] = cattle;
		console.log("Data details before updating to database"+JSON.stringify(data));
		}
	});
		//calling updateDocument function to update the farmer document to database
		updateDocument(data, data['_id'], function(err, data) {
		    console.log("Error:", err);
		    console.log("Data:", data);
		    callback(err, data);
		});
};

exports.retrieveNextVaccination =  function(id, rfid, callback)
{
	var nextVac = "";
	var nextVacDue = "";
	var error = "";
	var result = "";
	readDocument(id, function(err, data)
			{
		if(err)
			{
			error = "Error occured while retrieving given farmer document"+id;
			}
		else if(data)
			{
		var cattle = data['cattleDetails'];
		
			for(var i=0; i<cattle.length; i++)
			{
			console.log("rfid from db"+cattle[i].rfid);
			console.log("rfid from ui"+rfid);
			if(cattle[i].rfid === rfid)
				{
					nextVac = cattle[i].nextVac;
					nextVacDue = cattle[i].nextVacDue;
					console.log("nextVac"+nextVac);
					console.log("nextVacDue"+nextVacDue);
					break;
				}
			}
			if(nextVac != null && nextVacDue != null)
				{
			result = {"nextVac":nextVac, "nextVacDue":nextVacDue};
			console.log("result is "+JSON.stringify(result));
				}
			else
				{
				error = "RFID does not exist in given farmer id";
				}
			callback(error, result);
			}
		
			});
	
	
};

exports.retrieveFarmers = function(callback)
{
	var farmersList = [];
	db.getConnection(function(mydb)
	{
		var user_type = {name:'userType', type:'json', index:{fields:['userType']}};
		mydb.index(user_type, function(er, response) {
		  if (er) {
		    throw er;
		  }
		 
		  console.log('Index creation result: %s', response.result);
	});
		mydb.find({selector:{userType:'farmer'}}, function(er, result) {
			  if (er) {
			    throw er;
			  }
			 
			  console.log('Found %d documents with userType farmer', result.docs.length);
			  for (var i = 0; i < result.docs.length; i++) {
				  farmersList.push(result.docs[i]._id);
			    console.log('  Doc id: %s', result.docs[i]._id);
			    console.log("farmers list is "+farmersList[i]);
			  }
			  console.log("farmers list is "+farmersList);
			callback(farmersList);
			});
		
	});
};