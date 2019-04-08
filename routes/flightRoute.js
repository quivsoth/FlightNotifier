module.exports = {
  allFlights: function(req, res) {
    var flight = req.app.get('flight');
    flight.find({}, (err, flights) => {
      res.send(flights);
    });
  }
}
