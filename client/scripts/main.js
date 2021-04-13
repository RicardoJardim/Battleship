$(function () {
  var sound = document.getElementById("myaudio2");
  sound.volume = 0.1;
  $("#start").click(() => {
    sound.play();
  });

  $("#cancel").click(() => {
    sound.pause();
    sound.currentTime = 0;
  });

  var username = getCookie("username");
  var email = getCookie("email");
  console.log(email);
  var points = getCookie("points");
  var token = getCookie("authorization");
  if (token) {
    $.ajax({
      url: "/user/" + email,
      async: false,
      type: "GET",
      headers: {
        authorization: token,
      },
      success: function (data) {
        var number = data.data;

        setCookie("points", number);
        $("#points").append(" " + number);
      },
      error: function (data) {
        alert(data);
      },
    });
  }
  var boats;
  verify();

  $("#tourn").click(PlayTournament);
  $("#logout").click(Logout);
  $("#leaderboard").click(function () {
    changePageTo("leaderboard");
  });
  $("#chooseShips").click(function () {
    changePageTo("placeships");
  });

  var socket;

  //************************************Btns****************************************

  function verifyFunction() {
    if (boats) {
      Play1vs1();
    } else {
      alert("Go pick some boats");
    }
  }

  //Play 1 contra 1
  function Play1vs1() {
    socket = io.connect();

    socket.emit("join", username, email, points, boats);

    var id = this.id;
    var modal = document.getElementById("myModal");
    modal.style.display = "block";

    var span = document.getElementsByClassName("close")[0];

    span.onclick = function () {
      modal.style.display = "none";
      socket.emit("leaveWaiting", function () {
        console.log("Disconnected from server.");
      });
    };

    socket.on("changePage", function (data) {
      if (data.success == true) {
        $("#hide").css("display", "none");
        $("#show").css("display", "block");

        console.log("Starting game");
        $("#game-number").html(data.gameID);

        afterConnect();
      }
    });

    //QUANDO FAZ UPDATE DO JOGO
    socket.on("update", function (gameState) {
      dataToVue(gameState);
    });
  }
  //Botao jogar torneio
  function PlayTournament() {
    alert("Buy the full version to unlock this feature");
  }
  //logout
  function Logout() {
    if (token) {
      $.ajax({
        url: "/user/logged",
        async: true,
        type: "POST",
        data: { email: email },
        headers: {
          authorization: token,
        },
        success: function (data) {
          if (data.success == true) {
            window.location = "/";
          }
        },
        error: function (data) {
          alert(data);
        },
      });
    } else {
      window.location = "/";
    }
  }
  //Mostra a Leaderboard

  //Trata de tudo depois de conectar a socket
  function afterConnect() {
    //DISCONENECT DO JOGO
    socket.on("disconnect", function () {
      console.log("Disconnected from server.");
      $("#game").hide();
    });

    //CHAT
    socket.on("chat", function (msg) {
      $("#messages").append(
        "<li><strong>" + msg.name + ":</strong> " + msg.message + "</li>"
      );
      $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
    });

    // NOTIFICA QUE SAIU DO JOGO
    socket.on("notification", function (msg) {
      $("#messages").append("<li>" + msg.message + "</li>");
      $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
    });

    //NOTIFICAÇÃO PARA O UTILIZADOR QUE GANHOU
    socket.on("opponentleft", function (msg) {
      $("#messages").append("<li>" + msg.message + "</li>");
      $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
      socket.emit("opponentleft", { id: socket.id });
    });

    //ACABA O JOGO
    socket.on("gameover", function (isWinner) {
      if (isWinner) {
        $("#messages").append("<li> Congratulations you won the game </li>");
        $("#messages").append("<li> You Won the game and 100 points</li>");

        $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);

        socket.emit("opponentleft", { id: socket.id });
      } else {
        $("#messages").append("<li> You lost </li>");
        $("#messages-list").scrollTop($("#messages-list")[0].scrollHeight);
      }
    });

    //ENVIAR MENSAGEM
    $("#message-form").submit(function () {
      socket.emit("chat", $("#message").val());
      $("#message").val("");
      return false;
    });

    //UPDATE GRID THEM
    socket.on("updateGrid", function (data) {
      changeTh(data);
    });
    //UPDATE GRID ME
    socket.on("updateGridMe", function (data) {
      changeMe(data);
    });
  }

  //FUNCAO GERAL PARA MUDAR DE PAGINA
  function changePageTo(goTo) {
    var token = getCookie("authorization");
    if (token) {
      $.ajax({
        url: "/verify",
        async: true,
        type: "GET",
        headers: {
          authorization: token,
        },
        success: function (data) {
          if (data.success) {
            if (data.success == true) {
              window.location = "/" + goTo + "/" + token;
            }
          }
        },
        error: function (data) {
          alert(data);
        },
      });
    }
  }
  //VERIFICA SE TEM PREMISSOES
  function verify() {
    if (token) {
      $.ajax({
        url: "/ships/" + email,
        async: false,
        type: "GET",
        headers: {
          authorization: token,
        },
        success: function (data) {
          if (data.success == true) {
            boats = data.data.ships;
          }
        },
        error: function (data) {
          alert(data);
        },
      });
    } else {
      boats = null;
    }
    $("#umvsum").click(verifyFunction);
  }
});
