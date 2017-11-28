"use strict";

var displayOptions = false; // no GLOBALS

var handleTweet = function handleTweet(e) {
  e.preventDefault();

  if ($("#tweetMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  sendAjax('POST', $("#tweetForm").attr("action"), $("#tweetForm").serialize(), function () {
    sendAjax('GET', '/getToken', null, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  // remove image input field
  var imageInput = document.querySelector("#imageInput");
  if (imageInput) imageInput.parentNode.removeChild(imageInput);

  // change tweet placeholder text back
  var tweetMsg = document.querySelector("#tweetMessage");
  tweetMsg.placeholder = "What's happening?";
  tweetMsg.value = '';

  return false;
};

var handleChange = function handleChange(e) {
  e.preventDefault();

  if ($("#changeTweetMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  sendAjax('POST', $("#changeTweetForm").attr("action"), $("#changeTweetForm").serialize(), function () {
    sendAjax('GET', '/getToken', null, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  var optDivId = "optDiv" + $("#changeTweetForm").attr('data-ref');
  var optDiv = document.getElementById(optDivId);
  if (optDiv) optDiv.parentNode.removeChild(optDiv);

  displayOptions = false;

  return false;
};

var handleReply = function handleReply(e) {
  e.preventDefault();

  if ($("#replyMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  sendAjax('POST', $("#replyTweetForm").attr("action"), $("#replyTweetForm").serialize(), function () {
    sendAjax('GET', '/getToken', null, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  var replyForm = document.querySelector("#replyTweetForm");
  replyForm.parentNode.removeChild(replyForm);
};

var handlePassword = function handlePassword(e) {
  e.preventDefault();

  if ($("#oldPass").val() == '' || $("#newPass1").val() == '' || $("#newPass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  console.log($("#passwordForm").serialize());

  sendAjax('POST', $("#passwordForm").attr("action"), $("#passwordForm").serialize(), redirect);
};

var handleDelete = function handleDelete(e, csrf, tweetId) {
  e.preventDefault();

  var queryString = "_csrf=" + csrf + "&_id=" + tweetId;

  sendAjax('POST', '/delete', queryString, function () {
    sendAjax('GET', '/getToken', null, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  displayOptions = false;

  return false;
};

var handleFav = function handleFav(csrf, tweetId) {
  var favId = 'fav' + tweetId;
  var favButton = document.getElementById(favId);
  favButton.src = '/assets/img/heart-fill.png';

  var queryString = "_csrf=" + csrf + "&id=" + tweetId;

  if (favButton.dataset.faved === "false") {
    sendAjax('POST', '/favTweet', queryString, function () {
      sendAjax('GET', '/getToken', null, function (result) {
        loadTweetsFromServer(result.csrfToken);
      });
    });
  }
  favButton.dataset.faved = "true";
};

// function that creates image input in tweet form
var createImageInput = function createImageInput() {
  var imageField = document.querySelector('#imageField');
  if (imageField.childNodes.length === 0) {
    var input = document.createElement('input');
    input.id = "imageInput";
    input.type = "text";
    input.name = "imgData";
    input.placeholder = "Image link";

    imageField.appendChild(input);
  }
};

var ChangePasswordWindow = function ChangePasswordWindow(props) {
  return React.createElement(
    "div",
    { id: "passwordDiv" },
    React.createElement(
      "form",
      { id: "passwordForm",
        name: "passwordForm",
        onSubmit: handlePassword,
        action: "/passChange",
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
        { htmlFor: "oldPass" },
        "Old password: "
      ),
      React.createElement("input", { id: "oldPass", type: "password", name: "oldPass" }),
      React.createElement(
        "label",
        { htmlFor: "newPass1" },
        "New password:"
      ),
      React.createElement("input", { id: "newPass1", type: "password", name: "newPass1" }),
      React.createElement(
        "label",
        { htmlFor: "newPass2" },
        "Retype password:"
      ),
      React.createElement("input", { id: "newPass2", type: "password", name: "newPass2" }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
    )
  );
};

var createPasswordWindow = function createPasswordWindow(csrf) {
  ReactDOM.render(React.createElement(ChangePasswordWindow, { csrf: csrf }), document.querySelector("#appContent"));
};

var TweetForm = function TweetForm(props) {
  return React.createElement(
    "div",
    { id: "tweetFormDiv" },
    React.createElement(
      "form",
      { id: "tweetForm",
        onSubmit: handleTweet,
        name: "tweetForm",
        action: "/maker",
        method: "POST",
        className: "tweetForm",
        enctype: "multipart/form-data"
      },
      React.createElement("input", { id: "tweetMessage", type: "text", name: "message", placeholder: "What's happening?" }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "makeTweetSubmit", type: "submit", value: "Tweet" }),
      React.createElement("div", { id: "imageField" })
    ),
    React.createElement("img", { id: "uploadImage", src: "/assets/img/upload.png", width: "25", height: "25", alt: "upload image", onClick: createImageInput })
  );
};

var MakeChangeForm = function MakeChangeForm(props) {
  return React.createElement(
    "form",
    { id: "changeTweetForm",
      onSubmit: handleChange,
      name: "changeTweetForm",
      action: "/change",
      method: "POST",
      className: "changeForm",
      "data-ref": props.tweetId
    },
    React.createElement("input", { id: "changeTweetMessage", type: "text", name: "message", placeholder: props.message }),
    React.createElement("input", { type: "hidden", name: "_id", value: props.tweetId }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "changeTweetSubmit", type: "submit", value: "Tweet" })
  );
};

var renderChangeForm = function renderChangeForm(csrf, tweetId, message) {
  var chngId = "chng" + tweetId;

  ReactDOM.render(React.createElement(MakeChangeForm, { csrf: csrf, tweetId: tweetId, message: message }), document.getElementById(chngId));
};

var removeDeleteOpts = function removeDeleteOpts(id) {
  var delDivId = "delDiv" + id;
  var delDiv = document.getElementById(delDivId);
  delDiv.parentNode.removeChild(delDiv);

  var optDivId = "optDiv" + id;
  var optDiv = document.getElementById(optDivId);
  optDiv.parentNode.removeChild(optDiv);

  displayOptions = false;
};

var MakeDeleteOptions = function MakeDeleteOptions(props) {
  var delDivId = "delDiv" + props.tweetId;
  return React.createElement(
    "div",
    { id: delDivId, className: "delDiv" },
    React.createElement(
      "div",
      { className: "delYes", onClick: function onClick(e) {
          return handleDelete(e, props.csrf, props.tweetId);
        } },
      "Delete"
    ),
    React.createElement(
      "div",
      { className: "delNo", onClick: function onClick(e) {
          return removeDeleteOpts(props.tweetId);
        } },
      "Cancel"
    )
  );
};

var renderDeleteOptions = function renderDeleteOptions(csrf, tweetId) {
  var id = "del" + tweetId;
  ReactDOM.render(React.createElement(MakeDeleteOptions, { csrf: csrf, tweetId: tweetId }), document.getElementById(id));
};

var MakeOptions = function MakeOptions(props) {
  if (displayOptions) {
    var optDivId = "optDiv" + props.tweetId;
    return React.createElement(
      "div",
      { id: optDivId, className: "optDiv" },
      React.createElement(
        "div",
        { className: "changeTweet", onClick: function onClick() {
            return renderChangeForm(props.csrf, props.tweetId, props.tweetMessage);
          } },
        "Edit Tweet"
      ),
      React.createElement("hr", null),
      React.createElement(
        "div",
        { className: "deleteTweet", onClick: function onClick() {
            return renderDeleteOptions(props.csrf, props.tweetId);
          } },
        "Delete Tweet"
      )
    );
  } else {
    var delDivId = "delDiv" + props.tweetId;
    var delDiv = document.getElementById(delDivId);
    if (delDiv) delDiv.parentNode.removeChild(delDiv);

    return React.createElement("div", null);
  }
};

var renderOptions = function renderOptions(csrf, tweetId, tweetMessage) {
  displayOptions = !displayOptions;
  var id = "opt" + tweetId;
  ReactDOM.render(React.createElement(MakeOptions, { csrf: csrf, tweetId: tweetId, tweetMessage: tweetMessage }), document.getElementById(id));
};

var MakeReplyForm = function MakeReplyForm(props) {
  return React.createElement(
    "form",
    { id: "replyTweetForm",
      onSubmit: handleReply,
      name: "replyTweetForm",
      action: "/reply",
      method: "POST",
      className: "replyForm",
      "data-ref": props.tweetId
    },
    React.createElement("input", { id: "replyMessage", type: "text", name: "message", placeholder: "Reply here" }),
    React.createElement("input", { type: "hidden", name: "_id", value: props.tweetId }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "replyTweetSubmit", type: "submit", value: "Reply" })
  );
};

var renderReplyDiv = function renderReplyDiv(csrf, tweetId, replyDivId) {
  ReactDOM.render(React.createElement(MakeReplyForm, { csrf: csrf, tweetId: tweetId }), document.getElementById(replyDivId));
};

var MakeReplies = function MakeReplies(props) {
  if (props.comments.length === 0) {
    return React.createElement(
      "div",
      { className: "replyDiv" },
      React.createElement(
        "h3",
        null,
        "No replies"
      )
    );
  }

  var replies = props.comments.map(function (comment) {
    // source: https://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurrence
    return React.createElement(
      "div",
      { className: "replyDiv" },
      React.createElement(
        "h4",
        null,
        comment.substr(0, comment.indexOf(';'))
      ),
      React.createElement(
        "p",
        null,
        comment.substr(comment.indexOf(';') + 1)
      )
    );
  });

  return React.createElement(
    "div",
    null,
    replies
  );
};

var renderReplies = function renderReplies(e, repliesId, comments) {
  e.preventDefault();
  var id = repliesId;
  ReactDOM.render(React.createElement(MakeReplies, { comments: comments }), document.getElementById(id));
};

var TweetList = function TweetList(props) {
  var csrf = props.csrf;

  if (props.tweets.length === 0) {
    return React.createElement(
      "div",
      { className: "tweetList" },
      React.createElement(
        "h3",
        { className: "emptyTweet" },
        "No Tweets yet"
      )
    );
  }

  var tweetNodes = props.tweets.map(function (tweet) {
    var delId = "del" + tweet._id;
    var chngId = "chng" + tweet._id;
    var optId = "opt" + tweet._id;
    var favId = "fav" + tweet._id;
    var replyId = "reply" + tweet._id;
    var replyDivId = "replyDiv" + tweet._id;
    var repliesId = "replies" + tweet._id;

    var imgSrc = void 0;

    if (tweet.imgData) {
      imgSrc = tweet.imgData;
    }

    var comments = tweet.comments;
    return React.createElement(
      "div",
      { key: tweet._id, className: "tweet" },
      props.displayname == tweet.displayname && React.createElement("img", { className: "dropDownIcon", src: "/assets/img/dropdown.png", width: "25", height: "25", alt: "dropdown icon", onClick: function onClick() {
          return renderOptions(csrf, tweet._id, tweet.message);
        } }),
      React.createElement("div", { id: optId }),
      React.createElement("div", { id: delId }),
      React.createElement(
        "h4",
        { className: "tweetDisplayName" },
        tweet.displayname,
        " | ",
        tweet.createdDate
      ),
      React.createElement(
        "p",
        { className: "tweetMessage", id: chngId },
        tweet.message
      ),
      imgSrc != null && React.createElement("img", { className: "tweetImg", src: imgSrc, width: "300", height: "150", alt: "image here" }),
      React.createElement(
        "div",
        null,
        React.createElement("img", { id: replyId, className: "replyButton", src: "/assets/img/reply.png", width: "17", height: "17", alt: "reply button", onClick: function onClick() {
            return renderReplyDiv(csrf, tweet._id, replyDivId);
          } }),
        React.createElement("img", { id: favId, className: "favButton", src: "/assets/img/heart.png", width: "17", height: "17", alt: "favorite tweet", "data-faved": "false", onClick: function onClick() {
            return handleFav(csrf, tweet._id);
          } }),
        tweet.favorites > 0 && React.createElement(
          "span",
          null,
          " ",
          tweet.favorites,
          " "
        ),
        React.createElement(
          "a",
          { href: "#", className: "viewReplies", onClick: function onClick(e) {
              return renderReplies(e, repliesId, comments);
            } },
          "Show replies"
        )
      ),
      React.createElement("div", { id: replyDivId }),
      React.createElement("div", { id: repliesId, className: "replies" })
    );
  });

  return React.createElement(
    "div",
    { className: "tweetList" },
    tweetNodes
  );
};

var loadTweetsFromServer = function loadTweetsFromServer(csrf) {
  sendAjax('GET', '/getTweets', null, function (data) {
    ReactDOM.render(React.createElement(TweetList, { csrf: csrf, displayname: data.displayname, tweets: data.tweets }), document.querySelector("#tweets"));
  });
};

var setup = function setup(csrf) {
  var changePasswordButton = document.querySelector("#changePassButton");

  changePasswordButton.addEventListener("click", function (e) {
    e.preventDefault();
    createPasswordWindow(csrf);
    return false;
  });

  ReactDOM.render(React.createElement(TweetForm, { csrf: csrf }), document.querySelector("#makeTweet"));

  ReactDOM.render(React.createElement(TweetList, { tweets: [], csrf: csrf }), document.querySelector("#tweets"));

  loadTweetsFromServer(csrf);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
};

var NotFound = function NotFound(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "p",
      null,
      "props.message"
    )
  );
};

var createNotFoundPage = function createNotFoundPage(message) {
  ReactDOM.render(React.createElement(NotFound, { message: message }), document.querySelector("#content"));
};

var redirect = function redirect(response) {
  window.location = response.redirect;
};

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
      console.log(messageObj);
      handleError(messageObj.error);
    }
  });
};
