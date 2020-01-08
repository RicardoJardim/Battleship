var mongodb = require("../utils/mongoConfig");

function insertUser(c, t, callback) {
  var db = mongodb.getDB();
  var line = { content: c, title: t };

  db.collection("notes").insertOne(line, function(err, res) {
    if (err) callback("Error inserting note");
    else callback("note inserted");
  });
}

function getAllUsers(callback) {
  var db = mongodb.getDB();
  //console.log(db);
  var cursor = db
    .collection("notes")
    .find()
    .toArray(function(err, result) {
      if (!err) callback(result);
    });
}

module.exports = {
  insertUser,
  getAllUsers
};
