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
var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};

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
  var viewReplies = document.getElementsByClassName('viewReplies');

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

      /*if(viewReplies){
        for(let i = 0; i < viewReplies.length; i++)
          viewReplies[i].style.
      }*/

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

      if (errContent) {
        errContent.style.backgroundColor = "rgb(245, 248, 250)";
      }
    }
  });
};
