// - Handling requests to server - region
// handles user login to server
const handleLogin = (e) => {
  e.preventDefault();
  
  if($("#username").val() == '' || $("#password").val() == ''){
    handleError("Username or password is required");
    return false;
  }
  
  console.log($("input[name=_csrf]").val());
  
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), true, redirect);
  
  return false;
};

// handles user sign up to server
const handleSignup = (e) => {
  e.preventDefault();
  
  if($("#username").val() == '' || $("#displayname").val() == '' || $("#password").val() == '' || $("#password2").val() == ''){
    handleError("All fields are required");
    return false;
  }
  
  if($("#password").val() !== $("#password2").val()){
    handleError("Passwords do not match");
    return false;
  }
  
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), true, redirect);
  
  return false;
};
//endregion

// - Form creating related-functions - region
// function that creates the login window form
const LoginWindow = (props) => {
  return (
  <form id="loginForm" name="loginForm"
      onSubmit={handleLogin}
      action="/login"
      method="POST"
      className="mainForm"
    >
    <h1>Tweeter</h1>
    <label htmlFor="username">Username: </label>
    <input className="username" type="text" name="username" placeholder="username"/>
    <label htmlFor="pass">Password: </label>
    <input id="password" type="password" name="password" placeholder="password"/>
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="formSubmit" type="submit" value="Sign in" />
  </form>  
  );
};

// function that creates the sign up window form
const SignupWindow = (props) => {
  return (
    <form id="signupForm"
      name="signupForm"
      onSubmit={handleSignup}
      action="/signup"
      method="POST"
      className="mainForm"
    >
      <h1>Tweeter</h1>
      <label htmlFor="username">Username: </label>
      <input className="username" type="text" name="username" placeholder="username" />
      <label htmlFor="displayname">Display Name: </label>
      <input id="displayname" type="text" name="displayname" placeholder="display name"/>
      <label htmlFor="pass">Password: </label>
      <input id="password" type="password" name="password" placeholder="password" />
      <label htmlFor="pass2">Retype Password: </label>
      <input id="password2" type="password" name="password2" placeholder="retype password" />
      <input type="hidden" name="_csrf" value={props.csrf} />
      <input className="formSubmit" type="submit" value="Sign Up" />
    </form>
  );
};
//endregion

// - Window rendering related-functions - region
// function that renders the login window to content
const createLoginWindow = (csrf) => {
  ReactDOM.render(
    <LoginWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

// function that renders the sign up window to content
const createSignupWindow = (csrf) => {
  ReactDOM.render(
    <SignupWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};
//endregion

// function that sets up page initially
const setup = (csrf) => {
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signupButton");
  
  toggleDarkMode();
  
  signupButton.addEventListener("click", (e) => {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  
  createLoginWindow(csrf); //default view
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