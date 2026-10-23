const express = require("express");
const router = express.Router();
const { createBlog, getBlogs, getBlogById } = require("../controllers/blogController");
router.post("/", createBlog);
router.get("/", getBlogs);
router.get("/:id", getBlogById);
module.exports = router;
