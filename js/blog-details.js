const API_BASE = "http://localhost:5000/api/blogs";
const target = document.getElementById("blogDetails");
const blogId = new URLSearchParams(window.location.search).get("id");
function safe(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[ch])); }
(async function () {
  if (!blogId) { target.textContent = "No blog was selected."; return; }
  try {
    const response = await fetch(`${API_BASE}/${encodeURIComponent(blogId)}`);
    const data = await response.json();
    if (!response.ok || !data.success) throw new Error(data.message || "Blog not found");
    const blog = data.blog;
    const date = blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : "";
    target.innerHTML = `<span class="blog-category">${safe(blog.category || "General")}</span><h1>${safe(blog.title)}</h1><p class="details-meta">${safe(date)} · ${Number(blog.views || 0)} views</p><div class="details-content">${safe(blog.content)}</div>${blog.tags ? `<p class="details-meta">Tags: ${safe(blog.tags)}</p>` : ""}`;
  } catch (err) { target.textContent = err.message || "Unable to load this blog. Make sure the backend is running."; }
})();
