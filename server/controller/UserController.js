const user = require("../model/UserModel.js");
var crypto = require("crypto");

//VERIFICA SE ESTÀ ATIVO
function verifyLogged(body, callback) {
  user.findUser({ email: body.email }, function(data) {
    console.log(data);
    if (data == true)
      return callback({
        success: true
      });
    else {
      return callback({
        success: false
      });
    }
  });
}

//CRIA UM NOVO REGISTO
function registerAuth(body, callback) {
  const { error } = user.validateUser(body);
  if (error)
    return callback({
      success: false,
      message: " " + error.details[0].message + ""
    });

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

//LOGIN
function loginAuth(body, callback) {
  var hash = crypto
    .createHash("md5")
    .update(body.password)
    .digest("hex");
  console.log(hash);

  user.loginUser({ email: body.email, password: hash }, function(data) {
    console.log(data);
    if (data.success == true) {
      var newUser = new user.User({
        id: data.data._id,
        name: data.data.name,
        email: data.data.email,
        points: data.data.points
      });
      const token = newUser.generateAuthToken();
      return callback({
        success: data.success,
        data: newUser,
        _token: token
      });
    } else {
      callback({
        success: false,
        message: data.data
      });
    }
  });
}

//RETORNA TODOS OS USERS
function getAllUsers(callback) {
  user.getAllUsers(callback);
}

module.exports = {
  getAllUsers,
  loginAuth,
  registerAuth,
  verifyLogged
};

//FUNÇÂO PARA AJUDAR NO REGISTO
function helperfunction(data, callback) {
  var newUser = new user.User({
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
  });
}
