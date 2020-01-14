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

    var gridIndex = position.y * GameSetting.gridCols + position.x;

    if (
      this.players[opponent].shots[gridIndex] === 0 &&
      this.gameStatus === GameStatus.inProgress
    ) {
      if (!this.players[opponent].shoot(gridIndex)) {
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

      return true;
    }

    return false;
  }
  //ESTADO DO JOGO
  getGameState(player, gridOwner) {
    var gridAux;
    if (gridOwner == player) {
      gridAux = 0;
    } else gridAux = 1;
    return {
      turn: this.currentPlayer === player,
      gridIndex: gridAux,
      grid: this.getGrid(gridOwner, player !== gridOwner)
    };
  }
  //GRID
  getGrid(player, hideShips) {
    var shipsAux;
    if (hideShips) {
      shipsAux = this.players[player].getSunkShips();
    } else {
      shipsAux = this.players[player].ships;
    }
    return {
      shots: this.players[player].shots,
      ships: shipsAux
    };
  }
}

module.exports = {
  Game
};
