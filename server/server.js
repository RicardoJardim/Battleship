//Modulos principais
var express = require("express");
var path = require("path");
var http = require("http");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var socketio = require("socket.io");

//Utils
var mongoUtil = require("./utils/mongoConnection");

//Atribuições
var app = express();
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

//Conexão a base de dados
//Instancia o servidor
mongoUtil.connectToServer(function(err) {
  server.listen(8080, function() {
    console.log("Chatroom listening on port 8080");
  });
});
