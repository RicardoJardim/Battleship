const mongodb = require("../utils/mongoConnection");

//Função para criar um user
function insertGrid(data, callback) {
  const db = mongodb.getDB();

  db.collection("grids").insertOne(data, function (err, res) {
    if (err) callback({ success: false, message: "Falha no insert" });
    else callback({ success: true, message: "Inseriu com sucesso" });
  });
}

function getGrid(email, callback) {
  var db = mongodb.getDB();
  var cursor = db
    .collection("grids")
    .findOne({ email: email }, function (err, result) {
      if (result) {
        callback({ success: true, data: result });
      } else {
        callback({ success: false, data: "Utilizador não encontrado" });
      }
    });
}

function updateGridModel(user, data, callback) {
  var db = mongodb.getDB();
  var newvalues = { $set: { ships: data } };
  console.log(user);
  console.log(data);
  db.collection("grids").updateOne(
    { email: user },
    newvalues,
    function (err, res) {
      if (res) callback({ success: true });
      else callback({ success: false });
    }
  );
}

module.exports = {
  insertGrid,
  getGrid,
  updateGridModel,
};
