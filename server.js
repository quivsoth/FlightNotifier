//var broadcast = require("./broadcast.js");
var express = require('express');                                       //web server framework specific to node js (similar to IIS,apache)
var bodyParser = require('body-parser');                                //parse body data coming in from a web request
var app = express();                                                    //calling express and returns an instance as a created application
var http = require('http').Server(app);                                 //attaches express callbacks to vanilla node http
var io = require('socket.io')(http);                                    //socket io === graphql subscriptions - websocket
var mongoose = require('mongoose'), Schema = mongoose.Schema;


//var flightListenerApi = require('./listeners/flightApiListener.js');

run().catch(error => console.error(error));

async function run() {
//  console.clear();
  console.log(new Date(), 'Started Flight API Server');

  /*
  var args = process.argv.slice(2);
  if (args == "drop") {
    console.log('trying to drop');
    flightListenerApi.drop();
    //process.exit();
  } else if(args == "build") {
    flightListenerApi.build();
    //process.exit();
  } else if(args == "run") {
    setInterval(flightListenerApi.getActiveFlights, 6000, 'getActiveFlights');
    //process.exit();
  }

  */
                                                                                    //registering middleware
  app.use(express.static(__dirname));                                               //use express static content app handler, index.html is a static file

  require('./listeners/flightListener.js');


  /*
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.set('socketio', io);

  // Configuration
  var config = require('./config');

  // Database
  require('./database.js')(config);

  // Routes
  require('./routes')(app, io);

  
  // Flight listeners for Google Home
  require('./listeners/flightListener.js');
  
  */
                                                                                                  //start server on port 8080
 var server = http.listen(8080, () => {
   console.log('Server running on port:', server.address().port);
 });
 
  module.exports = server;

}

// io.on('connection', () => {
//   // console.log("Connected.");
// });
