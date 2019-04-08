module.exports = {
  allDerps: function(req, res) {
    var derp = req.app.get('derp');
    derp.find({}, (err, result) => {
      res.send(result);
    });
  }
}
