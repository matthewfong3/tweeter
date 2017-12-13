"use strict";

// - Handling requests to server - region
// handles user login to server
var handleLogin = function handleLogin(e) {
  e.preventDefault();

  if ($("#username").val() == '' || $("#password").val() == '') {
    handleError("Username or password is required");
    return false;
  }

  console.log($("input[name=_csrf]").val());

  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), true, redirect);

  return false;
};

// handles user sign up to server
var handleSignup = function handleSignup(e) {
  e.preventDefault();

  if ($("#username").val() == '' || $("#displayname").val() == '' || $("#password").val() == '' || $("#password2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#password").val() !== $("#password2").val()) {
    handleError("Passwords do not match");
    return false;
  }

  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), true, redirect);

  return false;
};
//endregion

// - Form creating related-functions - region
// function that creates the login window form
var LoginWindow = function LoginWindow(props) {
  return React.createElement(
    "form",
    { id: "loginForm", name: "loginForm",
      onSubmit: handleLogin,
      action: "/login",
      method: "POST",
      className: "mainForm"
    },
    React.createElement(
      "h1",
      null,
      "Tweeter"
    ),
    React.createElement(
      "label",
      { htmlFor: "username" },
      "Username: "
    ),
    React.createElement("input", { className: "username", type: "text", name: "username", placeholder: "username" }),
    React.createElement(
      "label",
      { htmlFor: "pass" },
      "Password: "
    ),
    React.createElement("input", { id: "password", type: "password", name: "password", placeholder: "password" }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign in" })
  );
};

// function that creates the sign up window form
var SignupWindow = function SignupWindow(props) {
  return React.createElement(
    "form",
    { id: "signupForm",
      name: "signupForm",
      onSubmit: handleSignup,
      action: "/signup",
      method: "POST",
      className: "mainForm"
    },
    React.createElement(
      "h1",
      null,
      "Tweeter"
    ),
    React.createElement(
      "label",
      { htmlFor: "username" },
      "Username: "
    ),
    React.createElement("input", { className: "username", type: "text", name: "username", placeholder: "username" }),
    React.createElement(
      "label",
      { htmlFor: "displayname" },
      "Display Name: "
    ),
    React.createElement("input", { id: "displayname", type: "text", name: "displayname", placeholder: "display name" }),
    React.createElement(
      "label",
      { htmlFor: "pass" },
      "Password: "
    ),
    React.createElement("input", { id: "password", type: "password", name: "password", placeholder: "password" }),
    React.createElement(
      "label",
      { htmlFor: "pass2" },
      "Retype Password: "
    ),
    React.createElement("input", { id: "password2", type: "password", name: "password2", placeholder: "retype password" }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "formSubmit", type: "submit", value: "Sign Up" })
  );
};
//endregion

// - Window rendering related-functions - region
// function that renders the login window to content
var createLoginWindow = function createLoginWindow(csrf) {
  ReactDOM.render(React.createElement(LoginWindow, { csrf: csrf }), document.querySelector("#content"));
};

// function that renders the sign up window to content
var createSignupWindow = function createSignupWindow(csrf) {
  ReactDOM.render(React.createElement(SignupWindow, { csrf: csrf }), document.querySelector("#content"));
};
//endregion

// function that sets up page initially
var setup = function setup(csrf) {
  var loginButton = document.querySelector("#loginButton");
  var signupButton = document.querySelector("#signupButton");

  toggleDarkMode();

  signupButton.addEventListener("click", function (e) {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });

  loginButton.addEventListener("click", function (e) {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });

  createLoginWindow(csrf); //default view
};

// function that makes a request to the server to get a new token for the user
var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, true, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

// function that handles error messages from the server
var handleError = function handleError(message) {
  $("#errorMessage").text(message);
};

// function that redirects the user on request success
var redirect = function redirect(response) {
  window.location = response.redirect;
};

// function that sends ajax requests to the server
var sendAjax = function sendAjax(type, action, data, processBool, success) {
  var contentTypeVal = void 0;

  if (!processBool) contentTypeVal = false;else contentTypeVal = 'application/x-www-form-urlencoded; charset=UTF-8';

  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    processData: processBool,
    contentType: contentTypeVal,
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};

// helper function that toggles on/off dark/night mode view
var toggleDarkMode = function toggleDarkMode() {
  var checkbox = document.querySelector("#darkModeCheckBox");
  var body = document.body;
  var nav = document.querySelector("#nav");

  // login only
  var content = document.querySelector("#content");

  // app only
  var passwordDiv = document.querySelector("#passwordDiv");
  var tweetFormDiv = document.querySelector("#tweetFormDiv");
  var tweets = document.getElementsByClassName('tweet');
  var emptyTweet = document.getElementsByClassName('emptyTweet');
  var replies = document.getElementsByClassName('replyDiv');
  var profile = document.querySelector("#profile");

  // notFound only
  var errContent = document.querySelector("#errContent");

  checkbox.addEventListener('change', function () {
    if (checkbox.checked) {
      body.style.backgroundColor = "rgb(20,29,38)";
      body.style.color = "white";
      nav.style.backgroundColor = "rgb(36,52,71)";

      if (content) {
        content.style.backgroundColor = "rgb(27,40,54)";
      }

      if (passwordDiv) {
        passwordDiv.style.backgroundColor = "rgb(27,40,54)";
      }

      if (tweetFormDiv) {
        tweetFormDiv.style.backgroundColor = "rgb(27,52, 72)";
      }

      if (emptyTweet) {
        for (var i = 0; i < emptyTweet.length; i++) {
          emptyTweet[i].style.backgroundColor = "rgb(36,52,71)";
        }
      }

      if (tweets) {
        for (var _i = 0; _i < tweets.length; _i++) {
          tweets[_i].style.backgroundColor = "rgb(36,52,71)";
        }
      }

      if (replies) {
        for (var _i2 = 0; _i2 < replies.length; _i2++) {
          replies[_i2].style.backgroundColor = "rgb(27,40,54)";
        }
      }

      if (profile) {
        profile.style.backgroundColor = "rgb(36,52,71)";
      }

      if (errContent) {
        errContent.style.backgroundColor = "rgb(36,52,71)";
      }
    } else {
      body.style.backgroundColor = "rgb(230, 236, 240)";
      body.style.color = "black";
      nav.style.backgroundColor = "white";

      if (content) {
        content.style.backgroundColor = "rgb(245, 248, 250)";
      }

      if (passwordDiv) {
        passwordDiv.style.backgroundColor = "rgb(245, 248, 250)";
      }

      if (tweetFormDiv) {
        tweetFormDiv.style.backgroundColor = "rgb(232, 245, 253)";
      }

      if (emptyTweet) {
        for (var _i3 = 0; _i3 < emptyTweet.length; _i3++) {
          emptyTweet[_i3].style.backgroundColor = "white";
        }
      }

      if (tweets) {
        for (var _i4 = 0; _i4 < tweets.length; _i4++) {
          tweets[_i4].style.backgroundColor = "white";
        }
      }

      if (replies) {
        for (var _i5 = 0; _i5 < replies.length; _i5++) {
          replies[_i5].style.backgroundColor = "rgb(217, 235, 253)";
        }
      }

      if (profile) {
        profile.style.backgroundColor = "white";
      }

      if (errContent) {
        errContent.style.backgroundColor = "rgb(245, 248, 250)";
      }
    }
  });
};

// helper function that re-renders appropriate content depending on dark/light mode being active
var checkDarkMode = function checkDarkMode() {
  var checkbox = document.querySelector("#darkModeCheckBox");
  var emptyTweet = document.getElementsByClassName('emptyTweet');
  var tweets = document.getElementsByClassName('tweet');
  var replies = document.getElementsByClassName('replyDiv');
  var transparentDivs = document.getElementsByClassName('transparentDiv');

  if (checkbox.checked) {
    // dark mode active
    if (emptyTweet) {
      for (var i = 0; i < emptyTweet.length; i++) {
        emptyTweet[i].style.backgroundColor = "rgb(36,52,71)";
      }
    }

    if (tweets) {
      for (var _i6 = 0; _i6 < tweets.length; _i6++) {
        tweets[_i6].style.backgroundColor = "rgb(36,52,71)";
      }
    }

    if (replies) {
      for (var _i7 = 0; _i7 < replies.length; _i7++) {
        replies[_i7].style.backgroundColor = "rgb(27,40,54)";
      }
    }
  } else {
    // light mode active
    if (emptyTweet) {
      for (var _i8 = 0; _i8 < emptyTweet.length; _i8++) {
        emptyTweet[_i8].style.backgroundColor = "white";
      }
    }

    if (tweets) {
      for (var _i9 = 0; _i9 < tweets.length; _i9++) {
        tweets[_i9].style.backgroundColor = "white";
      }
    }

    if (replies) {
      for (var _i10 = 0; _i10 < replies.length; _i10++) {
        replies[_i10].style.backgroundColor = "rgb(217, 235, 253)";
      }
    }
  }

  if (transparentDivs) {
    for (var _i11 = 0; _i11 < transparentDivs.length; _i11++) {
      transparentDivs[_i11].style.backgroundColor = "transparent";
    }
  }
};
