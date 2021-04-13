$(function () {
  // place your code

  $("#user_btn").click(sendLogin);
  $("#register_btn").click(sendRegister);
  var audio = document.getElementById("myAudio");

  $("#start").click(() => {
    audio.play();
  });

  $("#cancel").click(() => {
    audio.pause();
    audio.currentTime = 0;
  });

  function sendRegister() {
    changeroute();
    var not_empty = [];
    var valid = [];

    valores = [];
    elementos = [];

    valores.push(
      form_regist.Username.value,
      form_regist.email.value,
      form_regist.password.value
    );
    elementos.push(
      form_regist.Username,
      form_regist.email,
      form_regist.password
    );

    removeMessages(".form-label-group");
    valid.push(validString(form_regist.Username.value, form_regist.Username));
    valid.push(validateEmail(form_regist.email.value, form_regist.email));
    valid.push(validString(form_regist.password.value, form_regist.password));

    for (var i = 0; i < valores.length; i++) {
      not_empty.push(validateEmpty(valores[i], elementos[i]));
    }

    if (valid.reduce(and) && not_empty.reduce(and)) {
      console.log("entrou");

      var content = {
        name: form_regist.Username.value,
        email: form_regist.email.value,
        password: form_regist.password.value,
      };
      postData("/register", content);
    }
  }

  function sendLogin() {
    changeroute();
    var not_empty = [];
    var valid = [];

    valores = [];
    elementos = [];

    valores.push(form_login.email.value, form_login.password.value);
    elementos.push(form_login.email, form_login.password);

    removeMessages(".form-label-group");
    valid.push(validateEmail(form_login.email.value, form_login.email));
    valid.push(validString(form_login.password.value, form_login.password));

    for (var i = 0; i < valores.length; i++) {
      not_empty.push(validateEmpty(valores[i], elementos[i]));
    }

    if (valid.reduce(and) && not_empty.reduce(and)) {
      console.log("entrou");
      var content = {
        email: form_login.email.value,
        password: form_login.password.value,
      };
      postData("/login", content);
    }
  }

  function postData(url, content) {
    $.post(url, content, function (data) {
      if (data.success == false) {
        alert(data.message);
      } else {
        changeroute();
      }
    });
  }

  function validateEmpty(content, element) {
    if (content == "") {
      $(element).css("background", "#ffcccc");
      $(element).attr("placeholder", "Mandatory field");
      return false;
    } else {
      return true;
    }
  }

  function validateEmail(content, element) {
    if (!content.match(/^[a-zA-Z0-9._]*@[a-z]*\.(com|pt|org)$/)) {
      $(element).css("background-color", "#ebdf5e");
      $(element).after(
        '<p style="color:#c2b100"> Incorrect email formatting </p>'
      );
      return false;
    } else {
      return true;
    }
  }

  function validString(content, element) {
    if (!content.match(/^[a-zA-Z0-9]+/)) {
      $(element).css("background-color", "#ebdf5e");
      $(element).after(
        '<p style="color:red;margin:0px"> Incorrect field formatting </p>'
      );
      return false;
    } else {
      return true;
    }
  }

  function and(a, b) {
    return a && b;
  }

  function removeMessages(string) {
    $(string).children().filter("p").remove();
  }
  function changeroute() {
    var token = getCookie("authorization");
    if (token) {
      window.window.location = "/choose/" + token;
    } else {
      console.log("Please enable Cookies");
      return;
    }
  }
});
