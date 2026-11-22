// =========================================
// TU SATHI - COURSE PAGE
// MongoDB / Node.js API + LOCAL CACHE FALLBACK
// =========================================

const API_HOST = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
const API_BASE = "http://" + API_HOST + ":5000/api";


// =========================================
// CACHE KEYS
// =========================================

// Courses page ले प्रयोग गर्ने SAME cache
const COURSES_CACHE_KEY =
    "tu-sathi-courses-cache";

// प्रत्येक course + level को subjects अलग cache
const SUBJECTS_CACHE_PREFIX =
    "tu-sathi-subjects-cache-";


// =========================================
// HELPERS
// =========================================

function normalizeValue(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "");

}


function makeSlug(value) {

    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

}


function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function getOrdinal(number) {

    if (number === 1) return "st";
    if (number === 2) return "nd";
    if (number === 3) return "rd";

    return "th";

}


// =========================================
// DEFAULT COURSES FALLBACK
// =========================================
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

const DEFAULT_SUBJECTS = {
    // BSc CSIT
    "6a9c5de22ed8ff337fc68994-1": [
        { _id: "6a9c5f3af94eae69862f4d80", name: "Digital Logic", code: "CSC111", description: "Boolean algebra, logic gates, combinational and sequential circuits." },
        { _id: "6a9c5f3af94eae69862f4d81", name: "Introduction to Information Technology", code: "CSC109", description: "Computer hardware, software, internet and information systems." },
        { _id: "6a9c5f3af94eae69862f4d82", name: "C Programming", code: "CSC110", description: "Structured programming, pointers, arrays, structures and files in C." },
        { _id: "6a9c5f3af94eae69862f4d83", name: "Mathematics I", code: "MTH112", description: "Calculus, linear algebra, limits and integration." },
        { _id: "6a9c5f3af94eae69862f4d69", name: "Physics", code: "PHY113", description: "Mechanics, electromagnetism and modern physics." }
    ],
    "6a9c5de22ed8ff337fc68994-2": [
        { _id: "6a9c5f3af94eae69862f4d84", name: "Discrete Structures", code: "CSC160", description: "Propositional logic, set theory, relations, graphs and combinatorics." },
        { _id: "6a9c5f3af94eae69862f4d85", name: "Object Oriented Programming", code: "CSC161", description: "OOP concepts, classes, inheritance, polymorphism in C++." },
        { _id: "6a9c5f3af94eae69862f4d86", name: "Microprocessor", code: "CSC162", description: "8085/8086 architecture, assembly language and interfacing." },
        { _id: "6a9c5f3af94eae69862f4d87", name: "Mathematics II", code: "MTH163", description: "Multivariable calculus, differential equations and vectors." },
        { _id: "6a9c5f3af94eae69862f4d88", name: "Statistics I", code: "STA164", description: "Probability theory, distributions and descriptive statistics." }
    ],
    "6a9c5de22ed8ff337fc68994-3": [
        { _id: "6a9c5f3af94eae69862f4d64", name: "Data Structures and Algorithms", code: "CSC206", description: "Stacks, queues, linked lists, trees, graphs, sorting and searching." },
        { _id: "6a9c5f3af94eae69862f4d89", name: "Numerical Method", code: "CSC207", description: "Interpolation, numerical differentiation, integration and linear equations." },
        { _id: "6a9c5f3af94eae69862f4d8a", name: "Computer Architecture", code: "CSC208", description: "Processor design, ALU, memory hierarchy and pipelining." },
        { _id: "6a9c5f51224ba2469b22c28a", name: "Computer Graphics", code: "CSC209", description: "2D/3D transformations, clipping, illumination and rendering." },
        { _id: "6a9c5f3af94eae69862f4d8b", name: "Statistics II", code: "STA210", description: "Inferential statistics, hypothesis testing, ANOVA and regression." }
    ],
    "6a9c5de22ed8ff337fc68994-4": [
        { _id: "6a9c5f3af94eae69862f4d8c", name: "Theory of Computation", code: "CSC256", description: "Finite automata, regular expressions, context-free grammars and Turing machines." },
        { _id: "6a9c5f3af94eae69862f4d5f", name: "Computer Networks", code: "CSC257", description: "TCP/IP, routing, transport layer, packet switching and network security." },
        { _id: "6a9c5f3af94eae69862f4d5e", name: "Operating Systems", code: "CSC258", description: "Process scheduling, deadlocks, memory management and file systems." },
        { _id: "6a9c5f3af94eae69862f4d8d", name: "Database Management System", code: "CSC259", description: "Relational models, SQL, normalization and transaction management." },
        { _id: "6a9c5f3af94eae69862f4d8e", name: "Artificial Intelligence", code: "CSC260", description: "Search algorithms, knowledge representation, expert systems and neural networks." }
    ],
    // BHM
    "6a9c5de22ed8ff337fc68999-1": [
        { _id: "6a9c5f3af94eae69862f4d90", name: "Food Production & Patisserie I", code: "BHM111", description: "Culinary preparation, kitchen safety, tools and cooking methods." },
        { _id: "6a9c5f3af94eae69862f4d91", name: "Food & Beverage Service I", code: "BHM112", description: "Restaurant operations, dining room service and customer etiquette." },
        { _id: "6a9c5f3af94eae69862f4d92", name: "Housekeeping Operations", code: "BHM113", description: "Hotel housekeeping management, guest room cleaning and hygiene." },
        { _id: "6a9c5f3af94eae69862f4d93", name: "Front Office Operations", code: "BHM114", description: "Front desk procedures, reservation management and guest relations." },
        { _id: "6a9c5f3af94eae69862f4d94", name: "English Communication", code: "BHM115", description: "Hospitality business communication and professional presentation skills." }
    ],
    "6a9c5de22ed8ff337fc68999-2": [
        { _id: "6a9c5f3af94eae69862f4d95", name: "Food Production & Patisserie II", code: "BHM121", description: "Bakery and pastry arts, international cuisine techniques and recipe standardization." },
        { _id: "6a9c5f3af94eae69862f4d96", name: "Food & Beverage Service II", code: "BHM122", description: "Bar management, wine studies, cocktail preparation, banquet operations." }
    ],
    // BCA
    "6a9c5098108d9c375a9a21f0-1": [
        { _id: "6a9c5f3af94eae69862f4da0", name: "Computer Fundamentals & Applications", code: "CACS101", description: "Operating systems, productivity software and internet fundamentals." },
        { _id: "6a9c5f3af94eae69862f4da1", name: "Society and Technology", code: "CACO102", description: "Impact of IT on society, ethics, digital divide and legal issues." },
        { _id: "6a9c5f3af94eae69862f4da2", name: "English I", code: "CAEN103", description: "English proficiency, reading comprehension and business writing." },
        { _id: "6a9c5f3af94eae69862f4da3", name: "Mathematics I", code: "CAMT104", description: "Calculus, matrices, coordinate geometry and algebra." },
        { _id: "6a9c5f3af94eae69862f4da4", name: "Digital Logic Systems", code: "CACS105", description: "Boolean algebra, digital logic gates and circuit analysis." }
    ],
    "6a9c5098108d9c375a9a21f0-2": [
        { _id: "6a9c5f3af94eae69862f4da5", name: "C Programming", code: "CACS151", description: "Syntax, data types, control flow, functions, arrays and pointers in C." },
        { _id: "6a9c5f3af94eae69862f4da6", name: "Financial Accounting", code: "CAAC152", description: "Principles of financial accounting, journals, ledgers and balance sheets." }
    ],
    // BBA
    "6a9c5de22ed8ff337fc68993-1": [
        { _id: "6a9c5f3af94eae69862f4db0", name: "English I", code: "ENG201", description: "Professional business English and communication skills." },
        { _id: "6a9c5f3af94eae69862f4db1", name: "Business Mathematics I", code: "MTH201", description: "Algebra, calculus and financial mathematics for business." },
        { _id: "6a9c5f3af94eae69862f4db2", name: "Principles of Management", code: "MGT201", description: "Management principles, planning, organizing and leadership." },
        { _id: "6a9c5f3af94eae69862f4db3", name: "Microeconomics", code: "ECO201", description: "Market mechanisms, supply and demand, and market structures." }
    ],
    // BBS
    "6a9c5de22ed8ff337fc68992-1": [
        { _id: "6a9c5f3af94eae69862f4d5a", name: "Financial Accounting and Analysis", code: "MGT211", description: "Accounting principles, journals, ledgers and balance sheets." },
        { _id: "6a9c5f3af94eae69862f4d5b", name: "Principles of Management", code: "MGT203", description: "Managerial philosophy, strategic planning and organization." },
        { _id: "6a9c5f3af94eae69862f4dc0", name: "Business English", code: "MGT201", description: "Corporate communication and business correspondence." },
        { _id: "6a9c5f3af94eae69862f4dc1", name: "Business Statistics", code: "MGT202", description: "Collection, presentation and analysis of business data." },
        { _id: "6a9c5f3af94eae69862f4dc2", name: "Business Economics", code: "MGT204", description: "Economic concepts, pricing policies and national income." }
    ]
};

function getDefaultSubjects(courseId, level) {
    const key = `${courseId}-${level}`;
    if (DEFAULT_SUBJECTS[key]) return DEFAULT_SUBJECTS[key];
    const normalizedId = normalizeValue(courseId);
    for (const k of Object.keys(DEFAULT_SUBJECTS)) {
        if (k.endsWith(`-${level}`)) {
            const coursePart = k.replace(`-${level}`, "");
            const courseObj = DEFAULT_COURSES.find(c => c._id === coursePart || normalizeValue(c.name) === normalizedId);
            if (courseObj && (normalizeValue(courseObj._id) === normalizedId || normalizeValue(courseObj.name) === normalizedId)) {
                return DEFAULT_SUBJECTS[k];
            }
        }
    }
    return [];
}

// =========================================
// COURSE CACHE
// =========================================

function getCoursesCache() {

    try {

        const cached =
            localStorage.getItem(
                COURSES_CACHE_KEY
            );

        if (cached) {
            const courses = JSON.parse(cached);
            if (Array.isArray(courses) && courses.length > 0) {
                return courses;
            }
        }

    } catch (error) {

        console.error(
            "Courses cache read failed:",
            error
        );

    }

    return DEFAULT_COURSES;
}


function saveCoursesCache(courses) {

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
            "Courses cache save failed:",
            error
        );

    }
}


// =========================================
// SUBJECT CACHE
// =========================================

function getSubjectsCacheKey(
    courseId,
    period
) {

    return (
        SUBJECTS_CACHE_PREFIX +
        String(courseId).trim() +
        "-" +
        String(period).trim()
    );

}


function getSubjectsCache(
    courseId,
    period
) {

    try {

        const key =
            getSubjectsCacheKey(
                courseId,
                period
            );

        const cached =
            localStorage.getItem(key);

        if (!cached) {
            return [];
        }

        const subjects =
            JSON.parse(cached);

        return Array.isArray(subjects)
            ? subjects
            : [];

    } catch (error) {

        console.error(
            "Subjects cache read failed:",
            error
        );

        return [];
    }

}


function saveSubjectsCache(
    courseId,
    period,
    subjects
) {

    try {

        const key =
            getSubjectsCacheKey(
                courseId,
                period
            );

        localStorage.setItem(
            key,
            JSON.stringify(subjects)
        );

        console.log(
            "Subjects saved to browser cache:",
            key
        );

    } catch (error) {

        console.error(
            "Subjects cache save failed:",
            error
        );

    }

}


// =========================================
// LOAD COURSE PAGE
// =========================================

async function loadCoursePage() {

    const params =
        new URLSearchParams(
            window.location.search
        );

    const courseParam =
        params.get("course");


    if (!courseParam) {

        console.error(
            "Course ID/slug missing from URL"
        );

        return;

    }


    const searchValue =
        String(courseParam)
            .trim()
            .toLowerCase();


    console.log(
        "COURSE URL VALUE:",
        searchValue
    );


    // =========================================
    // STEP 1
    // GET COURSES FROM CACHE FIRST
    // =========================================

    const cachedCourses =
        getCoursesCache();


    let courses = [];


    if (cachedCourses.length > 0) {

        console.log(
            "Showing cached courses first:",
            cachedCourses
        );

        courses =
            cachedCourses;

    }


    // =========================================
    // STEP 2
    // TRY MONGODB API
    // =========================================

    try {

        console.log(
            "Fetching latest courses from MongoDB API..."
        );


        const response =
            await fetch(
                `${API_BASE}/courses`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Courses API error: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "COURSES API:",
            result
        );


        let latestCourses = [];


        if (Array.isArray(result)) {

            latestCourses =
                result;

        }

        else if (
            Array.isArray(result.courses)
        ) {

            latestCourses =
                result.courses;

        }

        else if (
            result.data &&
            Array.isArray(
                result.data.courses
            )
        ) {

            latestCourses =
                result.data.courses;

        }


        if (latestCourses.length > 0) {

            courses =
                latestCourses;

            saveCoursesCache(
                latestCourses
            );

            console.log(
                "Latest MongoDB courses saved to cache."
            );

        }

    }

    catch (error) {

        console.error(
            "Course API unavailable:",
            error
        );


        // =========================================
        // USE CACHE
        // =========================================

        if (cachedCourses.length > 0) {

            courses =
                cachedCourses;

            console.log(
                "MongoDB unavailable. Using cached courses."
            );

        }

        else {

            console.error(
                "No cached courses available."
            );

            showCourseError(
                "Unable to load course",
                "MongoDB is unavailable and no cached course data exists."
            );

            return;

        }

    }


    // =========================================
    // CHECK COURSES
    // =========================================

    if (
        !Array.isArray(courses) ||
        courses.length === 0
    ) {

        showCourseError(
            "Unable to load course",
            "No courses found."
        );

        return;

    }


    console.log(
        "COURSES:",
        courses
    );


    // =========================================
    // FIND COURSE
    // =========================================

    const normalizedSearch =
        normalizeValue(
            courseParam
        );


    const course =
        courses.find(c => {

            const id =
                normalizeValue(
                    c._id ||
                    c.id ||
                    ""
                );


            const name =
                normalizeValue(
                    c.name ||
                    ""
                );


            const slug =
                normalizeValue(
                    c.slug ||
                    ""
                );


            const code =
                normalizeValue(
                    c.code ||
                    ""
                );


            const generatedSlug =
                normalizeValue(
                    makeSlug(
                        c.name
                    )
                );


            return (
                id === normalizedSearch ||
                name === normalizedSearch ||
                slug === normalizedSearch ||
                code === normalizedSearch ||
                generatedSlug === normalizedSearch
            );

        });


    // =========================================
    // COURSE NOT FOUND
    // =========================================

    if (!course) {

        console.error(
            "Course not found:",
            courseParam
        );

        showCourseError(
            "Course not found",
            `Course "${courseParam}" was not found.`
        );

        return;

    }


    // =========================================
    // COURSE FOUND
    // =========================================

    console.log(
        "SELECTED COURSE:",
        course
    );


    const courseId =
        String(
            course._id ||
            course.id ||
            ""
        );


    if (!courseId) {

        showCourseError(
            "Course error",
            "Course ID is missing."
        );

        return;

    }


    // =========================================
    // COURSE INFORMATION
    // =========================================

    const courseName =
        document.querySelector(
            "[data-course-name]"
        );


    const courseFullName =
        document.querySelector(
            "[data-course-fullname]"
        );


    const courseDescription =
        document.querySelector(
            "[data-course-description]"
        );


    if (courseName) {

        courseName.textContent =
            course.name || "";

    }


    if (courseFullName) {

        courseFullName.textContent =
            course.fullName ||
            course.fullname ||
            course.subtitle ||
            "";

    }


    if (courseDescription) {

        courseDescription.textContent =
            course.description || "";

    }


    // =========================================
    // PAGE TITLE
    // =========================================

    document.title =
        `${course.name || "Course"} | TU Sathi`;


    // =========================================
    // STRUCTURE TYPE
    // =========================================

    const structureType =
        String(
            course.structureType ||
            course.structure ||
            "semester"
        )
            .trim()
            .toLowerCase();


    let periodName;
    let periodCount;


    if (
        structureType === "yearly" ||
        structureType === "year"
    ) {

        periodName = "Year";
        periodCount = 4;

    }

    else {

        periodName = "Semester";
        periodCount = 8;

    }


    // =========================================
    // COURSE LEVEL COUNT
    // =========================================

    const possibleCount =
        Number(
            course.levelCount ||
            course.semesterCount ||
            course.periodCount ||
            0
        );


    if (
        Number.isFinite(
            possibleCount
        ) &&
        possibleCount > 0
    ) {

        periodCount =
            possibleCount;

    }


    // =========================================
    // PERIOD HEADING
    // =========================================

    const periodHeading =
        document.querySelector(
            "[data-period-heading]"
        );


    if (periodHeading) {

        periodHeading.textContent =
            `Select ${periodName}`;

    }


    // =========================================
    // RENDER PERIODS
    // =========================================

    renderPeriods(
        courseId,
        periodName,
        periodCount
    );

}


// =========================================
// SHOW COURSE ERROR
// =========================================

function showCourseError(
    title,
    message
) {

    const container =
        document.querySelector(
            "[data-subjects]"
        );


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="empty-state">

            <h3>
                ${escapeHTML(title)}
            </h3>

            <p>
                ${escapeHTML(message)}
            </p>

        </div>

    `;

}


// =========================================
// RENDER SEMESTERS / YEARS
// =========================================

function renderPeriods(
    courseId,
    periodName,
    periodCount
) {

    const container =
        document.querySelector(
            "[data-semesters]"
        );


    if (!container) {

        console.error(
            "data-semesters not found"
        );

        return;

    }


    container.innerHTML = "";


    // =========================================
    // CREATE PERIOD BUTTONS
    // =========================================

    for (
        let i = 1;
        i <= periodCount;
        i++
    ) {

        const link =
            document.createElement(
                "a"
            );


        link.href = "#";


        link.className =
            "semester-link" +
            (
                i === 1
                    ? " active"
                    : ""
            );


        link.dataset.period =
            i;


        link.innerHTML = `

            <span>
                ${i}${getOrdinal(i)} ${periodName}
            </span>

        `;


        link.addEventListener(
            "click",
            function(event) {

                event.preventDefault();


                container
                    .querySelectorAll(
                        ".semester-link"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                link.classList.add(
                    "active"
                );


                loadSubjects(
                    courseId,
                    i
                );

            }
        );


        container.appendChild(
            link
        );

    }


    // =========================================
    // LOAD FIRST PERIOD
    // =========================================

    if (periodCount > 0) {

        loadSubjects(
            courseId,
            1
        );

    }

}


// =========================================
// LOAD SUBJECTS
// CACHE + MONGODB
// =========================================

async function loadSubjects(
    courseId,
    period
) {

    const container =
        document.querySelector(
            "[data-subjects]"
        );


    if (!container) {

        console.error(
            "data-subjects not found"
        );

        return;

    }


    const selectedCourseId =
        String(
            courseId
        ).trim();


    const selectedLevel =
        Number(period);


    // =========================================
    // VALIDATE
    // =========================================

    if (!selectedCourseId) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load subjects</h3>
                <p>Course ID is missing.</p>
            </div>
        `;

        return;

    }


    if (
        !Number.isInteger(
            selectedLevel
        ) ||
        selectedLevel < 1
    ) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load subjects</h3>
                <p>Invalid semester/year.</p>
            </div>
        `;

        return;

    }


    // =========================================
    // STEP 1
    // SHOW CACHE FIRST
    // =========================================

    const cachedSubjects =
        getSubjectsCache(
            selectedCourseId,
            selectedLevel
        );


    if (cachedSubjects.length > 0) {

        console.log(
            "Showing cached subjects first:",
            cachedSubjects
        );

        renderSubjects(
            container,
            cachedSubjects,
            selectedCourseId,
            selectedLevel
        );

    }

    else {

        container.innerHTML = `
            <div class="loading">
                Loading subjects...
            </div>
        `;

    }


    // =========================================
    // STEP 2
    // FETCH LATEST FROM MONGODB
    // =========================================

    try {

        console.log(
            "Fetching latest subjects from MongoDB API..."
        );


        const response =
            await fetch(
                `${API_BASE}/subjects/course/${encodeURIComponent(
                    selectedCourseId
                )}/level/${selectedLevel}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Unable to load subjects. HTTP ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "SUBJECTS BY COURSE/LEVEL API:",
            result
        );


        const subjects =
            Array.isArray(
                result.subjects
            )
                ? result.subjects
                : [];


        // =========================================
        // NO SUBJECTS
        // =========================================

        if (!subjects.length) {

            const fallbackSubs = getDefaultSubjects(selectedCourseId, selectedLevel);
            if (fallbackSubs.length > 0) {
                console.log("Using default fallback subjects:", fallbackSubs);
                renderSubjects(
                    container,
                    fallbackSubs,
                    selectedCourseId,
                    selectedLevel
                );
                saveSubjectsCache(
                    selectedCourseId,
                    selectedLevel,
                    fallbackSubs
                );
                return;
            }

            if (cachedSubjects.length > 0) {

                console.log(
                    "MongoDB returned no subjects. Using cached subjects."
                );

                renderSubjects(
                    container,
                    cachedSubjects,
                    selectedCourseId,
                    selectedLevel
                );

                return;

            }


            showNoSubjects(
                container,
                selectedLevel
            );

            return;

        }


        // =========================================
        // SAVE SUBJECTS TO CACHE
        // =========================================

        saveSubjectsCache(
            selectedCourseId,
            selectedLevel,
            subjects
        );


        // =========================================
        // RENDER LATEST SUBJECTS
        // =========================================

        renderSubjects(
            container,
            subjects,
            selectedCourseId,
            selectedLevel
        );


        console.log(
            "Latest subjects loaded successfully."
        );


    }

    catch (error) {

        console.error(
            "Subject loading failed:",
            error
        );


        // =========================================
        // USE CACHE WHEN MONGODB OFFLINE
        // =========================================

        if (cachedSubjects.length > 0) {

            console.log(
                "MongoDB unavailable. Using cached subjects."
            );


            renderSubjects(
                container,
                cachedSubjects,
                selectedCourseId,
                selectedLevel
            );

            return;

        }

        const fallbackSubs = getDefaultSubjects(selectedCourseId, selectedLevel);
        if (fallbackSubs.length > 0) {
            console.log(
                "MongoDB unavailable. Using default subjects fallback:",
                fallbackSubs
            );

            renderSubjects(
                container,
                fallbackSubs,
                selectedCourseId,
                selectedLevel
            );

            saveSubjectsCache(
                selectedCourseId,
                selectedLevel,
                fallbackSubs
            );

            return;
        }


        // =========================================
        // NO CACHE
        // =========================================

        container.innerHTML = `

            <div class="empty-state">

                <h3>
                    Unable to load subjects
                </h3>

                <p>
                    MongoDB is unavailable and
                    no cached subjects exist for
                    this semester/year.
                </p>

            </div>

        `;

    }

}


// =========================================
// RENDER SUBJECTS
// =========================================

function renderSubjects(
    container,
    subjects,
    selectedCourseId,
    selectedLevel
) {

    if (
        !Array.isArray(subjects) ||
        subjects.length === 0
    ) {

        showNoSubjects(
            container,
            selectedLevel
        );

        return;

    }


    container.innerHTML =
        subjects
            .map(subject => {

                const subjectId =
                    String(
                        subject._id ||
                        subject.id ||
                        ""
                    );


                const subjectName =
                    subject.name ||
                    "Unnamed Subject";


                const subjectCode =
                    subject.code ||
                    "";


                const subjectUrl =
                    `subject.html?course=${encodeURIComponent(
                        selectedCourseId
                    )}&semester=${encodeURIComponent(
                        selectedLevel
                    )}&subject=${encodeURIComponent(
                        subjectId
                    )}`;


                return `

                    <a
                        class="subject-card panel"
                        href="${subjectUrl}"
                    >

                        <h3>
                            ${escapeHTML(
                                subjectName
                            )}
                        </h3>

                        ${
                            subjectCode
                                ? `
                                    <p class="subject-code">
                                        ${escapeHTML(
                                            subjectCode
                                        )}
                                    </p>
                                  `
                                : ""
                        }

                        <div class="subject-link">
                            View Resources →
                        </div>

                    </a>

                `;

            })
            .join("");

}


// =========================================
// NO SUBJECT
// =========================================

function showNoSubjects(
    container,
    period
) {

    container.innerHTML = `

        <div class="empty-state">

            <h3>
                No subjects available
            </h3>

            <p>
                No subjects have been added
                for semester ${period} yet.
            </p>

        </div>

    `;

}


// =========================================
// START
// =========================================

document.addEventListener(
    "DOMContentLoaded",
    loadCoursePage
);