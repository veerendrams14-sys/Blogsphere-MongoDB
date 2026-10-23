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
    app.listen(PORT, () => console.log(`BlogSphere Backend running on http://localhost:${PORT}`));
  })
  .catch(err => { console.error("MongoDB connection failed:", err.message); process.exit(1); });
