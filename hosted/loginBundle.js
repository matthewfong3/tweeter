// Useful References (regarding ReactJS): 
// https://stackoverflow.com/questions/36672007/reactjs-cannot-read-property-keys-of-undefined
// https://stackoverflow.com/questions/38194585/reactjs-browser-cannot-read-property-keys-of-undefined

"use strict";

// sends login requests to server
const handleLogin = e => {
  e.preventDefault();
  if ($("#emailField").val() == '' || $("#pass1Field").val() == '') {
    handleError("Username or password is required");
    return false;
  }
  const loginForm = $("#loginForm");
  sendAjax(loginForm.attr('method'), loginForm.attr('action'), loginForm.serialize(), true, redirect);
  return false;
};

// sends sign up requests to server
const handleSignup = e => {
  e.preventDefault();
  if ($("#emailField").val() == '' || $("#usernameField").val() == '' || $("#pass1Field").val() == '' || $("#pass2Field").val() == '') {
    handleError("All fields are required");
    return false;
  }
  if ($("#pass1Field").val() !== $("#pass2Field").val()) {
    handleError("Passwords do not match");
    return false;
  }
  const signupForm = $("#signupForm");
  sendAjax(signupForm.attr('method'), signupForm.attr('action'), signupForm.serialize(), true, redirect);
  return false;
};

// Creates Login window when called
const LoginWindow = props => {
  return /*#__PURE__*/React.createElement("form", {
    id: "loginForm",
    name: "loginForm",
    onSubmit: handleLogin,
    action: "/login",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("h1", null, "Log in"), /*#__PURE__*/React.createElement("label", {
    htmlFor: "email"
  }, "Email Address:"), /*#__PURE__*/React.createElement("input", {
    id: "emailField",
    name: "email",
    type: "text",
    placeholder: "email"
  }), /*#__PURE__*/React.createElement("label", {
    for: "pass1"
  }, "Password:"), /*#__PURE__*/React.createElement("input", {
    id: "pass1Field",
    name: "pass1",
    type: "password",
    placeholder: "password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Log In"
  }));
};

// Creates Sign up window when called
const SignupWindow = props => {
  return /*#__PURE__*/React.createElement("form", {
    id: "signupForm",
    name: "signupForm",
    onSubmit: handleSignup,
    action: "/signup",
    method: "POST",
    className: "mainForm"
  }, /*#__PURE__*/React.createElement("h1", null, "Sign up"), /*#__PURE__*/React.createElement("label", {
    htmlFor: "email"
  }, "Email Address:"), /*#__PURE__*/React.createElement("input", {
    id: "emailField",
    name: "email",
    type: "text",
    placeholder: "email"
  }), /*#__PURE__*/React.createElement("label", {
    htmlFor: "username"
  }, "Username:"), /*#__PURE__*/React.createElement("input", {
    id: "usernameField",
    name: "username",
    type: "text",
    placeholder: "username"
  }), /*#__PURE__*/React.createElement("label", {
    for: "pass1"
  }, "Password:"), /*#__PURE__*/React.createElement("input", {
    id: "pass1Field",
    name: "pass1",
    type: "password",
    placeholder: "password"
  }), /*#__PURE__*/React.createElement("label", {
    for: "pass2"
  }, "Retype password:"), /*#__PURE__*/React.createElement("input", {
    id: "pass2Field",
    name: "pass2",
    type: "password",
    placeholder: "retype password"
  }), /*#__PURE__*/React.createElement("input", {
    type: "hidden",
    name: "_csrf",
    value: props.csrf
  }), /*#__PURE__*/React.createElement("input", {
    className: "formSubmit",
    type: "submit",
    value: "Sign up"
  }));
};

// REACTJS - render Login form to DOM
const createLoginWindow = csrf => {
  ReactDOM.render( /*#__PURE__*/React.createElement(LoginWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
};

// REACTJS - render Sign up form to DOM
const createSignupWindow = csrf => {
  ReactDOM.render( /*#__PURE__*/React.createElement(SignupWindow, {
    csrf: csrf
  }), document.querySelector("#content"));
};

// toggles on/off dark/light mode view
const toggleDarkMode = () => {
  let checkbox = document.querySelector("#darkModeCheckbox");
  let body = document.body;
  let nav = document.querySelector("#nav");
  let content = document.querySelector("#content");
  let errorContent = document.querySelector("#errorContent");
  checkbox.addEventListener('change', () => {
    // dark mode active
    if (checkbox.checked) {
      body.style.backgroundColor = "rgb(20,29,38)";
      body.style.color = "white";
      nav.style.backgroundColor = "rgb(36,52,71)";
      if (content) content.style.backgroundColor = "rgb(27,40,54)";
      if (errorContent) errorContent.style.backgroundColor = "rgb(20,29,38)";
    }
    // light mode active
    else {
      body.style.backgroundColor = "rgb(230, 236, 240)";
      body.style.color = "black";
      nav.style.backgroundColor = "white";
      if (content) content.style.backgroundColor = "rgb(245, 248, 250)";
      if (errorContent) errorContent.style.backgroundColor = "rgb(230, 236, 240)";
    }
  });
};

// initial setup for page
const setup = csrf => {
  const signupButton = document.querySelector("#signupButton");
  const loginButton = document.querySelector("#loginButton");
  signupButton.addEventListener('click', e => {
    e.preventDefault();
    $("#errorMessage").text('');
    createSignupWindow(csrf);
    return false;
  });
  loginButton.addEventListener('click', e => {
    e.preventDefault();
    $("#errorMessage").text('');
    createLoginWindow(csrf);
    return false;
  });
  createLoginWindow(csrf); // render a default view to page
  toggleDarkMode();
};

// grabs csrfToken from server for client-side to send requests
const init = () => {
  sendAjax('GET', '/getToken', null, true, response => {
    setup(response.csrfToken);
  });
};
$(document).ready(init);
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
