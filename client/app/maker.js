const handleTweet = (e) => {
  e.preventDefault();
  
  if($("#tweetMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  let queryString = $("#tweetForm").serialize();
  
  let imgElem = document.getElementById('imageUpload');
  
  if(imgElem){
    let imgData = JSON.stringify(getBase64Image(imgElem));
  
    //console.log("imgData: " + imgData);
    queryString += "&imgData=" + imgData;
  }
  
  //console.log(queryString);
  
  sendAjax('POST', $("#tweetForm").attr("action"), queryString, () => {
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

const handleDelete = (e, csrf, tweetId) => {
  e.preventDefault();
  
  let queryString = `_csrf=${csrf}&_id=${tweetId}`;
  
  sendAjax('POST', '/delete', queryString, () => {
    sendAjax('GET', '/getToken', null, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  return false;
};

const getBase64Image = (imgElem) => {
  let canvas = document.createElement('canvas');
  canvas.width = imgElem.clientWidth;
  canvas.height = imgElem.clientHeight;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(imgElem, 0, 0);
  let dataURL = canvas.toDataURL('image/png');
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

const updateImageDisplay = () => {
  let current = $("#file")[0].files;
  
  if(current.length === 0){
    console.log('no files currently uploaded');
  } else {
    let image = document.createElement('img');
    //image.type = 'image';
    image.id = "imageUpload";
    image.src = window.URL.createObjectURL(current[0]);
    image.alt = 'image display';
    image.width = "300";
    image.height = "150";
    
    let tweetForm = document.querySelector("#tweetform");
    
    tweetForm.appendChild(image);
    
    console.log('image uploaded');
  }
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
        <input type="file" id="file" name="file" accept="image/jpeg, image/jpg, image/png" multiple onChange={updateImageDisplay}/>
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
  
  let chngId = "chng" + tweetId;
   
  ReactDOM.render(
    <MakeChangeForm csrf={csrf} tweetId={tweetId} message={message}/>, document.getElementById(chngId)
  );
};

const removeDeleteOpts = (delDivId) => {
  let delDiv = document.getElementById(delDivId);
  delDiv.parentNode.removeChild(delDiv);
};

const MakeDeleteOptions = (props) => {
  let delDivId = "delDiv" + props.tweetId;
  return(
    <div id={delDivId}>
      <button onClick={ (e) => handleDelete(e, props.csrf, props.tweetId)}>Yes</button>
      <button onClick={(e) => removeDeleteOpts(delDivId)}>No</button>
    </div>
  );
}

const renderDeleteOptions = (csrf, tweetId) => {
  let id = "del" + tweetId;
  ReactDOM.render(
    <MakeDeleteOptions csrf={csrf} tweetId={tweetId}/>, document.getElementById(id)
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
    let obj;
    let imgSrc;
    
    if(tweet.imgData){
      //console.log(tweet.imgData);
      obj = JSON.parse(tweet.imgData);
    
      imgSrc = "data:image/png;base64," + obj;
    
      //console.log(imgSrc);
    }
    console.log(imgSrc);
    return(
      <div key={tweet._id} className="tweet" >
        <h4 className="tweetDisplayName">{tweet.displayname} | {tweet.createdDate}</h4>
        <p className="tweetMessage" id={chngId}>{tweet.message}</p>
        {obj != null &&
          <img src={imgSrc} width="300" height="150" alt="image here"/>
        }
        {props.displayname == tweet.displayname && <div>
          <button className="changeTweet" onClick={ (e) => renderChangeForm(e, csrf, tweet._id, tweet.message)}>Edit Tweet</button>
          <button className="deleteTweet" onClick={ (e) => renderDeleteOptions(csrf, tweet._id)}>Delete Tweet</button>
        </div>}
        <div id={delId}></div>
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