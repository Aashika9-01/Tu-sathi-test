// ============================================================
// TU SATHI - CONTRIBUTE PAGE
// MongoDB / Node.js API VERSION
// ============================================================

const API_HOST = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
const API_BASE = "http://" + API_HOST + ":5000/api";


// ============================================================
// SECURITY - ESCAPE HTML
// ============================================================
// Used when displaying contributor/user-provided names.
// Prevents HTML from being injected into the page.
// ============================================================

function escapeHTML(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// CACHE KEYS
// ============================================================

const COURSE_CACHE_KEY =
    "tuSathi_contribution_courses";

const CONTRIBUTOR_CACHE_KEY =
    "tuSathi_contribution_contributors";


// ============================================================
// DOM ELEMENTS
// ============================================================

const courseSelect =
    document.querySelector("[data-course-select]");

const periodSelect =
    document.querySelector("[data-period-select]");

const subjectSelect =
    document.querySelector("[data-subject-select]");

const periodLabel =
    document.querySelector("[data-period-label]");

const contributorsList =
    document.querySelector("[data-contributors-list]");

const form =
    document.querySelector("[data-contribution-form]") ||
    document.querySelector("#contributeForm") ||
    document.querySelector("form");

const submitButton =
    document.querySelector("[data-submit-contribution]");


// ============================================================
// SAFE JSON PARSER
// ============================================================

function safeJSONParse(value, fallback = null) {

    try {

        return JSON.parse(value);

    } catch (error) {

        return fallback;

    }

}


// ============================================================
// CACHE GET
// ============================================================

function getCache(key) {

    try {

        const data =
            localStorage.getItem(key);

        if (!data) {
            return null;
        }

        return safeJSONParse(data, null);

    } catch (error) {

        console.warn(
            "Cache read error:",
            key,
            error
        );

        return null;
    }

}


// ============================================================
// CACHE SET
// ============================================================

function setCache(key, data) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "Cache save error:",
            key,
            error
        );

    }

}


// ============================================================
// GET COURSE ID
// ============================================================

function getCourseId(course) {

    if (!course) {
        return "";
    }

    return String(
        course._id ||
        course.id ||
        course.courseId ||
        ""
    );

}


// ============================================================
// GET COURSE NAME
// ============================================================

function getCourseName(course) {

    if (!course) {
        return "";
    }

    return (
        course.name ||
        course.title ||
        course.courseName ||
        ""
    );

}


// ============================================================
// GET STRUCTURE TYPE
// ============================================================

function getCoursePeriodType(course) {

    if (!course) {
        return "semester";
    }

    const structureType =
        String(
            course.structureType ||
            course.system ||
            ""
        ).toLowerCase();

    const courseName =
        getCourseName(course).toLowerCase();


    // Explicit yearly structure

    if (
        structureType.includes("year") ||
        structureType.includes("yearly")
    ) {

        return "year";

    }


    // Explicit semester structure

    if (
        structureType.includes("semester")
    ) {

        return "semester";

    }


    // Fallback courses

    if (
        courseName.includes("bbs") ||
        courseName.includes("bed") ||
        courseName.includes("b.ed") ||
        courseName.includes("bba")
    ) {

        return "year";

    }


    return "semester";

}


// ============================================================
// GET PERIOD LABEL
// ============================================================

function getPeriodLabel(course, number) {

    const type =
        getCoursePeriodType(course);

    if (type === "year") {

        return `Year ${number}`;

    }

    return `Semester ${number}`;

}


// ============================================================
// LOAD PERIODS
// ============================================================

function loadPeriods(course) {

    if (!periodSelect) {
        return;
    }


    // Reset

    periodSelect.innerHTML =
        '<option value="">Select period</option>';


    // No course

    if (!course) {

        periodSelect.disabled = true;

        if (periodLabel) {

            periodLabel.textContent =
                "Semester / Year";

        }

        if (subjectSelect) {

            subjectSelect.innerHTML =
                '<option value="">Select subject</option>';

            subjectSelect.disabled = true;

        }

        return;

    }


    // Get structure

    const structure =
        getCoursePeriodType(course);


    // Update label

    if (periodLabel) {

        if (structure === "year") {

            periodLabel.textContent =
                "Year";

        } else {

            periodLabel.textContent =
                "Semester";

        }

    }


    // Get period count

    let periodCount =
        Number(course.periodCount);


    // Fallback

    if (!periodCount || periodCount < 1) {

        if (structure === "year") {

            periodCount = 4;

        } else {

            periodCount = 8;

        }

    }


    // Create periods

    for (
        let i = 1;
        i <= periodCount;
        i++
    ) {

        const option =
            document.createElement("option");

        option.value =
            String(i);

        option.textContent =
            getPeriodLabel(
                course,
                i
            );

        periodSelect.appendChild(
            option
        );

    }


    periodSelect.disabled = false;


    // Reset subjects

    if (subjectSelect) {

        subjectSelect.innerHTML =
            '<option value="">Select subject</option>';

        subjectSelect.disabled = true;

    }

}


// ============================================================
// LOAD COURSES
// ============================================================

async function loadContributionCourses() {

    if (!courseSelect) {

        console.warn(
            "Course select not found."
        );

        return;

    }


    courseSelect.innerHTML =
        '<option value="">Loading courses...</option>';

    courseSelect.disabled = true;


    try {

        const response =
            await fetch(
                `${API_BASE}/courses?t=${Date.now()}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                `Courses API failed: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "COURSES API RESPONSE:",
            result
        );


        let courses = [];


        // API array

        if (Array.isArray(result)) {

            courses = result;

        }


        // { courses: [] }

        else if (
            Array.isArray(result.courses)
        ) {

            courses =
                result.courses;

        }


        // { data: [] }

        else if (
            Array.isArray(result.data)
        ) {

            courses =
                result.data;

        }


        console.log(
            "COURSES EXTRACTED:",
            courses
        );


        // Save MongoDB data

        if (courses.length > 0) {

            setCache(
                COURSE_CACHE_KEY,
                courses
            );

        }


        // If API empty

        else {

            const cachedCourses =
                getCache(
                    COURSE_CACHE_KEY
                );


            if (
                Array.isArray(cachedCourses) &&
                cachedCourses.length
            ) {

                console.log(
                    "Using cached courses"
                );

                courses =
                    cachedCourses;

            }

        }


        renderCourses(courses);


    } catch (error) {

        console.error(
            "Unable to load courses:",
            error
        );


        // Cache fallback

        const cachedCourses =
            getCache(
                COURSE_CACHE_KEY
            );


        if (
            Array.isArray(cachedCourses) &&
            cachedCourses.length
        ) {

            console.log(
                "API failed. Using cached courses."
            );

            renderCourses(
                cachedCourses
            );

        } else {

            courseSelect.innerHTML =
                '<option value="">Unable to load courses</option>';

            courseSelect.disabled =
                false;

        }

    }

}


// ============================================================
// RENDER COURSES
// ============================================================

function renderCourses(courses) {

    if (!courseSelect) {
        return;
    }


    courseSelect.innerHTML =
        '<option value="">Select course</option>';


    if (
        !Array.isArray(courses) ||
        courses.length === 0
    ) {

        courseSelect.innerHTML =
            '<option value="">No courses found</option>';

        courseSelect.disabled =
            false;

        return;

    }


    courses.forEach(course => {

        const courseId =
            getCourseId(course);

        const courseName =
            getCourseName(course);


        if (
            !courseId ||
            !courseName
        ) {

            console.warn(
                "Invalid course:",
                course
            );

            return;

        }


        const option =
            document.createElement("option");


        // MongoDB ID

        option.value =
            courseId;


        // Name

        option.textContent =
            courseName;


        // Save complete object

        option.dataset.course =
            JSON.stringify(course);


        option.dataset.courseName =
            courseName;


        courseSelect.appendChild(
            option
        );

    });


    courseSelect.disabled =
        false;


    console.log(
        "COURSES LOADED:",
        courses.map(
            getCourseName
        )
    );

}


// ============================================================
// GET SELECTED COURSE
// ============================================================

function getSelectedCourse() {

    if (!courseSelect) {
        return null;
    }


    const selectedOption =
        courseSelect.options[
            courseSelect.selectedIndex
        ];


    if (
        !selectedOption ||
        !selectedOption.value
    ) {

        return null;

    }


    const courseData =
        selectedOption.dataset.course;


    if (courseData) {

        const parsed =
            safeJSONParse(
                courseData,
                null
            );


        if (parsed) {

            return parsed;

        }

    }


    return {

        _id:
            selectedOption.value,

        name:
            selectedOption.dataset.courseName ||
            ""

    };

}


// ============================================================
// SUBJECT REQUEST CONTROLLER
// ============================================================

let subjectController =
    null;


// ============================================================
// LOAD SUBJECTS
// ============================================================

async function loadSubjects(
    course,
    selectedPeriod
) {

    if (!subjectSelect) {
        return;
    }


    const courseId =
        getCourseId(course);


    if (
        !courseId ||
        !selectedPeriod
    ) {

        subjectSelect.innerHTML =
            '<option value="">Select subject</option>';

        subjectSelect.disabled =
            true;

        return;

    }


    // Structure

    const structure =
        getCoursePeriodType(course);


    // Cache key

    const SUBJECT_CACHE_KEY =
        `tuSathi_subjects_${courseId}_${selectedPeriod}`;


    console.log(
        "Loading subjects:",
        {
            courseId,
            selectedPeriod,
            structure,
            cacheKey:
                SUBJECT_CACHE_KEY
        }
    );


    // Cancel previous request

    if (subjectController) {

        subjectController.abort();

    }


    subjectController =
        new AbortController();


    subjectSelect.disabled =
        true;


    subjectSelect.innerHTML =
        '<option value="">Loading subjects...</option>';


    try {


        // ====================================================
        // IMPORTANT
        // YEAR COURSE
        // /year/
        //
        // SEMESTER COURSE
        // /semester/
        // ====================================================

        const periodRoute =
            structure === "year"
                ? "year"
                : "semester";


        const url =
            `${API_BASE}/subjects/course/` +
            `${encodeURIComponent(courseId)}/` +
            `${periodRoute}/` +
            `${encodeURIComponent(selectedPeriod)}` +
            `?t=${Date.now()}`;


        console.log(
            "SUBJECT API URL:",
            url
        );


        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    cache: "no-store",
                    signal:
                        subjectController.signal
                }
            );


        console.log(
            "SUBJECT API STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Subjects API failed: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "SUBJECT API RESPONSE:",
            result
        );


        let subjects = [];


        if (Array.isArray(result)) {

            subjects =
                result;

        }

        else if (
            Array.isArray(result.subjects)
        ) {

            subjects =
                result.subjects;

        }

        else if (
            Array.isArray(result.data)
        ) {

            subjects =
                result.data;

        }


        console.log(
            "SUBJECTS FROM API:",
            subjects
        );


        // ====================================================
        // API FOUND SUBJECTS
        // ====================================================

        if (subjects.length > 0) {

            setCache(
                SUBJECT_CACHE_KEY,
                subjects
            );

            renderSubjects(
                subjects
            );

            return;

        }


        // ====================================================
        // API EMPTY → CACHE
        // ====================================================

        const cachedSubjects =
            getCache(
                SUBJECT_CACHE_KEY
            );


        if (
            Array.isArray(cachedSubjects) &&
            cachedSubjects.length
        ) {

            console.log(
                "Using cached subjects."
            );


            renderSubjects(
                cachedSubjects
            );


            return;

        }


        // ====================================================
        // NOTHING FOUND
        // ====================================================

        subjectSelect.innerHTML =
            '<option value="">No subjects found</option>';

        subjectSelect.disabled =
            false;


    } catch (error) {


        // Abort is normal

        if (
            error.name === "AbortError"
        ) {

            return;

        }


        console.error(
            "Unable to load subjects:",
            error
        );


        // ====================================================
        // CACHE FALLBACK
        // ====================================================

        const cachedSubjects =
            getCache(
                SUBJECT_CACHE_KEY
            );


        if (
            Array.isArray(cachedSubjects) &&
            cachedSubjects.length
        ) {

            console.log(
                "Subjects API failed. Using cache."
            );


            renderSubjects(
                cachedSubjects
            );

        }

        else {

            subjectSelect.innerHTML =
                '<option value="">Unable to load subjects</option>';

            subjectSelect.disabled =
                false;

        }

    }

}


// ============================================================
// RENDER SUBJECTS
// ============================================================

function renderSubjects(subjects) {

    if (!subjectSelect) {
        return;
    }


    subjectSelect.innerHTML =
        '<option value="">Select subject</option>';


    if (
        !Array.isArray(subjects) ||
        subjects.length === 0
    ) {

        subjectSelect.innerHTML =
            '<option value="">No subjects found</option>';

        subjectSelect.disabled =
            false;

        return;

    }


    subjects.forEach(subject => {

        if (!subject) {
            return;
        }


        const subjectId =
            subject._id ||
            subject.id ||
            subject.subjectId ||
            "";


        const subjectName =
            subject.name ||
            subject.title ||
            subject.subjectName ||
            "";


        if (
            !subjectId ||
            !subjectName
        ) {

            return;

        }


        const option =
            document.createElement(
                "option"
            );


        // MongoDB ID

        option.value =
            subjectId;


        // Display name

        option.textContent =
            subject.code
                ? `${subject.code} - ${subjectName}`
                : subjectName;


        // Data

        option.dataset.subjectName =
            subjectName;


        if (subject.code) {

            option.dataset.subjectCode =
                subject.code;

        }


        option.dataset.subject =
            JSON.stringify(subject);


        subjectSelect.appendChild(
            option
        );

    });


    subjectSelect.disabled =
        false;


    console.log(
        "SUBJECTS LOADED:",
        subjects.map(
            subject =>
                subject.name ||
                subject.title ||
                subject.subjectName
        )
    );

}


// ============================================================
// LOAD CONTRIBUTORS
// ============================================================

async function loadContributors() {

    if (!contributorsList) {

        console.warn(
            "Contributors list not found."
        );

        return;

    }


    // Loading state

    contributorsList.innerHTML = `
        <p class="contributors-loading">
            Loading contributors...
        </p>
    `;


    try {


        // ====================================================
        // BACKEND ENDPOINT
        // ====================================================

        const response =
            await fetch(
                `${API_BASE}/contributor?t=${Date.now()}`,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        console.log(
            "CONTRIBUTOR API STATUS:",
            response.status
        );


        if (!response.ok) {

            throw new Error(
                `Contributor API failed: ${response.status}`
            );

        }


        const result =
            await response.json();


        console.log(
            "CONTRIBUTOR API RESPONSE:",
            result
        );


        let contributors = [];


        // API array

        if (Array.isArray(result)) {

            contributors =
                result;

        }


        // { contributors: [] }

        else if (
            Array.isArray(
                result.contributors
            )
        ) {

            contributors =
                result.contributors;

        }


        // { data: [] }

        else if (
            Array.isArray(result.data)
        ) {

            contributors =
                result.data;

        }


        console.log(
            "CONTRIBUTORS EXTRACTED:",
            contributors
        );


        // ====================================================
        // SAVE CACHE
        // ====================================================

        if (contributors.length > 0) {

            setCache(
                CONTRIBUTOR_CACHE_KEY,
                contributors
            );

        }


        // ====================================================
        // API EMPTY → CACHE
        // ====================================================

        else {

            const cached =
                getCache(
                    CONTRIBUTOR_CACHE_KEY
                );


            if (
                Array.isArray(cached) &&
                cached.length
            ) {

                console.log(
                    "Using cached contributors."
                );

                contributors =
                    cached;

            }

        }


        // ====================================================
        // RENDER
        // ====================================================

        renderContributors(
            contributors
        );


    } catch (error) {


        console.error(
            "Unable to load contributors:",
            error
        );


        // Cache fallback

        const cached =
            getCache(
                CONTRIBUTOR_CACHE_KEY
            );


        if (
            Array.isArray(cached) &&
            cached.length
        ) {

            renderContributors(
                cached
            );

        }

        else {

            contributorsList.innerHTML = `
                <p class="contributors-empty">
                    Unable to load contributors.
                </p>
            `;

        }

    }

}


// ============================================================
// RENDER CONTRIBUTORS
// ============================================================

function renderContributors(contributors) {

    if (!contributorsList) {
        return;
    }


    if (
        !Array.isArray(contributors) ||
        contributors.length === 0
    ) {

        contributorsList.innerHTML = `
            <p class="contributors-empty">
                No contributors yet.
            </p>
        `;

        return;

    }


    contributorsList.innerHTML = "";


    contributors.forEach((contributor, index) => {

        if (!contributor) {
            return;
        }


        const name =
            contributor.name ||
            contributor.fullName ||
            contributor.username ||
            contributor.displayName ||
            "";


        if (!String(name).trim()) {
            return;
        }


        const row =
            document.createElement("div");


        row.className =
            "contributor-item";


        row.innerHTML = `
            <span class="contributor-number">
                ${index + 1}.
            </span>

            <span class="contributor-name">
                ${escapeHTML(name)}
            </span>
        `;


        contributorsList.appendChild(row);

    });


    console.log(
        "CONTRIBUTORS RENDERED:",
        contributors.length
    );

}


// ============================================================
// COURSE CHANGE
// ============================================================

if (courseSelect) {

    courseSelect.addEventListener(
        "change",
        function () {


            const course =
                getSelectedCourse();


            console.log(
                "COURSE SELECTED:",
                course
            );


            // Reset subject

            if (subjectSelect) {

                subjectSelect.innerHTML =
                    '<option value="">Select subject</option>';

                subjectSelect.disabled =
                    true;

            }


            // Load periods

            loadPeriods(
                course
            );

        }
    );

}


// ============================================================
// PERIOD CHANGE
// ============================================================

if (periodSelect) {

    periodSelect.addEventListener(
        "change",
        function () {


            const course =
                getSelectedCourse();


            const selectedPeriod =
                this.value;


            console.log(
                "PERIOD SELECTED:",
                selectedPeriod
            );


            console.log(
                "SELECTED COURSE:",
                course
            );


            if (
                !course ||
                !selectedPeriod
            ) {


                if (subjectSelect) {

                    subjectSelect.innerHTML =
                        '<option value="">Select subject</option>';

                    subjectSelect.disabled =
                        true;

                }


                return;

            }


            // Load subjects

            loadSubjects(
                course,
                selectedPeriod
            );

        }
    );

}


// ============================================================
// SUBJECT CHANGE
// ============================================================

if (subjectSelect) {

    subjectSelect.addEventListener(
        "change",
        function () {


            const selectedOption =
                this.options[
                    this.selectedIndex
                ];


            if (
                selectedOption &&
                selectedOption.dataset.subjectName
            ) {

                console.log(
                    "SUBJECT SELECTED:",
                    selectedOption.dataset.subjectName
                );

            }

        }
    );

}


// ============================================================
// FORM SUBMIT
// ============================================================

if (form) {

    form.addEventListener(
        "submit",
        async function (event) {


            event.preventDefault();


            console.log(
                "Submitting contribution..."
            );


            // Prevent duplicate submission

            if (submitButton) {

                submitButton.disabled =
                    true;

                submitButton.dataset.originalText =
                    submitButton.textContent;

                submitButton.textContent =
                    "Submitting...";

            }


            try {


                // FormData

                const formData =
                    new FormData(form);


                // =================================================
                // LOG FORM DATA
                // =================================================

                console.log(
                    "FORM DATA:"
                );


                for (
                    const [
                        key,
                        value
                    ] of formData.entries()
                ) {

                    if (
                        value instanceof File
                    ) {

                        console.log(
                            key,
                            value.name
                        );

                    } else {

                        console.log(
                            key,
                            value
                        );

                    }

                }


                // =================================================
                // SEND
                // =================================================

                const response =
                    await fetch(
                        `${API_BASE}/contributions`,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                // =================================================
                // RESPONSE
                // =================================================

                const result =
                    await response.json();


                console.log(
                    "CONTRIBUTION RESPONSE:",
                    result
                );


                if (!response.ok) {

                    throw new Error(
                        result.message ||
                        "Contribution submission failed"
                    );

                }


                // =================================================
                // SUCCESS
                // =================================================

                alert(
                    result.message ||
                    "Contribution submitted successfully!"
                );


                // Reset form

                form.reset();


                // Reset periods

                if (periodSelect) {

                    periodSelect.innerHTML =
                        '<option value="">Select period</option>';

                    periodSelect.disabled =
                        true;

                }


                // Reset subjects

                if (subjectSelect) {

                    subjectSelect.innerHTML =
                        '<option value="">Select subject</option>';

                    subjectSelect.disabled =
                        true;

                }


                // Reset period label

                if (periodLabel) {

                    periodLabel.textContent =
                        "Semester / Year";

                }


            } catch (error) {


                console.error(
                    "Contribution submit error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to submit contribution."
                );


            } finally {


                // Enable submit button

                if (submitButton) {

                    submitButton.disabled =
                        false;


                    submitButton.textContent =
                        submitButton.dataset.originalText ||
                        "Submit Contribution →";

                }

            }

        }
    );

}


// ============================================================
// INITIALIZATION
// ============================================================

async function initializeContributionPage() {

    console.log(
        "======================================"
    );

    console.log(
        "TU SATHI CONTRIBUTION PAGE INITIALIZED"
    );

    console.log(
        "======================================"
    );


    // Disable dependent selects

    if (periodSelect) {

        periodSelect.disabled =
            true;

    }


    if (subjectSelect) {

        subjectSelect.disabled =
            true;

    }


    // =========================================================
    // LOAD COURSES
    // =========================================================

    await loadContributionCourses();


    // =========================================================
    // LOAD CONTRIBUTORS
    // =========================================================

    await loadContributors();

}


// ============================================================
// START
// ============================================================

if (
    document.readyState === "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeContributionPage
    );

} else {

    initializeContributionPage();

}