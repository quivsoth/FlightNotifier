var MongoClient = require('mongodb').MongoClient;
var request = require("request");
var jsonQuery = require('json-query');
var diff = require('deep-diff').diff;
var broadcast = require("../broadcast.js");
var config = require('../config');

//------

console.clear();


//run().catch(error => console.error(error));
console.log('Running DERP Listener for Google home');




module.exports = {
  build: async function(collection) {
    MongoClient.connect(config.database, function(err, db) {
      if (err) throw err;
      var dbo = db.db("techops");
      dbo.collection("derp").insertMany(collection, function(err, res) {
        if (err) throw err;
        console.log("Number of documents inserted: " + res.insertedCount);
        db.close();
      });
    });
  },

  read: async function(derpId, callBack) {
    MongoClient.connect(config.database, function(err, db) {
      if (err) throw err;
      var dbo = db.db("techops");
      dbo.collection("derp").find({derpId : derpId}).toArray(function(err, result) {
        if (err) throw err;
        db.close();
        // console.log(result);
        return callBack(result);
      });
    });
  },

  speak: async function(derpId) {
    var speaker = module.exports.read(derpId, function(result) {

// console.log(result[0].endTime);
      var message = "New DERP detected. ";
      message += "Application: " + result[0].appName + ". ";
      message += "Started at " + result[0].startTime + ". ";
      message += "Ended at " + result[0].endTime + ". ";
      message += "Severity Level: " + result[0].severity + ". ";
      message += "Slack Channel: " + result[0].slackChannel + ". ";
      broadcast.Send(message, "en-US");
    });
    // for (i = 0; i < 4; i++) {
    //   setTimeout(broadcast.Send("number : " + i, "en-US"), 4000, 'messge');
    // }
    //var sender = broadcast.Send("messageBuilderCollection.toString()", "en-US");
  }
}
