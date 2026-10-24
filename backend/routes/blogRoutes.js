const express = require("express");
const router = express.Router();
const { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog } = require("../controllers/blogController");

router.route("/").get(getBlogs).post(createBlog);
router.route("/:id").get(getBlogById).put(updateBlog).patch(updateBlog).delete(deleteBlog);

module.exports = router;
