/**
 * TU Sathi
 * Document Viewer
 */

document.addEventListener("DOMContentLoaded", () => {
    initViewer();
});


function isSafePdfUrl(urlStr) {
    if (!urlStr || typeof urlStr !== 'string') return false;
    const trimmed = urlStr.trim();
    if (/^(javascript|data|vbscript|file):/i.test(trimmed)) {
        return false;
    }
    try {
        const parsed = new URL(trimmed, window.location.href);
        const isAllowedOrigin = (parsed.origin === window.location.origin) ||
                                (parsed.hostname === 'localhost' && parsed.port === '5000') ||
                                (parsed.hostname === '127.0.0.1' && parsed.port === '5000');
        if (!isAllowedOrigin) return false;
        const pathname = parsed.pathname.toLowerCase();
        return pathname.endsWith('.pdf') || pathname.startsWith('/uploads/') || pathname.startsWith('/api/resources/');
    } catch {
        return false;
    }
}

function initViewer() {

    const params = new URLSearchParams(window.location.search);

    const file = params.get("file");
    const title = params.get("title");

    const viewer = document.querySelector("[data-pdf-viewer]");
    const documentTitle =
        document.querySelector("[data-document-title]");


    // -----------------------------------------
    // Check viewer
    // -----------------------------------------

    if (!viewer) {

        console.error(
            "TU Sathi: PDF viewer not found."
        );

        return;
    }


    // -----------------------------------------
    // No file provided
    // -----------------------------------------

    if (!file) {

        console.warn(
            "TU Sathi: No PDF file provided."
        );

        if (documentTitle) {

            documentTitle.textContent =
                "Select a document";

        }

        return;
    }


    // -----------------------------------------
    // Decode PDF path & Validate
    // -----------------------------------------

    const pdfPath = decodeURIComponent(file);

    if (!isSafePdfUrl(pdfPath)) {
        console.error("TU Sathi: Blocked potentially malicious or invalid document URL:", pdfPath);
        if (documentTitle) {
            documentTitle.textContent = "Invalid Document URL";
        }
        return;
    }

    console.log(
        "TU Sathi PDF:",
        pdfPath
    );


    // -----------------------------------------
    // Load PDF
    // -----------------------------------------

    const cleanPdf = String(pdfPath).split("#")[0];
    viewer.src = cleanPdf + "#toolbar=0&navpanes=0&scrollbar=0";


    // -----------------------------------------
    // Set document title
    // -----------------------------------------

    if (documentTitle) {

        if (title) {

            documentTitle.textContent =
                decodeURIComponent(title);

        } else {

            const fileName =
                pdfPath
                    .split("/")
                    .pop()
                    .replace(/\.pdf$/i, "")
                    .replace(/[-_]+/g, " ");

            documentTitle.textContent =
                fileName;

        }

    }


    // -----------------------------------------
    // Browser page title
    // -----------------------------------------

    if (title) {

        document.title =
            `${decodeURIComponent(title)} | TU Sathi`;

    }

}


/* ==================================================
   Resource List
   ================================================== */

function setupResourceLinks() {

    const resourceLinks =
        document.querySelectorAll("[data-resource]");

    const viewer =
        document.querySelector("[data-pdf-viewer]");

    const documentTitle =
        document.querySelector("[data-document-title]");


    if (!viewer) {
        return;
    }


    resourceLinks.forEach(link => {

        link.addEventListener("click", event => {

            event.preventDefault();


            // Remove active state

            resourceLinks.forEach(item => {

                item.classList.remove("active");

            });


            // Add active state

            link.classList.add("active");


            // Get PDF path

            const file =
                link.dataset.resource;


            if (!file) {
                return;
            }


            // Load PDF

            const cleanFile = String(file).split("#")[0];
            viewer.src = cleanFile + "#toolbar=0&navpanes=0&scrollbar=0";


            // Update title

            if (documentTitle) {

                documentTitle.textContent =
                    link.dataset.title ||
                    link.textContent.trim();

            }

        });

    });

}


/* ==================================================
   Initialize Resource Links & View-Only Protection
   ================================================== */

document.addEventListener("DOMContentLoaded", () => {

    setupResourceLinks();

    // Prevent right-click on the document viewing area
    document.addEventListener("contextmenu", (e) => {
        if (e.target.closest(".pdf-frame") || e.target.closest("[data-pdf-viewer]")) {
            e.preventDefault();
            return false;
        }
    });

    // Prevent Ctrl+S / Ctrl+P to prevent document saving/printing
    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S" || e.key === "p" || e.key === "P")) {
            e.preventDefault();
            return false;
        }
    });

});