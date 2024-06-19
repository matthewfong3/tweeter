"use strict";

// toggles dark mode on/off
const toggleDarkMode = () => {
  let checkbox = document.querySelector("#darkModeCheckbox");
  let body = document.body;
  let nav = document.querySelector("#nav");
  let errorContent = document.querySelector("#errorContent");
  checkbox.addEventListener('change', () => {
    // dark mode styles
    if (checkbox.checked) {
      body.style.backgroundColor = "rgb(20,29,38)";
      body.style.color = "white";
      nav.style.backgroundColor = "rgb(36,52,71)";
      if (errorContent) errorContent.style.backgroundColor = "rgb(20,29,38)";
    }
    // light mode styles
    else {
      body.style.backgroundColor = "rgb(230, 236, 240)";
      body.style.color = "black";
      nav.style.backgroundColor = "white";
      if (errorContent) errorContent.style.backgroundColor = "rgb(230, 236, 240)";
    }
  });
};
const init = () => {
  toggleDarkMode();
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
