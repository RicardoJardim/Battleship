//ESTADO DO JOGO
const GameStatus = {
  inProgress: 1,
  gameOver: 2
};

//SETTINGS DO JOGO
const GameSetting = {
  gridRows: 10,
  gridCols: 10,
  ships: [1, 2, 3, 4, 5]
};

module.exports = {
  GameStatus,
  GameSetting
};
