document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("[data-contact-form]");
  if (!form) return;

  const apiHost = (typeof window !== "undefined" && window.location && window.location.hostname) ? window.location.hostname : "localhost";
  const API_URL = "http://" + apiHost + ":5000/api/messages";

  const subjectLabels = {
    general: "General Question",
    feedback: "Feedback",
    notes: "Notes / Resources",
    technical: "Technical Problem",
    contribution: "Contribution",
    other: "Other"
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const button = form.querySelector('button[type="submit"]');
    const original = button?.textContent;
    if (button) {
      button.disabled = true;
      button.textContent = "Sending...";
    }

    try {
      const rawData = Object.fromEntries(new FormData(form).entries());
      const selectedSubject = rawData.subject || "";
      const subjectText = subjectLabels[selectedSubject] || selectedSubject;

      const payload = {
        name: (rawData.name || "").trim(),
        email: (rawData.email || "").trim(),
        subject: subjectText.trim(),
        message: (rawData.message || "").trim()
      };

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(result.message || "Unable to send message.");
      }

      form.reset();
      const status =
        form.querySelector("[data-contact-status]") ||
        document.createElement("p");
      status.className = "admin-message show";
      status.setAttribute("data-contact-status", "");
      status.style.color = "#16a34a";
      status.textContent =
        result.message || "Your message has been sent successfully!";
      if (!status.parentNode) form.appendChild(status);
    } catch (error) {
      const status =
        form.querySelector("[data-contact-status]") ||
        document.createElement("p");
      status.className = "admin-message show";
      status.setAttribute("data-contact-status", "");
      status.style.color = "#dc2626";
      status.textContent = error.message;
      if (!status.parentNode) form.appendChild(status);
    } finally {
      if (button) {
        button.disabled = false;
        button.textContent = original;
      }
    }
  });
});

