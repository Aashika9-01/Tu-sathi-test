// ======================================================
// TU SATHI
// LOAD ALL COURSES FROM MONGODB API
// WITH LOCAL STORAGE FALLBACK
// ======================================================

const API_HOST = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
const COURSES_API_URL = "http://" + API_HOST + ":5000/api/courses";

// Browser मा courses save गर्ने key
const COURSES_CACHE_KEY = "tu-sathi-courses-cache";

// ======================================================
// DEFAULT COURSES FALLBACK
// (Used when cache is empty or backend is loading/offline)
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
// LOAD CACHED COURSES
// ======================================================

function getCachedCourses() {

    try {

        const cachedData =
            localStorage.getItem(COURSES_CACHE_KEY);

        if (cachedData) {
            const courses = JSON.parse(cachedData);
            if (Array.isArray(courses) && courses.length > 0) {
                return courses;
            }
        }

    } catch (error) {

        console.error(
            "Failed to read cached courses:",
            error
        );

    }

    return DEFAULT_COURSES;
}


// ======================================================
// SAVE COURSES TO CACHE
// ======================================================

function saveCoursesToCache(courses) {

    try {

        localStorage.setItem(
            COURSES_CACHE_KEY,
            JSON.stringify(courses)
        );

        console.log(
            "Courses saved to browser cache."
        );

    } catch (error) {

        console.error(
            "Failed to save courses to cache:",
            error
        );
    }
}


// ======================================================
// RENDER COURSES
// ======================================================

function renderCourses(courses) {

    const courseGrid =
        document.querySelector("[data-courses]");

    const emptyState =
        document.querySelector("[data-empty-state]");


    if (!courseGrid) {
        return;
    }


    // ==================================================
    // CHECK COURSE DATA
    // ==================================================

    if (
        !Array.isArray(courses) ||
        courses.length === 0
    ) {

        courseGrid.innerHTML = "";

        if (emptyState) {
            emptyState.hidden = false;
        }

        return;
    }


    // Hide default empty state
    if (emptyState) {
        emptyState.hidden = true;
    }

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

    // ==================================================
    // RENDER COURSE CARDS
    // ==================================================

    courseGrid.innerHTML = sortedCourses.map(course => {

        // MongoDB _id
        const courseId =
            course._id || course.id || "";


        // Course name
        const courseName =
            course.name || "Course";


        // ==================================================
        // STRUCTURE TYPE
        // ==================================================

        let periodText = "Academic Program";


        if (course.structureType === "semester") {

            periodText =
                "Semester Program";

        } else if (
            course.structureType === "year"
        ) {

            periodText =
                "Yearly Program";
        }


        // ==================================================
        // COURSE ICON
        // ==================================================

        const courseIcon =
            course.icon || "🎓";


        // ==================================================
        // COURSE CARD
        // ==================================================

        return `

            <a
                href="course.html?course=${encodeURIComponent(courseId)}"
                class="course-card panel clickable-card"
            >

                <div class="course-top">

                    <span class="icon">
                        ${courseIcon}
                    </span>

                    <span>

                        <h3>
                            ${courseName}
                        </h3>

                        <p>
                            ${periodText}
                        </p>

                    </span>

                </div>


                <span class="course-link">
                    View Course →
                </span>

            </a>

        `;

    }).join("");
}


// ======================================================
// LOAD ALL COURSES
// ======================================================

async function loadAllCourses() {

    const courseGrid =
        document.querySelector("[data-courses]");


    if (!courseGrid) {
        return;
    }


    // ==================================================
    // STEP 1
    // SHOW CACHE FIRST
    // ==================================================

    const cachedCourses =
        getCachedCourses();


    if (cachedCourses.length > 0) {

        console.log(
            "Showing cached courses first:",
            cachedCourses
        );

        renderCourses(cachedCourses);
    }


    // ==================================================
    // STEP 2
    // FETCH LATEST DATA FROM MONGODB API
    // ==================================================

    try {

        console.log(
            "Fetching latest courses from MongoDB API..."
        );


        const response =
            await fetch(
                COURSES_API_URL,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        // ==================================================
        // CHECK API RESPONSE
        // ==================================================

        if (!response.ok) {

            throw new Error(
                `Failed to load courses: ${response.status}`
            );
        }


        // ==================================================
        // CONVERT RESPONSE TO JSON
        // ==================================================

        const result =
            await response.json();


        console.log(
            "Courses API Response:",
            result
        );


        // ==================================================
        // GET COURSE ARRAY
        // ==================================================

        const courses =
            Array.isArray(result)
                ? result
                : (
                    result.courses ||
                    result.data ||
                    []
                );


        // ==================================================
        // VALIDATE DATA
        // ==================================================

        if (
            !Array.isArray(courses) ||
            courses.length === 0
        ) {

            console.warn(
                "MongoDB API returned no courses."
            );


            // Cached courses छन् भने
            // ती नै देखाइरहने

            if (cachedCourses.length > 0) {

                renderCourses(cachedCourses);

                return;
            }


            // Cache पनि छैन भने मात्र empty state

            renderCourses([]);

            return;
        }


        // ==================================================
        // STEP 3
        // SAVE LATEST COURSES TO LOCAL STORAGE
        // ==================================================

        saveCoursesToCache(courses);


        // ==================================================
        // STEP 4
        // RENDER LATEST MONGODB DATA
        // ==================================================

        renderCourses(courses);


        console.log(
            "Latest MongoDB courses loaded successfully."
        );


    } catch (error) {

        // ==================================================
        // MONGODB / API CONNECTION FAILED
        // ==================================================

        console.error(
            "Course API loading failed:",
            error
        );


        // ==================================================
        // USE CACHE INSTEAD OF SHOWING EMPTY
        // ==================================================

        if (cachedCourses.length > 0) {

            console.log(
                "MongoDB unavailable. Using cached courses."
            );


            renderCourses(cachedCourses);

            return;
        }


        // ==================================================
        // NO CACHE + NO DATABASE
        // ==================================================

        console.warn(
            "No cached courses available."
        );


        renderCourses([]);
    }
}


// ======================================================
// LOAD WHEN PAGE IS READY
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadAllCourses();

    }
);