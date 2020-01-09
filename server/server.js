//Modulos principais
var express = require("express");
var path = require("path");
var http = require("http");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var socketio = require("socket.io");
const userController = require("./controller/UserController");

//Utils
var mongoUtil = require("./utils/mongoConnection");

//Atribuições
var app = express();
app.use(express.json());
var server = http.Server(app);

var io = socketio(server);

app.set("view engine", "ejs");

console.log("Server is running");

//Variáveis
const users = [];
const connections = [];

io.sockets.on("connection", socket => {
  connections.push(socket);
  console.log(" %s sockets is connected", connections.length);

  socket.on("disconnect", () => {
    connections.splice(connections.indexOf(socket), 1);
  });

  socket.on("sending message", message => {
    console.log("Message is received :", message);

    io.sockets.emit("new message", { message: message });
  });
});

//Routes
app.get("/", (req, res) => {
  var sendToServe = path.join(__dirname, "../client/index.html");
  res.sendFile(sendToServe);
});

app.get("/users", (req, res) => {
  userController.getAllUsers(function(result) {
    console.log(result.length);
    res.json(result);
  });
});

//Registo ta feito  Login +/-
app.post("/register", (req, res) => {
  userController.registerAuth(req.body, function(result) {
    console.log(result);
    if (result.success == false) {
      res.json(result);
    } else {
      res.json({ authorization: result._token, data: result.data });
    }
  });
});

//Conexão a base de dados
//Instancia o servidor
mongoUtil.connectToServer(function(err) {
  server.listen(8080, function() {
    console.log("Chatroom listening on port 8080");
  });
});
