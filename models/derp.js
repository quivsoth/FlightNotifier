var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// model of derp (uses mongoose)
module.exports = function(app) {
  var io = app.get('socketio');

  const insert_pipeline = [
    {$match: {operationType: 'insert', 'fullDocument.a': 1}}
  ]

  var derpSchema = new mongoose.Schema({
    derpId: Number,
    appName: String,
    startTime: String,
    endTime: String,
    severity: Number,
    slackChannel: String
  });


  var derp = mongoose.model('derp', derpSchema, 'derp');

  derp.watch(null, { fullDocument: "updateLookup" }).on('change', data =>
    io.emit('onDerpUpdated', data.fullDocument)
  );

  // derp.watch(insert_pipeline).on('insert', data =>
  //   io.emit('onDerpInserted', data.fullDocument)
  // );

  return derp;
};
