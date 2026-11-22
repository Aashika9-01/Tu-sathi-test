/* TU Sathi admin authentication UI.
   Handles AJAX login, error messaging, remember device, and seamless redirection. */

(function () {
    const form = document.querySelector('.admin-login form');
    const message = document.querySelector('.admin-message');
    const emailInput = document.querySelector('input[name="email"]');
    const passwordInput = document.querySelector('input[name="password"]');
    const rememberCheckbox = document.querySelector('input[name="remember"]');
    const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

    const messages = {
        invalid: 'Invalid administrator email or password.',
        locked_out: 'Too many failed attempts. Your account is temporarily locked for 15 minutes.',
        session_timeout: 'Your administrator session expired. Please sign in again.',
        email_config: 'OTP email is not configured on the server.',
        email_failed: 'The OTP email could not be sent. Please try again later.',
        otp_expired: 'Your verification session expired. Please sign in again.'
    };

    function showErrorMessage(text) {
        if (!message) return;
        message.textContent = text;
        message.classList.add('show');
        message.style.display = 'block';
    }

    function hideErrorMessage() {
        if (!message) return;
        message.textContent = '';
        message.classList.remove('show');
        message.style.display = 'none';
    }

    // 1. Check URL parameters for server-side redirect errors
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const emailParam = params.get('email');

    if (error && messages[error]) {
        showErrorMessage(messages[error]);
    } else if (error) {
        showErrorMessage('Sign in failed. Please verify your credentials and try again.');
    }

    if (emailParam && emailInput && !emailInput.value) {
        emailInput.value = emailParam;
    } else if (emailInput && !emailInput.value) {
        const savedEmail = localStorage.getItem('tu_admin_email');
        if (savedEmail) {
            emailInput.value = savedEmail;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }

    if (error || emailParam) {
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    // 2. Intercept Form Submission with AJAX to prevent page refresh flicker
    if (form) {
        form.addEventListener('submit', async function (e) {
            e.preventDefault();
            hideErrorMessage();

            const email = emailInput ? emailInput.value.trim() : '';
            const password = passwordInput ? passwordInput.value : '';

            if (!email || !password) {
                showErrorMessage('Please enter both administrator email and password.');
                return;
            }

            // Save or clear remember device
            if (rememberCheckbox && rememberCheckbox.checked) {
                localStorage.setItem('tu_admin_email', email);
            } else {
                localStorage.removeItem('tu_admin_email');
            }

            const originalBtnText = submitBtn ? submitBtn.textContent : 'Sign In Securely';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Verifying Credentials...';
            }

            try {
                const formData = new FormData(form);
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json'
                    }
                });

                const contentType = response.headers.get('content-type') || '';

                if (contentType.includes('application/json')) {
                    const data = await response.json();

                    if (data.success) {
                        if (submitBtn) submitBtn.textContent = 'Sign In Successful! Redirecting...';
                        window.location.href = data.redirect || 'Backend/admin/dashboard.php';
                        return;
                    } else {
                        const errMsg = data.message || messages[data.error] || 'Sign in failed. Please check your credentials.';
                        showErrorMessage(errMsg);
                    }
                } else if (response.redirected) {
                    window.location.href = response.url;
                    return;
                } else {
                    form.submit();
                    return;
                }
            } catch (err) {
                console.error('Admin login error:', err);
                form.submit();
                return;
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    }
})();
