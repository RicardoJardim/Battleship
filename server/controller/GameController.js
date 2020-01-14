const user = require("../model/GameModel.js");

//CRIA UM NOVO REGISTO
function registerGame(body, callback) {
  user.insertGame(body, function(data) {
    if (data.success == true) {
      callback({
        success: true,
        data: data.message
      });
    } else {
      callback({
        success: false,
        message: data.message
      });
    }
  });
}

module.exports = { registerGame };
