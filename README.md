# Battleship game using Vue - Node.js - Socket.io - Express - EmbedJs - MongoDB - jsonwebtoken - bcrypt

Este projeto consiste num jogo Batalha Naval totalmente web, em que a utilizacao inicia-se por fazer um registo e o login, estando os as credencias encriptadas. De seguida, no menu tera as opcoes de desconectar-se(logout), jogar(play), definir os barcos(ships) ou ver a leaderboard. Antes de jogar a primeira vez ou sempre que quiser alterar a posiçao dos barcos, tera de definir na pagina ships. Para cada jogador séra atribuido uma sala, em que espera por uma segunda conexão. Todo o jogo é dinamico e todas as ligações são encriptadas de forma a garantir uma boa segurança. Por fim, todos os jogos são registados, e é atribuido pontos ao jogar que ganhou.

## Settings
Run server

- node server/server.js

Database server

- localhost:27017
- db name -> battleship

## Node Modules

- npm install
- npm install express --save
- npm install body-parser --save
- npm install path --save
- npm install mongodb --save
- npm install --save ejs
- npm i config joi express mongoose jsonwebtoken bcrypt

# Rules

https://www.thesprucecrafts.com/the-basic-rules-of-battleship-411069
