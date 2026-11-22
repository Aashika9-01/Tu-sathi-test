/* Pagination placeholder for future data integration. */
function setupPagination(){

    const container=document.querySelector("[data-pagination]");

    const items=document.querySelectorAll("[data-page-item]");

    if(!container||!items.length)return;

    const perPage=10;

    let currentPage=1;

    const totalPages=Math.ceil(
        items.length/perPage
    );

    function render(){

        items.forEach((item,index)=>{

            const start=(currentPage-1)*perPage;

            const end=start+perPage;

            item.style.display=
            index>=start&&index<end
            ?""
            :"none";

        });

        container.innerHTML="";

        for(let i=1;i<=totalPages;i++){

            const button=document.createElement("button");

            button.textContent=i;

            button.className=
            i===currentPage
            ?"active"
            :"";

            button.onclick=()=>{

                currentPage=i;

                render();

            };

            container.appendChild(button);

        }

    }

    render();

}

document.addEventListener("DOMContentLoaded",()=>{

    setupPagination();

});