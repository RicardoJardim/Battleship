const mongo = require("mongodb");
const MongoClient = mongo.MongoClient;

var _db;

module.exports = {
  connectToServer: function (callback) {
    MongoClient.connect(
      "mongodb://localhost:27017/",
      { useUnifiedTopology: true },
      function (err, client) {
        if (!err) {
          console.log("Connected to database");
          if (err) throw err;
          _db = client.db("battleship");
          return callback(err);
        }
      }
    );
  },
  getDB: function () {
    return _db;
  },
};
