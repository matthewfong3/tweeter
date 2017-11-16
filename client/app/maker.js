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
  
  return false;
};

const handleDelete = (e) => {
  e.preventDefault();
  
  sendAjax('POST', $("#deleteTweetForm").attr("action"), $("#deleteTweetForm").serialize(), () => {
    sendAjax('GET', '/getToken', null, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  return false;
};

const TweetForm = (props) => {
  return(
    <div>
      <form id="tweetForm"
        onSubmit={handleTweet}
        name="tweetForm"
        action="/maker"
        method="POST"
        className="tweetForm"
      >
        <label htmlFor="message">Tweet:</label>
        <input id="tweetMessage" type="text" name="message" placeholder="What's happening?"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <input className="makeTweetSubmit" type="submit" value="Tweet"/>
      </form>
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
    >
      <input id="changeTweetMessage" type="text" name="message" placeholder={props.message}/>
      <input type="hidden" name="_id" value={props.tweetId}/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="changeTweetSubmit" type="submit" value="Tweet"/>
    </form>
  );
};

const renderChangeForm = (e, csrf, tweetId, message) => {
  e.preventDefault();
  
  ReactDOM.render(
    <MakeChangeForm csrf={csrf} tweetId={tweetId} message={message}/>, document.getElementById(tweetId)
  );
};

const MakeDeleteOptions = (props) => {
  return(
    <form id="deleteTweetForm"
      onSubmit={handleDelete}
      name="deleteTweetForm"
      action="/delete"
      method="POST"
      className="deleteForm"
    >
      <input type="hidden" name="_id" value={props.tweetId}/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <input className="deleteTweetSubmit" type="submit" value="Yes"/>
      <input className="deleteTweetSubmit" type="submit" value="No"/>
    </form>
  );
}

const renderDeleteOptions = (csrf, tweetId) => {
  ReactDOM.render(
    <MakeDeleteOptions csrf={csrf} tweetId={tweetId}/>, document.querySelector("#deleteOpts")
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
    return(
      <div key={tweet._id} className="tweet" >
        <h4 className="tweetDisplayName">{tweet.displayname}:</h4>
        <p className="tweetMessage" id={tweet._id}>{tweet.message}</p>
        <button className="changeTweet" onClick={ (e) => renderChangeForm(e, csrf, tweet._id, tweet.message)}>Change Tweet</button>
        <button className="deleteTweet" onClick={ (e) => renderDeleteOptions(csrf, tweet._id)}>Delete Tweet</button>
        <div id="deleteOpts"></div>
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
      <TweetList csrf={csrf} tweets={data.tweets}/>, document.querySelector("#tweets")
    );
  });
};

const setup = function(csrf){
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