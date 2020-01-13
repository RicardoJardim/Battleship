//ESTADO DO JOGO
const GameStatus = {
  inProgress: 1,
  gameOver: 2
};

//SETTINGS DO JOGO
const GameSetting = {
  gridRows: 10,
  gridCols: 10,
  ships: [5, 4, 3, 3, 2]
};

module.exports = {
  GameStatus,
  GameSetting
};
