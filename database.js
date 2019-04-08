var mongoose = require('mongoose');
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

const pipeline = [{
  $project: {
    documentKey: false
  }
}];

module.exports = async function(config) {
  mongoose.connect(config.database, { useNewUrlParser: true }, () => {
      console.log('DB connection Established!', new Date());
  });
}
