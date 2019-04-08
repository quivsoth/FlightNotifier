var assert = require('assert');
var config = require('../config');
var derp = require('../listeners/derpListener.js');

var MongoClient = require('mongodb').MongoClient;


describe.only('DERP tests', function(done) {
  it('should build a database/collection and add a record', function(done) {
    var derpCollection = [];
    var sample_data1 = { derpId : 3, appName : "JMOCA", startTime : "01:33 pm", endTime : "09:14pm", severity: 4, slackChannel : "#ops-inc-741769" }
    //derpCollection.push(sample_data1);
    //derp.build(derpCollection);
    done();
  });

  it('should retrieve all DERPS', function(done) {
    var collection = derp.read(4, function(result) {
       assert.equal((result.length > 0), true);
    });
    done();
  });

  it('should speak to the home device', function(done) {
    //derp.speak(1);
    done();
  });






  it('should return all DERPS', function(done) {
    var mongoose = require('mongoose'), Schema = mongoose.Schema;

        //Set up default mongoose connection
    var mongoDB = config.database;
    mongoose.connect(mongoDB, { useNewUrlParser: true });

    // Get Mongoose to use the global promise library
    // mongoose.Promise = global.Promise;
    //Get the default connection
    var db = mongoose.connection;

    // model of derp (uses mongoose)
      var derpSchema = new mongoose.Schema({
        derpId: Number,
        appName: String
      });

      var modello = mongoose.model('trre', derpSchema );
      var awesome_instance = new modello({ derpId : 1, appName : 'awesome' });


      // // Save the new model instance, passing a callback
      // awesome_instance.save(function (err) {
      //   if (err) return handleError(err);
      //   // saved!
      // });
      //
      //



    //Bind connection to error event (to get notification of connection errors)
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));



    // dd.find({}, (err, result) => {
    //   console.log(result);
    // });



    done();
  });


});
