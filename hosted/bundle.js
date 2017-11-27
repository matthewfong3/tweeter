"use strict";

var displayOptions = false; // no GLOBALS
var test1 = void 0;

var handleTweet = function handleTweet(e) {
  e.preventDefault();

  if ($("#tweetMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  var queryString = $("#tweetForm").serialize();

  var imgElem = document.getElementById('imageUpload');

  if (imgElem) {
    var imgData = getBase64Image(imgElem);
    test1 = imgData;
    console.log(test1.replace(/\s/g, '').length);
    //test1 = base64ToBufferArray(imgData);
    //console.dir(test1);
    //test1 = arrayBufferToBase64(test1);
    //console.log(test1);
    //let testImg = document.createElement('img');
    //testImg.src = 'data:image/png;base64,' + test1;
    //console.log(testImg.src);
    //test1 = testImg.src;
    //document.body.appendChild(testImg);
    queryString += "&imgData=" + imgData;
  }

  sendAjax('POST', $("#tweetForm").attr("action"), queryString, function () {
    sendAjax('GET', '/getToken', null, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  var image = document.querySelector("#imageUpload");
  if (image) image.parentNode.removeChild(image);

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

// HELPER FUNCTIONS
// reference: https://stackoverflow.com/questions/21926893/sending-an-image-and-json-data-to-server-using-ajax-post-request
var getBase64Image = function getBase64Image(imgElem) {
  var canvas = document.createElement('canvas');
  canvas.width = imgElem.clientWidth;
  canvas.height = imgElem.clientHeight;
  var ctx = canvas.getContext('2d');
  ctx.drawImage(imgElem, 0, 0, canvas.width, canvas.height);
  var dataURL = canvas.toDataURL('image/png');

  //return dataURL;
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

var base64ToBufferArray = function base64ToBufferArray(base64) {
  var binaryString = window.atob(base64);
  var length = binaryString.length;
  var bytes = new Uint8Array(length);
  for (var i = 0; i < length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes.buffer;
};

// reference: https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
var toArrayBuffer = function toArrayBuffer(buf) {
  var ab = new ArrayBuffer(buf.length);
  var view = new Uint8Array(ab);
  for (var i = 0; i < buf.length; i++) {
    view[i] = buf[i];
  }return ab;
};

// reference: https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
var arrayBufferToBase64 = function arrayBufferToBase64(buffer) {
  var binary = '';
  var bytes = new Uint8Array(buffer);
  var length = bytes.byteLength;
  for (var i = 0; i < length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }return window.btoa(binary);
};

var updateImageDisplay = function updateImageDisplay() {
  var current = $("#file")[0].files;

  if (current.length === 0) {
    //console.log('no files currently uploaded');
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
    //console.log('image uploaded');
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

    //let chngForm = document.getElementById('changeTweetForm');
    //if(chngForm) chngForm.parentNode.removeChild(chngForm);
    return React.createElement("div", null);
  }
};

var renderOptions = function renderOptions(csrf, tweetId, tweetMessage) {
  displayOptions = !displayOptions;
  var id = "opt" + tweetId;
  ReactDOM.render(React.createElement(MakeOptions, { csrf: csrf, tweetId: tweetId, tweetMessage: tweetMessage }), document.getElementById(id));
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

  //props.testing = props.testing.replace(/\s/g,'');
  console.log(props.testing.length);
  if (props.testing === test1) {
    console.log('base64 string length are the same');
  } else {
    console.log('base64 string length are NOT the same');
  }

  var tweetNodes = props.tweets.map(function (tweet) {
    var delId = "del" + tweet._id;
    var chngId = "chng" + tweet._id;
    var optId = "opt" + tweet._id;
    var arrBuf = void 0;
    var imgSrc = void 0;

    if (tweet.imgData) {
      //console.dir(tweet.imgData);
      arrBuf = toArrayBuffer(tweet.imgData.data);
      //console.dir(arrBuf);
      //console.dir(arrayBufferToBase64(arrBuf));
      imgSrc = 'data:image/png;base64,' + arrayBufferToBase64(arrBuf).replace(/\s+/g, '');

      //imgSrc = arrayBufferToBase64(arrBuf);
      //console.dir(test1.length);
      console.dir(imgSrc);
      //if(test1 === imgSrc)
      //  console.log(true);
      //else
      //  console.log(false);
    }

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
      arrBuf != null && React.createElement("img", { src: imgSrc, width: "300", height: "150", alt: "image here" })
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
    ReactDOM.render(React.createElement(TweetList, { csrf: csrf, displayname: data.displayname, tweets: data.tweets, testing: data.testing }), document.querySelector("#tweets"));
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
