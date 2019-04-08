var MongoClient = require('mongodb').MongoClient;
var request = require("request");
var jsonQuery = require('json-query');
var diff = require('deep-diff').diff;
var flightModel = require('../models/flight.js');
var config = require('../config');
var moment = require('moment');
//  require('./database.js')(config);

const appId = config.appId;
const appKey = config.appKey;
var airport = config.airportTracked;

module.exports = {
  build: async function() {
    var year = moment().format('YYYY');
    var month = moment().format('MM');
    var day = moment().format('DD');
    //var hour = moment().format('HH');
    //var day = 10;
    var hour = 19;

    var maxFlights = '500';
    var url = `https://api.flightstats.com/flex/flightstatus/rest/v2/json/airport/status/${airport}/arr/${year}/${month}/${day}/${hour}?appId=${appId}&appKey=${appKey}&utc=false&numHours=6&carrier=AA&maxFlights=${maxFlights}`;

    console.log(url);
    request({
      url: url,
      json: true
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {
        rs = body;
        var flightCollection = [];
        for (var i = 0; i < rs.flightStatuses.length; i++) {
          //var terminal = rs.flightStatuses[i].airportResources.arrivalTerminal != undefined ? rs.flightStatuses[i].airportResources.arrivalTerminal : 'na';
          var terminal, gate;
          if (typeof rs.flightStatuses[i].airportResources === 'undefined') {
            terminal = 'Unassigned';
            gate = '';
          } else if (typeof rs.flightStatuses[i].airportResources.terminal == null || (typeof rs.flightStatuses[i].airportResources.gate == null)) {
            terminal = 'Unassigned';
            gate = '';
          } else {
            terminal = rs.flightStatuses[i].airportResources.arrivalTerminal;
            gate = rs.flightStatuses[i].airportResources.arrivalGate;
          };
          flightCollection[i] = {
            flightId: rs.flightStatuses[i].flightId,
            flightNumber: rs.flightStatuses[i].flightNumber,
            departingAirport: rs.flightStatuses[i].departureAirportFsCode,
            departureTime: moment(rs.flightStatuses[i].departureDate.dateLocal).format("hh:mm a"),
            arrivalTime: moment(rs.flightStatuses[i].arrivalDate.dateLocal).format("hh:mm a"),
            fullDepartureTime: rs.flightStatuses[i].departureDate.dateLocal,
            fullArrivalTime: rs.flightStatuses[i].arrivalDate.dateLocal,
            status: rs.flightStatuses[i].status,
            terminal: terminal,
            gate: (terminal === 'A' && airport === 'dfw') ? gate.substring(1) : gate
          }
        }
        MongoClient.connect(config.database, function(err, db) {
          if (err) throw err;
          var dbo = db.db("techops");
          dbo.collection("flights").insertMany(flightCollection, function(err, res) {
            if (err) throw err;
            console.log("Number of documents inserted: " + res.insertedCount);
            db.close();
          });
        });
      } else {
        console.log(error);
      }
    });
  },

  drop: async function() {
    console.log('Dropping data..');
    MongoClient.connect(config.database, function(err, db) {
      if (err) throw err;
      var dbo = db.db("techops");
      dbo.collection("flights").drop(function(err, delOK) {
        if (err) throw err;
        if (delOK) console.log("Collection deleted");
        db.close();
      });
    });
  },

  getActiveFlights: async function() {
    console.log('Checking flights: ', new Date());
    MongoClient.connect(config.database, function(err, db) {
      if (err) throw err;
      var dbo = db.db("techops");
      var query = {
        status: "A"
      };
      dbo.collection("flights").find(query).toArray(function(err, result) {
        if (err) throw err;
        for (var i = 0; i < result.length; i++) {
          //console.log(result[i]);
          module.exports.checkFlightStatus(result[i]);
        }
        db.close();
      });
    });
  },

  checkFlightStatus: async function(flight) {
    var url = `https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/${flight.flightId}?appId=${appId}&appKey=${appKey}`;
    request({
      url: url,
      json: true
    }, function(error, response, body) {
      if (!error && response.statusCode === 200) {

        // TODO diff out all the API variables
        if (body.flightStatus.status !== flight.status) {
          // somethings changed
          console.log('Changed');
          //
          //   var json = { flightId: "", flightNumber: "", departingAirport : "", +
          //                 departingAirport: "", departureTime: "", arrivalTime
          // }

          console.log('From live site flight num: ' + body.flightStatus.flightNumber);
          console.log('From live site status: ' + body.flightStatus.status + "\n\n");
          console.log('Local Record : ' + flight.flightNumber);
          console.log('Local Status : ' + flight.status);
          module.exports.update(body);
        }
      } else {
        console.log(error);
      }
    });
  },

  update: async function(body) {
    console.log(parseInt(body.flightStatus.flightNumber));
    MongoClient.connect(config.database, function(err, db) {
      if (err) throw err;
      var dbo = db.db("techops");
      if (err) {
        throw err;
      } else {
        // Modify and return the modified document
        var collection = dbo.collection("flights");
        collection.findOneAndUpdate({
          flightId: parseInt(body.flightStatus.flightId)
        }, {
          $set: {
            status: body.flightStatus.status
            //gate: "4"
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
}
