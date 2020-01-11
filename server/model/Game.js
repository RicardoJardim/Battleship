var Player = require("./Player.js");
const { GameStatus, GameSetting } = require("./ShipsAndMore.js");

class Game {
  constructor(id, idPlayer1, idPlayer2) {
    this.id = id;
    this.currentPlayer = Math.floor(Math.random() * 2);
    this.winningPlayer = null;
    this.gameStatus = GameStatus.inProgress;
    this.players = [new Player(idPlayer1), new Player(idPlayer2)];
  }
  getPlayerId(player) {
    return this.players[player].id;
  }
  getWinnerId() {
    if (this.winningPlayer === null) {
      return null;
    }
    return this.players[this.winningPlayer].id;
  }
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

  switchPlayer() {
    var current;
    if (this.currentPlayer == 0) {
      current = 1;
    } else {
      current = 0;
    }
    this.currentPlayer = current;
  }

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
  shoot(position) {
    var opponent = this.currentPlayer === 0 ? 1 : 0,
      gridIndex = position.y * GameSetting.gridCols + position.x;

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
  getGrid(player, hideShips) {
    return {
      shots: this.players[player].shots,
      ships: hideShips
        ? this.players[player].getSunkShips()
        : this.players[player].ships
    };
  }
}

module.exports = {
  Game
};
