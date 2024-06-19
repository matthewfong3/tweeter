// Useful References (regarding ReactJS): 
// https://stackoverflow.com/questions/36672007/reactjs-cannot-read-property-keys-of-undefined
// https://stackoverflow.com/questions/38194585/reactjs-browser-cannot-read-property-keys-of-undefined

"use strict"

// sends login requests to server
const handleLogin = (e) => {
    e.preventDefault();
    
    if($("#emailField").val() == '' || $("#pass1Field").val() == ''){
        handleError("Username or password is required");
        return false;
    }

    const loginForm = $("#loginForm");

    sendAjax(loginForm.attr('method'), loginForm.attr('action'), loginForm.serialize(), true, redirect);

    return false;
};

// sends sign up requests to server
const handleSignup = (e) => {
    e.preventDefault();
    
    if($("#emailField").val() == '' || $("#usernameField").val() == '' || $("#pass1Field").val() == '' || $("#pass2Field").val() == ''){
        handleError("All fields are required");
        return false;
    }

    if($("#pass1Field").val() !== $("#pass2Field").val()){
        handleError("Passwords do not match");
        return false;
    }

    const signupForm = $("#signupForm");

    sendAjax(signupForm.attr('method'), signupForm.attr('action'), signupForm.serialize(), true, redirect);

    return false;
};

// Creates Login window when called
const LoginWindow = (props) => { 
    return(
        <form id="loginForm" name="loginForm"
        onSubmit={handleLogin}
        action="/login"
        method="POST"
        className="mainForm">
            <h1>Log in</h1>
            <label htmlFor="email">Email Address:</label>
            <input id="emailField" name="email" type="text" placeholder="email"/>
            <label for="pass1">Password:</label>
            <input id="pass1Field" name="pass1" type="password" placeholder="password"/>
            <input type="hidden" name="_csrf" value={props.csrf}/>
            <input className="formSubmit" type="submit" value="Log In"/>
        </form>
    );
};

// Creates Sign up window when called
const SignupWindow = (props) => {
    return(
        <form id="signupForm"
            name="signupForm"
            onSubmit={handleSignup}
            action="/signup"
            method="POST"
            className="mainForm">
                <h1>Sign up</h1>
                <label htmlFor="email">Email Address:</label>
                <input id="emailField" name="email" type="text" placeholder="email"/>
                <label htmlFor="username">Username:</label>
                <input id="usernameField" name="username" type="text" placeholder="username"/>
                <label for="pass1">Password:</label>
                <input id="pass1Field" name="pass1" type="password" placeholder="password"/>
                <label for="pass2">Retype password:</label>
                <input id="pass2Field" name="pass2" type="password" placeholder="retype password"/>
                <input type="hidden" name="_csrf" value={props.csrf}/>
                <input className="formSubmit" type="submit" value="Sign up"/>
        </form>
    );
};

// REACTJS - render Login form to DOM
const createLoginWindow = (csrf) => {
    ReactDOM.render(<LoginWindow csrf={csrf}/>, document.querySelector("#content"));
};

// REACTJS - render Sign up form to DOM
const createSignupWindow = (csrf) => {
    ReactDOM.render(<SignupWindow csrf={csrf}/>, document.querySelector("#content"));
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
        if(checkbox.checked){
            body.style.backgroundColor = "rgb(20,29,38)";
            body.style.color = "white";
            nav.style.backgroundColor = "rgb(36,52,71)";
        
            if(content) content.style.backgroundColor = "rgb(27,40,54)";
        
            if(errorContent) errorContent.style.backgroundColor = "rgb(20,29,38)";
        } 
        // light mode active
        else{
            body.style.backgroundColor = "rgb(230, 236, 240)";
            body.style.color = "black";
            nav.style.backgroundColor = "white";
        
            if(content) content.style.backgroundColor = "rgb(245, 248, 250)";
        
            if(errorContent) errorContent.style.backgroundColor = "rgb(230, 236, 240)";
        }
    });
};

// initial setup for page
const setup = (csrf) => {
    const signupButton = document.querySelector("#signupButton");
    const loginButton = document.querySelector("#loginButton");

    signupButton.addEventListener('click', (e) => {
        e.preventDefault();
        $("#errorMessage").text('');
        createSignupWindow(csrf);
        return false;
    });

    loginButton.addEventListener('click', (e) => {
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
    sendAjax('GET', '/getToken', null, true, (response) => {
        setup(response.csrfToken);
    }); 
};

$(document).ready(init);