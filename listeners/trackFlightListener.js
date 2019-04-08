var config = require('../config');
var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var request = require("request");
var diff = require('deep-diff').diff;


run().catch(error => console.error(error));

async function run() {
  var url1 = "http://localhost:3000/api/flight1";
  var url2 = "http://localhost:3000/api/flight2";
  var url3 = "http://localhost:3000/api/flight3";
  var url4 = "http://localhost:3000/api/flight4";
  var url5 = "http://localhost:3000/api/flight5";
  //-----------------------------------------------

  setInterval(function() {getExternalFlight(url1);}, 10000);
  setInterval(function() {getExternalFlight(url2);}, 10000);
  setInterval(function() {getExternalFlight(url3);}, 10000);
  setInterval(function() {getExternalFlight(url4);}, 10000);
  setInterval(function() {getExternalFlight(url5);}, 10000);

  //findFlight(993372929);

  //getExternalFlight(url1);
}

function getExternalFlight(url) {
  request({
    url: url,
    json: true
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      var flightId = body.flightStatus.flightId;

      // internal document to compare against
      var getInternalFlight = findFlight(flightId, function(result) {
        let oldFlightRecord = {
          flightId: result.flightId,
          flightNumber: result.flightNumber,
          departingAirport: result.departingAirport,
          departureTime: result.departureTime,
          arrivalTime: result.arrivalTime,
          status: result.status,
          terminal: result.terminal,
          gate: result.gate
        };
        let newFlightRecord = {
          flightId: body.flightStatus.flightId,
          flightNumber: parseInt(body.flightStatus.flightNumber),
          departingAirport: body.flightStatus.departureAirportFsCode,
          departureTime: moment(body.flightStatus.departureDate.dateLocal).format("hh:mm a"),
          arrivalTime: moment(body.flightStatus.arrivalDate.dateLocal).format("hh:mm a"),
          status: body.flightStatus.status,
          terminal: body.flightStatus.airportResources.arrivalTerminal,
          gate: body.flightStatus.airportResources.arrivalGate
        };

        // console.log(newFlightRecord);
        // console.log(oldFlightRecord);

        var differences = diff(oldFlightRecord, newFlightRecord);
        console.log(differences);

        if (differences) {
          newFlightRecord = {...newFlightRecord, fullDepartureTime: body.flightStatus.departureDate.dateLocal,
                                                  fullArrivalTime: body.flightStatus.arrivalDate.dateLocal};
          updateFlight(newFlightRecord);
        }
      });
    } else {
      console.log(error);
    }
  });
}


function findFlight(flightId, callBack) {
  MongoClient.connect(config.database, function(err, db) {
    if (err) throw err;
    var dbo = db.db("techops");
    var query = {
      flightId: flightId
    };
    dbo.collection("flights").findOne(query, function(err, result) {
      if (err) throw err;
      //console.log(result);
      db.close();
      return callBack(result);
    });
  });
}

function updateFlight(data) {
  console.log(data);
  MongoClient.connect(config.database, function(err, db) {
    if (err) throw err;
    var dbo = db.db("techops");
    if (err) {
      throw err;
    } else {
      // Modify and return the modified document
      var collection = dbo.collection("flights");
      collection.findOneAndUpdate({
        flightId: data.flightId
      }, {
        $set: {
          flightId: data.flightId,
          flightNumber: data.flightNumber.toString(),
          departingAirport: data.departingAirport,
          departureTime: data.departureTime,
          arrivalTime: data.arrivalTime,
          fullDepartureTime: data.fullDepartureTime,
          fullArrivalTime: data.fullArrivalTime,
          status: data.status,
          terminal: data.terminal,
          gate: data.gate
        }
      }, {
        returnOriginal: true,
        upsert: false
      }, function(err, doc) {
        console.log(doc);
      });
    }
  });
}
