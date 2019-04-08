var express = require('express');
var derpRoute = require('./routes/derpRoute.js');
var flightRoute = require('./routes/flightRoute.js');

var config = require('./config');


// register route controllers
module.exports = function(app) {
  var flightModel = require('./models/flight.js')(app);
  var derpModel = require('./models/derp.js')(app);

  app.set('derp', derpModel);
  app.set('flight', flightModel);

  app.get('/api/derp', derpRoute.allDerps);
  app.get('/api/flights', flightRoute.allFlights);

  // Use middleware to set the default Content-Type
  app.use(function (req, res, next) {
      res.header('Content-Type', 'application/json');
      next();
  });

  app.get('/api/flight1', (req, res) => {
      var fs = require('fs');
      fs.readFile('./test/flight_sample1.json', 'utf8', function(err, contents) {
        res.send(JSON.parse(contents));
      });
  });

  app.get('/api/flight2', (req, res) => {
      var fs = require('fs');
      fs.readFile('./test/flight_sample2.json', 'utf8', function(err, contents) {
        res.send(JSON.parse(contents));
      });
  });

  app.get('/api/flight3', (req, res) => {
      var fs = require('fs');
      fs.readFile('./test/flight_sample3.json', 'utf8', function(err, contents) {
        res.send(JSON.parse(contents));
      });
  });

  app.get('/api/flight4', (req, res) => {
      var fs = require('fs');
      fs.readFile('./test/flight_sample4.json', 'utf8', function(err, contents) {
        res.send(JSON.parse(contents));
      });
  });

  app.get('/api/flight5', (req, res) => {
      var fs = require('fs');
      fs.readFile('./test/flight_sample5.json', 'utf8', function(err, contents) {
        res.send(JSON.parse(contents));
      });
  });


};
