"use strict";

var handleTweet = function handleTweet(e) {
  e.preventDefault();

  if ($("#tweetMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  var queryString = $("#tweetForm").serialize();

  var imgElem = document.getElementById('imageUpload');

  if (imgElem) {
    var imgData = JSON.stringify(getBase64Image(imgElem));

    //console.log("imgData: " + imgData);
    queryString += "&imgData=" + imgData;
  }

  //console.log(queryString);

  sendAjax('POST', $("#tweetForm").attr("action"), queryString, function () {
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

var handleDelete = function handleDelete(e, csrf, tweetId) {
  e.preventDefault();

  var queryString = "_csrf=" + csrf + "&_id=" + tweetId;

  sendAjax('POST', '/delete', queryString, function () {
    sendAjax('GET', '/getToken', null, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  return false;
};

var getBase64Image = function getBase64Image(imgElem) {
  var canvas = document.createElement('canvas');
  canvas.width = imgElem.clientWidth;
  canvas.height = imgElem.clientHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(imgElem, 0, 0);
  var dataURL = canvas.toDataURL('image/png');
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

var updateImageDisplay = function updateImageDisplay() {
  var current = $("#file")[0].files;

  if (current.length === 0) {
    console.log('no files currently uploaded');
  } else {
    var image = document.createElement('img');
    //image.type = 'image';
    image.id = "imageUpload";
    image.src = window.URL.createObjectURL(current[0]);
    image.alt = 'image display';
    image.width = "300";
    image.height = "150";

    var tweetForm = document.querySelector("#tweetform");

    tweetForm.appendChild(image);

    console.log('image uploaded');
  }
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
      React.createElement("input", { type: "file", id: "file", name: "file", accept: "image/jpeg, image/jpg, image/png", multiple: true, onChange: updateImageDisplay }),
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

  var chngId = "chng" + tweetId;

  ReactDOM.render(React.createElement(MakeChangeForm, { csrf: csrf, tweetId: tweetId, message: message }), document.getElementById(chngId));
};

var removeDeleteOpts = function removeDeleteOpts(delDivId) {
  var delDiv = document.getElementById(delDivId);
  delDiv.parentNode.removeChild(delDiv);
};

var MakeDeleteOptions = function MakeDeleteOptions(props) {
  var delDivId = "delDiv" + props.tweetId;
  return React.createElement(
    "div",
    { id: delDivId },
    React.createElement(
      "button",
      { onClick: function onClick(e) {
          return handleDelete(e, props.csrf, props.tweetId);
        } },
      "Yes"
    ),
    React.createElement(
      "button",
      { onClick: function onClick(e) {
          return removeDeleteOpts(delDivId);
        } },
      "No"
    )
  );
};

var renderDeleteOptions = function renderDeleteOptions(csrf, tweetId) {
  var id = "del" + tweetId;
  ReactDOM.render(React.createElement(MakeDeleteOptions, { csrf: csrf, tweetId: tweetId }), document.getElementById(id));
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
    var obj = void 0;
    var imgSrc = void 0;

    if (tweet.imgData) {
      //console.log(tweet.imgData);
      obj = JSON.parse(tweet.imgData);

      imgSrc = "data:image/png;base64," + obj;

      //console.log(imgSrc);
    }
    console.log(imgSrc);
    return React.createElement(
      "div",
      { key: tweet._id, className: "tweet" },
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
      obj != null && React.createElement("img", { src: imgSrc, width: "300", height: "150", alt: "image here" }),
      props.displayname == tweet.displayname && React.createElement(
        "div",
        null,
        React.createElement(
          "button",
          { className: "changeTweet", onClick: function onClick(e) {
              return renderChangeForm(e, csrf, tweet._id, tweet.message);
            } },
          "Edit Tweet"
        ),
        React.createElement(
          "button",
          { className: "deleteTweet", onClick: function onClick(e) {
              return renderDeleteOptions(csrf, tweet._id);
            } },
          "Delete Tweet"
        )
      ),
      React.createElement("div", { id: delId })
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
