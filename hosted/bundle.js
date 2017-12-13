"use strict";

// - Handling requests to server - region
// handles user tweet to server
var handleTweet = function handleTweet(e) {
  e.preventDefault();

  if ($("#tweetMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  // source: https://stackoverflow.com/questions/21060247/send-formdata-and-string-data-together-through-jquery-ajax
  var formData = new FormData();
  if ($("#upload")[0]) {
    var file_data = $("#upload")[0].files;
    for (var i = 0; i < file_data.length; i++) {
      formData.append('photos', file_data[i]);
    }
  }
  var oth_data = $("#tweetForm").serializeArray();
  $.each(oth_data, function (key, input) {
    formData.append(input.name, input.value);
  });

  var url = $("#tweetForm").attr("action") + "?_csrf=" + formData.get('_csrf');

  sendAjax('POST', url, formData, false, function () {
    sendAjax('GET', '/getToken', null, true, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  // remove image input field if it exists
  var imageInput = document.querySelector("#upload");
  if (imageInput) imageInput.parentNode.removeChild(imageInput);

  // change tweet placeholder text back to default
  var tweetMsg = document.querySelector("#tweetMessage");
  tweetMsg.placeholder = "What's happening?";
  tweetMsg.value = '';

  return false;
};

// handles user changed tweet to server
var handleChange = function handleChange(e) {
  e.preventDefault();

  if ($("#changeTweetMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  sendAjax('POST', $("#changeTweetForm").attr("action"), $("#changeTweetForm").serialize(), true, function () {
    sendAjax('GET', '/getToken', null, true, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  // remove option div on change tweet submit
  var optDivId = "optDiv" + $("#changeTweetForm").attr('data-ref');
  var optDiv = document.getElementById(optDivId);
  if (optDiv) optDiv.parentNode.removeChild(optDiv);

  return false;
};

// handles user replies to a tweet to server
var handleReply = function handleReply(e) {
  e.preventDefault();

  if ($("#replyMessage").val() == '') {
    handleError("Message is required");
    return false;
  }

  sendAjax('POST', $("#replyTweetForm").attr("action"), $("#replyTweetForm").serialize(), true, function () {
    sendAjax('GET', '/getToken', null, true, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  // remove reply form on submit
  var replyForm = document.querySelector("#replyTweetForm");
  replyForm.parentNode.removeChild(replyForm);
};

// handles password change to server
var handlePassword = function handlePassword(e) {
  e.preventDefault();

  if ($("#oldPass").val() == '' || $("#newPass1").val() == '' || $("#newPass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  sendAjax('POST', $("#passwordForm").attr("action"), $("#passwordForm").serialize(), true, redirect);
};

// handles delete a tweet request to server
var handleDelete = function handleDelete(e, csrf, tweetId) {
  e.preventDefault();

  var queryString = "_csrf=" + csrf + "&_id=" + tweetId;

  sendAjax('POST', '/delete', queryString, true, function () {
    sendAjax('GET', '/getToken', null, true, function (result) {
      loadTweetsFromServer(result.csrfToken);
    });
  });

  return false;
};

// handles favoriting a tweet to server
var handleFav = function handleFav(csrf, tweetId) {
  // change heart icon image
  var favId = 'fav' + tweetId;
  var favButton = document.getElementById(favId);
  favButton.src = '/assets/img/heart-fill.png';

  var queryString = "_csrf=" + csrf + "&id=" + tweetId;

  if (favButton.dataset.faved === "false") {
    sendAjax('POST', '/favTweet', queryString, true, function () {
      sendAjax('GET', '/getToken', null, true, function (result) {
        loadTweetsFromServer(result.csrfToken);
      });
    });
  }
  favButton.dataset.faved = "true";
};

// handles account searching to server
var handleSearch = function handleSearch(e) {
  e.preventDefault();

  if ($("#searchName").val() == '') {
    handleError('Field is required');
    return false;
  }

  sendAjax('POST', $("#searchAccountsForm").attr("action"), $("#searchAccountsForm").serialize(), true, function (data) {
    sendAjax('GET', '/getToken', null, true, function (result) {
      loadSearchAccount(result.csrfToken, data);
    });
  });
};

// handles follow request between accounts to server
var handleFollow = function handleFollow(e) {
  e.preventDefault();
  sendAjax('POST', $("#followAccountsForm").attr("action"), $("#followAccountsForm").serialize(), true, function () {
    sendAjax('GET', '/getToken', null, true, function (result) {
      loadProfileFromServer(result.csrfToken);
    });
  });
};
//endregion

// - Tweet related-functions - region
// function that creates the tweet form for user
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

// function that creates image input in tweet form
var createImageInput = function createImageInput() {
  var imageField = document.querySelector('#imageField');
  if (imageField.childNodes.length === 0) {
    var input = document.createElement('input');
    input.id = "upload";
    input.type = "file";
    input.name = "photos";
    input.className = "form-control";

    imageField.appendChild(input);
  }
};
//endregion

// - Change password related-functions - region
// function that creates the password change form
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
      React.createElement("input", { id: "oldPass", type: "password", name: "oldPass", placeholder: "old password" }),
      React.createElement(
        "label",
        { htmlFor: "newPass1" },
        "New password:"
      ),
      React.createElement("input", { id: "newPass1", type: "password", name: "newPass1", placeholder: "new password" }),
      React.createElement(
        "label",
        { htmlFor: "newPass2" },
        "Retype password:"
      ),
      React.createElement("input", { id: "newPass2", type: "password", name: "newPass2", placeholder: "retype password" }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "formSubmit", type: "submit", value: "Submit" })
    )
  );
};

// function that renders the password change form into appContent
var createPasswordWindow = function createPasswordWindow(csrf) {
  ReactDOM.render(React.createElement(ChangePasswordWindow, { csrf: csrf }), document.querySelector("#appContent"));
};
//endregion

// - Change tweet related-functions - region
// function that creates the change tweet form
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

// function that renders the change tweet form onto the page
var renderChangeForm = function renderChangeForm(csrf, tweetId, message) {
  var chngId = "chng" + tweetId;

  ReactDOM.render(React.createElement(MakeChangeForm, { csrf: csrf, tweetId: tweetId, message: message }), document.getElementById(chngId));
};
//endregion

// - Delete a tweet related-functions - region
// function that removes the tweet UI options when 'Cancel' button is clicked
var removeDeleteOpts = function removeDeleteOpts(id) {
  // removes the 'Delete | Cancel' div
  var delDivId = "delDiv" + id;
  var delDiv = document.getElementById(delDivId);
  delDiv.parentNode.removeChild(delDiv);

  // removes the options div
  var optDivId = "optDiv" + id;
  var optDiv = document.getElementById(optDivId);
  optDiv.parentNode.removeChild(optDiv);
};

// function that creates the 'Delete | Cancel' divs
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

// function that renders the delete options divs onto the page
var renderDeleteOptions = function renderDeleteOptions(csrf, tweetId) {
  var id = "del" + tweetId;
  ReactDOM.render(React.createElement(MakeDeleteOptions, { csrf: csrf, tweetId: tweetId }), document.getElementById(id));
};
//endregion

// - Options related-functions - region
// function that creates the options divs 
var MakeOptions = function MakeOptions(props) {
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
};

// function that renders the options divs onto the page
var renderOptions = function renderOptions(csrf, tweetId, tweetMessage) {
  var id = "opt" + tweetId;
  var optDiv = "optDiv" + tweetId;

  // allows user to toggle options div when clicking on dropdown icon for a tweet
  if (!document.getElementById(optDiv)) {
    ReactDOM.render(React.createElement(MakeOptions, { csrf: csrf, tweetId: tweetId, tweetMessage: tweetMessage }), document.getElementById(id));
  } else {
    document.getElementById(id).removeChild(document.getElementById(optDiv));

    var delDivId = "delDiv" + tweetId;
    var delDiv = document.getElementById(delDivId);
    if (delDiv) delDiv.parentNode.removeChild(delDiv);
  }
};
//endregion

// - Reply related-functions - region
// function that creates the reply form
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

// function that renders the reply form onto the page
var renderReplyDiv = function renderReplyDiv(csrf, tweetId, replyDivId) {
  ReactDOM.render(React.createElement(MakeReplyForm, { csrf: csrf, tweetId: tweetId }), document.getElementById(replyDivId));
};

// function that creates the replies divs
var MakeReplies = function MakeReplies(props) {
  // if replies does not exist, return an empty div
  if (!props.comments) {
    return React.createElement("div", null);
  }

  // if no replies yet, return a default message
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

  // loop through all replies and map them to their individual divs
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

  // return list of replies
  return React.createElement(
    "div",
    { className: "transparentDiv" },
    replies
  );
};

// function that renders the replies onto the page
var renderReplies = function renderReplies(e, linkId, repliesId) {
  e.preventDefault();

  var repliesDiv = document.getElementById(repliesId);
  var repliesLink = document.getElementById(linkId);

  // toggles show/hide replies when user clicks 'Show/Hide replies' link
  if (repliesLink.innerHTML === "Show replies") {
    repliesLink.innerHTML = "Hide replies";
    repliesDiv.style.display = "block";
  } else {
    repliesLink.innerHTML = "Show replies";
    repliesDiv.style.display = "none";
  }
};
//endregion

// - 'Tweet list' feed related-functions - region
// function that encapsulates all tweets into a 'tweet list' feed
var TweetList = function TweetList(props) {
  var csrf = props.csrf;

  // if no tweets have been posted yet, return a default message
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
    // create necessary unique ids for each tweet component
    var delId = "del" + tweet._id;
    var chngId = "chng" + tweet._id;
    var optId = "opt" + tweet._id;
    var favId = "fav" + tweet._id;
    var replyId = "reply" + tweet._id;
    var replyDivId = "replyDiv" + tweet._id;
    var repliesId = "replies" + tweet._id;
    var repliesLinkId = "repLink" + tweet._id;

    // seperate the date data 
    var date = tweet.createdDate.substr(0, tweet.createdDate.indexOf('T'));
    var time = tweet.createdDate.substr(tweet.createdDate.indexOf('T') + 1);
    time = time.substr(0, time.length - 5);

    // if an image is included in a tweet, store the data in a variable to be used
    var imgSrc = void 0;
    if (tweet.imgData[0]) {
      imgSrc = "/assets/uploads/" + tweet.imgData[0].filename;
    }

    // save the replies to be rendered later onto the page
    var replies = MakeReplies(tweet);

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
        date,
        " \xB7 ",
        time
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
        tweet.favorites.length > 0 && React.createElement(
          "span",
          null,
          " ",
          tweet.favorites.length,
          " "
        ),
        React.createElement(
          "a",
          { href: "#", id: repliesLinkId, className: "viewReplies", onClick: function onClick(e) {
              return renderReplies(e, repliesLinkId, repliesId);
            } },
          "Hide replies"
        )
      ),
      React.createElement("div", { id: replyDivId }),
      React.createElement(
        "div",
        { id: repliesId, className: "replies" },
        replies
      )
    );
  });

  return React.createElement(
    "div",
    { className: "tweetList" },
    tweetNodes
  );
};

// function that encapsulates profile search and profile account info into one div to be rendered to page
var LoadProfile = function LoadProfile(props) {
  return React.createElement(
    "div",
    null,
    React.createElement(
      "form",
      { id: "searchAccountsForm",
        onSubmit: handleSearch,
        name: "searchAccounts",
        action: "/search",
        method: "POST",
        className: "searchAccounts"
      },
      React.createElement("input", { id: "searchName", type: "text", name: "search", placeholder: "Search for a user" }),
      React.createElement("input", { type: "hidden", name: "_csrf", value: props.csrf }),
      React.createElement("input", { className: "searchSubmit", type: "submit", value: "Search" })
    ),
    React.createElement("div", { id: "searchResult" }),
    React.createElement("hr", null),
    React.createElement(
      "h2",
      { id: "displayname" },
      props.displayname
    ),
    React.createElement(
      "h4",
      { id: "profileStats" },
      "Followers: ",
      props.followers.length,
      " | Following: ",
      props.following.length
    )
  );
};

// function that renders the 'tweet list' feed onto the page
var loadTweetsFromServer = function loadTweetsFromServer(csrf) {
  sendAjax('GET', '/getTweets', null, true, function (data) {
    ReactDOM.render(React.createElement(TweetList, { csrf: csrf, displayname: data.displayname, tweets: data.tweets }), document.querySelector("#tweets"));
    checkDarkMode();
  });
};
//endregion

// function that renders content for searched account result
var loadSearchAccount = function loadSearchAccount(csrf, data) {
  sendAjax('GET', '/getTweets', null, true, function () {
    ReactDOM.render(React.createElement(
      "div",
      null,
      React.createElement(
        "form",
        { id: "followAccountsForm",
          onSubmit: handleFollow,
          name: "followAccounts",
          action: "/follow",
          method: "POST",
          className: "followAccounts"
        },
        React.createElement(
          "span",
          null,
          data.user
        ),
        React.createElement("input", { type: "hidden", name: "displayname", value: data.user }),
        React.createElement("input", { type: "hidden", name: "_csrf", value: csrf }),
        React.createElement("input", { className: "followSubmit", type: "submit", value: "Follow" })
      )
    ), document.querySelector("#searchResult"));
  });
};

// function that renders personal account's profile onto the page
var loadProfileFromServer = function loadProfileFromServer(csrf) {
  sendAjax('GET', '/getProfile', null, true, function (data) {
    ReactDOM.render(React.createElement(LoadProfile, { csrf: csrf, displayname: data.displayname, followers: data.followers, following: data.following }), document.querySelector("#profile"));
  });
};

// function that sets up page initially
var setup = function setup(csrf) {
  var changePasswordButton = document.querySelector("#changePassButton");

  toggleDarkMode();

  changePasswordButton.addEventListener("click", function (e) {
    e.preventDefault();
    createPasswordWindow(csrf);
    return false;
  });

  ReactDOM.render(React.createElement(TweetForm, { csrf: csrf }), document.querySelector("#makeTweet"));

  ReactDOM.render(React.createElement(TweetList, { tweets: [], csrf: csrf }), document.querySelector("#tweets"));

  loadTweetsFromServer(csrf);
  loadProfileFromServer(csrf);
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
