const API_URL = "http://localhost:5000/api/auth";

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

const token = localStorage.getItem("token");

let originalName = "";

// Redirect if the user is not logged in
if (!token) {
  window.location.href = "login.html";
} else {
  loadProfile();
}

// Load profile information from MongoDB through the backend
async function loadProfile() {
  try {
    message.textContent = "Loading profile...";

    const response = await fetch(`${API_URL}/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      logout();
      return;
    }

    if (!response.ok || !data.success || !data.user) {
      throw new Error(data.message || "Could not load profile.");
    }

    const user = data.user;

    nameInput.value = user.name || "";
    emailInput.value = user.email || "";

    joinedInput.value = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString()
      : "Date unavailable";

    originalName = nameInput.value;

    avatar.textContent =
      (user.name || "B").charAt(0).toUpperCase();

    localStorage.setItem(
      "blogSphereCurrentUser",
      JSON.stringify(user)
    );

    message.textContent = "";

  } catch (error) {
    message.textContent =
      error.message || "Unable to load profile.";
  }
}

// Enable name editing
editButton.addEventListener("click", () => {
  originalName = nameInput.value;

  nameInput.readOnly = false;
  nameInput.focus();

  editButton.hidden = true;
  saveButton.hidden = false;

  if (cancelButton) {
    cancelButton.hidden = false;
  }

  message.textContent = "Update your name and click Save Name.";
});

// Save the updated name to the backend
saveButton.addEventListener("click", async () => {
  const name = nameInput.value.trim();

  if (!name || name.length > 100) {
    message.textContent =
      "Enter a name between 1 and 100 characters.";
    return;
  }

  saveButton.disabled = true;
  message.textContent = "Saving your name...";

  try {
    const response = await fetch(`${API_URL}/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    const data = await response.json();

    if (response.status === 401 || response.status === 403) {
      logout();
      return;
    }

    if (!response.ok || !data.success || !data.user) {
      throw new Error(data.message || "Unable to save your name.");
    }

    nameInput.value = data.user.name || name;
    nameInput.readOnly = true;

    originalName = nameInput.value;

    avatar.textContent =
      (nameInput.value || "B").charAt(0).toUpperCase();

    // Keep the updated user details in local storage
    const currentUser = JSON.parse(
      localStorage.getItem("blogSphereCurrentUser") || "{}"
    );

    localStorage.setItem(
      "blogSphereCurrentUser",
      JSON.stringify({
        ...currentUser,
        ...data.user
      })
    );

    editButton.hidden = false;
    saveButton.hidden = true;

    if (cancelButton) {
      cancelButton.hidden = true;
    }

    message.textContent = "Name updated successfully!";

  } catch (error) {
    message.textContent =
      error.message || "Unable to save your name.";
  } finally {
    saveButton.disabled = false;
  }
});

// Cancel name editing
if (cancelButton) {
  cancelButton.addEventListener("click", () => {
    nameInput.value = originalName;
    nameInput.readOnly = true;

    editButton.hidden = false;
    saveButton.hidden = true;
    cancelButton.hidden = true;

    message.textContent = "Changes cancelled.";
  });
}

// Logout
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("blogSphereLoggedIn");
  localStorage.removeItem("blogSphereCurrentUser");
  localStorage.removeItem("editingDraftId");

  window.location.href = "login.html";
}

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}
