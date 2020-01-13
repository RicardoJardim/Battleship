var mongodb = require("../utils/mongoConnection");
const config = require("config");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
const mongoose = require("mongoose");

//Esquema do Modelo
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50
  },
  points: {
    type: Number,
    required: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 255
  }
});

//Token para o modelo
UserSchema.methods.generateAuthToken = function() {
  const token = jwt.sign({ _id: this._id }, config.get("myprivatekey"));
  return token;
};

//Atribuição do modelo
const User = mongoose.model("User", UserSchema);

//function to validate user
function validateUser(user) {
  const schema = {
    name: Joi.string()
      .min(3)
      .max(50)
      .required(),
    email: Joi.string()
      .min(5)
      .max(255)
      .required()
      .email(),
    password: Joi.string()
      .min(8)
      .max(255)
      .required()
  };

  return Joi.validate(user, schema);
}

//Função para criar um user
function insertUser(data, callback) {
  var db = mongodb.getDB();
  var line = {
    name: data.name,
    email: data.email,
    password: data.password,
    points: data.points
  };

  db.collection("users").insertOne(line, function(err, res) {
    if (err) callback({ success: false, message: "Falha no insert" });
    else callback({ success: true, message: "Inseriu com sucesso" });
  });
}

//retorna todos os users
function getAllUsers(callback) {
  var db = mongodb.getDB();
  //console.log(db);
  var cursor = db
    .collection("users")
    .find({}, { projection: { password: 0 } })
    .toArray(function(err, result) {
      if (!err) callback(result);
    });
}

//procura se existe o user
function findUser(data, callback) {
  var db = mongodb.getDB();
  var cursor = db.collection("users").findOne(data, function(err, result) {
    if (result) {
      callback(true);
    } else {
      callback(false);
    }
  });
}

//login user
function loginUser(data, callback) {
  var db = mongodb.getDB();
  var cursor = db
    .collection("users")
    .findOne(data, { projection: { password: 0 } }, function(err, result) {
      if (result) {
        callback({ success: true, data: result });
      } else {
        callback({ success: false, data: "Utilizador não encontrado" });
      }
    });
}

function updatePointsModel(user, data, callback) {
  var db = mongodb.getDB();
  var newvalues = { $set: { points: data.points } };
  db.collection("users").updateOne(user, newvalues, function(err, res) {
    if (!err) callback(res);
  });
}
function findPointsModel(email, callback) {
  var db = mongodb.getDB();
  var cursor = db
    .collection("users")
    .findOne({ email: email }, { projection: { password: 0 } }, function(
      err,
      result
    ) {
      if (result) {
        callback({ success: true, data: result });
      } else {
        callback({ success: false, data: "Utilizador não encontrado" });
      }
    });
}

module.exports = {
  insertUser,
  loginUser,
  getAllUsers,
  findUser,
  validateUser,
  updatePointsModel,
  findPointsModel,
  User
};
