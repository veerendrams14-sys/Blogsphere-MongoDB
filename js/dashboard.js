
const BLOGS_API_URL = "http://localhost:5000/api/blogs";

// Dashboard elements
const blogsContainer = document.getElementById("blogsContainer");
const statNumbers = document.querySelectorAll(".stat-number");
const searchInput = document.getElementById("blogSearch");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");

let allBlogs = [];
let searchTimer = null;

// Get JWT token saved during login
function getToken() {
    return (
        localStorage.getItem("token") ||
        localStorage.getItem("authToken")
    );
}

// Add authentication token to API requests
function authHeaders() {
    const token = getToken();

    return token
        ? { Authorization: `Bearer ${token}` }
        : {};
}

// Redirect to login if authentication fails
function handleUnauthorized() {
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("blogSphereLoggedIn");
    localStorage.removeItem("blogSphereCurrentUser");

    window.location.href = "login.html";
}

// Safely display text inside HTML
function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[character]));
}

// Support MongoDB IDs and regular IDs
function getBlogId(blog) {
    return String(blog._id || blog.id || "");
}

// Safely read an API response
async function readResponse(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        throw new Error("The server returned an invalid response.");
    }
}

// Load blogs belonging to the logged-in user
async function loadBlogs() {
    if (!blogsContainer) {
        console.error("blogsContainer was not found in dashboard.html");
        return;
    }

    const token = getToken();

    if (!token) {
        handleUnauthorized();
        return;
    }

    blogsContainer.innerHTML = `
        <div class="empty-state">
            <h3>Loading your blogs...</h3>
            <p>Please wait a moment.</p>
        </div>
    `;

    try {
        const response = await fetch(BLOGS_API_URL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                ...authHeaders()
            }
        });

        const data = await readResponse(response);

        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            return;
        }

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Failed to load blogs.");
        }

        // Supports APIs returning { success: true, blogs: [...] }
        allBlogs = Array.isArray(data.blogs)
            ? data.blogs
            : Array.isArray(data.data)
                ? data.data
                : [];

        updateStatistics(allBlogs);
        renderFilteredBlogs();

    } catch (error) {
        console.error("Error loading blogs:", error);

        blogsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load blogs</h3>
                <p>${escapeHtml(error.message)}</p>
                <button type="button" class="create-button" id="retryLoadBlogs">
                    Try Again
                </button>
            </div>
        `;

        document.getElementById("retryLoadBlogs")
            ?.addEventListener("click", loadBlogs);
    }
}

// Update dashboard statistics
function updateStatistics(blogs) {
    const totalBlogs = blogs.length;

    const publishedBlogs = blogs.filter(
        blog => String(blog.status || "").toLowerCase() === "published"
    ).length;

    const draftBlogs = blogs.filter(
        blog => String(blog.status || "").toLowerCase() === "draft"
    ).length;

    const totalViews = blogs.reduce(
        (total, blog) => total + (Number(blog.views) || 0),
        0
    );

    // These correspond to the four .stat-number elements in dashboard.html
    if (statNumbers[0]) {
        statNumbers[0].textContent = totalBlogs;
    }

    if (statNumbers[1]) {
        statNumbers[1].textContent = publishedBlogs;
    }

    if (statNumbers[2]) {
        statNumbers[2].textContent = draftBlogs;
    }

    if (statNumbers[3]) {
        statNumbers[3].textContent = totalViews;
    }
}

// Search and filter blogs
function renderFilteredBlogs() {
    if (!blogsContainer) return;

    const term = (searchInput?.value || "").trim().toLowerCase();
    const category = (categoryFilter?.value || "").toLowerCase();
    const status = (statusFilter?.value || "").toLowerCase();

    const filteredBlogs = allBlogs.filter(blog => {
        const searchableText = [
            blog.title,
            blog.content,
            blog.category,
            Array.isArray(blog.tags)
                ? blog.tags.join(" ")
                : blog.tags
        ].join(" ").toLowerCase();

        const blogCategory = String(blog.category || "").toLowerCase();
        const blogStatus = String(blog.status || "").toLowerCase();

        return (
            (!term || searchableText.includes(term)) &&
            (!category || blogCategory === category) &&
            (!status || blogStatus === status)
        );
    });

    displayBlogs(filteredBlogs);
}

// Display blog cards
function displayBlogs(blogs) {
    if (!blogsContainer) return;

    if (blogs.length === 0) {
        const hasFilters = Boolean(
            (searchInput?.value || "").trim() ||
            categoryFilter?.value ||
            statusFilter?.value
        );

        blogsContainer.innerHTML = `
            <div class="empty-state">
                <h3>${hasFilters ? "No matching blogs" : "No blogs yet G£ìn+Å"}</h3>
                <p>
                    ${hasFilters
                        ? "Try changing your search or filters."
                        : "Create your first blog to get started."}
                </p>
                ${
                    hasFilters
                        ? `<button type="button" class="create-button" id="clearBlogFilters">
                               Clear Filters
                           </button>`
                        : `<a href="create-blog.html" class="create-button">
                               + Create Your First Blog
                           </a>`
                }
            </div>
        `;

        document.getElementById("clearBlogFilters")
            ?.addEventListener("click", () => {
                if (searchInput) searchInput.value = "";
                if (categoryFilter) categoryFilter.value = "";
                if (statusFilter) statusFilter.value = "";

                renderFilteredBlogs();
            });

        return;
    }

    blogsContainer.innerHTML = blogs.map(blog => {
        const rawId = getBlogId(blog);
        const encodedId = encodeURIComponent(rawId);

        const title = blog.title || "Untitled Blog";
        const content = String(blog.content || "");
        const excerpt = content.length > 220
            ? content.slice(0, 220) + "..."
            : content;

        const category = blog.category || "General";
        const status = String(blog.status || "published").toLowerCase();
        const views = Number(blog.views) || 0;
        const date = blog.updatedAt || blog.createdAt;

        const formattedDate = date
            ? new Date(date).toLocaleDateString()
            : "";

        return `
            <article class="blog-card">
                <div class="blog-card-content">

                    <span class="blog-category">
                        ${escapeHtml(category)}
                    </span>

                    <h3>
                        <a href="blog-details.html?id=${encodedId}">
                            ${escapeHtml(title)}
                        </a>
                    </h3>

                    <p>${escapeHtml(excerpt)}</p>

                    <div class="blog-meta">
                        <span>=ƒæü ${views} views</span>

                        <span class="status-pill status-${escapeHtml(status)}">
                            ${escapeHtml(status)}
                        </span>

                        <span>${escapeHtml(formattedDate)}</span>
                    </div>

                    <div class="blog-actions">
                        <a
                            class="edit-blog-button"
                            href="create-blog.html?id=${encodedId}">
                            Edit
                        </a>

                        <button
                            class="delete-blog-button"
                            type="button"
                            data-delete-id="${escapeHtml(rawId)}"
                            data-delete-title="${escapeHtml(title)}">
                            Delete
                        </button>
                    </div>

                </div>
            </article>
        `;
    }).join("");

    // Attach delete handlers after rendering
    blogsContainer.querySelectorAll("[data-delete-id]")
        .forEach(button => {
            button.addEventListener("click", () => {
                deleteBlog(
                    button.dataset.deleteId,
                    button.dataset.deleteTitle
                );
            });
        });
}

// Delete a blog
async function deleteBlog(id, title) {
    if (!id) {
        alert("This blog does not have a valid ID.");
        return;
    }

    const confirmed = confirm(
        `Delete "${title}" permanently? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
        const response = await fetch(
            `${BLOGS_API_URL}/${encodeURIComponent(id)}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    ...authHeaders()
                }
            }
        );

        const data = await readResponse(response);

        if (response.status === 401 || response.status === 403) {
            handleUnauthorized();
            return;
        }

        if (!response.ok || data.success === false) {
            throw new Error(data.message || "Failed to delete blog.");
        }

        // Update the dashboard after successful deletion
        allBlogs = allBlogs.filter(
            blog => getBlogId(blog) !== String(id)
        );

        updateStatistics(allBlogs);
        renderFilteredBlogs();

    } catch (error) {
        console.error("Delete blog error:", error);

        alert(
            error.message ||
            "Unable to delete blog. Check your backend connection."
        );
    }
}

// Search blogs with a small delay
searchInput?.addEventListener("input", () => {
    clearTimeout(searchTimer);

    searchTimer = setTimeout(() => {
        renderFilteredBlogs();
    }, 150);
});

// Filter by category
categoryFilter?.addEventListener("change", renderFilteredBlogs);

// Filter by publication status
statusFilter?.addEventListener("change", renderFilteredBlogs);

// Load dashboard when the page opens
loadBlogs();
