var Player = require("./Players.js");
const { GameStatus, GameSetting } = require("./ShipsAndMore.js");

//CLASS GAME
class Game {
  //ID -> ID DO JOGO
  //IDPLAYER -> SOCKETID
  constructor(id, idPlayer1, email1, idPlayer2, email2) {
    this.id = id;
    this.currentPlayer = Math.floor(Math.random() * 2);
    this.winningPlayer = null;
    this.gameStatus = GameStatus.inProgress;
    this.players = [
      new Player(idPlayer1, email1),
      new Player(idPlayer2, email2)
    ];
  }
  //ID DO PLAYER -> FUNCIONA
  getPlayerId(player) {
    return this.players[player].id;
  }
  //ID DO VENCEDOR -> FUNCIONA
  getWinnerId() {
    if (this.winningPlayer === null) {
      return null;
    }
    return this.players[this.winningPlayer].id;
  }
  //ID DO PERDEDOR -> FUNCIONA
  getLoserId() {
    var loser;
    if (this.winningPlayer === null) {
      return null;
    }
    if (this.winningPlayer == 0) {
      loser = 1;
    } else {
      loser = 0;
    }
    return this.players[loser].id;
  }

  //MUDA DE JOGADOR ->FUNCIONA
  switchPlayer() {
    var current;
    if (this.currentPlayer == 0) {
      current = 1;
    } else {
      current = 0;
    }
    this.currentPlayer = current;
  }

  //SAI DO JOGO -> FUNCIONA
  abortGame(player) {
    this.gameStatus = GameStatus.gameOver;
    var winner;
    if (player == 0) {
      winner = 1;
    } else {
      winner = 0;
    }
    this.winningPlayer = winner;
  }

  //DISPARA PARA A POSIÇÃO QUE QUER
  shoot(position) {
    var opponent;
    if (this.currentPlayer == 0) {
      opponent = 1;
    } else {
      opponent = 0;
    }

    if (
      this.players[opponent].shots[position.y][position.x] == 0 &&
      this.gameStatus === GameStatus.inProgress
    ) {
      var saveStatus = this.players[opponent].shoot(position.y, position.x);
      if (!saveStatus) {
        this.switchPlayer();
      }

      if (this.players[opponent].getShipsLeft() <= 0) {
        this.gameStatus = GameStatus.gameOver;
        var winner;
        if (opponent == 0) {
          winner = 1;
        } else {
          winner = 0;
        }

        this.winningPlayer = winner;
      }

      return { savedStatus: saveStatus, success: true };
    }

    return { savedStatus: saveStatus, success: false };
  }

  //ESTADO DO JOGO

  getGameState(player, gridOwner) {
    return {
      turn: this.currentPlayer === player,
      grid: this.getGrid(gridOwner, player)
    };
  }

  //GRID

  getGrid(player) {
    return {
      shots: this.players[player].shots,
      ships: this.players[player].shipGrid
    };
  }
}

module.exports = {
  Game
};
