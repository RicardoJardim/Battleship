const user = require("../model/UserModel.js");

function addUSer(content, title, callback) {
  console.log("Inserting " + title);
  user.insertUser(content, title, callback);
}

function getAllUsers(callback) {
  user.getAllUsers(callback);
}

module.exports = {
  addUSer,
  getAllUsers
};
