const API_URL = "http://localhost:5000/api/blogs";

// Get authentication headers for protected API requests.
function getAuthHeaders(json = false) {
    const headers = {};
    const token = localStorage.getItem("token");

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    if (json) {
        headers["Content-Type"] = "application/json";
    }

    return headers;
}

const blogForm = document.getElementById("blogForm");
const params = new URLSearchParams(window.location.search);
const editId = params.get("id");

const titleHeading = document.querySelector(".create-header h1");
const submitButton = blogForm.querySelector('button[type="submit"]');
const draftButton = blogForm.querySelector(".draft-button");

let isLoadingBlog = false;

function formValues(status) {
    return {
        title: document.getElementById("blogTitle").value.trim(),
        category: document.getElementById("category").value,
        tags: document.getElementById("tags").value.trim(),
        content: document.getElementById("content").value.trim(),
        status: status
    };
}

async function saveBlog(status) {
    if (isLoadingBlog) return;

    const token = localStorage.getItem("token");

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

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            alert("Your login session has expired. Please log in again.");
            localStorage.removeItem("token");
            localStorage.removeItem("authToken");
            localStorage.removeItem("blogSphereLoggedIn");
            localStorage.removeItem("blogSphereCurrentUser");
            window.location.href = "login.html";
            return;
        }

        if (!response.ok || !data.success) {
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
            "\nPlease check that the backend is running and MongoDB is connected."
        );

    } finally {
        submitButton.disabled = false;
        draftButton.disabled = false;
        submitButton.textContent = originalSubmitText;
    }
}

// Publish a new blog or publish changes to an existing blog.
blogForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveBlog("published");
});

// Save a blog as a draft.
draftButton.addEventListener("click", function (event) {
    event.preventDefault();
    saveBlog("draft");
});

// Load an existing blog when Edit is selected.
async function loadBlogForEditing() {
    if (!editId) return;

    const token = localStorage.getItem("token");

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

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            throw new Error("Your login session is invalid. Please log in again.");
        }

        if (!response.ok || !data.success) {
            throw new Error(data.message || "Unable to load blog details.");
        }

        // Support either response format.
        const blog = data.blog || data.data;

        if (!blog) {
            throw new Error("Blog details were not returned by the server.");
        }

        document.getElementById("blogTitle").value = blog.title || "";

        const categoryField = document.getElementById("category");
        categoryField.value = blog.category || "";

        // Add a category option if it is not already listed.
        if (blog.category && categoryField.value !== blog.category) {
            const option = document.createElement("option");
            option.value = blog.category;
            option.textContent = blog.category;
            categoryField.appendChild(option);
            categoryField.value = blog.category;
        }

        document.getElementById("tags").value = blog.tags || "";
        document.getElementById("content").value = blog.content || "";

        submitButton.textContent =
            blog.status === "published"
                ? "Save Changes & Publish"
                : "Publish Blog";

        draftButton.textContent = "Save Changes as Draft";

    } catch (error) {
        console.error("Load blog error:", error);
        alert(error.message || "Unable to load blog details.");

        window.location.href = "dashboard.html";

    } finally {
        isLoadingBlog = false;
        submitButton.disabled = false;
        draftButton.disabled = false;
    }
}

loadBlogForEditing();
