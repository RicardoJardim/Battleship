const user = require("../model/UserModel.js");
var crypto = require("crypto");

function registerAuth(body, callback) {
  const { error } = user.validateUser(body);
  if (error)
    return callback({ success: false, message: error.details[0].message });

  user.findUser({ email: body.email }, function(data) {
    console.log(data);
    if (data == true)
      return callback({
        success: false,
        message: "Já existe este email registado"
      });
    else {
      return helperfunction(body, callback);
    }
  });
}

function getAllUsers(callback) {
  user.getAllUsers(callback);
}

module.exports = {
  getAllUsers,
  registerAuth
};

function helperfunction(data, callback) {
  newUser = new user.User({
    name: data.name,
    password: data.password,
    email: data.email,
    points: 0
  });

  var hash = crypto
    .createHash("md5")
    .update(data.password)
    .digest("hex");
  console.log(hash);
  newUser.password = hash;

  user.insertUser(newUser, function(data) {
    if (data.success == true) {
      const token = newUser.generateAuthToken();
      callback({
        success: true,
        data: {
          id: newUser._id,
          points: newUser.points,
          name: newUser.name,
          email: newUser.email
        },
        _token: token
      });
    } else {
      callback({
        success: false,
        message: data.message
      });
    }
  }); //falta inserir
}
