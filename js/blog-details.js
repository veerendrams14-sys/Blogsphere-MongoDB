
const API_BASE = "http://localhost:5000/api/blogs";

const target = document.getElementById("blogDetails");

const blogId = new URLSearchParams(
    window.location.search
).get("id");

// Get the JWT saved during login
function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );
}

// Escape HTML to safely display blog content
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[character]));
}

// Read the API response safely
async function readResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error("The server returned an invalid response.");
    }
}

// Redirect to login if the token is missing or invalid
function redirectToLogin() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("blogSphereLoggedIn");
    localStorage.removeItem("blogSphereCurrentUser");

    window.location.href = "login.html";
}

// Format the publication date
function formatDate(dateValue) {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleDateString();
}

// Display a blog's details
function displayBlog(blog) {
    if (!target) return;

    const title = blog.title || "Untitled Blog";
    const category = blog.category || "General";
    const content = blog.content || "";
    const views = Number(blog.views) || 0;
    const date = formatDate(blog.createdAt || blog.updatedAt);

    const tags = Array.isArray(blog.tags)
        ? blog.tags.join(", ")
        : String(blog.tags || "");

    target.innerHTML = `
        <article class="blog-details-content">

            <span class="blog-category">
                ${escapeHtml(category)}
            </span>

            <h1>${escapeHtml(title)}</h1>

            <p class="details-meta">
                ${escapeHtml(date)}
                ${date ? " · " : ""}
                👁 ${views} views
            </p>

            <div class="details-content">
                ${escapeHtml(content).replace(/\r?\n/g, "<br>")}
            </div>

            ${
                tags.trim()
                    ? `<p class="details-meta">
                           <strong>Tags:</strong> ${escapeHtml(tags)}
                       </p>`
                    : ""
            }

            <div class="blog-actions">
                <a href="dashboard.html" class="create-button">
                    Back to Dashboard
                </a>

                <a
                    href="create-blog.html?id=${encodeURIComponent(
                        String(blog._id || blog.id || blogId)
                    )}"
                    class="edit-blog-button">
                    Edit Blog
                </a>
            </div>

        </article>
    `;
}

// Fetch the selected blog from the backend
async function loadBlogDetails() {
    if (!target) {
        console.error(
            'Element with id="blogDetails" was not found in blog-details.html'
        );
        return;
    }

    if (!blogId) {
        target.innerHTML = `
            <div class="empty-state">
                <h3>No blog selected</h3>
                <p>Please select a blog from your dashboard.</p>
                <a href="dashboard.html" class="create-button">
                    Back to Dashboard
                </a>
            </div>
        `;
        return;
    }

    const token = getToken();

    if (!token) {
        redirectToLogin();
        return;
    }

    target.innerHTML = `
        <div class="empty-state">
            <h3>Loading blog...</h3>
            <p>Please wait while we fetch the blog details.</p>
        </div>
    `;

    try {
        const response = await fetch(
            `${API_BASE}/${encodeURIComponent(blogId)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const data = await readResponse(response);

        if (response.status === 401 || response.status === 403) {
            redirectToLogin();
            return;
        }

        if (!response.ok || data.success === false) {
            throw new Error(
                data.message || "Unable to find this blog."
            );
        }

        // Supports { success: true, blog: {...} }
        const blog = data.blog || data.data;

        if (!blog || typeof blog !== "object") {
            throw new Error("Blog details were not found in the response.");
        }

        displayBlog(blog);

    } catch (error) {
        console.error("Error loading blog details:", error);

        target.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load blog</h3>
                <p>${escapeHtml(error.message)}</p>
                <a href="dashboard.html" class="create-button">
                    Back to Dashboard
                </a>
                <button
                    type="button"
                    class="create-button"
                    id="retryBlogDetails">
                    Try Again
                </button>
            </div>
        `;

        document.getElementById("retryBlogDetails")
            ?.addEventListener("click", loadBlogDetails);
    }
}

// Start when the page opens
loadBlogDetails();
