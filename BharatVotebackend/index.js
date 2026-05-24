const express = require('express');
const cors = require('cors');
require('dotenv').config();

const otpRoutes = require('./routes/otp');
const voteRoutes = require('./routes/vote');

const app = express();

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());

app.use('/api', otpRoutes);
app.use('/api', voteRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(process.env.PORT || 4000, () => {
  console.log(`Server running on port ${process.env.PORT || 4000}`);
});