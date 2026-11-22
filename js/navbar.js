/* Navigation behavior is centralised in app.js. */
function setupNavbar(){

    const menuButton=document.querySelector("[data-menu]");
    const menu=document.querySelector("#navMenu");

    if(!menuButton||!menu)return;

    menuButton.addEventListener("click",()=>{
        menu.classList.toggle("open");
    });

    document.addEventListener("click",event=>{

        if(
            !menu.contains(event.target)&&
            !menuButton.contains(event.target)
        ){
            menu.classList.remove("open");
        }

    });

}

function setActiveNavigation(){

    const currentPage=
    document.body.dataset.page;

    document.querySelectorAll(".nav-links a").forEach(link=>{

        link.classList.remove("active");

        if(link.dataset.page===currentPage){
            link.classList.add("active");
        }

    });

}

document.addEventListener("DOMContentLoaded",()=>{

    setupNavbar();

    setActiveNavigation();

});