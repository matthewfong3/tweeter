let displayOptions = false; // no GLOBALS

const handleTweet = (e) => {
  e.preventDefault();
  
  if($("#tweetMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  sendAjax('POST', $("#tweetForm").attr("action"), $("#tweetForm").serialize(), () => {
    sendAjax('GET', '/getToken', null, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  // remove image input field
  let imageInput = document.querySelector("#imageInput");
  if(imageInput) imageInput.parentNode.removeChild(imageInput);
  
  // change tweet placeholder text back
  let tweetMsg = document.querySelector("#tweetMessage");
  tweetMsg.placeholder = "What's happening?";
  tweetMsg.value = '';
  
  return false;
};

const handleChange = (e) => {
  e.preventDefault();
  
  if($("#changeTweetMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  sendAjax('POST', $("#changeTweetForm").attr("action"), $("#changeTweetForm").serialize(), () => {
    sendAjax('GET', '/getToken', null, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  let optDivId = "optDiv" + $("#changeTweetForm").attr('data-ref');
  let optDiv = document.getElementById(optDivId);
  if(optDiv) optDiv.parentNode.removeChild(optDiv);
  
  displayOptions = false;
  
  return false;
};

const handleReply = (e) => {
  e.preventDefault();
  
  if($("#replyMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  sendAjax('POST', $("#replyTweetForm").attr("action"), $("#replyTweetForm").serialize(), () => {
    sendAjax('GET', '/getToken', null, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  let replyForm = document.querySelector("#replyTweetForm");
  replyForm.parentNode.removeChild(replyForm);
};

const handlePassword = (e) => {
  e.preventDefault();
  
  if($("#oldPass").val() == '' || $("#newPass1").val() == '' || $("#newPass2").val() == ''){
    handleError("All fields are required");
    return false;
  }
  
  console.log($("#passwordForm").serialize());
  
  sendAjax('POST', $("#passwordForm").attr("action"), $("#passwordForm").serialize(), redirect);
};

const handleDelete = (e, csrf, tweetId) => {
  e.preventDefault();
  
  let queryString = `_csrf=${csrf}&_id=${tweetId}`;
  
  sendAjax('POST', '/delete', queryString, () => {
    sendAjax('GET', '/getToken', null, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  displayOptions = false;
  
  return false;
};

const handleFav = (csrf, tweetId) => {  
  let favId = 'fav' + tweetId;
  let favButton = document.getElementById(favId);
  favButton.src = '/assets/img/heart-fill.png';
  
  let queryString = `_csrf=${csrf}&id=${tweetId}`;

  if(favButton.dataset.faved === "false"){
    sendAjax('POST', '/favTweet', queryString, () => {
      sendAjax('GET', '/getToken', null, (result) => {
        loadTweetsFromServer(result.csrfToken);
      });
    }); 
  } 
  favButton.dataset.faved = "true";
};

// function that creates image input in tweet form
const createImageInput = () => {
  let imageField = document.querySelector('#imageField');
  if(imageField.childNodes.length === 0){
    let input = document.createElement('input');
    input.id = "imageInput";
    input.type = "text";
    input.name = "imgData";
    input.placeholder = "Image link";
  
    imageField.appendChild(input); 
  }
};

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
        <input id="oldPass" type="password" name="oldPass"></input>
        <label htmlFor="newPass1">New password:</label>
        <input id="newPass1" type="password" name="newPass1"></input>
        <label htmlFor="newPass2">Retype password:</label>
        <input id="newPass2" type="password" name="newPass2"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="formSubmit" type="submit" value="Submit"/>
      </form>
    </div>
  );
};

const createPasswordWindow = (csrf) => {
  ReactDOM.render(
    <ChangePasswordWindow csrf={csrf} />, document.querySelector("#appContent")
  );
};

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
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="makeTweetSubmit" type="submit" value="Tweet"/>
        <div id="imageField"></div>
      </form>
      <img id="uploadImage" src="/assets/img/upload.png" width="25" height="25" alt="upload image" onClick={createImageInput}/>
    </div>
  );
};

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

const renderChangeForm = (csrf, tweetId, message) => {
  let chngId = "chng" + tweetId;
   
  ReactDOM.render(
    <MakeChangeForm csrf={csrf} tweetId={tweetId} message={message}/>, document.getElementById(chngId)
  );
};

const removeDeleteOpts = (id) => {
  let delDivId = "delDiv" + id;
  let delDiv = document.getElementById(delDivId);
  delDiv.parentNode.removeChild(delDiv);
  
  let optDivId = "optDiv" + id;
  let optDiv = document.getElementById(optDivId);
  optDiv.parentNode.removeChild(optDiv);
  
  displayOptions = false;
};

const MakeDeleteOptions = (props) => {
  let delDivId = "delDiv" + props.tweetId;
  return(
    <div id={delDivId} className="delDiv">
      <div className="delYes" onClick={ (e) => handleDelete(e, props.csrf, props.tweetId)}>Delete</div>
      <div className="delNo" onClick={(e) => removeDeleteOpts(props.tweetId)}>Cancel</div>
    </div>
  );
}

const renderDeleteOptions = (csrf, tweetId) => {
  let id = "del" + tweetId;
  ReactDOM.render(
    <MakeDeleteOptions csrf={csrf} tweetId={tweetId}/>, document.getElementById(id)
  );
};

const MakeOptions = (props) => {
  if(displayOptions){
  let optDivId = "optDiv" + props.tweetId;
  return(
    <div id={optDivId} className="optDiv">
      <div className="changeTweet" onClick={() => renderChangeForm(props.csrf, props.tweetId, props.tweetMessage)}>Edit Tweet</div>
      <hr/>
      <div className="deleteTweet" onClick={() => renderDeleteOptions(props.csrf, props.tweetId)}>Delete Tweet</div>
    </div>
  );
  } else {
    let delDivId = "delDiv" + props.tweetId;
    let delDiv = document.getElementById(delDivId);
    if(delDiv) delDiv.parentNode.removeChild(delDiv);
    
    return(<div></div>);
  }
};

const renderOptions = (csrf, tweetId, tweetMessage) => {
  displayOptions = !displayOptions;
  let id = "opt" + tweetId;
  ReactDOM.render(
    <MakeOptions csrf={csrf} tweetId={tweetId} tweetMessage={tweetMessage}/>, document.getElementById(id)
  );
};

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

const renderReplyDiv = (csrf, tweetId, replyDivId) => {
  ReactDOM.render(
    <MakeReplyForm csrf={csrf} tweetId={tweetId} />, document.getElementById(replyDivId)
  );
};

const MakeReplies = (props) => {
  if(props.comments.length === 0){
    return(
      <div className="replyDiv">
        <h3>No replies</h3>
      </div>
    );
  }
  
  const replies = props.comments.map((comment) => {
    // source: https://stackoverflow.com/questions/10272773/split-string-on-the-first-white-space-occurrence
    return(
      <div className="replyDiv">
        <h4>{comment.substr(0,comment.indexOf(';'))}</h4>
        <p>{comment.substr(comment.indexOf(';')+1)}</p>
      </div>
    );
  });
  
  return(
    <div>
      {replies}
    </div>
  );
};

const renderReplies = (e, repliesId, comments) => { 
  e.preventDefault();
  let id = repliesId;
  ReactDOM.render(
    <MakeReplies comments={comments}/>, document.getElementById(id)
  );
};

const TweetList = (props) => {
  let csrf = props.csrf;
  
  if(props.tweets.length === 0){
    return(
      <div className="tweetList">
        <h3 className="emptyTweet">No Tweets yet</h3>
      </div>
    );
  }
  
  const tweetNodes = props.tweets.map((tweet) => {
    let delId = "del" + tweet._id;
    let chngId = "chng" + tweet._id;
    let optId = "opt" + tweet._id;
    let favId = "fav" + tweet._id;
    let replyId = "reply" + tweet._id;
    let replyDivId = "replyDiv" + tweet._id;
    let repliesId = "replies" + tweet._id;
    
    let imgSrc;
    
    if(tweet.imgData){
      imgSrc = tweet.imgData;
    }
    
    let comments = tweet.comments;
    return(
      <div key={tweet._id} className="tweet" >
        {props.displayname == tweet.displayname &&
          <img className="dropDownIcon" src="/assets/img/dropdown.png" width="25" height="25" alt="dropdown icon" onClick={() => renderOptions(csrf, tweet._id, tweet.message)}/>
        }
        <div id={optId}></div>
        <div id={delId}></div>
        <h4 className="tweetDisplayName">{tweet.displayname} | {tweet.createdDate}</h4>
        <p className="tweetMessage" id={chngId}>{tweet.message}</p>
        {imgSrc != null &&
          <img className="tweetImg" src={imgSrc} width="300" height="150" alt="image here"/>
        }
        <div>
          <img id={replyId} className="replyButton" src="/assets/img/reply.png" width="17" height="17" alt="reply button" onClick={() => renderReplyDiv(csrf, tweet._id, replyDivId)} />
          <img id={favId} className="favButton" src="/assets/img/heart.png" width="17" height="17" alt="favorite tweet" data-faved="false" onClick={() => handleFav(csrf, tweet._id)}/>
          {tweet.favorites > 0 &&
            <span> {tweet.favorites} </span>
          }
          <a href="#" className="viewReplies" onClick={(e) => renderReplies(e, repliesId, comments)}>Show replies</a>
        </div>
        <div id={replyDivId}></div>
        <div id={repliesId} className="replies"></div>
      </div>
    );
  });
  
  return(
    <div className="tweetList">
      {tweetNodes}
    </div>
  );
};

const loadTweetsFromServer = (csrf) => {
  sendAjax('GET', '/getTweets', null, (data) => {
    ReactDOM.render(
      <TweetList csrf={csrf} displayname={data.displayname} tweets={data.tweets}/>, document.querySelector("#tweets")
    );
  });
};

const setup = function(csrf){
  const changePasswordButton = document.querySelector("#changePassButton");
  
  changePasswordButton.addEventListener("click", (e) => {
    e.preventDefault();
    createPasswordWindow(csrf);
    return false;
  });
  
  ReactDOM.render(
    <TweetForm csrf={csrf} />, document.querySelector("#makeTweet")
  );
  
  ReactDOM.render(
    <TweetList tweets={[]} csrf={csrf}/>, document.querySelector("#tweets")
  );
  
  loadTweetsFromServer(csrf);
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function(){
  getToken();
});