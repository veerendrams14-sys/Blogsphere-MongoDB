
const express = require("express");
const router = express.Router();

const {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog
} = require("../controllers/blogController");

const protect = require("../middleware/authMiddleware");

router.route("/")
  .get(protect, getBlogs)
  .post(protect, createBlog);

router.route("/:id")
  .get(protect, getBlogById)
  .put(protect, updateBlog)
  .patch(protect, updateBlog)
  .delete(protect, deleteBlog);

module.exports = router;
