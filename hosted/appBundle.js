// Useful References (regarding ReactJS): 
// https://stackoverflow.com/questions/36672007/reactjs-cannot-read-property-keys-of-undefined
// https://stackoverflow.com/questions/38194585/reactjs-browser-cannot-read-property-keys-of-undefined

"use strict";

// sends edit tweet requests to server
const handleEdit = (e, id) => {
  e.preventDefault();
  if ($(`#editTweetMessage${id}`).val() == '') {
    handleError("Message is required");
    return false;
  }
  const editTweetForm = $(`#editTweetForm${id}`);
  sendAjax(editTweetForm.attr("method"), editTweetForm.attr("action"), editTweetForm.serialize(), true, () => {
    removeOptions(id);
    sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
  });
  return false;
};

// sends delete tweet requests to server
const handleDelete = (csrf, id) => {
  const queryString = `_csrf=${csrf}&_id=${id}`;
  sendAjax('POST', '/deleteTweet', queryString, true, () => {
    sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
  });
};

// sends delete reply requests to server
const handleDeleteReply = (csrf, parentTweetId, id) => {
  const queryString = `_csrf=${csrf}&parentTweet_id=${parentTweetId}&_id=${id}`;
  sendAjax('POST', '/deleteReply', queryString, true, () => {
    sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
  });
};

// removes (hides view) of edit/delete options for a tweet when user clicks 'Cancel' button
const removeOptions = id => {
  // WE ARE REALLY JUST TOGGLING THE DISPLAYS RATHER THAN REMOVING ELEMENTS FROM THE DOM 
  // BECAUSE REMOVING/ADDING ELEMENTS CONSTANTLY IS VERY EXPENSIVE

  // removes the initial options container
  const optionsContainerId = `optionsContainer${id}`;
  let optionsContainer = document.getElementById(optionsContainerId);
  optionsContainer.style.display = "none";

  // remove editTweetForm if it exists in the DOM
  const editTweetForm = document.getElementById(`editTweetForm${id}`);
  const tweetMessage = document.getElementById(`tweetMessage${id}`);
  if (editTweetForm) {
    editTweetForm.style.display = "none";
    tweetMessage.style.display = "block";
  }

  // removes the deleteTweet options if it exists in the DOM
  let deleteTweetContainer = document.getElementById(`deleteTweetContainer${id}`);
  if (deleteTweetContainer) deleteTweetContainer.style.display = "none";
};

// Creates the Edit Tweet Form when called
// references: https://legacy.reactjs.org/docs/faq-functions.html
const CreateEditTweetForm = props => {
  return /*#__PURE__*/React.createElement("form", {
    id: `editTweetForm${props.tweetId}`,
    name: `editTweetForm${props.tweetId}`,
    onSubmit: e => handleEdit(e, props.tweetId),
    action: "/editTweet",
    method: "POST"
  }, /*#__PURE__*/React.createElement("input", {
    id: `editTweetMessage${props.tweetId}`,
    className: "editTweetMessage",
    type: "text",
    name: "message",
    placeholder: props.message
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_id",
    value: props.tweetId
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "editTweetFormSubmit",
    type: "submit",
    value: "Tweet"
  }));
};

// Creates the Delete Options 'Delete | Cancel' when called
const CreateDeleteOptions = props => {
  const deleteTweetContainerId = `deleteTweetContainer${props.tweetId}`;
  return /*#__PURE__*/React.createElement("div", {
    id: deleteTweetContainerId,
    className: "deleteTweetContainer"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDelete(props.csrf, props.tweetId)
  }, "Delete"), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeOptions(props.tweetId)
  }, "Cancel"));
};

// REACTJS - renders the Edit Tweet Form to DOM
const renderEditTweetForm = (csrf, id, message) => {
  const editTweetDivId = `editTweetDiv${id}`;
  const editTweetForm = document.getElementById(`editTweetForm${id}`);
  const tweetMessage = document.getElementById(`tweetMessage${id}`);
  if (!editTweetForm) {
    tweetMessage.style.display = "none";
    ReactDOM.render( /*#__PURE__*/React.createElement(CreateEditTweetForm, {
      csrf: csrf,
      tweetId: id,
      message: message
    }), document.getElementById(editTweetDivId));
  }
  // toggle display of editTweetForm if it already exists in DOM
  else {
    editTweetForm.style.display = editTweetForm.style.display === "none" ? "block" : "none";
    tweetMessage.style.display = tweetMessage.style.display === "none" ? "block" : "none";
  }
};

// REACTJS - renders the Delete Options 'Delete | Cancel' to DOM
const renderDeleteOptions = (csrf, id) => {
  const deleteTweetDivId = `deleteTweetDiv${id}`;
  const deleteTweetContainerId = `deleteTweetContainer${id}`;
  const deleteTweetContainer = document.getElementById(deleteTweetContainerId);
  if (!deleteTweetContainer) ReactDOM.render( /*#__PURE__*/React.createElement(CreateDeleteOptions, {
    csrf: csrf,
    tweetId: id
  }), document.getElementById(deleteTweetDivId));
  // toggle display of deleteTweet options if it already exists in DOM
  else deleteTweetContainer.style.display = deleteTweetContainer.style.display === "none" ? "block" : "none";
};

// Creates the Options 'Edit Tweet| Delete Tweet' for modifying a tweet when called
const CreateOptions = props => {
  const optionsContainerId = `optionsContainer${props.tweetId}`;
  const deleteTweetDivId = `deleteTweetDiv${props.tweetId}`;
  return /*#__PURE__*/React.createElement("div", {
    id: optionsContainerId,
    className: "optionsContainer"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => renderEditTweetForm(props.csrf, props.tweetId, props.message)
  }, "Edit Tweet"), /*#__PURE__*/React.createElement("button", {
    onClick: () => renderDeleteOptions(props.csrf, props.tweetId)
  }, "Delete Tweet"), /*#__PURE__*/React.createElement("div", {
    id: deleteTweetDivId
  }));
};

// REACTJS - renders the Options 'Edit Tweet | Delete Tweet' to DOM
const renderOptions = (csrf, id, message) => {
  const optionsDivId = `optionsDiv${id}`;
  const optionsContainerDiv = document.getElementById(`optionsContainer${id}`);
  const tweetMessage = document.getElementById(`tweetMessage${id}`);
  if (!optionsContainerDiv) ReactDOM.render( /*#__PURE__*/React.createElement(CreateOptions, {
    csrf: csrf,
    tweetId: id,
    message: message
  }), document.getElementById(optionsDivId));
  // toggle display of initial options prompt if it already exists in DOM
  else {
    optionsContainerDiv.style.display = optionsContainerDiv.style.display === "none" ? "block" : "none";

    // hide editTweetForm for now, when rendering initial options prompt
    const editTweetForm = document.getElementById(`editTweetForm${id}`);
    if (editTweetForm) {
      editTweetForm.style.display = "none";
      tweetMessage.style.display = "block";
    }

    // hide deleteTweet options for now, when rendering initial options prompt
    const deleteTweetContainer = document.getElementById(`deleteTweetContainer${id}`);
    if (deleteTweetContainer) deleteTweetContainer.style.display = "none";
  }
};

// sends favorite tweet requests to server
const handleFav = (csrf, id) => {
  // change heart icon image
  const favId = `fav${id}`;
  let favButton = document.getElementById(favId);
  favButton.dataset.faved = favButton.dataset.faved == "true" ? "false" : "true";
  if (favButton.dataset.faved == "true") favButton.src = 'assets/img/heart-fill.png';
  const queryString = `_csrf=${csrf}&_id=${id}`;
  sendAjax('POST', '/favTweet', queryString, true, () => {
    sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
  });
};

// sends reply to a tweet requests to server
const handleReply = (e, id) => {
  e.preventDefault();
  if ($(`#replyMessage${id}`).val() == '') {
    handleError("Message is required");
    return false;
  }
  const replyTweetForm = $(`#replyTweetForm${id}`);

  // references: https://stackoverflow.com/questions/21060247/send-formdata-and-string-data-together-through-jquery-ajax
  let formData = new FormData();
  let file_data = $(`#replyFilesInput${id}`)[0].files;

  // reply with no files attached
  if (file_data.length === 0) {
    sendAjax(replyTweetForm.attr('method'), replyTweetForm.attr('action'), replyTweetForm.serialize(), true, () => {
      // reset files input to null and hide reply tweet form
      // references: https://stackoverflow.com/questions/1703228/how-can-i-clear-an-html-file-input-with-javascript
      document.getElementById(`replyFilesInput${id}`).value = null;
      document.getElementById(`replyTweetForm${id}`).style.display = "none"; // hide replyTweetForm on success
      sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
    });
  } else {
    // references: https://stackoverflow.com/questions/96428/how-do-i-split-a-string-breaking-at-a-particular-character
    const [type, ext] = file_data[0].type.split('/');
    const fileFieldname = type === 'video' ? 'video' : 'images';
    const action = type === 'video' ? '/videoReply' : '/imagesReply';
    for (let i = 0; i < file_data.length; i++) formData.append(fileFieldname, file_data[i]);
    let oth_data = replyTweetForm.serializeArray();
    $.each(oth_data, (key, input) => formData.append(input.name, input.value));
    const url = action + "?_csrf=" + formData.get('_csrf');
    sendAjax(replyTweetForm.attr('method'), url, formData, false, () => {
      document.getElementById(`replyFilesInput${id}`).value = null;
      document.getElementById(`replyTweetForm${id}`).style.display = "none"; // hide replyTweetForm on success
      sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
    });
  }
};
const removeDeleteReplyOptions = id => {
  let deleteReplyTweetContainer = document.getElementById(`deleteReplyTweetContainer${id}`);
  if (deleteReplyTweetContainer) deleteReplyTweetContainer.style.display = "none";
};
const CreateDeleteReplyOptions = props => {
  const deleteReplyTweetContainerId = `deleteReplyTweetContainer${props.replyId}`;
  return /*#__PURE__*/React.createElement("div", {
    id: deleteReplyTweetContainerId,
    className: "deleteReplyTweetContainer"
  }, /*#__PURE__*/React.createElement("button", {
    onClick: () => handleDeleteReply(props.csrf, props.parentTweetId, props.replyId)
  }, "Delete"), /*#__PURE__*/React.createElement("button", {
    onClick: () => removeDeleteReplyOptions(props.replyId)
  }, "Cancel"));
};
const renderDeleteReplyOptions = (csrf, parentTweetId, id) => {
  const deleteReplyTweetDivId = `deleteReplyTweetDiv${id}`;
  const deleteReplyTweetContainerId = `deleteReplyTweetContainer${id}`;
  const deleteReplyTweetContainer = document.getElementById(deleteReplyTweetContainerId);
  if (!deleteReplyTweetContainer) ReactDOM.render( /*#__PURE__*/React.createElement(CreateDeleteReplyOptions, {
    csrf: csrf,
    parentTweetId: parentTweetId,
    replyId: id
  }), document.getElementById(deleteReplyTweetDivId));else deleteReplyTweetContainer.style.display = deleteReplyTweetContainer.style.display === "none" ? "block" : "none";
};

// Creates all the replies within a tweet when called
const CreateReplies = (csrf, accountUser, tweet) => {
  // if replies does not exist, return an empty div
  if (!tweet.comments) return /*#__PURE__*/React.createElement("div", null);

  // if no replies, return a default message
  if (tweet.comments.length === 0) return /*#__PURE__*/React.createElement("div", {
    className: "replyDiv"
  }, /*#__PURE__*/React.createElement("h3", null, "No replies"));

  // loop through all replies & map them to their own divs
  const replies = tweet.comments.map(comment => {
    const deleteReplyTweetDivId = `deleteReplyTweetDiv${comment._id}`;
    let filesData;
    if (comment.filesData) filesData = createFilesData(comment.filesData);

    // references: https://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurrence
    return /*#__PURE__*/React.createElement("div", {
      className: "replyDiv"
    }, /*#__PURE__*/React.createElement("span", null, /*#__PURE__*/React.createElement("strong", null, comment.username), ": ", comment.message), accountUser == comment.username && /*#__PURE__*/React.createElement("img", {
      className: "replyDropdownIcon",
      src: "assets/img/dropdown.png",
      alt: "dropdown icon",
      onClick: () => renderDeleteReplyOptions(csrf, tweet._id, comment._id)
    }), /*#__PURE__*/React.createElement("div", {
      id: deleteReplyTweetDivId
    }), filesData && /*#__PURE__*/React.createElement("div", {
      className: "replyFilesDiv"
    }, filesData));
  });

  // return list of replies
  return /*#__PURE__*/React.createElement("div", null, replies);
};

// Creates the replyForm (reply to a tweet) when called
// references: https://legacy.reactjs.org/docs/faq-functions.html
const CreateReplyForm = props => {
  return /*#__PURE__*/React.createElement("form", {
    id: `replyTweetForm${props.tweetId}`,
    name: `replyTweetForm${props.tweetId}`,
    onSubmit: e => handleReply(e, props.tweetId),
    action: "/reply",
    method: "POST"
  }, /*#__PURE__*/React.createElement("input", {
    id: `replyMessage${props.tweetId}`,
    className: "replyMessage",
    type: "text",
    name: "message",
    placeholder: "reply here"
  }), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("img", {
    id: `replyUploadFiles${props.tweetId}`,
    className: "replyUploadFiles",
    src: props.replyUploadFilesSrc,
    alt: "upload files button"
  }), /*#__PURE__*/React.createElement("input", {
    id: `replyFilesInput${props.tweetId}`,
    className: "replyFilesInput",
    type: "file",
    name: "files",
    multiple: true
  })), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_id",
    value: props.tweetId
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "replyTweetFormSubmit",
    type: "submit",
    value: "Reply"
  }));
};

// REACTJS - renders the replyForm to DOM
const renderReplyFormDiv = (csrf, id, replyFormDivId) => {
  let form = document.getElementById(`replyTweetForm${id}`);
  if (!form) {
    let src = document.getElementById("darkModeCheckbox").checked ? 'assets/img/upload_dm.png' : 'assets/img/upload.png';
    ReactDOM.render( /*#__PURE__*/React.createElement(CreateReplyForm, {
      csrf: csrf,
      tweetId: id,
      replyUploadFilesSrc: src
    }), document.getElementById(replyFormDivId));
  }
  // toggle display of replyTweetForm if it already exists in DOM
  else form.style.display = form.style.display === "none" ? "block" : "none";
};

// REACTJS - renders all the replies of a tweet to DOM
const renderReplies = (e, repliesLinkId, repliesDivId) => {
  e.preventDefault();
  let repliesLinkDiv = document.getElementById(repliesLinkId);
  let repliesDiv = document.getElementById(repliesDivId);

  // toggle show/hide replies when user clicks 'Show/Hide replies' link
  if (repliesLinkDiv.innerHTML === "Show replies") {
    repliesLinkDiv.innerHTML = "Hide replies";
    repliesDiv.style.display = "block";
  } else {
    repliesLinkDiv.innerHTML = "Show replies";
    repliesDiv.style.display = "none";
  }
};

// sends account follow requests to server
const handleFollow = e => {
  e.preventDefault();
  const followAccountForm = $("#followAccountForm");
  sendAjax(followAccountForm.attr('method'), followAccountForm.attr('action'), followAccountForm.serialize(), true, () => {
    sendAjax('GET', '/getToken', null, true, obj => renderProfileFromServer(obj.csrfToken));
  });
  return false;
};

// Creates Search for Account Form when called
const CreateSearchAccount = props => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", {
    id: "followAccountForm",
    name: "followAccountForm",
    onSubmit: handleFollow,
    action: "/follow",
    method: "POST"
  }, /*#__PURE__*/React.createElement("span", null, props.username), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "username",
    value: props.username
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Follow"
  })));
};

// REACTJS - renders searched account profile and their tweets to DOM
const renderSearchResult = (csrf, accountUser, username, tweets) => {
  let src = document.getElementById("darkModeCheckbox").checked ? 'assets/img/heart_dm.png' : 'assets/img/heart.png';
  ReactDOM.render( /*#__PURE__*/React.createElement(CreateSearchAccount, {
    csrf: csrf,
    username: username
  }), document.querySelector("#searchResult"));
  ReactDOM.render( /*#__PURE__*/React.createElement(CreateTweetsList, {
    csrf: csrf,
    accountUser: accountUser,
    tweets: tweets,
    favSrc: src
  }), document.querySelector("#tweets"));
  checkDarkMode();
};

// sends search for account requests to server
const handleSearch = e => {
  e.preventDefault();
  if ($("#searchName").val() == '') {
    handleError('Field is required');
    return false;
  }
  const searchAccountForm = $("#searchAccountForm");
  sendAjax(searchAccountForm.attr('method'), searchAccountForm.attr('action'), searchAccountForm.serialize(), true, data => {
    sendAjax('GET', '/getToken', null, true, obj => renderSearchResult(obj.csrfToken, data.accountUser, data.username, data.tweets));
  });
  return false;
};

// Creates User Profile info & Search for account form when called
const CreateMyProfile = props => {
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", {
    id: "searchAccountForm",
    name: "searchAccountForm",
    onSubmit: handleSearch,
    action: "/searchAccount",
    method: "POST"
  }, /*#__PURE__*/React.createElement("input", {
    id: "searchUsername",
    type: "text",
    name: "username",
    placeholder: "search for a user"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Search"
  })), /*#__PURE__*/React.createElement("div", {
    id: "searchResult"
  }), /*#__PURE__*/React.createElement("hr", null), /*#__PURE__*/React.createElement("h2", {
    id: "username"
  }, props.username), /*#__PURE__*/React.createElement("h4", {
    id: "profileStats"
  }, "Following: ", props.following.length, " | Followers: ", props.followers.length));
};

// REACTJS - renders user profile info & search account form to DOM
const renderProfileFromServer = csrf => {
  sendAjax('GET', '/getProfile', null, true, data => {
    ReactDOM.render( /*#__PURE__*/React.createElement(CreateMyProfile, {
      csrf: csrf,
      username: data.username,
      followers: data.followers,
      following: data.following
    }), document.querySelector("#profile"));
  });
};

// Creates File Data elements for each file (image/etc.) attached to a tweet
const createFilesData = filesData => {
  let width = filesData.length > 1 ? `${40}%` : `${80}%`;
  const files = filesData.map(f => {
    if (f.fieldname === 'images') {
      return /*#__PURE__*/React.createElement("img", {
        className: "images",
        src: `assets/uploads/${f.filename}`,
        width: width
      });
    } else if (f.fieldname === 'video') {
      return /*#__PURE__*/React.createElement("video", {
        className: "video",
        width: "80%",
        controls: true
      }, /*#__PURE__*/React.createElement("source", {
        src: `assets/uploads/${f.filename}`,
        type: f.mimetype
      }));
    }
  });
  return /*#__PURE__*/React.createElement("div", null, files);
};

// Creates list of tweets when called
const CreateTweetsList = props => {
  const csrf = props.csrf;

  // if no tweets have been posted yet, return a default message
  if (props.tweets.length === 0) {
    return /*#__PURE__*/React.createElement("div", {
      className: "tweetsList"
    }, /*#__PURE__*/React.createElement("h3", {
      className: "emptyTweet"
    }, "No Tweets yet"));
  }
  const tweetNodes = props.tweets.map(tweet => {
    // create unique id for each tweet component
    const tweetMessageId = `tweetMessage${tweet._id}`;
    const replyId = `reply${tweet._id}`;
    const repliesLinkId = `repliesLink${tweet._id}`;
    const replyFormDivId = `replyDiv${tweet._id}`;
    const repliesDivId = `replies${tweet._id}`;
    const optionsDivId = `optionsDiv${tweet._id}`;
    const editTweetDivId = `editTweetDiv${tweet._id}`;
    const favId = `fav${tweet._id}`;

    // seperate the date data 
    const date = tweet.createdDate.substr(0, tweet.createdDate.indexOf('T'));
    let time = tweet.createdDate.substr(tweet.createdDate.indexOf('T') + 1);
    time = time.substr(0, time.length - 5);

    // save the replies to be rendered later onto the page
    const replies = CreateReplies(csrf, props.accountUser, tweet);

    // display appropriate favIcon
    let favIconSrc = props.favIconSrc;
    let dataFaved = "false";
    if (props.accountUser) {
      for (const f of tweet.favorites) {
        if (f === props.accountUser) {
          favIconSrc = "assets/img/heart-fill.png";
          dataFaved = "true";
        }
      }
    }

    // only call CreateFilesData() helper function if a tweet has filesData attached
    // only render to DOM if filesData has data (!undefined)
    let filesData;
    if (tweet.filesData.length > 0) filesData = createFilesData(tweet.filesData);
    return /*#__PURE__*/React.createElement("div", {
      key: tweet._id,
      className: "tweet"
    }, props.accountUser == tweet.username && /*#__PURE__*/React.createElement("img", {
      className: "dropdownIcon",
      src: "assets/img/dropdown.png",
      alt: "dropdown icon",
      onClick: () => renderOptions(csrf, tweet._id, tweet.message)
    }), /*#__PURE__*/React.createElement("div", {
      id: optionsDivId
    }), /*#__PURE__*/React.createElement("h4", {
      className: "tweetUsername"
    }, tweet.username, " | ", date, " \xB7 ", time), /*#__PURE__*/React.createElement("p", {
      id: tweetMessageId,
      className: "tweetMessage"
    }, tweet.message), /*#__PURE__*/React.createElement("span", {
      id: editTweetDivId
    }), filesData && /*#__PURE__*/React.createElement("div", {
      id: "tweetFilesDiv"
    }, filesData), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("img", {
      id: replyId,
      className: "replyButton",
      src: "assets/img/reply.png",
      alt: "reply button",
      onClick: () => renderReplyFormDiv(csrf, tweet._id, replyFormDivId)
    }), /*#__PURE__*/React.createElement("img", {
      id: favId,
      className: "favButton",
      src: favIconSrc,
      alt: "favorite tweet",
      "data-faved": dataFaved,
      onClick: () => handleFav(csrf, tweet._id)
    }), tweet.favorites.length > 0 && /*#__PURE__*/React.createElement("span", {
      className: "tweetFavoritesCount"
    }, tweet.favorites.length), /*#__PURE__*/React.createElement("a", {
      href: "#",
      id: repliesLinkId,
      className: "viewReplies",
      onClick: e => renderReplies(e, repliesLinkId, repliesDivId)
    }, "Hide replies")), /*#__PURE__*/React.createElement("div", {
      id: replyFormDivId
    }), /*#__PURE__*/React.createElement("div", {
      id: repliesDivId,
      className: "replies"
    }, replies));
  });
  return /*#__PURE__*/React.createElement("div", {
    className: "tweetsList"
  }, tweetNodes);
};

// REACTJS - renders list of tweets to DOM
const renderTweetsFromServer = csrf => {
  let src = document.getElementById("darkModeCheckbox").checked ? 'assets/img/heart_dm.png' : 'assets/img/heart.png';
  sendAjax('GET', '/getTweets', null, true, data => {
    ReactDOM.render( /*#__PURE__*/React.createElement(CreateTweetsList, {
      csrf: csrf,
      accountUser: data.accountUser,
      tweets: data.tweets,
      favIconSrc: src
    }), document.querySelector("#tweets"));
    checkDarkMode();
  });
};

// sends new tweet requests to server
const handleTweet = e => {
  e.preventDefault();
  if ($("#messageField").val() == '') {
    handleError("Message is required");
    return false;
  }
  const tweetForm = $("#tweetForm");

  // references: https://stackoverflow.com/questions/21060247/send-formdata-and-string-data-together-through-jquery-ajax
  let formData = new FormData();
  let file_data = $("#filesInput")[0].files;

  // tweet with no files attached
  if (file_data.length === 0) {
    sendAjax(tweetForm.attr('method'), tweetForm.attr('action'), tweetForm.serialize(), true, () => {
      // reset tweet placeholder & value back to default
      let messageField = document.getElementById("messageField");
      messageField.value = '';
      messageField.placeholder = "What's happening?";
      sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
    });
  } else {
    // references: https://stackoverflow.com/questions/96428/how-do-i-split-a-string-breaking-at-a-particular-character
    const [type, ext] = file_data[0].type.split('/');
    const fileFieldname = type === 'video' ? 'video' : 'images';
    const action = type === 'video' ? '/videoTweet' : '/imagesTweet';
    for (let i = 0; i < file_data.length; i++) formData.append(fileFieldname, file_data[i]); // 'images' nameField here must match nameField used 
    //  on multer() middleware on server-side

    let oth_data = tweetForm.serializeArray();
    $.each(oth_data, (key, input) => formData.append(input.name, input.value));

    // we need to append our csrf token to our url because of the way we are sending our formData,
    // which also leads us to setting 'processData: false' in our call to sendAjax()
    const url = action + "?_csrf=" + formData.get('_csrf');
    sendAjax(tweetForm.attr('method'), url, formData, false, () => {
      // reset tweet placeholder & value back to default
      let messageField = document.getElementById("messageField");
      messageField.value = '';
      messageField.placeholder = "What's happening?";
      sendAjax('GET', '/getToken', null, true, obj => renderTweetsFromServer(obj.csrfToken));
    });
  }
  return false;
};

// Creates new tweet form when called
const CreateTweetForm = props => {
  // references: https://stackoverflow.com/questions/2855589/replace-input-type-file-by-an-image
  // references: https://stackoverflow.com/questions/8669579/multiple-files-select-and-upload
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("form", {
    id: "tweetForm",
    name: "tweetForm",
    onSubmit: handleTweet,
    action: "/tweet",
    method: "POST",
    enctype: "multipart/form-data"
  }, /*#__PURE__*/React.createElement("input", {
    id: "messageField",
    name: "message",
    type: "text",
    placeholder: "What's happening?"
  }), /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("label", null, /*#__PURE__*/React.createElement("img", {
    id: "uploadFiles",
    className: "uploadFiles",
    src: "assets/img/upload.png",
    alt: "upload files button"
  }), /*#__PURE__*/React.createElement("input", {
    id: "filesInput",
    className: "filesInput",
    type: "file",
    name: "files",
    multiple: true
  })), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "tweetFormSubmit",
    type: "submit",
    value: "Tweet"
  })));
};

// sends change password requests to server
const handlePassword = e => {
  e.preventDefault();
  if ($("#oldPassField").val() == '' || $("#newPass1Field").val() == '' || $("#newPass2Field").val() == '') {
    handleError("All fields are required");
    return false;
  }
  if ($("#newPass1Field").val() !== $("#newPass2Field").val()) {
    handleError("New passwords do not match");
    return false;
  }
  const passwordForm = $("#passwordForm");
  sendAjax(passwordForm.attr("method"), passwordForm.attr("action"), passwordForm.serialize(), true, redirect);
};

// Creates Change Password window when called
const CreateChangePasswordWindow = props => {
  return /*#__PURE__*/React.createElement("div", {
    id: "passwordDiv"
  }, /*#__PURE__*/React.createElement("form", {
    id: "passwordForm",
    name: "passwordForm",
    onSubmit: handlePassword,
    action: "/changePassword",
    method: "POST"
  }, /*#__PURE__*/React.createElement("h1", null, "Change Password"), /*#__PURE__*/React.createElement("label", {
    htmlFor: "oldPass"
  }, "Old password: "), /*#__PURE__*/React.createElement("input", {
    id: "oldPassField",
    type: "password",
    name: "oldPass",
    placeholder: "old password"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "newPass1"
  }, "New password:"), /*#__PURE__*/React.createElement("input", {
    id: "newPass1Field",
    type: "password",
    name: "newPass1",
    placeholder: "new password"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "newPass2"
  }, "Retype password:"), /*#__PURE__*/React.createElement("input", {
    id: "newPass2Field",
    type: "password",
    name: "newPass2",
    placeholder: "retype password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Submit"
  })));
};

// REACTJS - renders change password window to DOM
const renderChangePasswordWindow = csrf => {
  ReactDOM.render( /*#__PURE__*/React.createElement(CreateChangePasswordWindow, {
    csrf: csrf
  }), document.querySelector("#content"));

  // depending on checkbox status, apply appropriate styles to password form after rendering to DOM
  let checkbox = document.querySelector("#darkModeCheckbox");
  let passwordDiv = document.querySelector("#passwordDiv");
  passwordDiv.style.backgroundColor = checkbox.checked ? "rgb(27,40,54)" : "rgb(245, 248, 250)";
};

// initial setup for page
const setup = csrf => {
  const changePasswordButton = document.querySelector("#changePasswordButton");
  changePasswordButton.addEventListener('click', e => {
    e.preventDefault();
    renderChangePasswordWindow(csrf);
    $("#errorMessage").text('');
    return false;
  });
  let src = document.getElementById("darkModeCheckbox").checked ? 'assets/img/heart_dm.png' : 'assets/img/heart.png';
  ReactDOM.render( /*#__PURE__*/React.createElement(CreateTweetForm, {
    csrf: csrf
  }), document.querySelector("#createTweet"));
  ReactDOM.render( /*#__PURE__*/React.createElement(CreateTweetsList, {
    tweets: [],
    csrf: csrf,
    favIconSrc: src
  }), document.querySelector("#tweets"));
  renderProfileFromServer(csrf);
  renderTweetsFromServer(csrf);
  toggleDarkMode();
};

// grabs csrfToken from server for client-side to send requests
const init = () => {
  sendAjax('GET', '/getToken', null, true, obj => {
    setup(obj.csrfToken);
  });
};
$(document).ready(init);

// toggles on/off dark/light mode view
const toggleDarkMode = () => {
  let checkbox = document.querySelector("#darkModeCheckbox");
  let body = document.body;
  let nav = document.querySelector("#nav");
  let tweetsSection = document.querySelector("#tweetsSection");
  let createTweet = document.querySelector("#createTweet");
  let tweets = document.getElementsByClassName('tweet');
  let emptyTweet = document.getElementsByClassName('emptyTweet');
  let replies = document.getElementsByClassName('replyDiv');
  let profile = document.querySelector("#profile");
  let viewReplies = document.getElementsByClassName('viewReplies');
  let dropdownIcons = document.getElementsByClassName('dropdownIcon');
  let replyButtons = document.getElementsByClassName('replyButton');
  let uploadFiles = document.querySelector('#uploadFiles');
  let replyUploadFiles = document.getElementsByClassName('replyUploadFiles');
  let favButtons = document.getElementsByClassName('favButton');
  let replyDropdownIcons = document.getElementsByClassName('replyDropdownIcon');
  checkbox.addEventListener('change', () => {
    // need to instantiate passwordDiv variable on every click event because passwordDiv may not exist in DOM at first,
    // unlike the other variables above (which will be have valid values saved when main app page is loaded)
    let passwordDiv = document.querySelector("#passwordDiv");

    // dark mode active
    if (checkbox.checked) {
      body.style.backgroundColor = "rgb(20,29,38)";
      body.style.color = "white";
      nav.style.backgroundColor = "rgb(36,52,71)";
      if (passwordDiv) passwordDiv.style.backgroundColor = "rgb(27,40,54)";
      if (tweetsSection) tweetsSection.style.backgroundColor = "rgb(36,52,71)";
      if (createTweet) createTweet.style.backgroundColor = "rgb(27,52, 72)";
      if (profile) profile.style.backgroundColor = "rgb(36,52,71)";
      if (viewReplies) for (const vR of viewReplies) vR.style.color = "white";
      if (emptyTweet) for (const eT of emptyTweet) eT.style.backgroundColor = "rgb(36,52,71)";
      if (tweets) for (const t of tweets) t.style.backgroundColor = "rgb(36,52,71)";
      if (replies) for (const r of replies) r.style.backgroundColor = "rgb(27,40,54)";
      if (dropdownIcons) for (const d of dropdownIcons) d.src = "assets/img/dropdown_dm.png";
      if (replyDropdownIcons) for (const r of replyDropdownIcons) r.src = "assets/img/dropdown_dm.png";
      if (replyButtons) for (const r of replyButtons) r.src = 'assets/img/reply_dm.png';
      if (uploadFiles) uploadFiles.src = 'assets/img/upload_dm.png';
      if (replyUploadFiles) for (const rup of replyUploadFiles) rup.src = 'assets/img/upload_dm.png';
      if (favButtons) for (const f of favButtons) f.src = f.dataset.faved == "true" ? "assets/img/heart-fill.png" : "assets/img/heart_dm.png";
    }
    // light mode active
    else {
      body.style.backgroundColor = "rgb(230, 236, 240)";
      body.style.color = "black";
      nav.style.backgroundColor = "rgb(245, 248, 250)";
      if (passwordDiv) passwordDiv.style.backgroundColor = "rgb(245, 248, 250)";
      if (tweetsSection) tweetsSection.style.backgroundColor = "rgb(245, 248, 250)";
      if (createTweet) createTweet.style.backgroundColor = "rgb(232, 245, 253)";
      if (profile) profile.style.backgroundColor = "white";
      if (viewReplies) for (const vR of viewReplies) vR.style.color = "black";
      if (emptyTweet) for (const eT of emptyTweet) eT.style.backgroundColor = "rgb(217, 235, 253)";
      if (tweets) for (const t of tweets) t.style.backgroundColor = "white";
      if (replies) for (const r of replies) r.style.backgroundColor = "rgb(217, 235, 253)";
      if (dropdownIcons) for (const d of dropdownIcons) d.src = "assets/img/dropdown.png";
      if (replyDropdownIcons) for (const r of replyDropdownIcons) r.src = "assets/img/dropdown.png";
      if (replyButtons) for (const r of replyButtons) r.src = 'assets/img/reply.png';
      if (uploadFiles) uploadFiles.src = 'assets/img/upload.png';
      if (replyUploadFiles) for (const rup of replyUploadFiles) rup.src = 'assets/img/upload.png';
      if (favButtons) for (const f of favButtons) f.src = f.dataset.faved == "true" ? "assets/img/heart-fill.png" : "assets/img/heart.png";
    }
  });
};

// re-renders content depending on dark/light mode view
const checkDarkMode = () => {
  let checkbox = document.querySelector("#darkModeCheckbox");
  let emptyTweet = document.getElementsByClassName('emptyTweet');
  let tweets = document.getElementsByClassName('tweet');
  let replies = document.getElementsByClassName('replyDiv');
  let viewReplies = document.getElementsByClassName('viewReplies');
  let tweetsSection = document.querySelector("#tweetsSection");
  let dropdownIcons = document.getElementsByClassName('dropdownIcon');
  let favButtons = document.getElementsByClassName('favButton');
  let replyButtons = document.getElementsByClassName('replyButton');
  let uploadFiles = document.querySelector('#uploadFiles');
  let replyUploadFiles = document.getElementsByClassName('replyUploadFiles');
  let replyDropdownIcons = document.getElementsByClassName('replyDropdownIcon');

  // dark mode active
  if (checkbox.checked) {
    if (tweetsSection) tweetsSection.style.backgroundColor = "rgb(36,52,71)";
    if (emptyTweet) for (const eT of emptyTweet) eT.style.backgroundColor = "rgb(36,52,71)";
    if (tweets) for (const t of tweets) t.style.backgroundColor = "rgb(36,52,71)";
    if (viewReplies) for (const vR of viewReplies) vR.style.color = "white";
    if (replies) for (const r of replies) r.style.backgroundColor = "rgb(27,40,54)";
    if (dropdownIcons) for (const d of dropdownIcons) d.src = "assets/img/dropdown_dm.png";
    if (replyButtons) for (const r of replyButtons) r.src = 'assets/img/reply_dm.png';
    if (replyDropdownIcons) for (const r of replyDropdownIcons) r.src = "assets/img/dropdown_dm.png";
    if (uploadFiles) uploadFiles.src = 'assets/img/upload_dm.png';
    if (replyUploadFiles) for (const rup of replyUploadFiles) rup.src = 'assets/img/upload_dm.png';
    if (favButtons) for (const f of favButtons) f.src = f.dataset.faved == "true" ? "assets/img/heart-fill.png" : "assets/img/heart_dm.png";
  }
  // light mode active
  else {
    if (tweetsSection) tweetsSection.style.backgroundColor = "rgb(245, 248, 250)";
    if (emptyTweet) for (const eT of emptyTweet) eT.style.backgroundColor = "rgb(217, 235, 253)";
    if (tweets) for (const t of tweets) t.style.backgroundColor = "white";
    if (viewReplies) for (const vR of viewReplies) vR.style.color = "black";
    if (replies) for (const r of replies) r.style.backgroundColor = "rgb(217, 235, 253)";
    if (dropdownIcons) for (const d of dropdownIcons) d.src = "assets/img/dropdown.png";
    if (replyDropdownIcons) for (const r of replyDropdownIcons) r.src = "assets/img/dropdown.png";
    if (replyButtons) for (const r of replyButtons) r.src = 'assets/img/reply.png';
    if (uploadFiles) uploadFiles.src = 'assets/img/upload.png';
    if (replyUploadFiles) for (const rup of replyUploadFiles) rup.src = 'assets/img/upload.png';
    if (favButtons) for (const f of favButtons) f.src = f.dataset.faved == "true" ? "assets/img/heart-fill.png" : "assets/img/heart.png";
  }
};
// sends AJAX requests to server and redirects responses accordingly
const sendAjax = (type, action, data, processBool, success) => {
  let contentType = !processBool ? false : 'application/x-www-form-urlencoded; charset=UTF-8';
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: 'json',
    processData: processBool,
    contentType: contentType,
    success: success,
    error: xhr => handleError(xhr.responseJSON.error)
  });
};

// handles error responses from server
const handleError = message => $("#errorMessage").text(message);

// redirects the user to pages (window.location)
const redirect = res => window.location = res.redirect;
