/* =========================================================
   ANNOUNCEMENTS.JS
   TU Sathi
   MongoDB API ONLY
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    loadAnnouncements();
});


async function loadAnnouncements() {

    const container = document.querySelector(".announcement-list");

    if (!container) {
        console.error("Announcement container not found.");
        return;
    }


    /* =====================================================
       IMPORTANT:
       Remove EVERYTHING that may already be inside
       announcement-list.
    ===================================================== */

    container.replaceChildren();


    try {
        const apiHost = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
        const response = await fetch(
            "http://" + apiHost + ":5000/api/notices",
            {
                method: "GET",
                cache: "no-store"
            }
        );


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );

        }


        const data = await response.json();


        console.log(
            "TU SATHI NOTICE API:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message || "Failed to load notices."
            );

        }


        const notices = Array.isArray(data.notices)
            ? data.notices
            : [];


        /* =================================================
           NO NOTICES
        ================================================= */

        if (notices.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <h3>No announcements yet.</h3>
                    <p>
                        New TU Sathi notices will appear here.
                    </p>
                </div>
            `;

            return;
        }


        /* =================================================
           SORT NEWEST FIRST
        ================================================= */

        notices.sort((a, b) => {

            return (
                new Date(b.createdAt || b.date || 0) -
                new Date(a.createdAt || a.date || 0)
            );

        });


        /* =================================================
           CREATE CARDS ONLY FROM MONGODB DATA
        ================================================= */

        const fragment = document.createDocumentFragment();


        notices.forEach(notice => {

            const article =
                document.createElement("article");


            article.className =
                "panel announcement-card";


            article.setAttribute(
                "data-announcement",
                ""
            );


            article.setAttribute(
                "tabindex",
                "0"
            );


            article.setAttribute(
                "role",
                "button"
            );


            const title =
                notice.title || "Announcement";


            const description =
                notice.description || "";


            const link =
                notice.link || "";


            const date =
                notice.date ||
                notice.createdAt ||
                "";


            const parsedDate =
                new Date(date);


            let dateLabel = date;


            if (!Number.isNaN(parsedDate.getTime())) {

                dateLabel =
                    parsedDate
                        .toLocaleDateString(
                            "en-US",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric"
                            }
                        )
                        .toUpperCase();

            }


            article.setAttribute(
                "aria-label",
                `Open ${title}`
            );


            article.dataset.link =
                link;


            article.innerHTML = `

                <time
                    class="announcement-date"
                    datetime="${escapeAnnouncement(date)}"
                >
                    ${escapeAnnouncement(dateLabel)}
                </time>


                <div class="announcement-content">

                    <h2>
                        ${escapeAnnouncement(title)}
                    </h2>

                    <p>
                        ${escapeAnnouncement(description)}
                    </p>

                </div>


                <span
                    class="announcement-arrow"
                    aria-hidden="true"
                >
                    →
                </span>

            `;


            /* =================================================
               CLICK
            ================================================= */

            article.addEventListener(
                "click",
                () => {

                    if (!link) {

                        console.warn(
                            "Notice has no link:",
                            title
                        );

                        return;
                    }


                    window.open(
                        link,
                        "_blank",
                        "noopener,noreferrer"
                    );

                }
            );


            /* =================================================
               KEYBOARD
            ================================================= */

            article.addEventListener(
                "keydown",
                event => {

                    if (
                        event.key === "Enter" ||
                        event.key === " "
                    ) {

                        event.preventDefault();

                        if (!link) {
                            return;
                        }


                        window.open(
                            link,
                            "_blank",
                            "noopener,noreferrer"
                        );

                    }

                }
            );


            fragment.appendChild(article);

        });


        /* =================================================
           FINAL RENDER
           ONLY API DATA
        ================================================= */

        container.replaceChildren(fragment);


        console.log(
            "RENDERED NOTICE TITLES:",
            notices.map(notice => notice.title)
        );

    }


    catch (error) {

        console.error(
            "Announcement loading failed:",
            error
        );


        container.replaceChildren();


        container.innerHTML = `
            <div class="empty-state">
                <h3>
                    Unable to load announcements.
                </h3>

                <p>
                    Please try again later.
                </p>
            </div>
        `;

    }

}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeAnnouncement(value) {

    return String(value ?? "").replace(
        /[&<>"']/g,
        character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]
    );

}