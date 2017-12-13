// function that handles error messages from the server
const handleError = (message) => {
  $("#errorMessage").text(message);
};

// function that redirects the user on request success
const redirect = (response) => {
  window.location = response.redirect;
};

// function that sends ajax requests to the server
const sendAjax = (type, action, data, processBool,success) => {
  let contentTypeVal;
  
  if(!processBool) contentTypeVal = false;
  else contentTypeVal = 'application/x-www-form-urlencoded; charset=UTF-8';
  
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data, 
    dataType: "json",
    processData: processBool,
    contentType: contentTypeVal,
    success: success,
    error: function(xhr, status, error){
      var messageObj = JSON.parse(xhr.responseText); 
      handleError(messageObj.error);  
    }
  });
};

// helper function that toggles on/off dark/night mode view
const toggleDarkMode = () => {
  let checkbox = document.querySelector("#darkModeCheckBox");
  let body = document.body;
  let nav = document.querySelector("#nav");
  
  // login only
  let content = document.querySelector("#content");
  
  // app only
  let passwordDiv = document.querySelector("#passwordDiv");
  let tweetFormDiv = document.querySelector("#tweetFormDiv");
  let tweets = document.getElementsByClassName('tweet');
  let emptyTweet = document.getElementsByClassName('emptyTweet');
  let replies = document.getElementsByClassName('replyDiv');
  let profile = document.querySelector("#profile");
  
  // notFound only
  let errContent = document.querySelector("#errContent");
  
  checkbox.addEventListener('change', () => {
    if(checkbox.checked){
      body.style.backgroundColor = "rgb(20,29,38)";
      body.style.color = "white";
      nav.style.backgroundColor = "rgb(36,52,71)";
      
      if(content){
        content.style.backgroundColor = "rgb(27,40,54)";
      }
      
      if(passwordDiv){
        passwordDiv.style.backgroundColor = "rgb(27,40,54)";
      }
      
      if(tweetFormDiv){
        tweetFormDiv.style.backgroundColor = "rgb(27,52, 72)";
      }
      
      if(emptyTweet){
        for(let i =  0; i < emptyTweet.length; i++){
          emptyTweet[i].style.backgroundColor = "rgb(36,52,71)";
        }
      }
      
      if(tweets){
        for(let i = 0; i < tweets.length; i++){
          tweets[i].style.backgroundColor = "rgb(36,52,71)";
        }
      }
      
      if(replies){
        for(let i = 0; i < replies.length; i++){
          replies[i].style.backgroundColor = "rgb(27,40,54)";
        }
      }
      
      if(profile){
        profile.style.backgroundColor = "rgb(36,52,71)";
      }
      
      if(errContent){
        errContent.style.backgroundColor = "rgb(36,52,71)";
      }
    } else {
      body.style.backgroundColor = "rgb(230, 236, 240)";
      body.style.color = "black";
      nav.style.backgroundColor = "white";
      
      if(content){
        content.style.backgroundColor = "rgb(245, 248, 250)";
      }
      
      if(passwordDiv){
        passwordDiv.style.backgroundColor = "rgb(245, 248, 250)";
      }
      
      if(tweetFormDiv){
        tweetFormDiv.style.backgroundColor = "rgb(232, 245, 253)";
      }
      
      if(emptyTweet){
        for(let i =  0; i < emptyTweet.length; i++){
          emptyTweet[i].style.backgroundColor = "white";
        }
      }
      
      if(tweets){
        for(let i = 0; i < tweets.length; i++){
          tweets[i].style.backgroundColor = "white";
        }
      }
      
      if(replies){
        for(let i = 0; i < replies.length; i++){
          replies[i].style.backgroundColor = "rgb(217, 235, 253)";
        }
      }
      
      if(profile){
        profile.style.backgroundColor = "white";
      }
      
      if(errContent){
        errContent.style.backgroundColor = "rgb(245, 248, 250)";
      }
    }
  });
};

// helper function that re-renders appropriate content depending on dark/light mode being active
const checkDarkMode = () => {
  let checkbox = document.querySelector("#darkModeCheckBox");
  let emptyTweet = document.getElementsByClassName('emptyTweet');
  let tweets = document.getElementsByClassName('tweet');
  let replies = document.getElementsByClassName('replyDiv');
  let transparentDivs = document.getElementsByClassName('transparentDiv');
  
  if(checkbox.checked){ // dark mode active
    if(emptyTweet){
      for(let i =  0; i < emptyTweet.length; i++){
        emptyTweet[i].style.backgroundColor = "rgb(36,52,71)";
      }
    }
    
    if(tweets){
      for(let i = 0; i < tweets.length; i++){
        tweets[i].style.backgroundColor = "rgb(36,52,71)";
      }
    }
    
    if(replies){
      for(let i = 0; i < replies.length; i++){
        replies[i].style.backgroundColor = "rgb(27,40,54)";
      }
    }
  } else { // light mode active
    if(emptyTweet){
      for(let i =  0; i < emptyTweet.length; i++){
        emptyTweet[i].style.backgroundColor = "white";
      }
    }
    
    if(tweets){
      for(let i = 0; i < tweets.length; i++){
        tweets[i].style.backgroundColor = "white";
      }
    }
    
    if(replies){
      for(let i = 0; i < replies.length; i++){
        replies[i].style.backgroundColor = "rgb(217, 235, 253)";
      }
    }
  }
  
  if(transparentDivs){
    for(let i = 0; i < transparentDivs.length; i++){
      transparentDivs[i].style.backgroundColor = "transparent";
    }
  }
};