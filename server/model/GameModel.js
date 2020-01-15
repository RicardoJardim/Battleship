var mongodb = require("../utils/mongoConnection");

//Função para criar um user
function insertGame(data, callback) {
  var db = mongodb.getDB();

  db.collection("games").insertOne(data, function(err, res) {
    if (err) callback({ success: false, message: "Falha no insert" });
    else callback({ success: true, message: "Inseriu com sucesso" });
  });
}

module.exports = {
  insertGame
};
