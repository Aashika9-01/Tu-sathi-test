// ======================================================
// HOME PAGE COURSES
// MONGODB API + LOCAL STORAGE FALLBACK
// ======================================================

const API_HOST = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
const HOME_COURSES_API_URL =
    "http://" + API_HOST + ":5000/api/courses";

const HOME_COURSES_CACHE_KEY =
    "tu-sathi-home-courses-cache";


// ======================================================
// ======================================================
// DEFAULT COURSES FALLBACK
// ======================================================
const DEFAULT_COURSES = [
    { _id: "6a9c5098108d9c375a9a21f0", name: "BCA", subtitle: "Bachelor of Computer Application", description: "Computer application, software development and programming.", structureType: "semester", icon: "🎓" },
    { _id: "6a9c5de22ed8ff337fc68992", name: "BBS", subtitle: "Bachelor of Business Studies", description: "Business studies programme with academic resources and notes.", structureType: "semester", icon: "🏛" },
    { _id: "6a9c5de22ed8ff337fc68993", name: "BBA", subtitle: "Bachelor of Business Administration", description: "Business administration resources including notes and syllabus.", structureType: "semester", icon: "💼" },
    { _id: "6a9c5de22ed8ff337fc68994", name: "BSc CSIT", subtitle: "Bachelor of Science in CS & IT", description: "Computer science, networking, database and IT subjects.", structureType: "semester", icon: "⌨" },
    { _id: "6a9c5de22ed8ff337fc68995", name: "BIT", subtitle: "Bachelor of Information Technology", description: "Information technology notes, syllabus and examination resources.", structureType: "semester", icon: "⚙" },
    { _id: "6a9c5de22ed8ff337fc68996", name: "BSC", subtitle: "Bachelor of Science", description: "General Science courses including Physics, Chemistry and Math.", structureType: "semester", icon: "🎓" },
    { _id: "6a9c5de22ed8ff337fc68997", name: "BA", subtitle: "Bachelor of Arts", description: "Arts, humanities, sociology, English and Nepali literature.", structureType: "semester", icon: "🎓" },
    { _id: "6a9c5de22ed8ff337fc68998", name: "BIM", subtitle: "Bachelor of Information Management", description: "Integrated management and information technology studies.", structureType: "semester", icon: "🎓" },
    { _id: "6a9c5de22ed8ff337fc68999", name: "BHM", subtitle: "Bachelor of Hotel Management", description: "Hotel management, hospitality, culinary arts and tourism.", structureType: "semester", icon: "🏨" },
    { _id: "6aa3a60f5bf51638cc1882b5", name: "B.Ed", subtitle: "Bachelor of Education", description: "Educational theory, methodology, curriculum and pedagogy.", structureType: "yearly", icon: "📚" }
];

// ======================================================
// GET CACHED COURSES
// ======================================================

function getHomeCoursesCache() {

    try {

        const cached =
            localStorage.getItem(
                HOME_COURSES_CACHE_KEY
            );

        if (cached) {
            const courses = JSON.parse(cached);
            if (Array.isArray(courses) && courses.length > 0) {
                return courses;
            }
        }

    } catch (error) {

        console.error(
            "Home courses cache read failed:",
            error
        );

    }

    return DEFAULT_COURSES;
}


// ======================================================
// SAVE COURSES TO CACHE
// ======================================================

function saveHomeCoursesCache(courses) {

    try {

        localStorage.setItem(
            HOME_COURSES_CACHE_KEY,
            JSON.stringify(courses)
        );

        console.log(
            "Home courses saved to browser cache."
        );

    } catch (error) {

        console.error(
            "Home courses cache save failed:",
            error
        );
    }
}


// ======================================================
// RENDER HOME COURSES
// ======================================================

function renderHomeCourses(courses) {

    const courseTarget =
        document.querySelector(
            "[data-courses]"
        );

    if (!courseTarget) {
        return;
    }


    if (
        !Array.isArray(courses) ||
        courses.length === 0
    ) {

        courseTarget.innerHTML = `

            <div class="empty-state">

                <h3>
                    Courses are unavailable.
                </h3>

                <p>
                    Please try again later.
                </p>

            </div>

        `;

        return;
    }


    /*
     * Priority order for popular courses so primary
     * academic programs (BCA, BSc CSIT, BBA, BBS, BSC, BIT, etc.)
     * always appear prominently at the top.
     */
    const priority = [
        "bca",
        "bsc csit",
        "csit",
        "bba",
        "bbs",
        "bit",
        "bsc",
        "ba",
        "bim",
        "bhm",
        "bed",
        "b.ed"
    ];

    const sortedCourses = [...courses].sort((a, b) => {
        const nameA = String(a.name || "").trim().toLowerCase();
        const nameB = String(b.name || "").trim().toLowerCase();
        const idxA = priority.indexOf(nameA);
        const idxB = priority.indexOf(nameB);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return nameA.localeCompare(nameB);
    });

    // Display top 9 featured courses + 1 "More Courses" card (forms 2 neat rows in 5-col grid)
    const featuredCourses = sortedCourses.slice(0, 4);

    courseTarget.innerHTML =
        featuredCourses
            .map(course => {
                const courseId = course._id || course.id || course.name;

                let periodText = "Academic Program";
                if (course.structureType === "semester") {
                    periodText = "Semester Program";
                } else if (course.structureType === "yearly" || course.structureType === "year") {
                    periodText = "Yearly Program";
                } else if (course.subtitle) {
                    periodText = course.subtitle;
                }

                return `
                    <a
                        href="course.html?course=${encodeURIComponent(courseId)}"
                        class="course-card panel clickable-card"
                    >
                        <div class="course-top">
                            <span class="icon">
                                ${escapeHTML(course.icon || "🎓")}
                            </span>
                            <span>
                                <h3>
                                    ${escapeHTML(course.name || "Course")}
                                </h3>
                                <p>
                                    ${escapeHTML(periodText)}
                                </p>
                            </span>
                        </div>

                        <span class="course-link">
                            View Course →
                        </span>
                    </a>
                `;
            })
            .join("")
        +
        `
            <a
                href="courses.html"
                class="course-card panel more-course clickable-card"
            >
                <div class="course-top">
                    <span class="icon">
                        ➕
                    </span>
                    <span>
                        <h3>
                            More Courses
                        </h3>
                        <p>
                            Browse all available courses
                        </p>
                    </span>
                </div>

                <span class="course-link">
                    View All Courses →
                </span>
            </a>
        `;
}


// ======================================================
// LOAD HOME COURSES
// ======================================================

async function loadHomeCourses() {

    const courseTarget =
        document.querySelector(
            "[data-courses]"
        );

    if (!courseTarget) {
        return;
    }


    // ==================================================
    // STEP 1
    // SHOW CACHE FIRST
    // ==================================================

    const cachedCourses =
        getHomeCoursesCache();


    if (cachedCourses.length > 0) {

        console.log(
            "Showing cached home courses first:",
            cachedCourses
        );

        renderHomeCourses(
            cachedCourses
        );
    }


    // ==================================================
    // STEP 2
    // FETCH LATEST DATA FROM MONGODB
    // ==================================================

    try {

        console.log(
            "Fetching latest home courses from MongoDB API..."
        );


        const response =
            await fetch(
                HOME_COURSES_API_URL,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load courses from backend"
            );
        }


        const data =
            await response.json();


        console.log(
            "Home Courses API Response:",
            data
        );


        if (!data.success) {

            throw new Error(
                data.message ||
                "Failed to load courses"
            );
        }


        const courses =
            data.courses || [];


        // ==================================================
        // CHECK COURSE DATA
        // ==================================================

        if (
            !Array.isArray(courses) ||
            courses.length === 0
        ) {

            console.warn(
                "MongoDB returned no courses."
            );


            if (cachedCourses.length > 0) {

                renderHomeCourses(
                    cachedCourses
                );

                return;
            }


            renderHomeCourses([]);

            return;
        }


        // ==================================================
        // STEP 3
        // SAVE LATEST DATA
        // ==================================================

        saveHomeCoursesCache(
            courses
        );


        // ==================================================
        // STEP 4
        // RENDER LATEST DATA
        // ==================================================

        renderHomeCourses(
            courses
        );


        console.log(
            "Latest home courses loaded successfully."
        );


    } catch (error) {

        console.error(
            "Home course loading failed:",
            error
        );


        // ==================================================
        // USE CACHE WHEN MONGODB IS OFFLINE
        // ==================================================

        if (cachedCourses.length > 0) {

            console.log(
                "MongoDB unavailable. Using cached home courses."
            );


            renderHomeCourses(
                cachedCourses
            );

            return;
        }


        // ==================================================
        // NO CACHE
        // ==================================================

        renderHomeCourses([]);
    }
}


// ======================================================
// ESCAPE HTML
// ======================================================

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


// ======================================================
// HERO NOTICE BADGE
// ======================================================

function setupHeroNotice() {

    const heroArt =
        document.querySelector(
            ".hero-art"
        );


    if (!heroArt) {
        return;
    }


    heroArt.insertAdjacentHTML(
        "afterbegin",

        `

        <div class="notice-badge">
            ▤ Notices
        </div>

        `
    );
}


// ======================================================
// HOME NOTICE
// ======================================================

async function loadHomeNotice() {

    const target =
        document.querySelector(
            "[data-announcement]"
        );


    if (!target) {
        return;
    }


    let notices = [];

    try {
        const response = await fetch(
            "http://" + API_HOST + ":5000/api/notices",
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (response.ok) {
            const data = await response.json();
            if (data && data.success && Array.isArray(data.notices)) {
                notices = data.notices;
            }
        }
    } catch (apiError) {
        console.warn(
            "Home notices API offline:",
            apiError
        );
    }

    if (!notices.length) {
        target.textContent = "No announcements yet.";
        return;
    }

    notices.sort(
        (a, b) =>
            new Date(
                b.createdAt ||
                b.created_at ||
                b.date ||
                0
            ) -
            new Date(
                a.createdAt ||
                a.created_at ||
                a.date ||
                0
            )
    );

    const latest = notices[0];

    target.textContent =
        latest.title ||
        "New announcement available.";

    target.style.cursor =
        latest.link
            ? "pointer"
            : "default";

    if (latest.link) {
        target.onclick = () => {
            location.href =
                "viewer.html?file=" +
                encodeURIComponent(
                    latest.link
                );
        };
    }
}


// ======================================================
// PAGE INITIALIZATION
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadHomeCourses();

        setupHeroNotice();

        loadHomeNotice();

    }
);