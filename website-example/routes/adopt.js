const express = require("express");
const db = require("../db");
const router = express.Router();

// ── Submit adoption application ───────────────────────────
router.post("/submit", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "You must be logged in." });

  const { fullName, phone, homeType, otherPets, reason } = req.body;

  if (!fullName || !phone || !homeType || !otherPets || !reason)
    return res.status(400).json({ message: "All fields are required." });

  try {
    await db.query(
      "INSERT INTO adoptions (user_id, full_name, phone, home_type, other_pets, reason) VALUES (?, ?, ?, ?, ?, ?)",
      [req.session.userId, fullName, phone, homeType, otherPets, reason],
    );
    res.json({ message: "Application submitted! We'll be in touch soon." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

// ── Get all of current user's applications ────────────────
router.get("/mine", async (req, res) => {
  if (!req.session.userId)
    return res.status(401).json({ message: "You must be logged in." });

  try {
    const [rows] = await db.query(
      "SELECT * FROM adoptions WHERE user_id = ? ORDER BY submitted_at DESC",
      [req.session.userId],
    );
    res.json({ applications: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error." });
  }
});

module.exports = router;
