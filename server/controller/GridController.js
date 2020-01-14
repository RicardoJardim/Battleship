const user = require("../model/GridModel.js");

//CRIA UM NOVO REGISTO
function registerGrid(body, callback) {
  user.insertGrid(body, function(data) {
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

function findGrid(userEmail, callback) {
  user.getGrid(userEmail, callback);
}

function updateGrid(userEmail, boats, callback) {
  user.updateGridModel(userEmail, boats, callback);
}
module.exports = { registerGrid, findGrid, updateGrid };
