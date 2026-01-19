require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/dbConfig');
const eventRoutes = require('./routes/eventRoutes');

const app = express();

/* ---------- CORS ---------- */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

/* ---------- BODY PARSER ---------- */
app.use(express.json());

/* ---------- ROUTES ---------- */
app.use('/api/events', eventRoutes);

app.get('/', (req, res) => {
  res.send('LivingCity API is running');
});

/* ---------- DB CHECK ---------- */
pool.query('SELECT 1')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => {
    console.error('❌ DB connection error', err);
    process.exit(1);
  });

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
