const transporter = require('../mailer');
const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Generate random 6-digit OTP
function genOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// ─── SEND OTP ──────────────────────────────────────────────────────────────
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email required' });
  }

  const [rows] = await db.query(
    'SELECT has_voted FROM voters WHERE email = ?',
    [email]
  );

  if (rows.length > 0 && rows[0].has_voted) {
    return res.status(409).json({
      error: 'This email has already cast a vote.'
    });
  }

  const otp = genOtp();
  const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'BharatVote Verification OTP',
      text: `Your BharatVote OTP is ${otp}. Valid for 10 minutes. Do not share this with anyone.`
    });
  } catch (err) {
    console.error('Email send error:', err.response?.data || err.message || err);
    return res.status(500).json({
      error: 'Failed to send OTP email. Please try again.'
    });
  }

  await db.query(`
    INSERT INTO voters (email, otp, otp_expiry)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      otp        = VALUES(otp),
      otp_expiry = VALUES(otp_expiry)
  `, [email, otp, expiry]);

  console.log(`✅ OTP sent to ${email}`);
  res.json({ success: true, message: 'OTP sent to your email.' });
});

// ─── VERIFY OTP ────────────────────────────────────────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: 'Email and OTP required' });
  }

  const [rows] = await db.query(
    'SELECT otp, otp_expiry, has_voted FROM voters WHERE email = ?',
    [email]
  );

  if (!rows.length) {
    return res.status(404).json({ error: 'Email not found. Please request OTP first.' });
  }

  if (rows[0].has_voted) {
    return res.status(409).json({ error: 'This email has already voted.' });
  }

  if (rows[0].otp !== String(otp)) {
    return res.status(401).json({ error: 'Invalid OTP. Please check and try again.' });
  }

  if (new Date() > new Date(rows[0].otp_expiry)) {
    return res.status(401).json({ error: 'OTP has expired. Please request a new one.' });
  }

  res.json({ success: true, message: 'Verified successfully.' });
});

module.exports = router;