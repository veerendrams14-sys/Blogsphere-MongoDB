require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");
const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.get("/api/check-blogs", async (req, res) => {
  try {
    const Blog = require("./models/Blog");
    const blogs = await Blog.find({}, { title: 1 }).lean();

    res.json({
      database: mongoose.connection.name,
      collection: Blog.collection.name,
      count: blogs.length,
      blogs: blogs.map(blog => blog.title)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
app.get("/api/blogs-test", (req, res) => {
  res.json({ message: "Updated server.js is working!" });
});
console.log("Blog routes loaded:", blogRoutes.stack.map(r => r.route?.path));
app.get("/", (req, res) => res.json({ message: "BlogSphere Backend is running!", database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
app.get("/api/health", (req, res) => res.json({ success: true, database: mongoose.connection.readyState === 1 ? "connected" : "disconnected" }));
const PORT = process.env.PORT || 5000;
if (!process.env.MONGODB_URI) {
  console.error("Missing MONGODB_URI. Copy backend/.env.example to backend/.env and add your MongoDB connection string.");
  process.exit(1);
}
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
     console.log("DATABASE:", mongoose.connection.name);
    console.log("CLUSTER:", mongoose.connection.host);
    app.listen(PORT, () => console.log(`BlogSphere Backend running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
