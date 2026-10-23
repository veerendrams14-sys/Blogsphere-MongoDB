const User = require("../models/User");
const bcrypt = require("bcryptjs");

async function registerUser(req, res) {
  try {
    let { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });
    name = name.trim(); email = email.trim().toLowerCase();
    if (password.length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    if (await User.findOne({ email })) return res.status(409).json({ success: false, message: "Email already registered" });
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({ success: true, message: "Registration successful!", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: "Email already registered" });
    console.error("Register error:", err); return res.status(500).json({ success: false, message: "Unable to register user" });
  }
}
async function loginUser(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).json({ success: false, message: "Invalid email or password" });
    return res.json({ success: true, message: "Login successful!", user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) { console.error("Login error:", err); return res.status(500).json({ success: false, message: "Unable to log in" }); }
}
module.exports = { registerUser, loginUser };
