"use strict"

// toggles dark mode on/off
const toggleDarkMode = () => {
    let checkbox = document.querySelector("#darkModeCheckbox");

    let body = document.body;
    let nav = document.querySelector("#nav");
    let errorContent = document.querySelector("#errorContent");

    checkbox.addEventListener('change', () => {
        // dark mode styles
        if(checkbox.checked){
            body.style.backgroundColor = "rgb(20,29,38)";
            body.style.color = "white";
            nav.style.backgroundColor = "rgb(36,52,71)";

            if(errorContent) errorContent.style.backgroundColor = "rgb(20,29,38)";
        }
        // light mode styles
        else{
            body.style.backgroundColor = "rgb(230, 236, 240)";
            body.style.color = "black";
            nav.style.backgroundColor = "white";

            if(errorContent) errorContent.style.backgroundColor = "rgb(230, 236, 240)";
        }
    });
};

const init = () => {
    toggleDarkMode();
};

$(document).ready(init);