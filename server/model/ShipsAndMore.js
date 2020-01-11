const GameStatus = {
  inProgress: 1,
  gameOver: 2
};

const GameSetting = {
  gridRows: 10,
  gridCols: 10,
  ships: [5, 4, 3, 3, 2]
};

class Ship {
  constructor(x, y, size, hits, horizontal) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.hits = hits;
    this.horizontal = horizontal;
  }

  Morreu() {
    return this.hits >= this.size;
  }
}

module.exports = {
  GameStatus,
  GameSetting,
  Ship
};
