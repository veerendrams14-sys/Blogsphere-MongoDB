const BLOGS_API_URL = "http://localhost:5000/api/blogs";
const blogsContainer = document.getElementById("blogsContainer");
const statNumbers = document.querySelectorAll(".stat-number");
const searchInput = document.getElementById("blogSearch");
const categoryFilter = document.getElementById("categoryFilter");
const statusFilter = document.getElementById("statusFilter");
let allBlogs = [];
let searchTimer;

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[ch]));
}
function blogId(blog) { return String(blog.id || blog._id || ""); }

async function loadBlogs() {
  try {
    const response = await fetch(BLOGS_API_URL);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Failed to load blogs");
    allBlogs = data.blogs || [];
    updateStatistics(allBlogs);
    renderFilteredBlogs();
  } catch (error) {
    console.error("Error loading blogs:", error);
    blogsContainer.innerHTML = '<div class="empty-state"><h3>Unable to load blogs</h3><p>Check that the backend is running and MongoDB is connected, then refresh this page.</p></div>';
  }
}
function updateStatistics(blogs) {
  const total = blogs.length;
  const published = blogs.filter(blog => blog.status === "published").length;
  const drafts = blogs.filter(blog => blog.status === "draft").length;
  const views = blogs.reduce((sum, blog) => sum + Number(blog.views || 0), 0);
  if (statNumbers[0]) statNumbers[0].textContent = total;
  if (statNumbers[1]) statNumbers[1].textContent = published;
  if (statNumbers[2]) statNumbers[2].textContent = drafts;
  if (statNumbers[3]) statNumbers[3].textContent = views;
}
function renderFilteredBlogs() {
  const term = (searchInput?.value || "").trim().toLowerCase();
  const category = categoryFilter?.value || "";
  const status = statusFilter?.value || "";
  const filtered = allBlogs.filter(blog => {
    const searchable = `${blog.title || ""} ${blog.content || ""} ${blog.tags || ""}`.toLowerCase();
    return (!term || searchable.includes(term)) && (!category || String(blog.category).toLowerCase() === category) && (!status || blog.status === status);
  });
  displayBlogs(filtered);
}
function displayBlogs(blogs) {
  if (!blogs.length) {
    const hasFilters = (searchInput?.value || "").trim() || categoryFilter?.value || statusFilter?.value;
    blogsContainer.innerHTML = `<div class="empty-state"><h3>${hasFilters ? "No matching blogs" : "No blogs yet ✍️"}</h3><p>${hasFilters ? "Try changing your search or filters." : "Create your first blog to get started."}</p>${hasFilters ? '<button type="button" class="create-button" id="clearBlogFilters">Clear filters</button>' : '<a href="create-blog.html" class="create-button">+ Create Your First Blog</a>'}</div>`;
    document.getElementById("clearBlogFilters")?.addEventListener("click", () => { searchInput.value = ""; categoryFilter.value = ""; statusFilter.value = ""; renderFilteredBlogs(); });
    return;
  }
  blogsContainer.innerHTML = blogs.map(blog => {
    const id = encodeURIComponent(blogId(blog));
    const excerpt = String(blog.content || "").length > 220 ? `${String(blog.content).slice(0, 220)}…` : (blog.content || "");
    const date = blog.updatedAt || blog.createdAt;
    return `<article class="blog-card"><div class="blog-card-content"><span class="blog-category">${escapeHtml(blog.category || "General")}</span><h3><a href="blog-details.html?id=${id}">${escapeHtml(blog.title)}</a></h3><p>${escapeHtml(excerpt)}</p><div class="blog-meta"><span>👁 ${Number(blog.views || 0)} views</span><span class="status-pill status-${escapeHtml(blog.status || "published")}">${escapeHtml(blog.status || "published")}</span><span>${date ? escapeHtml(new Date(date).toLocaleDateString()) : ""}</span></div><div class="blog-actions"><a class="edit-blog-button" href="create-blog.html?id=${id}">Edit</a><button class="delete-blog-button" type="button" data-delete-id="${escapeHtml(blogId(blog))}" data-delete-title="${escapeHtml(blog.title)}">Delete</button></div></div></article>`;
  }).join("");
  blogsContainer.querySelectorAll("[data-delete-id]").forEach(button => button.addEventListener("click", () => deleteBlog(button.dataset.deleteId, button.dataset.deleteTitle)));
}
async function deleteBlog(id, title) {
  if (!confirm(`Delete "${title}" permanently? This cannot be undone.`)) return;
  try {
    const response = await fetch(`${BLOGS_API_URL}/${encodeURIComponent(id)}`, { method: "DELETE" });
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Delete failed");
    await loadBlogs();
  } catch (error) {
    alert(error.message || "Unable to delete blog. Check the backend connection.");
  }
}
searchInput?.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(renderFilteredBlogs, 150); });
categoryFilter?.addEventListener("change", renderFilteredBlogs);
statusFilter?.addEventListener("change", renderFilteredBlogs);
loadBlogs();
