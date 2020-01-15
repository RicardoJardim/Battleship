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
const gameController = require("./controller/GameController");
const gridController = require("./controller/GridController");

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

  socket.on("join", function(nome, email, points, boats) {
    users[socket.id] = {
      points: points,
      username: nome,
      ships: boats,
      email: email,
      inGame: null,
      player: null
    };
    var gameRoom = "game" + gameIdCounter;
    socket.join(gameRoom);
    //seeClients(gameRoom);
    var x = getClientsInRoom(gameRoom);

    if (x.length >= 2) {
      console.log(users[x[0]].email + " " + users[x[1]].email);
      var game = new Game(
        gameIdCounter,
        x[0],
        users[x[0]].email,
        x[1],
        users[x[1]].email
      );

      game.players[0].createShips(users[x[0]].ships);
      game.players[1].createShips(users[x[1]].ships);

      users[x[0]].player = 0;
      users[x[1]].player = 1;
      users[x[0]].inGame = game;
      users[x[1]].inGame = game;

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

      //CRIA AS GRIDS
      io.to(x[0]).emit("update", game.getGameState(0, 0));
      io.to(x[1]).emit("update", game.getGameState(1, 1));
    }
  });

  //SAIR DA ESPERA
  socket.on("leaveWaiting", function() {
    delete users[socket.id];
  });

  //QUANDO SAI DO JOGO FAZ UPDATE NOS PONTOS
  socket.on("opponentleft", function(data) {
    userController.updatePoints(
      { email: users[data.id].email },
      { points: parseInt(users[data.id].points) + 100 },
      function(result) {
        saveGame(users[data.id].inGame);
      }
    );
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
  //CHAT ENTRE OS JOGADORES
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

  //SHOT VER ISTO {y:y, x:x}
  socket.on("shot", function(position) {
    var game = users[socket.id].inGame;
    console.log(game);
    if (game !== null) {
      //TURNO DO PLAYER
      if (game.currentPlayer == users[socket.id].player) {
        console.log("-------------------------------------");
        console.log("Current player: " + game.currentPlayer);
        var opponent = game.currentPlayer == 0 ? 1 : 0;
        console.log("Opponent: " + opponent);
        console.log("----------SOCKET SHOT -----------");
        var obj = game.shoot(position);
        if (obj.success) {
          console.log("----------SOCKET SHOT -----------");
          checkGameOver(game);
          io.to(socket.id).emit("updateGrid", {
            pos: position,
            success: obj.savedStatus
          });

          io.to(game.getPlayerId(opponent)).emit("updateGridMe", {
            pos: position,
            success: obj.savedStatus
          });

          console.log("-------------------------------------");
        }
      }
    }
  });

  //ESCOLHA DA POSIÇÂO DOS BARCOS -> GAURDA NA DB A MODIFICAÇÂO OU ENTAO CRIA UM
  socket.on("ships", function(email, boats) {
    console.log("BOATS");
    console.log(boats);
    gridController.findGrid(email, function(data) {
      console.log(data);
      if (data.success == true) {
        console.log("update");

        gridController.updateGrid(email, boats, function(data) {
          console.log(data);

          if (data.success == true) {
            io.to(socket.id).emit("ships", { success: true });
          }
        });
      } else {
        gridController.registerGrid({ email: email, ships: boats }, function(
          data
        ) {
          if (data.success == true) {
            io.to(socket.id).emit("ships", { success: true });
          }
        });
      }
    });
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
    res.json(result);
  });
});

app.get("/ships/:email", auth, (req, res) => {
  gridController.findGrid(req.params.email, function(result) {
    res.json(result);
  });
});

//Verifica se está ativo para realizar logout
app.post("/user/logged", auth, (req, res) => {
  userController.verifyLogged(req.body, function(result) {
    res.json(result);
  });
});

//REGISTO
app.post("/register", (req, res) => {
  userController.registerAuth(req.body, function(result) {
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
    res.json({ data: data.data.points });
  });
});

app.get("/leaderboard/:token", (req, res) => {
  if (req.params.token) {
    userController.orderPoints(function(result) {
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

/*
  FUNÇÔES AUXILIARES
*/

//SAIU DO JOGO
function leaveGame(socket) {
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

    // NOTIFICA QUE GANHOU O JOGO
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
  io.of("/").adapter.clients([strings], (err, clients) => {});
}

//RETORNA TODOS OS CLIENTES DA ROOM ESPECIFICA
function getClientsInRoom(string) {
  var clientsArray = [];
  for (var id in io.sockets.adapter.rooms[string]) {
    clientsArray.push(io.sockets.adapter.rooms[string][id]);
  }
  var keys = Object.keys(clientsArray[0]);

  return keys;
}

function saveGame(body) {
  gameController.registerGame(body, function(data) {});
}
