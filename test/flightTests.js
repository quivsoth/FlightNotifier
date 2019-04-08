var assert = require('assert');
var request = require("request");
var config = require('../config');
var flightListener = require('../listeners/flightListener.js');
var moment = require('moment');

var MongoClient = require('mongodb').MongoClient;
var url1 = "http://localhost:3000/api/flight1";
var url2 = "http://localhost:3000/api/flight2";
var url3 = "http://localhost:3000/api/flight3";
var url4 = "http://localhost:3000/api/flight4";
var url5 = "http://localhost:3000/api/flight5";


describe.only('Query API for flight data', function() {
  // // it('should read a flight based on the flightId', function(done) {
  //   // TODO diff out all the API variables
  //    this.timeout(0);
  //   setInterval(compareFlights, 4000, 'getActiveFlights');
  //
  //   function compareFlights() {
  //     var fs = require('fs');
  //     fs.readFile('./flight_sample.json', 'utf8', function(err, contents) {
  //       var body = JSON.parse(contents);
  //           // console.log(body.flightStatus.status);
  //       MongoClient.connect(config.database, function(err, db) {
  //         if (err) throw err;
  //         var dbo = db.db("techops");
  //         var query = {
  //           flightId: 992822725
  //         };
  //         dbo.collection("flights").findOne(query).then(function(doc) {
  //           if (body.flightStatus.status !== doc.status) {
  //             //   // somethings changed
  //             console.log('Changed');
  //             console.log('From live site flight num: ' + body.flightStatus.flightNumber);
  //             console.log('From live site status: ' + body.flightStatus.status + "\n\n");
  //             console.log('Local Record : ' + doc.flightNumber);
  //             console.log('Local Status : ' + doc.status);
  //             //module.exports.update(body);
  //           }
  //           db.close();
  //           //done();
  //         }); //dbo collection
  //       }); //mongo connect
  //     }); //fs readfile
  //   }; //blastme
  // }); //it should


  it('should detect changes in my sample flight JSON file', function(done) {
    // setInterval(function() {flightManager(url1);}, 10000);
    // setInterval(function() {flightManager(url2);}, 10000);
    // setInterval(function() {flightManager(url3);}, 10000);
    // setInterval(function() {flightManager(url4);}, 10000);
    // setInterval(function() {flightManager(url5);}, 10000);
    done();
  }); // it should


    it('Should scrape what I need', function(done) {
      request({
        url: url1,
        json: true
      }, function(error, response, body) {
        if (!error && response.statusCode === 200) {
          //if (body.flightStatus.status !== flight.status) {
          if (body.flightStatus.status !== 'A') {
            // somethings changed
            console.log('Changed : ' + body.flightStatus.status);
            var flightId = body.flightStatus.flightId;
            var flightNumber = body.flightStatus.flightNumber;
            var departingAirport = body.flightStatus.departureAirportFsCode;
            var departureTime = moment(body.flightStatus.departureDate.dateLocal).format("hh:mm a");
            var arrivalTime = moment(body.flightStatus.arrivalDate.dateLocal).format("hh:mm a");
            var fullDepartureTime = body.flightStatus.departureDate.dateLocal;
            var fullArrivalTime = body.flightStatus.departureDate.dateLocal;
            var status = body.flightStatus.status;
            var terminal = body.flightStatus.airportResources.arrivalTerminal;
            var gate = body.flightStatus.airportResources.arrivalGate;

            //console.log(parseInt(body.flightStatus.flightNumber));
            MongoClient.connect(config.database, function(err, db) {
              if (err) throw err;
              var dbo = db.db("techops");
              if (err) {
                throw err;
              } else {
                // Modify and return the modified document
                var collection = dbo.collection("flights");
                collection.findOneAndUpdate({
                  flightId: flightId
                }, {
                  $set: {
                    flightId: flightId,
                    flightNumber: flightNumber,
                    departingAirport: departingAirport,
                    departureTime: departureTime,
                    arrivalTime: arrivalTime,
                    fullDepartureTime: fullDepartureTime,
                    fullArrivalTime: fullArrivalTime,
                    status: status,
                    terminal: terminal,
                    gate: gate
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
        } else {
          console.log(error);
        }
      });
    });
}); //describes


function flightManager(url) {
  //var url = `https://api.flightstats.com/flex/flightstatus/rest/v2/json/flight/status/${flight.flightId}?appId=${appId}&appKey=${appKey}`;
  request({
    url: url,
    json: true
  }, function(error, response, body) {
    if (!error && response.statusCode === 200) {
      // TODO diff out all the API variables
      //if (body.flightStatus.status !== flight.status) {
      if (body.flightStatus.status !== 'A') {
        // somethings changed
        console.log('Changed : ' + body.flightStatus.status);
      }
    } else {
      console.log(error);
    }
  });
}
