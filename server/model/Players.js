const { Ship, GameSetting } = require("./ShipsAndMore.js");

class Player {
  constructor(id) {
    var i;
    this.id = id;
    this.shots = Array(GameSetting.gridRows * GameSetting.gridCols);
    this.shipGrid = Array(GameSetting.gridRows * GameSetting.gridCols);
    this.ships = [];

    for (i = 0; i < GameSetting.gridRows * GameSetting.gridCols; i++) {
      this.shots[i] = 0;
      this.shipGrid[i] = -1;
    }

    if (!this.createRandomShips()) {
      // Random placement of ships failed. Use fallback layout (should rarely happen).
      this.ships = [];
      this.createShips();
    }
  }
  shoot(gridIndex) {
    if (this.shipGrid[gridIndex] >= 0) {
      // Hit!
      this.ships[this.shipGrid[gridIndex]].hits++;
      this.shots[gridIndex] = 2;
      return true;
    } else {
      // Miss
      this.shots[gridIndex] = 1;
      return false;
    }
  }
  getSunkShips() {
    var i,
      sunkShips = [];

    for (i = 0; i < this.ships.length; i++) {
      if (this.ships[i].isSunk()) {
        sunkShips.push(this.ships[i]);
      }
    }

    return sunkShips;
  }
  createShips() {
    var shipIndex,
      i,
      gridIndex,
      ship,
      x = [1, 3, 5, 8, 8],
      y = [1, 2, 5, 2, 8],
      horizontal = [false, true, false, false, true];

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
  checkShipAdjacent() {
    var i,
      j,
      x1 = ship.x - 1,
      y1 = ship.y - 1,
      x2 = ship.horizontal ? ship.x + ship.size : ship.x + 1,
      y2 = ship.horizontal ? ship.y + 1 : ship.y + ship.size;

    for (i = x1; i <= x2; i++) {
      if (i < 0 || i > GameSetting.gridCols - 1) continue;
      for (j = y1; j <= y2; j++) {
        if (j < 0 || j > GameSetting.gridRows - 1) continue;
        if (this.shipGrid[j * GameSetting.gridCols + i] >= 0) {
          return true;
        }
      }
    }

    return false;
  }
  checkShipOverlap(ship) {
    var i,
      gridIndex = ship.y * GameSetting.gridCols + ship.x;

    for (i = 0; i < ship.size; i++) {
      if (this.shipGrid[gridIndex] >= 0) {
        return true;
      }
      gridIndex += ship.horizontal ? 1 : GameSetting.gridCols;
    }

    return false;
  }
  getShipsLeft() {
    var i,
      shipCount = 0;

    for (i = 0; i < this.ships.length; i++) {
      if (!this.ships[i].isSunk()) {
        shipCount++;
      }
    }

    return shipCount;
  }
  createRandomShips() {
    var shipIndex;

    for (shipIndex = 0; shipIndex < GameSetting.ships.length; shipIndex++) {
      ship = new Ship(GameSetting.ships[shipIndex]);

      if (!this.placeShipRandom(ship, shipIndex)) {
        return false;
      }

      this.ships.push(ship);
    }

    return true;
  }
  placeShipRandom(ship, shipIndex) {
    var i,
      j,
      gridIndex,
      xMax,
      yMax,
      tryMax = 25;

    for (i = 0; i < tryMax; i++) {
      ship.horizontal = Math.random() < 0.5;

      xMax = ship.horizontal
        ? GameSetting.gridCols - ship.size + 1
        : GameSetting.gridCols;
      yMax = ship.horizontal
        ? GameSetting.gridRows
        : GameSetting.gridRows - ship.size + 1;

      ship.x = Math.floor(Math.random() * xMax);
      ship.y = Math.floor(Math.random() * yMax);

      if (!this.checkShipOverlap(ship) && !this.checkShipAdjacent(ship)) {
        // success - ship does not overlap or is adjacent to other ships
        // place ship array-index in shipGrid
        gridIndex = ship.y * GameSetting.gridCols + ship.x;
        for (j = 0; j < ship.size; j++) {
          this.shipGrid[gridIndex] = shipIndex;
          gridIndex += ship.horizontal ? 1 : GameSetting.gridCols;
        }
        return true;
      }
    }

    return false;
  }
}

module.exports = Player;
