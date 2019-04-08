var broadcast = require("../broadcast.js");
var config = require("../config");
var axios = require("axios");
var signalR = require("@aspnet/signalr");

//------



const getConnectionInfo = () => {
  return axios
    .post(
      `https://gql-flighthub.azurewebsites.net/api/signalrinfo/deltas`,
      null,
      {}
    )
    .then(function(resp) {
      return resp.data;
    })
    .catch(function() {
      return {};
    });
};

const startConnection = connection => {
  console.log("Connecting");
  connection
    .start()
    .then(() => {
      console.log("Connected");
    })
    .catch(err => {
      console.error(err);
      setTimeout(() => {
        this.startConnection(connection);
      }, 2000);
    });
};


console.clear();
run().catch(error => console.error(error));
console.log("Running Flight Listener for Google home");

async function run() {
  getConnectionInfo()
    .then(info => {
      let accessToken = info.accessToken;

      const options = {
        accessTokenFactory: function() {
          if (accessToken) {
            const _accessToken = accessToken;
            return _accessToken;
          } else {
            return getConnectionInfo().then(function(info) {
              return info.accessToken;
            });
          }
        }
      };

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(info.url, options)
        .build();

      connection.on("flightDelta", data => messageBuilder(data));

      connection.onclose(() => {
        console.log("disconnected");
        setTimeout(() => {
          startConnection(connection);
        }, 2000);
      });

      startConnection(connection);
    })
    .catch(error => console.log(error));
}


  function messageBuilder(changes) {
    console.log(changes);
    var Enum = require('enum');
    var status = new Enum({
      'A': 'Active',
      'C': 'Cancelled',
      'D': 'Diverted',
      'DN': 'Data Source Needed',
      'L': 'Landed',
      'NO': 'Not Operational',
      'R': 'Redirected',
      'S': 'Scheduled',
      'U': 'Unknown'
    });

    var messageBuilderCollection = [];
    messageBuilderCollection.push('Flight Notification for AA' + changes.flightNumber);

    for (var i = 0; i < changes.deltas.length; i++) {
      console.log(changes.deltas[i].path);
    }





    // var flightNumber = changes.deltas.filter(function(DiffEdit) { return DiffEdit.path == "flightNumber"; });
    // if (parseInt(flightNumber[0].lhs) != parseInt(flightNumber[0].rhs)) messageBuilderCollection.push('Flight Number has changed from AA' + flightNumber[0].lhs + ' to AA' + flightNumber[0].rhs);

    // var departingAirport = changes.deltas.filter(function(DiffEdit) { return DiffEdit.path == "departingAirport";});
    // if (departingAirport.length > 0) messageBuilderCollection.push('Location changed from ' + departingAirport[0].lhs + ' to ' + departingAirport[0].rhs);

    var departureTime = changes.deltas.filter(function(DiffEdit) { return DiffEdit.path[0] == "departureDate"; });
    if (departureTime.length > 0) messageBuilderCollection.push('Departure time has changed to ' + departureTime[0].rhs);

    var arrivalTime = changes.deltas.filter(function(DiffEdit) { return DiffEdit.path[0] == "arrivalDate"; });
    if (arrivalTime.length > 0) messageBuilderCollection.push('Arrival time has changed to ' + arrivalTime[0].rhs);

    var flight_Status = changes.deltas.filter(function(DiffEdit) { return DiffEdit.path == "status"; });
    if (flight_Status.length > 0) messageBuilderCollection.push('Flight Status has changed to ' +  status.get(flight_Status[0].rhs).value);

    var terminal = changes.deltas.filter(function(DiffEdit) { return DiffEdit.path[1] == "arrivalTerminal"; });
    if (terminal.length > 0) messageBuilderCollection.push('Terminal has changed from ' + terminal[0].lhs + ' to ' +  terminal[0].rhs);

    var gate = changes.deltas.filter(function(DiffEdit) { return DiffEdit.path[1] == "arrivalGate"; });
    if (gate.length > 0) messageBuilderCollection.push('Gate has changed from ' + gate[0].lhs + ' to ' +  gate[0].rhs);

    for (var i = 0; i < messageBuilderCollection.length; i++) { if(i >= 2) messageBuilderCollection[i] = "and, " + messageBuilderCollection[i] + ", " }
    // //
    console.log(messageBuilderCollection);
    broadcast.Send(messageBuilderCollection.toString(), "en-US");
}


// var MongoClient = require('mongodb').MongoClient;
// var request = require("request");
// var jsonQuery = require('json-query');
// var diff = require('deep-diff').diff;
// var broadcast = require("../broadcast.js");
// var config = require('../config');

// //------

// console.clear();
// run().catch(error => console.error(error));
// console.log('Running Flight Listener for Google home');

// async function run() {
//   // console.clear();
//   console.log(new Date(), 'start');
//   const pipeline = [{
//     $project: {
//       documentKey: false
//     }
//   }];
//   MongoClient.connect(config.database)
//     .then(client => {
//       //console.log("Connected correctly to server");
//       // specify db and collections
//       const db = client.db("techops");
//       const collection = db.collection("flights");
//       const changeStream = collection.watch(pipeline, {
//         fullDocument: 'updateLookup'
//       });
//       // start listen to changes
//       changeStream.on("change", function(data) {
//         //console.log("full document : " + data.fullDocument);
//         compareFlightChanges(data);
//       });
//     })
//     .catch(err => {
//       console.error(err);
//     });

//   refresh();

//   function refresh() {
//     var url = "http://localhost:3000/api/flights";
//     request({
//       url: url,
//       json: true
//     }, function(error, response, body) {
//       if (!error && response.statusCode === 200) {
//         rs = body;
//       } else {
//         console.log(error);
//       }
//     });
//   }

//   function compareFlightChanges(data) {
//     // var result = jsonQuery('[*_id=5c58c286e0ceb31c96458743]', {
//     var currentRecord = jsonQuery('[*_id=' + data.fullDocument._id + ']', {
//       data: rs
//     }).value;
//     var differences = diff(currentRecord[0], data.fullDocument);

//     console.log(currentRecord[0]);
//     console.log(data.fullDocument);

//     // NOTE: Right hand side is the new value
//     if (differences) messageBuilder(currentRecord[0], differences);

//     refresh();
//   }

//   function messageBuilder(currentRecord, differences) {
//     // console.log(differences);
//     var Enum = require('enum');
//     var status = new Enum({
//       'A': 'Active',
//       'C': 'Cancelled',
//       'D': 'Diverted',
//       'DN': 'Data Source Needed',
//       'L': 'Landed',
//       'NO': 'Not Operational',
//       'R': 'Redirected',
//       'S': 'Scheduled',
//       'U': 'Unknown'
//     });

//     var messageBuilderCollection = [];
//     messageBuilderCollection.push('Flight Notification for AA' + currentRecord.flightNumber);

//     var flightNumber = differences.filter(function(DiffEdit) { return DiffEdit.path == "flightNumber"; });
//     if (parseInt(flightNumber[0].lhs) != parseInt(flightNumber[0].rhs)) messageBuilderCollection.push('Flight Number has changed from AA' + flightNumber[0].lhs + ' to AA' + flightNumber[0].rhs);

//     var departingAirport = differences.filter(function(DiffEdit) { return DiffEdit.path == "departingAirport";});
//     if (departingAirport.length > 0) messageBuilderCollection.push('Location changed from ' + departingAirport[0].lhs + ' to ' + departingAirport[0].rhs);

//     var departureTime = differences.filter(function(DiffEdit) { return DiffEdit.path == "departureTime"; });
//     if (departureTime.length > 0) messageBuilderCollection.push('Departure time has changed to ' + departureTime[0].rhs);

//     var arrivalTime = differences.filter(function(DiffEdit) { return DiffEdit.path == "arrivalTime"; });
//     if (arrivalTime.length > 0) messageBuilderCollection.push('Arrival time has changed to ' + arrivalTime[0].rhs);

//     var flight_Status = differences.filter(function(DiffEdit) { return DiffEdit.path == "status"; });
//     //fix undefined
//     if (flight_Status.length > 0) messageBuilderCollection.push('Flight Status has changed to ' + status.get(flight_Status[0].rhs).value);

//     var terminal = differences.filter(function(DiffEdit) { return DiffEdit.path == "terminal"; });
//     var gate = differences.filter(function(DiffEdit) { return DiffEdit.path == "gate"; });

//     var termHasValue = (terminal.length > 0) ? true : false;
//     var gateHasValue = (gate.length > 0) ? true : false;
//     if (termHasValue && gateHasValue) {
//       messageBuilderCollection.push('Terminal has changed from ' + currentRecord.terminal + currentRecord.gate +
//         ' to ' + terminal[0].rhs + gate[0].rhs);
//     }
//     else if (termHasValue && !gateHasValue) {
//       messageBuilderCollection.push('Terminal has changed from ' + currentRecord.terminal + currentRecord.gate +
//         ' to ' + terminal[0].rhs + currentRecord.gate);
//     }
//     else if (gateHasValue && !termHasValue) {
//       messageBuilderCollection.push('Gate has changed from ' + currentRecord.terminal + gate[0].lhs +
//         ' to ' + currentRecord.terminal + gate[0].rhs);
//     }

//     for (var i = 0; i < messageBuilderCollection.length; i++) { if(i >= 2) messageBuilderCollection[i] = "and, " + messageBuilderCollection[i] + ", " }
//     //
//     console.log(messageBuilderCollection);

//     var sender = broadcast.Send(messageBuilderCollection.toString(), "en-US");
//     return messageBuilderCollection.toString();
//   }
// }
