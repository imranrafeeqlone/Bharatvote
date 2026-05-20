const express = require('express');
const router = express.Router();
const db = require('../db');

// CAST VOTE
router.post('/cast-vote', async (req, res) => {
  const { email, otp, party_id } = req.body;

  if (!email || !otp || !party_id) {
    return res.status(400).json({
      error: 'Missing fields'
    });
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Verify voter by email and OTP
    const [voter] = await conn.query(
      'SELECT otp, otp_expiry, has_voted FROM voters WHERE email = ? FOR UPDATE',
      [email]
    );

    if (!voter.length) {
      throw new Error('Email not found');
    }

    if (voter[0].has_voted) {
      return res.status(409).json({ error: 'You have already voted' });
    }

    if (voter[0].otp !== String(otp)) {
      throw new Error('Invalid OTP');
    }

    if (new Date() > new Date(voter[0].otp_expiry)) {
      throw new Error('OTP expired');
    }

    // Insert vote record into SQL
    await conn.query(
      'INSERT INTO votes (email, party_id, ip_address) VALUES (?, ?, ?)',
      [email, party_id, req.ip]
    );

    // Increase party vote count
    await conn.query(
      'UPDATE parties SET vote_count = vote_count + 1 WHERE id = ?',
      [party_id]
    );

    // Mark voter as voted
    await conn.query(
      'UPDATE voters SET has_voted = TRUE, voted_at = NOW() WHERE email = ?',
      [email]
    );

    await conn.commit();

    res.json({
      success: true,
      message: 'Vote recorded'
    });

  } catch (err) {

    await conn.rollback();

    res.status(400).json({
      error: err.message
    });

  } finally {

    conn.release();

  }
});

// GET RESULTS
router.get('/results', async (req, res) => {

  const [rows] = await db.query(`
    SELECT
      id,
      abbr,
      name,
      vote_count
    FROM parties
    ORDER BY vote_count DESC
  `);

  res.json(rows);

});

module.exports = router;