const Blog = require("../models/Blog");
async function createBlog(req, res) {
  try {
    const { title, category, tags, content, status } = req.body;
    if (!title || !category || !content) return res.status(400).json({ success: false, message: "Title, category and content are required" });
    const blog = await Blog.create({ title: title.trim(), category, tags: tags || "", content, status: status === "draft" ? "draft" : "published" });
    return res.status(201).json({ success: true, message: "Blog created successfully!", blog: { ...blog.toObject(), id: blog._id } });
  } catch (err) { console.error("Create blog error:", err); return res.status(500).json({ success: false, message: "Unable to create blog" }); }
}
async function getBlogs(req, res) {
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, count: blogs.length, blogs: blogs.map(b => ({ ...b, id: b._id })) });
  } catch (err) { console.error("Get blogs error:", err); return res.status(500).json({ success: false, message: "Unable to retrieve blogs" }); }
}
async function getBlogById(req, res) {
  try {
    const blog = await Blog.findById(req.params.id).lean();
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    await Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } });
    return res.json({ success: true, blog: { ...blog, id: blog._id, views: (blog.views || 0) + 1 } });
  } catch (err) { return res.status(400).json({ success: false, message: "Invalid blog ID" }); }
}
module.exports = { createBlog, getBlogs, getBlogById };
