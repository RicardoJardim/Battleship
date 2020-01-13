const { GameSetting } = require("./ShipsAndMore.js");

class Ship {
  constructor(size) {
    this.x = 0;
    this.y = 0;
    this.size = size;
    this.hits = 0;
    this.horizontal = false;
  }

  Morreu() {
    return this.hits >= this.size;
  }
}

class Player {
  //ID -> SOCKET.ID
  constructor(id) {
    var i;
    this.id = id;
    this.shots = Array(GameSetting.gridRows * GameSetting.gridCols);
    this.shipGrid = Array(GameSetting.gridRows * GameSetting.gridCols);
    this.ships = [];

    //0 -> NAO EXPLORADO  1-> ATIROU E FALHOU   -1 -> POSICAO DOS BARCOS
    for (i = 0; i < GameSetting.gridRows * GameSetting.gridCols; i++) {
      this.shots[i] = 0;
      this.shipGrid[i] = -1;
    }
  }
  //TIRO NO ADVERSÁRIO
  shoot(gridIndex) {
    if (this.shipGrid[gridIndex] >= 0) {
      //ACERTOU NO BARCO ADVERSÁRIO
      this.ships[this.shipGrid[gridIndex]].hits++;
      this.shots[gridIndex] = 2;
      return true;
    } else {
      //FALHOU
      this.shots[gridIndex] = 1;
      return false;
    }
  }
  //TODOS OS BARCOS QUE SE AFUNDARAM
  getSunkShips() {
    var i,
      sunkShips = [];

    for (i = 0; i < this.ships.length; i++) {
      if (this.ships[i].Morreu()) {
        sunkShips.push(this.ships[i]);
      }
    }

    return sunkShips;
  }
  //CRIA BARCOS NA GRID
  createShips() {
    var shipIndex,
      i,
      gridIndex,
      x = [1, 3, 5, 8, 8],
      y = [1, 2, 5, 2, 8],
      horizontal = [false, true, false, false, true];

    var ship;

    for (shipIndex = 0; shipIndex < GameSetting.ships.length; shipIndex++) {
      ship = new Ship(GameSetting.ships[shipIndex]);
      ship.horizontal = horizontal[shipIndex];
      ship.x = x[shipIndex];
      ship.y = y[shipIndex];

      // place ship array-index in shipGrid
      gridIndex = ship.y * GameSetting.gridCols + ship.x;
      for (i = 0; i < ship.size; i++) {
        this.shipGrid[gridIndex] = shipIndex;
        gridIndex += ship.horizontal ? 1 : GameSetting.gridCols;
      }

      this.ships.push(ship);
    }
  }

  //BARCOS QUE FALTAM MORRER
  getShipsLeft() {
    var i,
      shipCount = 0;

    for (i = 0; i < this.ships.length; i++) {
      if (!this.ships[i].Morreu()) {
        shipCount++;
      }
    }

    return shipCount;
  }
  //CRIA OS BARCOS RANDOM
  createRandomShips() {
    var shipIndex;

    for (shipIndex = 0; shipIndex < GameSetting.ships.length; shipIndex++) {
      var ship = new Ship(GameSetting.ships[shipIndex]);

      this.ships.push(ship);
    }

    return true;
  }
}

module.exports = Player;
