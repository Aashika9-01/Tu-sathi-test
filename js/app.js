/**
 * =========================================================
 * TU Sathi
 * Global Application
 * =========================================================
 */

const page =
    document.body.dataset.page || "home";


/* =========================================================
   Component Loader
   ========================================================= */

/**
 * Load an HTML component into one or more elements.
 *
 * @param {string} selector
 * @param {string} file
 */
async function loadComponent(selector, file) {

    const elements =
        document.querySelectorAll(selector);

    if (!elements.length) {
        return;
    }

    try {

        const response =
            await fetch(file);

        if (!response.ok) {

            throw new Error(
                `Failed loading ${file}: ${response.status}`
            );

        }

        const html =
            await response.text();

        elements.forEach(element => {

            element.innerHTML = html;

        });

    } catch (error) {

        console.error(
            `TU Sathi Component Error: ${error.message}`
        );

    }

}


/* =========================================================
   Navbar
   ========================================================= */

async function loadNavbar() {

    /*
     * IMPORTANT:
     * Navbar must load navbar.html.
     *
     * Previously footer.html was being loaded here,
     * which caused the footer to appear where navbar
     * should have been.
     */

    await loadComponent(
        "[data-header]",
        "components/navbar.html"
    );

    setupNavbar();

}


/* =========================================================
   Navbar Setup
   ========================================================= */

function setupNavbar() {

    const menuButton =
        document.querySelector("[data-menu]");

    const navMenu =
        document.querySelector("#navMenu");


    /* =====================================================
       Mobile Menu
       ===================================================== */

    if (menuButton && navMenu) {

        menuButton.addEventListener(
            "click",
            () => {

                navMenu.classList.toggle("open");

                const isOpen =
                    navMenu.classList.contains("open");

                menuButton.setAttribute(
                    "aria-expanded",
                    String(isOpen)
                );

            }
        );

    }


    /* =====================================================
       Active Navigation
       ===================================================== */

    setActiveNav();

}


/* =========================================================
   Active Navigation
   ========================================================= */

function setActiveNav() {

    let currentPage =
        location.pathname
            .split("/")
            .pop();


    if (!currentPage) {

        currentPage =
            "index.html";

    }


    document
        .querySelectorAll(".nav-links a")
        .forEach(link => {

            const href =
                link.getAttribute("href");


            if (!href) {
                return;
            }


            /*
             * Remove query parameters
             * when comparing URLs.
             */

            const cleanHref =
                href.split("?")[0];


            /*
             * Remove possible hash.
             */

            const cleanPage =
                cleanHref.split("#")[0];


            if (cleanPage === currentPage) {

                link.classList.add("active");

            } else {

                link.classList.remove("active");

            }

        });

}


/* =========================================================
   Footer
   ========================================================= */

async function loadFooter() {

    await loadComponent(
        "[data-footer]",
        "components/footer.html"
    );

}


/* =========================================================
   Theme
   ========================================================= */

function setupTheme() {

    const themeButton =
        document.querySelector("[data-theme]");

    const icon =
        themeButton?.querySelector(".theme-icon");


    /* =====================================================
       Apply Saved Theme
       ===================================================== */

    const savedTheme =
        localStorage.getItem(
            "studyhub-theme"
        );


    if (savedTheme === "dark") {

        document.documentElement
            .classList.add("dark");

        document.body
            .classList.add("dark");

    } else {

        document.documentElement
            .classList.remove("dark");

        document.body
            .classList.remove("dark");

    }


    /* =====================================================
       Remove Loading Class
       ===================================================== */

    document.documentElement
        .classList.remove("dark-loading");


    /* =====================================================
       Update Theme Icon
       ===================================================== */

    function updateIcon() {

        if (!icon) {
            return;
        }


        const dark =
            document.body
                .classList
                .contains("dark");


        icon.textContent =
            dark ? "☀" : "☾";

    }


    updateIcon();


    /* =====================================================
       No Theme Button
       ===================================================== */

    if (!themeButton) {
        return;
    }


    /* =====================================================
       Theme Toggle
       ===================================================== */

    themeButton.addEventListener(
        "click",
        () => {

            const dark =
                document.body
                    .classList
                    .contains("dark");


            if (dark) {

                document.documentElement
                    .classList
                    .remove("dark");

                document.body
                    .classList
                    .remove("dark");

                localStorage.setItem(
                    "studyhub-theme",
                    "light"
                );

            } else {

                document.documentElement
                    .classList
                    .add("dark");

                document.body
                    .classList
                    .add("dark");

                localStorage.setItem(
                    "studyhub-theme",
                    "dark"
                );

            }


            updateIcon();

        }
    );

}


/* =========================================================
   Copy Buttons
   ========================================================= */

function setupCopyButtons() {

    document
        .querySelectorAll("[data-copy]")
        .forEach(button => {

            button.addEventListener(
                "click",
                async () => {

                    const value =
                        button.dataset.copy;


                    if (!value) {
                        return;
                    }


                    try {

                        await navigator
                            .clipboard
                            .writeText(value);


                        const oldText =
                            button.textContent;


                        button.textContent =
                            "Copied ✓";


                        setTimeout(
                            () => {

                                button.textContent =
                                    oldText;

                            },
                            1500
                        );


                    } catch (error) {

                        console.error(
                            "Copy failed:",
                            error
                        );

                    }

                }
            );

        });

}


/* =========================================================
   Breadcrumb
   ========================================================= */

function setupBreadcrumb() {

    const breadcrumb =
        document.querySelector(
            "[data-breadcrumb]"
        );


    if (!breadcrumb) {
        return;
    }


    const params =
        new URLSearchParams(
            location.search
        );


    const course =
        params.get("course");

    const semester =
        params.get("semester");

    const subject =
        params.get("subject");


    const items = [

        {
            name: "Home",
            link: "index.html"
        }

    ];


    /* =====================================================
       Course
       ===================================================== */

    if (course) {

        items.push({

            name: formatText(course),

            link:
                `course.html?course=${encodeURIComponent(course)}`

        });

    }


    /* =====================================================
       Semester
       ===================================================== */

    if (semester) {

        items.push({

            name: formatText(semester),

            link:
                `semester.html?course=${encodeURIComponent(course || "")}&semester=${encodeURIComponent(semester)}`

        });

    }


    /* =====================================================
       Subject
       ===================================================== */

    if (subject) {

        items.push({

            name: formatText(subject),

            link: null

        });

    }


    /* =====================================================
       Render Breadcrumb
       ===================================================== */

    breadcrumb.innerHTML =
        items
            .map((item, index) => {

                const divider =
                    index > 0
                        ? `<span class="breadcrumb-divider" aria-hidden="true">›</span>`
                        : "";

                const safeName =
                    escapeHTML(item.name);

                const safeLink =
                    item.link
                        ? encodeURI(item.link)
                        : null;

                const content =
                    safeLink
                        ? `<a href="${safeLink}">${safeName}</a>`
                        : `<span>${safeName}</span>`;


                return `
                    ${divider}
                    ${content}
                `;

            })
            .join("");

}


/* =========================================================
   Escape HTML Helper
   ========================================================= */

function escapeHTML(str) {

    if (!str) {
        return "";
    }

    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================================================
   Format Text
   ========================================================= */

function formatText(text) {

    if (!text) {
        return "";
    }


    return text
        .replaceAll("-", " ")
        .replaceAll("_", " ")
        .replace(
            /\b\w/g,
            char => char.toUpperCase()
        );

}


/* =========================================================
   Get Query Parameter
   ========================================================= */

function getQueryParam(name) {

    const params =
        new URLSearchParams(
            location.search
        );


    return params.get(name);

}


/* =========================================================
   Page Title
   ========================================================= */

function setupPageTitle() {

    const title =
        document.querySelector(
            "[data-page-title]"
        );


    if (!title) {
        return;
    }


    const course =
        getQueryParam("course");

    const subject =
        getQueryParam("subject");

    const semester =
        getQueryParam("semester");


    /* =====================================================
       Subject Page
       ===================================================== */

    if (subject) {

        title.textContent =
            `${formatText(subject)} | TU Sathi`;

        return;

    }


    /* =====================================================
       Semester Page
       ===================================================== */

    if (semester) {

        title.textContent =
            `${formatText(semester)} | TU Sathi`;

        return;

    }


    /* =====================================================
       Course Page
       ===================================================== */

    if (course) {

        title.textContent =
            `${formatText(course)} | TU Sathi`;

    }

}


/* =========================================================
   Loading State
   ========================================================= */

function showLoading(element) {

    if (!element) {
        return;
    }


    element.innerHTML = `
        <div class="loading-state">
            <span>Loading...</span>
        </div>
    `;

}


/* =========================================================
   Empty State
   ========================================================= */

function showEmpty(
    element,
    message = "No content available."
) {

    if (!element) {
        return;
    }


    element.innerHTML = `
        <div class="empty-state">
            <p>${message}</p>
        </div>
    `;

}


/* =========================================================
   Subscribe
   ========================================================= */

function setupSubscribe() {

    const subscribeForm =
        document.getElementById("subscribeForm");

    const subscriberEmail =
        document.getElementById("subscriberEmail");

    const subscribeButton =
        document.getElementById("subscribeButton");

    const subscribeMessage =
        document.getElementById("subscribeMessage");


    /*
     * Footer load नभएको page भए
     * function यतिमै stop हुन्छ।
     */

    if (!subscribeForm) {
        return;
    }


    subscribeForm.addEventListener(
        "submit",
        async (e) => {

            e.preventDefault();


            const email =
                subscriberEmail.value.trim();


            /* =================================================
               Validate Email
               ================================================= */

            if (!email) {

                subscribeMessage.textContent =
                    "Please enter your email.";

                subscriberEmail.focus();

                return;

            }


            /*
             * Basic email validation
             */

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailPattern.test(email)) {

                subscribeMessage.textContent =
                    "Please enter a valid email.";

                subscriberEmail.focus();

                return;

            }


            /* =================================================
               Disable Button
               ================================================= */

            subscribeButton.disabled = true;

            subscribeMessage.textContent =
                "Subscribing...";


            try {

                /* =============================================
                   Send Email To Node.js Backend
                   ============================================= */

                const apiHost = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
                const response =
                    await fetch(
                        "http://" + apiHost + ":5000/api/subscribers",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    email: email
                                })
                        }
                    );


                /* =============================================
                   Read Backend Response
                   ============================================= */

                const data =
                    await response.json();


                console.log(
                    "[SUBSCRIBER RESPONSE]",
                    data
                );


                /* =============================================
                   Success
                   ============================================= */

                if (
                    response.ok &&
                    data.success
                ) {

                    subscribeMessage.textContent =
                        "Subscribed successfully!";

                    subscribeForm.reset();

                }


                /* =============================================
                   Error From Backend
                   ============================================= */

                else {

                    subscribeMessage.textContent =
                        data.message ||
                        "Subscription failed.";

                }


            } catch (error) {

                console.error(
                    "[SUBSCRIBE ERROR]",
                    error
                );


                subscribeMessage.textContent =
                    "Unable to connect to server.";

            }


            /* =================================================
               Enable Button Again
               ================================================= */

            finally {

                subscribeButton.disabled = false;

            }

        }
    );

}


/* =========================================================
   Global Initialization
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        /*
         * =================================================
         * Load shared components first.
         * =================================================
         */

        await loadNavbar();

        await loadFooter();


        /*
         * =================================================
         * IMPORTANT:
         * Footer माथि load भएपछि मात्र subscribe setup
         * गर्ने।
         * =================================================
         */

        setupSubscribe();


        /*
         * =================================================
         * Global functionality.
         * =================================================
         */

        setupTheme();

        setupCopyButtons();

        setupBreadcrumb();

        setupPageTitle();

        setupSecretAdminAccess();

    }
);


/* =========================================================
   Secret Admin Portal Access (Ctrl + Shift + A or 3-click copyright)
   ========================================================= */

function setupSecretAdminAccess() {

    // 1. Secret Keyboard Shortcut: Ctrl + Shift + A (or Alt + Shift + A)
    window.addEventListener("keydown", function(event) {
        if (
            (event.ctrlKey || event.altKey) &&
            event.shiftKey &&
            (event.key === "A" || event.key === "a")
        ) {
            event.preventDefault();
            window.location.href = "tu-secure-admin.html";
        }
    });

    // 2. Secret Hidden Gesture: 3 rapid clicks on footer copyright
    let clickCount = 0;
    let clickTimer = null;

    document.addEventListener("click", function(event) {
        const copyrightEl = event.target.closest(".copyright");
        if (copyrightEl) {
            clickCount++;
            clearTimeout(clickTimer);
            if (clickCount >= 3) {
                clickCount = 0;
                window.location.href = "tu-secure-admin.html";
            } else {
                clickTimer = setTimeout(function() {
                    clickCount = 0;
                }, 1000);
            }
        }
    });
}


/* =========================================================
   Global TU Sathi Namespace
   ========================================================= */

window.TUSathi = {

    getQueryParam,

    formatText,

    showLoading,

    showEmpty

};