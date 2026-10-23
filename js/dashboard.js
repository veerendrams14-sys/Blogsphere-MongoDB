function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[ch])); }

const BLOGS_API_URL = "http://localhost:5000/api/blogs";

const blogsContainer = document.getElementById("blogsContainer");
const statNumbers = document.querySelectorAll(".stat-number");


async function loadBlogs() {

    try {

    const response = await fetch(BLOGS_API_URL);
        const data = await response.json();

        console.log("Blogs received:", data);

        if (!data.success) {
            throw new Error("Failed to load blogs");
        }

        const blogs = data.blogs;

        // Update dashboard statistics
        updateStatistics(blogs);

        // Display blogs
        displayBlogs(blogs);

    } catch (error) {

        console.error("Error loading blogs:", error);

        blogsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load blogs</h3>
                <p>
                    Please make sure the backend server is running.
                </p>
            </div>
        `;
    }
}


function updateStatistics(blogs) {

    const totalBlogs = blogs.length;

    const publishedBlogs = blogs.filter(
        blog => blog.status === "published"
    ).length;

    const draftBlogs = blogs.filter(
        blog => blog.status === "draft"
    ).length;

    const totalViews = blogs.reduce(
        (total, blog) => total + (blog.views || 0),
        0
    );


    statNumbers[0].textContent = totalBlogs;
    statNumbers[1].textContent = publishedBlogs;
    statNumbers[2].textContent = draftBlogs;
    statNumbers[3].textContent = totalViews;
}


function displayBlogs(blogs) {

    if (blogs.length === 0) {

        blogsContainer.innerHTML = `
            <div class="empty-state">

                <h3>No blogs yet ✍️</h3>

                <p>
                    You haven't created any blogs yet.
                </p>

                <a href="create-blog.html" class="create-button">
                    + Create Your First Blog
                </a>

            </div>
        `;

        return;
    }


    blogsContainer.innerHTML = blogs.map(blog => {

        return `
            <article class="blog-card">

                <div class="blog-card-content">

                    <span class="blog-category">
                        ${escapeHtml(blog.category || "General")}
                    </span>

                    <h3>
                        <a href="blog-details.html?id=${encodeURIComponent(blog.id || blog._id)}">${escapeHtml(blog.title)}</a>
                    </h3>

                    <p>
                        ${escapeHtml(blog.content)}
                    </p>

                    <div class="blog-meta">

                        <span>
                            👁 ${blog.views || 0} views
                        </span>

                        <span>
                            ${blog.status || "published"}
                        </span>

                    </div>

                </div>

            </article>
        `;

    }).join("");
}


// Load blogs when dashboard opens
loadBlogs();