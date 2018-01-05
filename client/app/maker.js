// - Handling requests to server - region
// handles user tweet to server
const handleTweet = (e) => {
  e.preventDefault();
  
  if($("#tweetMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  // source: https://stackoverflow.com/questions/21060247/send-formdata-and-string-data-together-through-jquery-ajax
  let formData = new FormData();
  if($("#upload")[0]){
    let file_data = $("#upload")[0].files;
    for(let i = 0; i < file_data.length; i++) {
      formData.append('photos', file_data[i]);
    } 
  }
  let oth_data = $("#tweetForm").serializeArray();
  $.each(oth_data, (key, input) => {
    formData.append(input.name, input.value);
  });
  
  let url = $("#tweetForm").attr("action") + "?_csrf=" + formData.get('_csrf');
  
  sendAjax('POST', url, formData, false, () => {
    sendAjax('GET', '/getToken', null, true, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  // remove image input field if it exists
  let imageInput = document.querySelector("#upload");
  if(imageInput) imageInput.parentNode.removeChild(imageInput);
  
  // change tweet placeholder text back to default
  let tweetMsg = document.querySelector("#tweetMessage");
  tweetMsg.placeholder = "What's happening?";
  tweetMsg.value = '';
  
  return false;
};

// handles user changed tweet to server
const handleChange = (e) => {
  e.preventDefault();
  
  if($("#changeTweetMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  sendAjax('POST', $("#changeTweetForm").attr("action"), $("#changeTweetForm").serialize(), true, () => {
    sendAjax('GET', '/getToken', null, true, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  // remove option div on change tweet submit
  let optDivId = "optDiv" + $("#changeTweetForm").attr('data-ref');
  let optDiv = document.getElementById(optDivId);
  if(optDiv) optDiv.parentNode.removeChild(optDiv);
  
  return false;
};

// handles user replies to a tweet to server
const handleReply = (e) => {
  e.preventDefault();
  
  if($("#replyMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  sendAjax('POST', $("#replyTweetForm").attr("action"), $("#replyTweetForm").serialize(), true, () => {
    sendAjax('GET', '/getToken', null, true, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  // remove reply form on submit
  let replyForm = document.querySelector("#replyTweetForm");
  replyForm.parentNode.removeChild(replyForm);
};

// handles password change to server
const handlePassword = (e) => {
  e.preventDefault();
  
  if($("#oldPass").val() == '' || $("#newPass1").val() == '' || $("#newPass2").val() == ''){
    handleError("All fields are required");
    return false;
  }
  
  sendAjax('POST', $("#passwordForm").attr("action"), $("#passwordForm").serialize(), true, redirect);
};

// handles delete a tweet request to server
const handleDelete = (e, csrf, tweetId) => {
  e.preventDefault();
  
  let queryString = `_csrf=${csrf}&_id=${tweetId}`;
  
  sendAjax('POST', '/delete', queryString, true, () => {
    sendAjax('GET', '/getToken', null, true, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  return false;
};

// handles favoriting a tweet to server
const handleFav = (csrf, tweetId) => {  
  // change heart icon image
  let favId = 'fav' + tweetId;
  let favButton = document.getElementById(favId);
  favButton.src = '/assets/img/heart-fill.png';
  
  let queryString = `_csrf=${csrf}&id=${tweetId}`;

  if(favButton.dataset.faved === "false"){
    sendAjax('POST', '/favTweet', queryString, true, () => {
      sendAjax('GET', '/getToken', null, true, (result) => {
        loadTweetsFromServer(result.csrfToken);
      });
    }); 
  } 
  favButton.dataset.faved = "true";
};

// handles account searching to server
const handleSearch = (e) => {
  e.preventDefault();
  
  
  if($("#searchName").val() == ''){
    handleError('Field is required');
    return false;
  }
  
  sendAjax('POST', $("#searchAccountsForm").attr("action"), $("#searchAccountsForm").serialize(), true, (data) => {
    sendAjax('GET', '/getToken', null, true, (result) => {
      loadSearchAccount(result.csrfToken, data);
    });
  });
};

// handles follow request between accounts to server
const handleFollow = (e) => {
  e.preventDefault();
  sendAjax('POST', $("#followAccountsForm").attr("action"), $("#followAccountsForm").serialize(), true, () => {
    sendAjax('GET', '/getToken', null, true, (result) => {
      loadProfileFromServer(result.csrfToken);
    });
  });
};
//endregion

// - Tweet related-functions - region
// function that creates the tweet form for user
const TweetForm = (props) => {
  return(
    <div id="tweetFormDiv">
      <form id="tweetForm"
        onSubmit={handleTweet}
        name="tweetForm"
        action="/maker"
        method="POST"
        className="tweetForm"
        enctype="multipart/form-data"
      >
        <input id="tweetMessage" type="text" name="message" placeholder="What's happening?"/>
        <input type="hidden" name="_csrf" value={props.csrf} />
        <input className="makeTweetSubmit" type="submit" value="Tweet"/>
        <div id="imageField"></div>
      </form>
      <img id="uploadImage" src="/assets/img/upload.png" width="25" height="25" alt="upload image" onClick={createImageInput}/>
    </div>
  );
};

// function that creates image input in tweet form
const createImageInput = () => {
  let imageField = document.querySelector('#imageField');
  if(imageField.childNodes.length === 0){
    let input = document.createElement('input');
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
const ChangePasswordWindow = (props) => {
  return(
    <div id="passwordDiv">
      <form id="passwordForm"
        name="passwordForm"
        onSubmit={handlePassword}
        action="/passChange"
        method="POST"
        className="mainForm"
      >
        <h1>Tweeter</h1>
        <label htmlFor="oldPass">Old password: </label>
        <input id="oldPass" type="password" name="oldPass" placeholder="old password"></input>
        <label htmlFor="newPass1">New password:</label>
        <input id="newPass1" type="password" name="newPass1" placeholder="new password"></input>
        <label htmlFor="newPass2">Retype password:</label>
        <input id="newPass2" type="password" name="newPass2" placeholder="retype password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Submit"/>
      </form>
    </div>
  );
};

// function that renders the password change form into appContent
const createPasswordWindow = (csrf) => {
  let profile = document.querySelector("#profile");
  profile.style.display = "none";
  
  ReactDOM.render(
    <ChangePasswordWindow csrf={csrf} />, document.querySelector("#appContent")
  );
};
//endregion

// - Change tweet related-functions - region
// function that creates the change tweet form
const MakeChangeForm = (props) => {
  return(
    <form id="changeTweetForm"
      onSubmit={handleChange}
      name="changeTweetForm"
      action="/change"
      method="POST"
      className="changeForm"
      data-ref={props.tweetId}
    >
      <input id="changeTweetMessage" type="text" name="message" placeholder={props.message}/>
      <input type="hidden" name="_id" value={props.tweetId}/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="changeTweetSubmit" type="submit" value="Tweet"/>
    </form>
  );
};

// function that renders the change tweet form onto the page
const renderChangeForm = (csrf, tweetId, message) => {
  let chngId = "chng" + tweetId;
   
  ReactDOM.render(
    <MakeChangeForm csrf={csrf} tweetId={tweetId} message={message} />, document.getElementById(chngId)
  );
};
//endregion

// - Delete a tweet related-functions - region
// function that removes the tweet UI options when 'Cancel' button is clicked
const removeDeleteOpts = (id) => {
  // removes the 'Delete | Cancel' div
  let delDivId = "delDiv" + id;
  let delDiv = document.getElementById(delDivId);
  delDiv.parentNode.removeChild(delDiv);
  
  // removes the options div
  let optDivId = "optDiv" + id;
  let optDiv = document.getElementById(optDivId);
  optDiv.parentNode.removeChild(optDiv);
};

// function that creates the 'Delete | Cancel' divs
const MakeDeleteOptions = (props) => {
  let delDivId = "delDiv" + props.tweetId;
  return(
    <div id={delDivId} className="delDiv">
      <div className="delYes" onClick={ (e) => handleDelete(e, props.csrf, props.tweetId)}>Delete</div>
      <div className="delNo" onClick={(e) => removeDeleteOpts(props.tweetId)}>Cancel</div>
    </div>
  );
}

// function that renders the delete options divs onto the page
const renderDeleteOptions = (csrf, tweetId) => {
  let id = "del" + tweetId;
  ReactDOM.render(
    <MakeDeleteOptions csrf={csrf} tweetId={tweetId} />, document.getElementById(id)
  );
};
//endregion

// - Options related-functions - region
// function that creates the options divs 
const MakeOptions = (props) => {
    let optDivId = "optDiv" + props.tweetId;
    return(
      <div id={optDivId} className="optDiv">
        <div className="changeTweet" onClick={() => renderChangeForm(props.csrf, props.tweetId, props.tweetMessage)}>Edit Tweet</div>
        <hr/>
        <div className="deleteTweet" onClick={() => renderDeleteOptions(props.csrf, props.tweetId)}>Delete Tweet</div>
      </div>
    );
};

// function that renders the options divs onto the page
const renderOptions = (csrf, tweetId, tweetMessage) => {
  let id = "opt" + tweetId;
  let optDiv = "optDiv" + tweetId;
  
  // allows user to toggle options div when clicking on dropdown icon for a tweet
  if(!document.getElementById(optDiv)){
    ReactDOM.render(
      <MakeOptions csrf={csrf} tweetId={tweetId} tweetMessage={tweetMessage} />, document.getElementById(id)
    );
  } else {
    document.getElementById(id).removeChild(document.getElementById(optDiv));
    
    let delDivId = "delDiv" + tweetId;
    let delDiv = document.getElementById(delDivId);
    if(delDiv) delDiv.parentNode.removeChild(delDiv);
  }
};
//endregion

// - Reply related-functions - region
// function that creates the reply form
const MakeReplyForm = (props) => {
  return(
    <form id="replyTweetForm"
      onSubmit={handleReply}
      name="replyTweetForm"
      action="/reply"
      method="POST"
      className="replyForm"
      data-ref={props.tweetId}
    >
      <input id="replyMessage" type="text" name="message" placeholder="Reply here"/>
      <input type="hidden" name="_id" value={props.tweetId}/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="replyTweetSubmit" type="submit" value="Reply"/>
    </form>
  );
};

// function that renders the reply form onto the page
const renderReplyDiv = (csrf, tweetId, replyDivId) => {
  ReactDOM.render(
    <MakeReplyForm csrf={csrf} tweetId={tweetId} />, document.getElementById(replyDivId)
  );
};

// function that creates the replies divs
const MakeReplies = (props) => {
  // if replies does not exist, return an empty div
  if(!props.comments){
    return(
      <div></div>
    );
  }
  
  // if no replies yet, return a default message
  if(props.comments.length === 0){
    return(
      <div className="replyDiv">
        <h3>No replies</h3>
      </div>
    );
  }
  
  // loop through all replies and map them to their individual divs
  const replies = props.comments.map((comment) => {
    // source: https://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurrence
    return(
      <div className="replyDiv">
        <h4>{comment.substr(0,comment.indexOf(';'))}</h4>
        <p>{comment.substr(comment.indexOf(';')+1)}</p>
      </div>
    );
  });
  
  // return list of replies
  return(
    <div className="transparentDiv">
      {replies}
    </div>
  );
};

// function that renders the replies onto the page
const renderReplies = (e, linkId, repliesId) => { 
  e.preventDefault();
  
  let repliesDiv = document.getElementById(repliesId);
  let repliesLink = document.getElementById(linkId);
  
  // toggles show/hide replies when user clicks 'Show/Hide replies' link
  if(repliesLink.innerHTML === "Show replies"){
    repliesLink.innerHTML = "Hide replies";
    repliesDiv.style.display = "block";
  }
  else{
    repliesLink.innerHTML = "Show replies";
    repliesDiv.style.display = "none";
  }
};
//endregion

// - 'Tweet list' feed related-functions - region
// function that encapsulates all tweets into a 'tweet list' feed
const TweetList = (props) => {
  let csrf = props.csrf;
  
  // if no tweets have been posted yet, return a default message
  if(props.tweets.length === 0){
    return(
      <div className="tweetList">
        <h3 className="emptyTweet">No Tweets yet</h3>
      </div>
    );
  }
  
  const tweetNodes = props.tweets.map((tweet) => {
    // create necessary unique ids for each tweet component
    let delId = "del" + tweet._id;
    let chngId = "chng" + tweet._id;
    let optId = "opt" + tweet._id;
    let favId = "fav" + tweet._id;
    let replyId = "reply" + tweet._id;
    let replyDivId = "replyDiv" + tweet._id;
    let repliesId = "replies" + tweet._id;
    let repliesLinkId = "repLink" + tweet._id;
    
    // seperate the date data 
    let date = tweet.createdDate.substr(0,tweet.createdDate.indexOf('T'));
    let time = tweet.createdDate.substr(tweet.createdDate.indexOf('T')+1);
    time = time.substr(0, time.length - 5);
    
    // if an image is included in a tweet, store the data in a variable to be used
    let imgSrc;
    if(tweet.imgData[0]){
      imgSrc = `/assets/uploads/${tweet.imgData[0].filename}`;
    }
    
    // save the replies to be rendered later onto the page
    let replies = MakeReplies(tweet);
  
    return(
      <div key={tweet._id} className="tweet" >
        {props.displayname == tweet.displayname &&
          <img className="dropDownIcon" src="/assets/img/dropdown.png" width="25" height="25" alt="dropdown icon" onClick={() => renderOptions(csrf, tweet._id, tweet.message)}/>
        }
        <div id={optId}></div>
        <div id={delId}></div>
        <h4 className="tweetDisplayName">{tweet.displayname} | {date} · {time}</h4>
        <p className="tweetMessage" id={chngId}>{tweet.message}</p>
        {imgSrc != null &&
          <img className="tweetImg" src={imgSrc} width="300" height="150" alt="image here"/>
        }
        <div>
          <img id={replyId} className="replyButton" src="/assets/img/reply.png" width="17" height="17" alt="reply button" onClick={() => renderReplyDiv(csrf, tweet._id, replyDivId)} />
          <img id={favId} className="favButton" src="/assets/img/heart.png" width="17" height="17" alt="favorite tweet" data-faved="false" onClick={() => handleFav(csrf, tweet._id)}/>
          {tweet.favorites.length > 0 &&
            <span> {tweet.favorites.length} </span>
          }
          <a href="#" id={repliesLinkId} className="viewReplies" onClick={(e) => renderReplies(e, repliesLinkId, repliesId)}>Hide replies</a>
        </div>
        <div id={replyDivId}></div>
        <div id={repliesId} className="replies">
          {replies}
        </div>
      </div>
    );
  });
  
  return(
    <div className="tweetList">
      {tweetNodes}
    </div>
  );
};

// function that encapsulates profile search and profile account info into one div to be rendered to page
const LoadProfile = (props) => {
  return(
    <div>
      <form id="searchAccountsForm"
        onSubmit={handleSearch}
        name="searchAccounts"
        action="/search"
        method="POST"
        className="searchAccounts"
      >
        <input id="searchName" type="text" name="search" placeholder="Search for a user"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="searchSubmit" type="submit" value="Search"/>
      </form>
      <div id="searchResult"></div>
      <hr></hr>
      <h2 id="displayname">{props.displayname}</h2>
      <h4 id="profileStats">Followers: {props.followers.length} | Following: {props.following.length}</h4>
    </div>
  );
};

// function that renders the 'tweet list' feed onto the page
const loadTweetsFromServer = (csrf) => {
  sendAjax('GET', '/getTweets', null, true, (data) => {
    ReactDOM.render(
      <TweetList csrf={csrf} displayname={data.displayname} tweets={data.tweets}/>, document.querySelector("#tweets")
    );
    checkDarkMode();
  });
};
//endregion

// function that renders content for searched account result
const loadSearchAccount = (csrf, data) => {
  sendAjax('GET', '/getTweets', null, true, () => { 
    ReactDOM.render(
      <div>
          <form id="followAccountsForm"
          onSubmit={handleFollow}
          name="followAccounts"
          action="/follow"
          method="POST"
          className="followAccounts"
          >
          <span>{data.user}</span>
          <input type="hidden" name="displayname" value={data.user}/>
          <input type="hidden" name="_csrf" value={csrf}/>
          <input className="followSubmit" type="submit" value="Follow"/>
        </form>
      </div>,
      document.querySelector("#searchResult")
    );
  });
};

// function that renders personal account's profile onto the page
const loadProfileFromServer = (csrf) => {
  sendAjax('GET', '/getProfile', null, true, (data) => {
    ReactDOM.render(
      <LoadProfile csrf={csrf} displayname={data.displayname} followers={data.followers} following={data.following}/>, 
      document.querySelector("#profile")
    );
  });
};

// function that sets up page initially
const setup = function(csrf){
  const changePasswordButton = document.querySelector("#changePassButton");
  
  toggleDarkMode();

  changePasswordButton.addEventListener("click", (e) => {
    e.preventDefault();
    createPasswordWindow(csrf);
    return false;
  });
  
  ReactDOM.render(
    <TweetForm csrf={csrf} />, document.querySelector("#makeTweet")
  );
  
  ReactDOM.render(
    <TweetList tweets={[]} csrf={csrf} />, document.querySelector("#tweets")
  );
  
  loadTweetsFromServer(csrf);
  loadProfileFromServer(csrf);
};

// function that makes a request to the server to get a new token for the user
const getToken = () => {
  sendAjax('GET', '/getToken', null, true, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function(){
  getToken();
});