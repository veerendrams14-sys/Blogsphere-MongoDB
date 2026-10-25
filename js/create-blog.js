
"use strict";

const API_URL = "https://blogsphere-mongo-db.vercel.app/api/blogs";

// Get authentication headers for protected API requests.
function getAuthHeaders(json = false) {
    const headers = {};
    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (json) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

// Form elements
const blogForm = document.getElementById("blogForm");
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

const titleHeading = document.querySelector(".create-header h1");
const submitButton = blogForm.querySelector('button[type="submit"]');
const draftButton = blogForm.querySelector(".draft-button");

let isLoadingBlog = false;

// Read a response safely
async function readResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error("The server returned an invalid response.");
    }
}

// Convert tags to a string for the input field
function formatTags(tags) {
    if (Array.isArray(tags)) {
        return tags.join(", ");
    }

    return tags || "";
}

// Get form values
function formValues(status) {
    return {
        title: document.getElementById("blogTitle").value.trim(),
        category: document.getElementById("category").value,
        tags: document.getElementById("tags").value.trim(),
        content: document.getElementById("content").value.trim(),
        status
    };
}

// Handle expired login sessions
function handleUnauthorized() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("blogSphereLoggedIn");
    localStorage.removeItem("blogSphereCurrentUser");

    alert("Your login session has expired. Please log in again.");
    window.location.href = "login.html";
}

// Save or update a blog
async function saveBlog(status) {
    if (isLoadingBlog) return;

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    if (!token) {
        alert("Your login session is missing. Please log in again.");
        window.location.href = "login.html";
        return;
    }

    const blogData = formValues(status);

    if (!blogData.title || !blogData.category || !blogData.content) {
        alert("Please fill in the title, category and content.");
        return;
    }

    const originalSubmitText = submitButton.textContent;

    submitButton.disabled = true;
    draftButton.disabled = true;
    submitButton.textContent = editId ? "Saving..." : "Publishing...";

    try {
        const response = await fetch(
            editId
                ? `${API_URL}/${encodeURIComponent(editId)}`
                : API_URL,
            {
                method: editId ? "PUT" : "POST",
                headers: getAuthHeaders(true),
                body: JSON.stringify(blogData)
            }
        );

        const data = await readResponse(response);

        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            return;
        }

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Unable to save blog.");
        }

        alert(
            status === "draft"
                ? "Draft saved successfully!"
                : editId
                    ? "Blog updated successfully!"
                    : "Blog published successfully!"
        );

        window.location.href = "dashboard.html";

    } catch (error) {
        console.error("Save blog error:", error);

        alert(
            (error.message || "Unable to save blog.") +
            "\nPlease check the backend connection and try again."
        );

    } finally {
        submitButton.disabled = false;
        draftButton.disabled = false;
        submitButton.textContent = originalSubmitText;
    }
}

// Publish a new blog or update an existing blog
blogForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveBlog("published");
});

// Save a blog as a draft
draftButton.addEventListener("click", function (event) {
    event.preventDefault();
    saveBlog("draft");
});

// Load an existing blog when Edit is selected
async function loadBlogForEditing() {
    if (!editId) return;

    const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

    if (!token) {
        alert("Please log in to edit a blog.");
        window.location.href = "login.html";
        return;
    }

    isLoadingBlog = true;
    submitButton.disabled = true;
    draftButton.disabled = true;

    if (titleHeading) {
        titleHeading.textContent = "Edit Blog";
    }

    submitButton.textContent = "Loading Blog...";

    try {
        const response = await fetch(
            `${API_URL}/${encodeURIComponent(editId)}`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        const data = await readResponse(response);

        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            return;
        }

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Unable to load blog details.");
        }

        // Support common API response formats
        let blog = data.blog || data.data || data;

        // Some APIs return an array of blogs
        if (Array.isArray(blog)) {
            blog = blog.find(item =>
                String(item._id || item.id) === String(editId)
            );
        }

        // Some APIs wrap the blog inside a result property
        if (blog && blog.blog) {
            blog = blog.blog;
        }

        if (
            !blog ||
            typeof blog !== "object" ||
            (!blog._id && !blog.id && !blog.title)
        ) {
            throw new Error(
                "The server did not return the selected blog. " +
                "Please check the backend GET /api/blogs/:id route."
            );
        }

        // Fill title
        document.getElementById("blogTitle").value =
            blog.title || "";

        // Fill category, including categories not in the dropdown
        const categoryField = document.getElementById("category");
        const savedCategory = blog.category || "";

        if (
            savedCategory &&
            !Array.from(categoryField.options).some(
                option => option.value === savedCategory
            )
        ) {
            const option = document.createElement("option");
            option.value = savedCategory;
            option.textContent = savedCategory;
            categoryField.appendChild(option);
        }

        categoryField.value = savedCategory;

        // Fill tags and content
        document.getElementById("tags").value =
            formatTags(blog.tags);

        document.getElementById("content").value =
            blog.content || "";

        // Update button labels
        submitButton.textContent =
            String(blog.status || "").toLowerCase() === "published"
                ? "Save Changes & Publish"
                : "Publish Blog";

        draftButton.textContent = "Save Changes as Draft";

    } catch (error) {
        console.error("Load blog error:", error);

        alert(
            error.message ||
            "Unable to load blog details."
        );

        window.location.href = "dashboard.html";

    } finally {
        isLoadingBlog = false;
        submitButton.disabled = false;
        draftButton.disabled = false;
    }
}

// Load editing details when the page opens
loadBlogForEditing();
