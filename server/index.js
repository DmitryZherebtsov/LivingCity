require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/dbConfig');
const eventRoutes = require('./routes/eventRoutes');
const cookieParser = require('cookie-parser');

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./routes/userRoutes');

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
app.use(cookieParser());

/* ---------- ROUTES ---------- */
app.use('/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('LivingCity API is running');
});

/* ---------- DB CHECK ---------- */
pool.query('SELECT 1')
  .then(() => console.log('PostgreSQL connected'))
  .catch(err => {
    console.error('DB connection error', err);
    process.exit(1);
  });

/* ---------- SERVER ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});