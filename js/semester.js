const API_HOST = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
const API_BASE = "http://" + API_HOST + ":5000/api";

function makeSlug(value) {
    return String(value ?? "")
        .trim()
        .toLowerCase()
        .replace(/&/g, "and")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

async function fetchCourses() {
    try {
        const response = await fetch(`${API_BASE}/courses`, { cache: "no-store" });
        if (response.ok) {
            const data = await response.json();
            const list = Array.isArray(data) ? data : (data.courses || []);
            if (list.length) return list;
        }
    } catch (e) {
        console.warn("Course API unavailable for semester page:", e);
    }

    return [];
}

async function fetchSubjects(courseId, courseSlug, period) {
    if (courseId) {
        try {
            const response = await fetch(
                `${API_BASE}/subjects/course/${encodeURIComponent(courseId)}/semester/${encodeURIComponent(period)}`,
                { cache: "no-store" }
            );
            if (response.ok) {
                const data = await response.json();
                const list = Array.isArray(data) ? data : (data.subjects || []);
                if (list.length) return list;
            }
        } catch (e) {
            console.warn("Subject API unavailable:", e);
        }
    }

    return [];
}

async function loadSemesterPage() {
    const params = new URLSearchParams(location.search);
    const courseQuery = params.get("course");
    const period = params.get("semester") || params.get("year");

    if (!courseQuery) return;

    const courses = await fetchCourses();
    const course = courses.find(item => {
        const itemSlug = item.slug || makeSlug(item.name);
        const querySlug = makeSlug(courseQuery);
        return itemSlug === querySlug || item._id === courseQuery || (item.name && item.name.toLowerCase() === courseQuery.toLowerCase());
    });

    if (!course) return;

    const courseSlug = course.slug || makeSlug(course.name);
    updateCourseInfo(course, period);
    loadSemesterSubjects(course, courseSlug, period);
}

function updateCourseInfo(course, period) {
    const icon = document.querySelector("[data-course-icon]");
    const name = document.querySelector("[data-course-name]");
    const description = document.querySelector("[data-course-description]");
    const currentPeriod = document.querySelector("[data-current-semester]");

    const periodLabel = course.structureType === "yearly" ? "Year" : "Semester";

    if (icon) icon.textContent = course.icon || "🎓";
    if (name) name.textContent = course.name;
    if (description) {
        description.textContent = course.description || `${periodLabel} ${period} resources for ${course.name}.`;
    }
    if (currentPeriod) {
        currentPeriod.textContent = period;
    }
}

function escapeHTML(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function loadSemesterSubjects(course, courseSlug, period) {
    const subjectList = document.querySelector("[data-subjects]");
    if (!subjectList) return;

    const subjects = await fetchSubjects(course._id, courseSlug, period);

    if (!subjects.length) {
        subjectList.innerHTML = `
            <div class="empty-state">
                <h3>No subjects found for this ${course.structureType === "yearly" ? "year" : "semester"}.</h3>
            </div>
        `;
        return;
    }

    subjectList.innerHTML = subjects.map(subject => {
        const subSlug = subject.slug || makeSlug(subject.name);
        const subIcon = escapeHTML(subject.icon || "📘");
        const subName = escapeHTML(subject.name || "");
        const subCode = subject.code ? escapeHTML(subject.code) : "";
        const courseParam = course._id || courseSlug;

        return `
            <article class="subject-card panel">
                <span class="icon">${subIcon}</span>
                <h3>${subName}</h3>
                ${subCode ? `<p class="subject-code">${subCode}</p>` : ""}
                <a class="resource-link" href="subject.html?course=${encodeURIComponent(courseParam)}&semester=${encodeURIComponent(period)}&subject=${encodeURIComponent(subSlug)}">
                    View Subject →
                </a>
            </article>
        `;
    }).join("");
}

document.addEventListener("DOMContentLoaded", () => {
    loadSemesterPage();
});