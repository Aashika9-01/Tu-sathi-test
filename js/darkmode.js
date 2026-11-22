function loadSavedTheme(){

const savedTheme=
localStorage.getItem("studyhub-theme");

const icon=
document.querySelector(".theme-icon");


if(savedTheme==="dark"){

document.body.classList.add("dark");

}


if(icon){

icon.textContent=
document.body.classList.contains("dark")
?"☀"
:"☾";

}

}


function setupDarkMode(){

const button=
document.querySelector("[data-theme]");


const icon=
document.querySelector(".theme-icon");


if(!button)return;


button.addEventListener(
"click",
()=>{


document.body.classList.toggle("dark");


const isDark=
document.body.classList.contains("dark");


localStorage.setItem(
"studyhub-theme",
isDark?"dark":"light"
);


if(icon){

icon.textContent=
isDark?"☀":"☾";

}


}
);


}


document.addEventListener(
"DOMContentLoaded",
()=>{

loadSavedTheme();

setupDarkMode();

}
);