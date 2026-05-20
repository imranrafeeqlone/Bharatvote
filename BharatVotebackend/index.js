const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const otpRoutes = require('./routes/otp');
const voteRoutes = require('./routes/vote');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many requests. Try again later.' }
});

app.use('/api', limiter);

app.use('/api', otpRoutes);
app.use('/api', voteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});