var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

// model of flight (uses mongoose)
module.exports = function(app) {
  var io = app.get('socketio');
  var flightSchema = new mongoose.Schema({
    flightId: String,
    flightNumber: Number,
    departingAirport: String,
    departureTime: String,
    arrivalTime: String,
    fullDepartureTime: String,
    fullArrivalTime: String,
    status: String,
    terminal: String,
    gate: String
  });

  var flight = mongoose.model('Flight', flightSchema);

  flight.watch(null, { fullDocument: "updateLookup" }).on('change', data =>
    io.emit('onDataChanged', data.fullDocument)
  );
  return flight;
};
