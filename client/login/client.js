const handleLogin = (e) => {
  e.preventDefault();
  
  if($("#username").val() == '' || $("#password").val() == ''){
    handleError("Username or password is required");
    return false;
  }
  
  console.log($("input[name=_csrf]").val());
  
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
  
  return false;
};

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
  
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
  
  return false;
};

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
    <input id="password" type="password" name="pass" placeholder="password"/>
    <input type="hidden" name="_csrf" value={props.csrf}/>
    <input className="formSubmit" type="submit" value="Sign in" />
  </form>  
  );
};

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
      <input id="password" type="password" name="pass" placeholder="password" />
      <label htmlFor="pass2">Retype Password: </label>
      <input id="password2" type="password" name="pass2" placeholder="retype password" />
      <input type="hidden" name="_csrf" value={props.csrf} />
      <input className="formSubmit" type="submit" value="Sign Up" />
    </form>
  );
};

const createLoginWindow = (csrf) => {
  ReactDOM.render(
    <LoginWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const createSignupWindow = (csrf) => {
  ReactDOM.render(
    <SignupWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const setup = (csrf) => {
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signupButton");
  
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

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function(){
  getToken();
});