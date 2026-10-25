
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

function serializeBlog(blog) {
  const item = blog.toObject ? blog.toObject() : blog;
  return { ...item, id: String(item._id) };
}

// Create a blog for the logged-in user
async function createBlog(req, res) {
  try {
    const { title, category, tags, content, status } = req.body;

    if (!title?.trim() || !category?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, category and content are required"
      });
    }

    const blog = await Blog.create({
      title: title.trim(),
      category: category.trim(),
      tags: (tags || "").trim(),
      content: content.trim(),
      status: status === "draft" ? "draft" : "published",
      author: req.user._id
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog: serializeBlog(blog)
    });
  } catch (err) {
    console.error("Create blog error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to create blog"
    });
  }
}

// Get only the logged-in user's blogs
async function getBlogs(req, res) {
  try {
    const filter = { author: req.user._id };

    if (["published", "draft"].includes(req.query.status)) {
      filter.status = req.query.status;
    }

    if (req.query.category) {
      const category = String(req.query.category).slice(0, 100);
      filter.category = new RegExp(
        "^" + category.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "$",
        "i"
      );
    }

    if (req.query.search) {
      const term = String(req.query.search).trim().slice(0, 100);

      if (term) {
        const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
          { title: new RegExp(safeTerm, "i") },
          { content: new RegExp(safeTerm, "i") },
          { tags: new RegExp(safeTerm, "i") }
        ];
      }
    }

    const blogs = await Blog.find(filter)
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      count: blogs.length,
      blogs: blogs.map(serializeBlog)
    });
  } catch (err) {
    console.error("Get blogs error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve blogs"
    });
  }
}

// Open a blog only if it belongs to the logged-in user
async function getBlogById(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID"
      });
    }

    const blog = await Blog.findOne({
      _id: req.params.id,
      author: req.user._id
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    blog.views += 1;
    await blog.save();

    return res.json({
      success: true,
      blog: serializeBlog(blog)
    });
  } catch (err) {
    console.error("Get blog error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve blog"
    });
  }
}

// Update only the logged-in user's blog
async function updateBlog(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID"
      });
    }

    const { title, category, tags, content, status } = req.body;

    if (!title?.trim() || !category?.trim() || !content?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title, category and content are required"
      });
    }

    const blog = await Blog.findOneAndUpdate(
      {
        _id: req.params.id,
        author: req.user._id
      },
      {
        title: title.trim(),
        category: category.trim(),
        tags: (tags || "").trim(),
        content: content.trim(),
        status: status === "draft" ? "draft" : "published"
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or you do not own it"
      });
    }

    return res.json({
      success: true,
      message: "Blog updated successfully",
      blog: serializeBlog(blog)
    });
  } catch (err) {
    console.error("Update blog error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to update blog"
    });
  }
}

// Delete only the logged-in user's blog
async function deleteBlog(req, res) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid blog ID"
      });
    }

    const blog = await Blog.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or you do not own it"
      });
    }

    return res.json({
      success: true,
      message: "Blog deleted successfully",
      id: req.params.id
    });
  } catch (err) {
    console.error("Delete blog error:", err);
    return res.status(500).json({
      success: false,
      message: "Unable to delete blog"
    });
  }
}

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
};
