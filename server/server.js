//Modulos principais
var express = require("express");
var path = require("path");
var http = require("http");
var bodyParser = require("body-parser");
var ejs = require("ejs");
var socketio = require("socket.io");
var urlParser = bodyParser.urlencoded({ extended: false });

//Encryptação de mensagens
var Entities = require("html-entities").AllHtmlEntities;
var entities = new Entities();

//Middleware
const auth = require("./middleware/auth");

//Game

const { GameStatus } = require("./GameData/ShipsAndMore.js");
const { Game } = require("./GameData/Game");

//Controllers
const userController = require("./controller/UserController");

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

var users = {};
var gameIdCounter = 1;
const connections = [];

io.sockets.on("connection", socket => {
  console.log(new Date().toISOString() + " ID " + socket.id + " connected.");

  socket.on("join", function(nome, email, points) {
    users[socket.id] = {
      points: points,
      username: nome,
      email: email,
      inGame: null,
      player: null
    };
    var gameRoom = "game" + gameIdCounter;
    socket.join(gameRoom);
    //seeClients(gameRoom);
    var x = getClientsInRoom(gameRoom);
    console.log(x.length);
    console.log(users);

    if (x.length >= 2) {
      console.log(users[x[0]].email + " " + users[x[1]].email);
      var game = new Game(
        gameIdCounter,
        x[0],
        users[x[0]].email,
        x[1],
        users[x[1]].email
      );
      console.log(game);

      users[x[0]].player = 0;
      users[x[1]].player = 1;
      users[x[0]].inGame = game;
      users[x[1]].inGame = game;

      // send initial ship placements
      io.to(x[0]).emit("update", game.getGameState(0, 0));
      io.to(x[1]).emit("update", game.getGameState(1, 1));

      console.log(
        new Date().toISOString() +
          " " +
          x[0] +
          " and " +
          x[1] +
          " have joined game ID " +
          game.id
      );
      seeClients("game" + game.id);

      io.to("game" + game.id).emit("changePage", {
        success: true,
        gameID: game.id
      });
      gameIdCounter++;
    }
  });

  //SAIR DA ESPERA
  socket.on("leaveWaiting", function() {
    console.log(socket.id);
    delete users[socket.id];
  });

  socket.on("opponentleft", function(data) {
    console.log("FAZER UPDATE NOS PONTOS");
    console.log(data.id);
    console.log(users[data.id]);

    userController.updatePoints(
      { email: users[data.id].email },
      { points: parseInt(users[data.id].points) + 100 },
      function(result) {
        console.log(result);
      }
    );
  });

  //SAIR DO JOGO
  socket.on("leave", function() {
    if (users[socket.id].inGame !== null) {
      leaveGame(socket);
    }
    delete users[socket.id];
  });

  //QUANDO DISCONECTA VERIFICA SE TA EM JOGO
  socket.on("disconnect", function() {
    console.log(
      new Date().toISOString() + " ID " + socket.id + " disconnected."
    );

    if (users[socket.id]) {
      console.log("Ta em jogo");
      leaveGame(socket);
    }

    delete users[socket.id];
  });
  //CHAT
  socket.on("chat", function(msg) {
    if (users[socket.id].inGame !== null && msg) {
      console.log(
        new Date().toISOString() +
          " Chat message from " +
          socket.id +
          ": " +
          msg
      );

      // Send message to opponent
      socket.broadcast.to("game" + users[socket.id].inGame.id).emit("chat", {
        name: "Opponent",
        message: entities.encode(msg)
      });

      // Send message to self
      io.to(socket.id).emit("chat", {
        name: "Me",
        message: entities.encode(msg)
      });
    }
  });

  //SHOT
  socket.on("shot", function(position) {
    var game = users[socket.id].inGame;
    var opponent;

    if (game !== null) {
      // Is it this users turn?
      if (game.currentPlayer === users[socket.id].player) {
        opponent = game.currentPlayer === 0 ? 1 : 0;

        if (game.shoot(position)) {
          // Valid shot
          checkGameOver(game);

          // Update game state on both clients.
          io.to(socket.id).emit(
            "update",
            game.getGameState(users[socket.id].player, opponent)
          );
          io.to(game.getPlayerId(opponent)).emit(
            "update",
            game.getGameState(opponent, opponent)
          );
        }
      }
    }
  });
});

//Routes

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/chose/:token", (req, res) => {
  if (req.params.token) {
    res.render("Bewteen");
  }
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

app.get("/verify", auth, (req, res) => {
  res.json({ success: true });
});

app.get("/user/:email", auth, (req, res) => {
  userController.findPoints(req.params.email, function(data) {
    console.log(data);
    res.json({ data: data.data.points });
  });
});

app.get("/leaderboard/:token", (req, res) => {
  if (req.params.token) {
    userController.orderPoints(function(result) {
      console.log(result);
      res.render("leaderboard", { data: result });
    });
  }
});

app.get("/placeships/:token", (req, res) => {
  if (req.params.token) {
    res.render("placeships");
  }
});

//Conexão a base de dados
//Instancia o servidor
mongoUtil.connectToServer(function(err) {
  server.listen(8080, function() {
    console.log("Chatroom listening on port 8080");
  });
});

//SAIO DO JOGO
function leaveGame(socket) {
  console.log(users[socket.id]);
  if (users[socket.id].inGame !== null) {
    console.log(
      new Date().toISOString() +
        " ID " +
        socket.id +
        " left game ID " +
        users[socket.id].inGame.id
    );

    // NOTIFICA QUE SAIU DO JOGO
    socket.broadcast
      .to("game" + users[socket.id].inGame.id)
      .emit("notification", {
        message: "Opponent has left the game"
      });

    socket.broadcast
      .to("game" + users[socket.id].inGame.id)
      .emit("opponentleft", {
        message: "You Won the game and 100 points"
      });

    if (users[socket.id].inGame.gameStatus != GameStatus.gameOver) {
      users[socket.id].inGame.abortGame(users[socket.id].player);
      checkGameOver(users[socket.id].inGame);
    }

    //SAI DO ROOM
    socket.leave("game" + users[socket.id].inGame.id);

    users[socket.id].inGame = null;
    users[socket.id].player = null;

    io.to(socket.id).emit("leave");
  }
}

//VERIFICA SE JA ACABOU O JOGO
function checkGameOver(game) {
  if (game.gameStatus === GameStatus.gameOver) {
    console.log(new Date().toISOString() + " Game ID " + game.id + " ended.");
    io.to(game.getWinnerId()).emit("gameover", true);
    io.to(game.getLoserId()).emit("gameover", false);
  }
}

//APENAS VE OS CLIENTES NA ROOM
function seeClients(strings) {
  io.of("/").adapter.clients([strings], (err, clients) => {
    console.log(clients);
  });
}

//RETORNA TODOS OS CLIENTES DA ROOM ESPECIFICA
function getClientsInRoom(string) {
  var clientsArray = [];
  for (var id in io.sockets.adapter.rooms[string]) {
    clientsArray.push(io.sockets.adapter.rooms[string][id]);
  }
  var keys = Object.keys(clientsArray[0]);
  console.log(keys);

  return keys;
}

/*
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
*/
