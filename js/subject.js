// ============================================================
// TU SATHI - SUBJECT PAGE
// MongoDB / Node.js API + Browser Cache
// ============================================================

// ============================================================
// API CONFIG
// ============================================================

// LOCAL & NETWORK DEVELOPMENT
const API_HOST = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
const API_BASE = "http://" + API_HOST + ":5000/api";
const FILE_BASE = "http://" + API_HOST + ":5000";

// ============================================================
// IMPORTANT
// ============================================================
// Production मा website host गर्दा माथिका दुई URL लाई
// आफ्नो deployed backend URL ले replace गर्नुहोस्.
//
// Example:
// const API_BASE = "https://your-backend.onrender.com/api";
// const FILE_BASE = "https://your-backend.onrender.com";


// ============================================================
// LOAD SUBJECT PAGE
// ============================================================

async function loadSubjectPage() {

    const params = new URLSearchParams(
        window.location.search
    );

    const courseId = params.get("course");
    const semester = params.get("semester");
    const subjectId = params.get("subject");
    const tab = params.get("tab") || "notes";

    console.log("=================================");
    console.log("TU SATHI SUBJECT PAGE");
    console.log("Course ID:", courseId);
    console.log("Semester:", semester);
    console.log("Subject ID:", subjectId);
    console.log("Tab:", tab);
    console.log("=================================");

    // ========================================================
    // URL CHECK
    // ========================================================

    if (!courseId || !semester || !subjectId) {

        console.error(
            "Course, semester or subject missing."
        );

        showEmptyState(
            "Invalid subject URL."
        );

        return;
    }

    // ========================================================
    // UPDATE TABS
    // ========================================================

    updateTabs(
        courseId,
        semester,
        subjectId,
        tab
    );

    // ========================================================
    // INITIAL LOADING
    // ========================================================

    setInitialLoading();

    // ========================================================
    // LOAD DATA
    // ========================================================

    await loadSubjectData(
        courseId,
        semester,
        subjectId,
        tab
    );
}


// ============================================================
// INITIAL LOADING
// ============================================================

function setInitialLoading() {

    const subjectName =
        document.querySelector(
            "[data-subject-name]"
        );

    const courseName =
        document.querySelector(
            "[data-course-name]"
        );

    const periodName =
        document.querySelector(
            "[data-period-name]"
        );

    const description =
        document.querySelector(
            "[data-subject-description]"
        );

    if (subjectName) {

        subjectName.textContent =
            "Loading Subject...";

    }

    if (courseName) {

        courseName.textContent =
            "Loading...";

    }

    if (periodName) {

        periodName.textContent =
            "Loading...";

    }

    if (description) {

        description.textContent =
            "Loading subject information...";

    }
}


// ============================================================
// UPDATE TABS
// ============================================================

function updateTabs(
    courseId,
    semester,
    subjectId,
    activeTab
) {

    document
        .querySelectorAll("[data-tab]")
        .forEach(button => {

            const tab =
                button.dataset.tab;

            button.classList.toggle(
                "active",
                tab === activeTab
            );

            button.setAttribute(
                "aria-selected",
                tab === activeTab
                    ? "true"
                    : "false"
            );

            button.onclick = function () {

                const url =
                    `subject.html?course=${encodeURIComponent(courseId)}` +
                    `&semester=${encodeURIComponent(semester)}` +
                    `&subject=${encodeURIComponent(subjectId)}` +
                    `&tab=${encodeURIComponent(tab)}`;

                window.location.href = url;
            };

        });
}


// ============================================================
// LOAD SUBJECT DATA
// ============================================================

async function loadSubjectData(
    courseId,
    semester,
    subjectId,
    tab
) {

    let course = null;
    let subject = null;

    // ========================================================
    // CACHE KEYS
    // ========================================================

    const courseCacheKey =
        `tu_sathi_course_${courseId}`;

    const subjectCacheKey =
        `tu_sathi_subject_${subjectId}`;

    // ========================================================
    // LOAD COURSE FROM API
    // ========================================================

    try {

        const courseURL =
            `${API_BASE}/courses`;

        console.log(
            "COURSE API:",
            courseURL
        );

        const response =
            await fetch(
                courseURL,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `Courses API returned ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "COURSES RESPONSE:",
            data
        );

        const courses =
            extractArray(
                data,
                ["courses"]
            );

        course =
            courses.find(item => {

                const id =
                    String(
                        item._id ||
                        item.id ||
                        ""
                    );

                return (
                    id ===
                    String(courseId)
                );

            });

        console.log(
            "MATCHED COURSE:",
            course
        );

        // ====================================================
        // SAVE COURSE TO BROWSER CACHE
        // ====================================================

        if (course) {

            saveCache(
                courseCacheKey,
                course
            );

        }

    } catch (error) {

        console.error(
            "COURSE API ERROR:",
            error
        );

        // ====================================================
        // LOAD COURSE FROM CACHE
        // ====================================================

        course =
            getCache(
                courseCacheKey
            );

        if (course) {

            console.log(
                "Course loaded from browser cache."
            );

        }

    }


    // ========================================================
    // LOAD SUBJECT FROM API
    // ========================================================

    try {

        const subjectURL =
            `${API_BASE}/subjects`;

        console.log(
            "SUBJECT API:",
            subjectURL
        );

        const response =
            await fetch(
                subjectURL,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `Subjects API returned ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "SUBJECTS RESPONSE:",
            data
        );

        const subjects =
            extractArray(
                data,
                ["subjects"]
            );

        subject =
            subjects.find(item => {

                const id =
                    String(
                        item._id ||
                        item.id ||
                        ""
                    );

                if (
                    id !==
                    String(subjectId)
                ) {

                    return false;

                }

                // ============================================
                // COURSE ID
                // ============================================

                let itemCourseId = "";

                if (
                    item.courseId &&
                    typeof item.courseId === "object"
                ) {

                    itemCourseId =
                        String(
                            item.courseId._id ||
                            item.courseId.id ||
                            ""
                        );

                } else {

                    itemCourseId =
                        String(
                            item.courseId ||
                            ""
                        );

                }

                // ============================================
                // SEMESTER
                // ============================================

                const itemSemester =
                    Number(
                        item.semester ??
                        item.level ??
                        item.period ??
                        0
                    );

                // ============================================
                // COURSE MATCH
                // ============================================

                const courseMatches =
                    !itemCourseId ||
                    itemCourseId ===
                    String(courseId);

                // ============================================
                // SEMESTER MATCH
                // ============================================

                const semesterMatches =
                    !itemSemester ||
                    itemSemester ===
                    Number(semester);

                return (
                    courseMatches &&
                    semesterMatches
                );

            });

        console.log(
            "MATCHED SUBJECT:",
            subject
        );

        // ====================================================
        // SAVE SUBJECT TO CACHE
        // ====================================================

        if (subject) {

            saveCache(
                subjectCacheKey,
                subject
            );

        }

    } catch (error) {

        console.error(
            "SUBJECT API ERROR:",
            error
        );

        // ====================================================
        // LOAD SUBJECT FROM CACHE
        // ====================================================

        subject =
            getCache(
                subjectCacheKey
            );

        if (subject) {

            console.log(
                "Subject loaded from browser cache."
            );

        }

    }


    // ========================================================
    // UPDATE SUBJECT INFORMATION
    // ========================================================

    if (subject) {

        updateSubjectInformation(
            subject,
            course,
            semester
        );

    } else {

        console.warn(
            "Subject not found in API or browser cache."
        );

        showFallbackSubject(
            course,
            semester
        );

    }


    // ========================================================
    // LOAD RESOURCES
    // ========================================================

    await loadResources(
        courseId,
        semester,
        subjectId,
        tab
    );
}


// ============================================================
// EXTRACT ARRAY
// ============================================================

function extractArray(
    data,
    possibleKeys = []
) {

    // Direct array
    if (Array.isArray(data)) {

        return data;

    }

    // Example:
    // { courses: [] }

    for (
        const key of possibleKeys
    ) {

        if (
            data &&
            Array.isArray(
                data[key]
            )
        ) {

            return data[key];

        }

    }

    // Example:
    // { data: [] }

    if (
        data &&
        data.data
    ) {

        if (
            Array.isArray(
                data.data
            )
        ) {

            return data.data;

        }

        for (
            const key of possibleKeys
        ) {

            if (
                Array.isArray(
                    data.data[key]
                )
            ) {

                return data.data[key];

            }

        }

    }

    return [];
}


// ============================================================
// UPDATE SUBJECT INFORMATION
// ============================================================

function updateSubjectInformation(
    subject,
    course,
    semester
) {

    const subjectName =
        document.querySelector(
            "[data-subject-name]"
        );

    const subjectDescription =
        document.querySelector(
            "[data-subject-description]"
        );

    const courseName =
        document.querySelector(
            "[data-course-name]"
        );

    const periodName =
        document.querySelector(
            "[data-period-name]"
        );

    // ========================================================
    // SUBJECT NAME
    // ========================================================

    if (subjectName) {

        subjectName.textContent =
            subject.name ||
            subject.title ||
            "Subject";

    }

    // ========================================================
    // DESCRIPTION
    // ========================================================

    if (subjectDescription) {

        subjectDescription.textContent =
            subject.description ||
            "Study resources available.";

    }

    // ========================================================
    // COURSE NAME
    // ========================================================

    if (courseName) {

        let name =
            "Course";

        if (course) {

            name =
                course.name ||
                course.title ||
                "Course";

        }

        if (
            name === "Course" &&
            subject.courseId &&
            typeof subject.courseId === "object"
        ) {

            name =
                subject.courseId.name ||
                "Course";

        }

        courseName.textContent =
            name;

    }

    // ========================================================
    // SEMESTER / YEAR
    // ========================================================

    if (periodName) {

        const structureType =
            String(
                course?.structureType ||
                "semester"
            )
            .trim()
            .toLowerCase();

        const semesterNumber =
            Number(semester);

        if (
            structureType === "yearly" ||
            structureType === "year"
        ) {

            periodName.textContent =
                `${semesterNumber}${getOrdinal(semesterNumber)} Year`;

        } else {

            periodName.textContent =
                `${semesterNumber}${getOrdinal(semesterNumber)} Semester`;

        }

    }

    // ========================================================
    // PAGE TITLE
    // ========================================================

    document.title =
        `${subject.name || "Subject"} | TU Sathi`;
}


// ============================================================
// FALLBACK SUBJECT
// ============================================================

function showFallbackSubject(
    course,
    semester
) {

    const subjectName =
        document.querySelector(
            "[data-subject-name]"
        );

    const courseName =
        document.querySelector(
            "[data-course-name]"
        );

    const periodName =
        document.querySelector(
            "[data-period-name]"
        );

    const description =
        document.querySelector(
            "[data-subject-description]"
        );

    if (subjectName) {

        subjectName.textContent =
            "Subject";

    }

    if (courseName) {

        courseName.textContent =
            course?.name ||
            "Course";

    }

    if (periodName) {

        const number =
            Number(semester);

        periodName.textContent =
            `${number}${getOrdinal(number)} Semester`;

    }

    if (description) {

        description.textContent =
            "Study resources available.";

    }
}


// ============================================================
// LOAD RESOURCES
// ============================================================

async function loadResources(
    courseId,
    semester,
    subjectId,
    tab
) {

    const list =
        document.querySelector(
            "[data-resource-list]"
        );

    const title =
        document.querySelector(
            "[data-list-title]"
        );

    if (!list) {

        console.error(
            "data-resource-list not found."
        );

        return;

    }

    // ========================================================
    // TITLE
    // ========================================================

    if (title) {

        if (tab === "papers") {

            title.textContent =
                "Final Board Papers";

        } else if (
            tab === "syllabus"
        ) {

            title.textContent =
                "Syllabus";

        } else {

            title.textContent =
                "Notes";

        }

    }

    // ========================================================
    // LOADING
    // ========================================================

    list.innerHTML = `
        <div class="loading">
            Loading documents...
        </div>
    `;

    // ========================================================
    // CACHE KEY
    // ========================================================

    const resourceCacheKey =
        `tu_sathi_resources_${courseId}_${semester}_${subjectId}_${tab}`;

    try {

        // ====================================================
        // RESOURCE API
        // ====================================================

        const url =
            `${API_BASE}/resources/filter` +
            `?courseId=${encodeURIComponent(courseId)}` +
            `&semester=${encodeURIComponent(semester)}` +
            `&subjectId=${encodeURIComponent(subjectId)}` +
            `&type=${encodeURIComponent(tab)}`;

        console.log(
            "RESOURCE API:",
            url
        );

        const response =
            await fetch(
                url,
                {
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                `Resources API returned ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "RESOURCE API RESPONSE:",
            data
        );

        const resources =
            extractArray(
                data,
                ["resources"]
            );

        console.log(
            "RESOURCES FOUND:",
            resources
        );

        // ====================================================
        // SAVE RESOURCES TO CACHE
        // ====================================================

        if (resources.length) {

            saveCache(
                resourceCacheKey,
                resources
            );

        }

        // ====================================================
        // DISPLAY
        // ====================================================

        renderResources(
            resources,
            list,
            resourceCacheKey
        );

    } catch (error) {

        console.error(
            "RESOURCE API ERROR:",
            error
        );

        // ====================================================
        // LOAD FROM CACHE
        // ====================================================

        const cachedResources =
            getCache(
                resourceCacheKey
            );

        if (
            cachedResources &&
            Array.isArray(cachedResources) &&
            cachedResources.length
        ) {

            console.log(
                "Resources loaded from browser cache."
            );

            renderResources(
                cachedResources,
                list,
                resourceCacheKey
            );

        } else {

            list.innerHTML = `
                <div class="loading">
                    Unable to load resources.
                </div>
            `;

            loadViewer(
                "",
                "Select a document"
            );

        }

    }
}


// ============================================================
// RENDER RESOURCES
// ============================================================

function renderResources(
    resources,
    list,
    cacheKey
) {

    // ========================================================
    // NO RESOURCES
    // ========================================================

    if (
        !resources ||
        !resources.length
    ) {

        list.innerHTML = `
            <div class="loading">
                No resources available.
            </div>
        `;

        loadViewer(
            "",
            "No document available."
        );

        return;

    }

    // ========================================================
    // RENDER
    // ========================================================

    list.innerHTML =
        resources
            .map(
                (
                    resource,
                    index
                ) => {

                    const fileUrl =
                        makeFileURL(
                            resource.filePath ||
                            resource.path ||
                            resource.file ||
                            ""
                        );

                    const resourceTitle =
                        resource.title ||
                        resource.name ||
                        resource.fileName ||
                        "Untitled Document";

                    return `
                        <a
                            href="#"
                            class="note ${
                                index === 0
                                    ? "active"
                                    : ""
                            }"
                            data-file="${escapeHTML(fileUrl)}"
                            data-title="${escapeHTML(resourceTitle)}"
                        >

                            <strong>
                                ${escapeHTML(resourceTitle)}
                            </strong>

                            ${
                                resource.createdAt
                                    ? `
                                        <small>
                                            ${escapeHTML(
                                                formatDate(
                                                    resource.createdAt
                                                )
                                            )}
                                        </small>
                                    `
                                    : ""
                            }

                        </a>
                    `;

                }
            )
            .join("");

    // ========================================================
    // CLICK EVENTS
    // ========================================================

    list
        .querySelectorAll(".note")
        .forEach(note => {

            note.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    list
                        .querySelectorAll(".note")
                        .forEach(item => {

                            item.classList.remove(
                                "active"
                            );

                        });

                    note.classList.add(
                        "active"
                    );

                    loadViewer(
                        note.dataset.file,
                        note.dataset.title
                    );

                }
            );

        });

    // ========================================================
    // OPEN FIRST DOCUMENT
    // ========================================================

    const first =
        resources[0];

    const firstFile =
        makeFileURL(
            first.filePath ||
            first.path ||
            first.file ||
            ""
        );

    loadViewer(
        firstFile,
        first.title ||
        first.name ||
        first.fileName ||
        "Document"
    );
}


// ============================================================
// TAB NAME
// ============================================================

function getTabName(tab) {

    if (tab === "papers") {

        return "final board papers";

    }

    if (tab === "syllabus") {

        return "syllabus";

    }

    return "notes";
}


// ============================================================
// MAKE FILE URL
// ============================================================

function makeFileURL(filePath) {

    if (!filePath) {

        return "";

    }

    let file =
        String(filePath).trim();

    // ========================================================
    // ALREADY FULL URL
    // ========================================================

    if (
        file.startsWith("http://") ||
        file.startsWith("https://")
    ) {

        return file;

    }

    // ========================================================
    // REMOVE LEADING SLASH
    // ========================================================

    file =
        file.replace(/^\/+/, "");

    // ========================================================
    // UPLOADS
    // ========================================================

    if (
        file.startsWith("uploads/")
    ) {

        return `${FILE_BASE}/${file}`;

    }

    // ========================================================
    // BACKEND/UPLOADS
    // ========================================================

    if (
        file.startsWith("Backend/uploads/")
    ) {

        file =
            file.replace(
                /^Backend\/+/,
                ""
            );

        return `${FILE_BASE}/${file}`;

    }

    // ========================================================
    // FALLBACK
    // ========================================================

    return `${FILE_BASE}/${file}`;
}


// ============================================================
// PDF VIEWER
// ============================================================

function loadViewer(
    file,
    title
) {

    const iframe =
        document.querySelector(
            "[data-pdf-viewer]"
        );

    const viewerTitle =
        document.querySelector(
            "[data-viewer-title]"
        );

    if (viewerTitle) {

        viewerTitle.textContent =
            title ||
            "Select a document";

    }

    if (!iframe) {

        console.error(
            "PDF viewer iframe not found."
        );

        return;

    }

    if (!file) {
        iframe.src = "";
        return;
    }

    const cleanFile = String(file).split("#")[0];
    iframe.src =
        cleanFile +
        "#toolbar=0&navpanes=0&scrollbar=0";
}


// ============================================================
// EMPTY STATE
// ============================================================

function showEmptyState(
    message
) {

    const list =
        document.querySelector(
            "[data-resource-list]"
        );

    if (list) {

        list.innerHTML = `
            <div class="loading">
                ${escapeHTML(message)}
            </div>
        `;

    }

    loadViewer(
        "",
        "No document available."
    );
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

    if (!value) {

        return "";

    }

    try {

        return new Date(
            value
        ).toLocaleDateString();

    } catch (error) {

        return String(value);

    }
}


// ============================================================
// ORDINAL
// ============================================================

function getOrdinal(number) {

    const n =
        Number(number);

    if (n === 1) {

        return "st";

    }

    if (n === 2) {

        return "nd";

    }

    if (n === 3) {

        return "rd";

    }

    return "th";
}


// ============================================================
// ESCAPE HTML
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


// ============================================================
// BROWSER CACHE
// ============================================================

// Save data permanently in this browser
function saveCache(
    key,
    data
) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

        console.log(
            "CACHE SAVED:",
            key
        );

    } catch (error) {

        console.error(
            "CACHE SAVE ERROR:",
            error
        );

    }
}


// ============================================================
// GET CACHE
// ============================================================

function getCache(key) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) {

            return null;

        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "CACHE READ ERROR:",
            error
        );

        return null;

    }
}


// ============================================================
// START
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
    loadSubjectPage();

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