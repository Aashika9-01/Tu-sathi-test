/* Search is intentionally presentation-only in the frontend prototype. */
function setupSearch(){

    const searchInput=document.querySelector("[data-search]");

    const searchItems=document.querySelectorAll("[data-search-item]");

    if(!searchInput||!searchItems.length)return;

    searchInput.addEventListener("input",()=>{

        const value=
        searchInput.value.toLowerCase().trim();

        searchItems.forEach(item=>{

            const text=
            item.textContent.toLowerCase();

            item.style.display=
            text.includes(value)
            ?""
            :"none";

        });

    });

}

document.addEventListener("DOMContentLoaded",()=>{

    setupSearch();

});