let displayOptions = false; // no GLOBALS
let test1;

const handleTweet = (e) => {
  e.preventDefault();
  
  if($("#tweetMessage").val() == ''){
    handleError("Message is required");
    return false;
  }
  
  let queryString = $("#tweetForm").serialize();
  
  let imgElem = document.getElementById('imageUpload');
  
  if(imgElem){
    let imgData = getBase64Image(imgElem);
    test1 = imgData;
    console.log(test1.replace(/\s/g,'').length);
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
  
  
  sendAjax('POST', $("#tweetForm").attr("action"), queryString, () => {
    sendAjax('GET', '/getToken', null, (result) => {
      loadTweetsFromServer(result.csrfToken);
    });
  });
  
  let image = document.querySelector("#imageUpload");
  if(image) image.parentNode.removeChild(image);
  
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

// HELPER FUNCTIONS
// reference: https://stackoverflow.com/questions/21926893/sending-an-image-and-json-data-to-server-using-ajax-post-request
const getBase64Image = (imgElem) => {
  let canvas = document.createElement('canvas');
  canvas.width = imgElem.clientWidth;
  canvas.height = imgElem.clientHeight;
  let ctx = canvas.getContext('2d');
  ctx.drawImage(imgElem, 0, 0, canvas.width, canvas.height);
  let dataURL = canvas.toDataURL('image/png');
  
  //return dataURL;
  return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
};

const base64ToBufferArray = (base64) => {
  const binaryString = window.atob(base64);
  const length = binaryString.length;
  const bytes = new Uint8Array(length);
  for (let i = 0; i < length; i++) { bytes[i] = binaryString.charCodeAt(i); }

  return bytes.buffer;
};

// reference: https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
const toArrayBuffer = (buf) => {
  let ab = new ArrayBuffer(buf.length);
  let view = new Uint8Array(ab);
  for(let i = 0; i < buf.length; i++)
    view[i] = buf[i];
  return ab;
};

// reference: https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
const arrayBufferToBase64 = (buffer) => {
  let binary = '';
  let bytes = new Uint8Array(buffer);
  let length = bytes.byteLength;
  for(let i = 0; i < length; i++)
    binary += String.fromCharCode(bytes[i]);
  return window.btoa(binary);
};

const updateImageDisplay = () => {
  let current = $("#file")[0].files;
  
  if(current.length === 0){
    //console.log('no files currently uploaded');
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
    //console.log('image uploaded');
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
    
    //let chngForm = document.getElementById('changeTweetForm');
    //if(chngForm) chngForm.parentNode.removeChild(chngForm);
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

const TweetList = (props) => {
  let csrf = props.csrf;
  
  if(props.tweets.length === 0){
    return(
      <div className="tweetList">
        <h3 className="emptyTweet">No Tweets yet</h3>
      </div>
    );
  }
  
  //props.testing = props.testing.replace(/\s/g,'');
  console.log(props.testing.length);
  if(props.testing === test1){
    console.log('base64 string length are the same');
  } else {
    console.log('base64 string length are NOT the same');
  }
  
  const tweetNodes = props.tweets.map((tweet) => {
    let delId = "del" + tweet._id;
    let chngId = "chng" + tweet._id;
    let optId = "opt" + tweet._id;
    let arrBuf;
    let imgSrc;
    
    if(tweet.imgData){
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
    
    return(
      <div key={tweet._id} className="tweet" >
        {props.displayname == tweet.displayname &&
          <img className="dropDownIcon" src="/assets/img/dropdown.png" width="25" height="25" alt="dropdown icon" onClick={() => renderOptions(csrf, tweet._id, tweet.message)}/>
        }
        <div id={optId}></div>
        <div id={delId}></div>
        <h4 className="tweetDisplayName">{tweet.displayname} | {tweet.createdDate}</h4>
        <p className="tweetMessage" id={chngId}>{tweet.message}</p>
        {arrBuf != null &&
          <img src={imgSrc} width="300" height="150" alt="image here"/>
        }
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
      <TweetList csrf={csrf} displayname={data.displayname} tweets={data.tweets} testing={data.testing}/>, document.querySelector("#tweets")
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