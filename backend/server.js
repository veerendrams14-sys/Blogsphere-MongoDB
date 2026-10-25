
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const authRoutes = require("./routes/authRoutes");
const blogRoutes = require("./routes/blogRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

// Support either environment-variable name.
const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

let connectionPromise;

async function connectDB() {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (!MONGO_URI) {
    throw new Error("Missing MONGO_URI environment variable");
  }

  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGO_URI).catch((error) => {
      connectionPromise = null;
      throw error;
    });
  }

  await connectionPromise;
}

// Connect to MongoDB before handling requests.
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    res.status(500).json({
      success: false,
      message: "Database connection failed"
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "BlogSphere Backend is running!",
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    database:
      mongoose.connection.readyState === 1
        ? "connected"
        : "disconnected"
  });
});

app.get("/api/check-blogs", async (req, res) => {
  try {
    const Blog = require("./models/Blog");
    const blogs = await Blog.find({}, { title: 1 }).lean();

    res.json({
      database: mongoose.connection.name,
      collection: Blog.collection.name,
      count: blogs.length,
      blogs: blogs.map((blog) => blog.title)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/api/blogs-test", (req, res) => {
  res.json({ message: "BlogSphere backend is working!" });
});

// Local development only. Vercel imports the Express app.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`BlogSphere Backend running on port ${PORT}`);
  });
}

module.exports = app;
