const mongoose = require("mongoose");
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  category: { type: String, required: true, trim: true },
  tags: { type: String, default: "" },
  content: { type: String, required: true },
  status: { type: String, enum: ["published", "draft"], default: "published" },
  views: { type: Number, default: 0 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }
}, { timestamps: true });
module.exports = mongoose.model("Blog", blogSchema);
