
"use strict";

// ============================================================
// BLOGSPHERE - MAIN JAVASCRIPT
// Module 5: Authentication and Logout
// ============================================================

const API_URL = "http://localhost:5000";

// ============================================================
// HELPER: READ JSON RESPONSE SAFELY
// ============================================================

async function readResponse(response) {
    try {
        return await response.json();
    } catch (error) {
        return {
            success: false,
            message: "Invalid response from server."
        };
    }
}

// ============================================================
// HELPER: SAVE LOGIN INFORMATION
// ============================================================

function saveLoginSession(data) {
    if (!data || !data.token || !data.user) {
        throw new Error(
            "Login response is missing the authentication token or user details."
        );
    }

    // Save JWT for protected backend requests
    localStorage.setItem("token", data.token);

    // Keep existing BlogSphere login information
    localStorage.setItem("blogSphereLoggedIn", "true");
    localStorage.setItem(
        "blogSphereCurrentUser",
        JSON.stringify(data.user)
    );
}

// ============================================================
// HELPER: LOG OUT
// ============================================================

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("blogSphereLoggedIn");
    localStorage.removeItem("blogSphereCurrentUser");
    localStorage.removeItem("editingDraftId");

    window.location.href = "login.html";
}

// ============================================================
// MODULE 5: USER REGISTRATION
// ============================================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const nameInput = document.getElementById("name");
        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");
        const confirmPasswordInput =
            document.getElementById("confirmPassword");

        if (
            !nameInput ||
            !emailInput ||
            !passwordInput ||
            !confirmPasswordInput
        ) {
            alert("Registration form fields are missing.");
            return;
        }

        const name = nameInput.value.trim();
        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill in all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters.");
            return;
        }

        const submitButton = registerForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        try {
            if (submitButton) submitButton.disabled = true;

            const response = await fetch(
                `${API_URL}/api/auth/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await readResponse(response);

            if (!response.ok || !data.success) {
                alert(data.message || "Registration failed.");
                return;
            }

            alert(data.message || "Registration successful!");

            window.location.href = "login.html";
        } catch (error) {
            console.error("Registration error:", error);

            alert(
                "Unable to connect to BlogSphere. " +
                "Check that the backend is running."
            );
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// ============================================================
// MODULE 5: USER LOGIN WITH JWT
// ============================================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const emailInput = document.getElementById("email");
        const passwordInput = document.getElementById("password");

        if (!emailInput || !passwordInput) {
            alert("Login form fields are missing.");
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"], input[type="submit"]'
        );

        try {
            if (submitButton) submitButton.disabled = true;

            const response = await fetch(
                `${API_URL}/api/auth/login`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await readResponse(response);

            if (!response.ok || !data.success) {
                alert(data.message || "Invalid email or password.");
                return;
            }

            // The backend must return a JWT token.
            saveLoginSession(data);

            alert(data.message || "Login successful!");

            window.location.href = "dashboard.html";
        } catch (error) {
            console.error("Login error:", error);

            alert(
                error.message ||
                "Unable to connect to BlogSphere. Check the backend."
            );
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

// ============================================================
// MODULE 5: LOGOUT
// ============================================================

const logoutLink = document.getElementById("logoutLink");

if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();
        logoutUser();
    });
}

// Support logout buttons that use this class.
document.querySelectorAll(".logout-button").forEach(function (button) {
    button.addEventListener("click", function (event) {
        event.preventDefault();
        logoutUser();
    });
});
