const { GameSetting } = require("./ShipsAndMore.js");

//CLASSE SHP
class Ship {
  constructor(size) {
    this.positions = [];
    this.size = size;
    this.hits = 0;
  }
  //VERIFICA SE MORRERU
  Morreu() {
    return this.hits >= this.size;
  }
}

class Player {
  //ID -> SOCKET.ID
  constructor(id, email) {
    this.id = id;
    this.email = email;
    this.shots = create2DArray(GameSetting.gridCols, GameSetting.gridRows);
    this.shipGrid = create2DArray(GameSetting.gridCols, GameSetting.gridRows);
    this.ships = [];

    //0 -> NAO EXPLORADO /   1-> ATIROU E FALHOU  / -1 -> POSICAO DOS BARCOS / 2-> ATIROU E ACERTOU
    for (var i = 0; i < GameSetting.gridCols; i++) {
      for (var e = 0; e < GameSetting.gridRows; e++) {
        this.shots[i][e] = 0;
        this.shipGrid[i][e] = -1;
      }
    }
  }
  //TIRO NO ADVERSÁRIO -> FEITO
  shoot(y, x) {
    if (this.shipGrid[y][x] >= 0) {
      //ACERTOU NO BARCO ADVERSÁRIO
      this.ships[this.shipGrid[y][x] - 1].hits++;
      this.shots[y][x] = 2;
      console.log("----------player SHOT -----------");
      console.log("ACERTOU");
      console.log("----------player SHOT -----------");
      return true;
    } else {
      this.shots[y][x] = 1;
      console.log("----------player SHOT -----------");
      console.log("FALHOU");
      console.log("----------player SHOT -----------");
      return false;
    }
  }
  //TODOS OS BARCOS QUE SE AFUNDARAM -> FEITO
  getSunkShips() {
    var sunkShips = [];

    for (var i = 0; i < this.ships.length; i++) {
      if (this.ships[i].Morreu()) {
        sunkShips.push(this.ships[i]);
      }
    }

    return sunkShips;
  }
  //CRIA BARCOS NA GRID -> FEITO
  createShips(boats) {
    var sorted = boats.sort((a, b) => (a.id > b.id ? 1 : -1));
    // console.log(sorted);

    var ship;
    for (var shipIndex = 0; shipIndex < GameSetting.ships.length; shipIndex++) {
      ship = new Ship(GameSetting.ships[shipIndex]);

      var elId = sorted.filter(function(el) {
        return el.id == shipIndex + 1;
      });
      ship.positions = elId;
      this.ships.push(ship);
    }

    for (var i = 0; i < sorted.length; i++) {
      this.shipGrid[sorted[i].y][sorted[i].x] = sorted[i].id;
    }

    //  console.log("-----------------");
    //  console.log(this.ships);
    //  console.log("-----------------");
  }

  //BARCOS QUE FALTAM MORRER -> FEITO
  getShipsLeft() {
    var shipCount = 0;

    for (var i = 0; i < this.ships.length; i++) {
      if (!this.ships[i].Morreu()) {
        shipCount++;
      }
    }

    return shipCount;
  }
}

//CRIA ARRAY 2D
function create2DArray(numRows, numColumns) {
  let array = new Array(numColumns);

  for (let i = 0; i < numColumns; i++) {
    array[i] = new Array(numRows);
  }

  return array;
}

module.exports = Player;
