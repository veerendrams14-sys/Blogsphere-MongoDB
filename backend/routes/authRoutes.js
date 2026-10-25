const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser
} = require("../controllers/authController");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

// Register
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Get logged-in user's profile
router.get("/me", protect, (req, res) => {
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
});

// Update logged-in user's name
router.put("/me", protect, async (req, res) => {
  try {
    const name = req.body.name?.trim();

    if (!name || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 1 and 100 characters."
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name },
      {
        new: true,
        runValidators: true
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    res.json({
      success: true,
      message: "Profile updated successfully!",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to update profile."
    });
  }
});

module.exports = router;