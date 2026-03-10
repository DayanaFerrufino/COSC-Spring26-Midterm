const express = require("express");
const bcrypt = require("bcryptjs");
const db = require("../db");
const router = express.Router();

// ── Register ──────────────────────────────────────────────
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password)
    return res.status(400).json({ message: "All fields are required." });

  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters." });

  try {
    const hashed = await bcrypt.hash(password, 12);
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed],
    );
    res.json({ message: "Account created! You can now log in." });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      const field = err.message.includes("username") ? "Username" : "Email";
      return res.status(409).json({ message: `${field} is already taken.` });
    }
    console.error(err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// ── Login ─────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Email and password are required." });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid email or password." });

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({
      message: `Welcome back, ${user.username}!`,
      username: user.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// ── Change Password ───────────────────────────────────────
router.post("/change-password", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "You must be logged in." });

  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: "Both fields are required." });

  if (newPassword.length < 6)
    return res
      .status(400)
      .json({ message: "New password must be at least 6 characters." });

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [
      req.session.userId,
    ]);
    const user = rows[0];

    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res
        .status(401)
        .json({ message: "Current password is incorrect." });

    const hashed = await bcrypt.hash(newPassword, 12);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [
      hashed,
      user.id,
    ]);

    res.json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// ── Logout ────────────────────────────────────────────────
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ message: "Logged out." });
  });
});

// ── Session check (useful for frontend state) ─────────────
router.get("/me", (req, res) => {
  if (!req.session.userId) return res.status(401).json({ loggedIn: false });
  res.json({ loggedIn: true, username: req.session.username });
});

module.exports = router;

// ── Get current user info ─────────────────────────────────
router.get("/profile", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "Not logged in." });

  try {
    const [rows] = await db.query(
      "SELECT id, username, email, created_at FROM users WHERE id = ?",
      [req.session.userId],
    );
    res.json({ user: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── Change username ───────────────────────────────────────
router.post("/change-username", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "You must be logged in." });

  const { newUsername } = req.body;
  if (!newUsername)
    return res.status(400).json({ message: "New username is required." });

  try {
    await db.query("UPDATE users SET username = ? WHERE id = ?", [
      newUsername,
      req.session.userId,
    ]);
    req.session.username = newUsername;
    res.json({ message: "Username updated!", username: newUsername });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res
        .status(409)
        .json({ message: "That username is already taken." });
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

// ── Change email ──────────────────────────────────────────
router.post("/change-email", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "You must be logged in." });

  const { newEmail } = req.body;
  if (!newEmail)
    return res.status(400).json({ message: "New email is required." });

  try {
    await db.query("UPDATE users SET email = ? WHERE id = ?", [
      newEmail,
      req.session.userId,
    ]);
    res.json({ message: "Email updated!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY")
      return res.status(409).json({ message: "That email is already in use." });
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});
