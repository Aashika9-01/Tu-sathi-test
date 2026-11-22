/* Shared utility module reserved for backend integration. */
function getUrlParam(name){
    return new URLSearchParams(location.search).get(name);
}

function getOrdinal(number){
    if(number===1)return "st";
    if(number===2)return "nd";
    if(number===3)return "rd";
    return "th";
}

function formatTitle(text){
    if(!text)return "";

    return text
        .split("-")
        .map(word=>word.charAt(0).toUpperCase()+word.slice(1))
        .join(" ");
}

function showMessage(message,type="info"){

    const box=document.createElement("div");

    box.className=`message ${type}`;

    box.textContent=message;

    document.body.appendChild(box);

    setTimeout(()=>{

        box.remove();

    },3000);

}

function escapeHTML(value){

    if(!value)return "";

    return value
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;")
        .replace(/'/g,"&#039;");

}