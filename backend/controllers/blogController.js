const mongoose = require("mongoose");
const Blog = require("../models/Blog");

function serializeBlog(blog) {
  const item = blog.toObject ? blog.toObject() : blog;
  return { ...item, id: String(item._id) };
}

async function createBlog(req, res) {
  try {
    const { title, category, tags, content, status } = req.body;
    if (!title?.trim() || !category?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title, category and content are required" });
    }
    const blog = await Blog.create({
      title: title.trim(), category: category.trim(), tags: (tags || "").trim(),
      content: content.trim(), status: status === "draft" ? "draft" : "published"
    });
    return res.status(201).json({ success: true, message: "Blog created successfully", blog: serializeBlog(blog) });
  } catch (err) {
    console.error("Create blog error:", err);
    return res.status(500).json({ success: false, message: "Unable to create blog" });
  }
}

async function getBlogs(req, res) {
  try {
    const filter = {};
    if (["published", "draft"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.category) filter.category = new RegExp(`^${String(req.query.category).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    if (req.query.search) {
      const term = String(req.query.search).trim().slice(0, 100);
      if (term) {
        const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        filter.$or = [{ title: new RegExp(safeTerm, "i") }, { content: new RegExp(safeTerm, "i") }, { tags: new RegExp(safeTerm, "i") }];
      }
    }
    const blogs = await Blog.find(filter).sort({ updatedAt: -1, createdAt: -1 }).lean();
    return res.json({ success: true, count: blogs.length, blogs: blogs.map(serializeBlog) });
  } catch (err) {
    console.error("Get blogs error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve blogs" });
  }
}

async function getBlogById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid blog ID" });
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    // Count a view when a blog detail is opened.
    blog.views += 1;
    await blog.save();
    return res.json({ success: true, blog: serializeBlog(blog) });
  } catch (err) {
    console.error("Get blog error:", err);
    return res.status(500).json({ success: false, message: "Unable to retrieve blog" });
  }
}

async function updateBlog(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid blog ID" });
    const { title, category, tags, content, status } = req.body;
    if (!title?.trim() || !category?.trim() || !content?.trim()) {
      return res.status(400).json({ success: false, message: "Title, category and content are required" });
    }
    const blog = await Blog.findByIdAndUpdate(req.params.id, {
      title: title.trim(), category: category.trim(), tags: (tags || "").trim(),
      content: content.trim(), status: status === "draft" ? "draft" : "published"
    }, { new: true, runValidators: true });
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    return res.json({ success: true, message: "Blog updated successfully", blog: serializeBlog(blog) });
  } catch (err) {
    console.error("Update blog error:", err);
    return res.status(500).json({ success: false, message: "Unable to update blog" });
  }
}

async function deleteBlog(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid blog ID" });
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });
    return res.json({ success: true, message: "Blog deleted successfully", id: req.params.id });
  } catch (err) {
    console.error("Delete blog error:", err);
    return res.status(500).json({ success: false, message: "Unable to delete blog" });
  }
}

module.exports = { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog };
