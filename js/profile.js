
"use strict";

// Correct deployed backend URL
const API_URL = "https://blogsphere-mongo-db.vercel.app/api/auth";

// Profile fields
const nameInput = document.getElementById("profileName");
const emailInput = document.getElementById("profileEmail");
const joinedInput = document.getElementById("joinedDate");
const avatar = document.getElementById("avatar");
const message = document.getElementById("profileMessage");

const editButton = document.getElementById("editButton");
const saveButton = document.getElementById("saveButton");
const cancelButton = document.getElementById("cancelButton");
const logoutButton = document.getElementById("logoutButton");

function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );
}

let originalName = "";

// Safely read API responses
async function readResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error("The server returned an invalid response.");
    }
}

// Show messages safely
function showMessage(text) {
    if (message) {
        message.textContent = text;
    }
}

// Redirect if the login session is invalid
function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("blogSphereLoggedIn");
    localStorage.removeItem("blogSphereCurrentUser");
    localStorage.removeItem("editingDraftId");

    window.location.href = "login.html";
}

// Load profile information from the backend
async function loadProfile() {
    const token = getToken();

    if (!token) {
        window.location.href = "login.html";
        return;
    }

    try {
        showMessage("Loading profile...");

        const response = await fetch(`${API_URL}/me`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        const data = await readResponse(response);

        if (response.status === 401 || response.status === 403) {
            logout();
            return;
        }

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Could not load profile.");
        }

        const user = data.user || data.data?.user || data.data;

        if (!user || typeof user !== "object") {
            throw new Error("The server did not return profile details.");
        }

        if (nameInput) {
            nameInput.value = user.name || "";
            nameInput.readOnly = true;
        }

        if (emailInput) {
            emailInput.value = user.email || "";
        }

        if (joinedInput) {
            joinedInput.value = user.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Date unavailable";
        }

        originalName = nameInput?.value || "";

        if (avatar) {
            avatar.textContent =
                (user.name || "B").charAt(0).toUpperCase();
        }

        localStorage.setItem(
            "blogSphereCurrentUser",
            JSON.stringify(user)
        );

        showMessage("");

    } catch (error) {
        console.error("Load profile error:", error);

        showMessage(
            error.message || "Unable to load profile. Please try again."
        );
    }
}

// Enable name editing
if (editButton) {
    editButton.addEventListener("click", () => {
        if (!nameInput) return;

        originalName = nameInput.value;
        nameInput.readOnly = false;
        nameInput.focus();

        editButton.hidden = true;

        if (saveButton) saveButton.hidden = false;
        if (cancelButton) cancelButton.hidden = false;

        showMessage("Update your name and click Save Name.");
    });
}

// Save the updated name
if (saveButton) {
    saveButton.addEventListener("click", async () => {
        const token = getToken();

        if (!token) {
            logout();
            return;
        }

        const name = nameInput?.value.trim() || "";

        if (!name || name.length > 100) {
            showMessage("Enter a name between 1 and 100 characters.");
            return;
        }

        saveButton.disabled = true;
        showMessage("Saving your name...");

        try {
            const response = await fetch(`${API_URL}/me`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name })
            });

            const data = await readResponse(response);

            if (response.status === 401 || response.status === 403) {
                logout();
                return;
            }

            if (!response.ok || data.success === false) {
                throw new Error(data.message || "Unable to save your name.");
            }

            const updatedUser =
                data.user || data.data?.user || data.data;

            if (!updatedUser || typeof updatedUser !== "object") {
                throw new Error("The server did not return the updated profile.");
            }

            const updatedName = updatedUser.name || name;

            nameInput.value = updatedName;
            nameInput.readOnly = true;
            originalName = updatedName;

            if (avatar) {
                avatar.textContent = updatedName.charAt(0).toUpperCase();
            }

            const currentUser = JSON.parse(
                localStorage.getItem("blogSphereCurrentUser") || "{}"
            );

            localStorage.setItem(
                "blogSphereCurrentUser",
                JSON.stringify({
                    ...currentUser,
                    ...updatedUser
                })
            );

            editButton.hidden = false;
            saveButton.hidden = true;

            if (cancelButton) cancelButton.hidden = true;

            showMessage("Name updated successfully!");

        } catch (error) {
            console.error("Save profile error:", error);

            showMessage(
                error.message || "Unable to save your name. Please try again."
            );
        } finally {
            saveButton.disabled = false;
        }
    });
}

// Cancel name editing
if (cancelButton) {
    cancelButton.addEventListener("click", () => {
        if (nameInput) {
            nameInput.value = originalName;
            nameInput.readOnly = true;
        }

        if (editButton) editButton.hidden = false;
        if (saveButton) saveButton.hidden = true;
        cancelButton.hidden = true;

        showMessage("Changes cancelled.");
    });
}

// Logout
if (logoutButton) {
    logoutButton.addEventListener("click", logout);
}

// Load the profile when the page opens
if (!getToken()) {
    window.location.href = "login.html";
} else {
    loadProfile();
}
