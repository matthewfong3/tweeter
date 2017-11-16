"use strict";

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

  return false;
};

var handleDelete = function handleDelete(e) {
  e.preventDefault();

  sendAjax('POST', $("#deleteTweetForm").attr("action"), $("#deleteTweetForm").serialize(), function () {
    sendAjax('GET', '/getToken', null, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  return false;
};

var TweetForm = function TweetForm(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { id: "tweetForm",
        onSubmit: handleTweet,
        name: "tweetForm",
        action: "/maker",
        method: "POST",
        className: "tweetForm"
      },
      React.createElement(
        "label",
        { htmlFor: "message" },
        "Tweet:"
      ),
      React.createElement("input", { id: "tweetMessage", type: "text", name: "message", placeholder: "What's happening?" }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "makeTweetSubmit", type: "submit", value: "Tweet" })
    )
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
      className: "changeForm"
    },
    React.createElement("input", { id: "changeTweetMessage", type: "text", name: "message", placeholder: props.message }),
    React.createElement("input", { type: "hidden", name: "_id", value: props.tweetId }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "changeTweetSubmit", type: "submit", value: "Tweet" })
  );
};

var renderChangeForm = function renderChangeForm(e, csrf, tweetId, message) {
  e.preventDefault();

  ReactDOM.render(React.createElement(MakeChangeForm, { csrf: csrf, tweetId: tweetId, message: message }), document.getElementById(tweetId));
};

var MakeDeleteOptions = function MakeDeleteOptions(props) {
  return React.createElement(
    "form",
    { id: "deleteTweetForm",
      onSubmit: handleDelete,
      name: "deleteTweetForm",
      action: "/delete",
      method: "POST",
      className: "deleteForm"
    },
    React.createElement("input", { type: "hidden", name: "_id", value: props.tweetId }),
    React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
    React.createElement("input", { className: "deleteTweetSubmit", type: "submit", value: "Yes" }),
    React.createElement("input", { className: "deleteTweetSubmit", type: "submit", value: "No" })
  );
};

var renderDeleteOptions = function renderDeleteOptions(csrf, tweetId) {
  ReactDOM.render(React.createElement(MakeDeleteOptions, { csrf: csrf, tweetId: tweetId }), document.querySelector("#deleteOpts"));
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
    return React.createElement(
      "div",
      { key: tweet._id, className: "tweet" },
      React.createElement(
        "h4",
        { className: "tweetDisplayName" },
        tweet.displayname,
        ":"
      ),
      React.createElement(
        "p",
        { className: "tweetMessage", id: tweet._id },
        tweet.message
      ),
      React.createElement(
        "button",
        { className: "changeTweet", onClick: function onClick(e) {
            return renderChangeForm(e, csrf, tweet._id, tweet.message);
          } },
        "Change Tweet"
      ),
      React.createElement(
        "button",
        { className: "deleteTweet", onClick: function onClick(e) {
            return renderDeleteOptions(csrf, tweet._id);
          } },
        "Delete Tweet"
      ),
      React.createElement("div", { id: "deleteOpts" })
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
    ReactDOM.render(React.createElement(TweetList, { csrf: csrf, tweets: data.tweets }), document.querySelector("#tweets"));
  });
};

var setup = function setup(csrf) {
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
      handleError(messageObj.error);
    }
  });
};
