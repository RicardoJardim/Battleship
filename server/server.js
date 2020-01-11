//Modulos principais
var express = require("express");
var path = require("path");
var http = require("http");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var socketio = require("socket.io");
var urlParser = bodyParser.urlencoded({ extended: false });

const userController = require("./controller/UserController");

const auth = require("./middleware/auth");

//Utils
var mongoUtil = require("./utils/mongoConnection");

//Atribuições
var app = express();
app.use(express.json());
var server = http.Server(app);

var io = socketio(server);
app.use(urlParser);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../client"));

console.log("Server is running");

//Variáveis

const users = [];
const connections = [];

io.sockets.on("connection", socket => {
  console.log(new Date().toISOString() + " ID " + socket.id + " connected.");

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
app.get("/socket", (req, res) => {
  var sendToServe = path.join(__dirname, "../client/index.html");
  res.sendFile(sendToServe);
});

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/verify", auth, (req, res) => {
  res.json({ success: true });
});

app.get("/chose/:token", (req, res) => {
  if (req.params.token) {
    res.render("choseGame");
  }
});

app.get("/game", (req, res) => {
  res.render("game");
});

//Retorna todos os utilizadores
app.get("/users", auth, (req, res) => {
  userController.getAllUsers(function(result) {
    console.log(result.length);
    res.json(result);
  });
});

//Verifica se está ativo para realizar logout
app.post("/user/logged", auth, (req, res) => {
  userController.verifyLogged(req.body, function(result) {
    console.log(result);
    res.json(result);
  });
});

//REGISTO
app.post("/register", (req, res) => {
  userController.registerAuth(req.body, function(result) {
    console.log(result);
    if (result.success == false) {
      res.json(result);
    } else {
      res.json({
        success: true,
        authorization: result._token,
        data: result.data
      });
    }
  });
});
//LOGIN
app.post("/login", (req, res) => {
  userController.loginAuth(req.body, function(result) {
    console.log(result);
    if (result.success == false) {
      res.json(result);
    } else {
      res.json({
        success: result.success,
        authorization: result._token,
        data: result.data
      });
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
