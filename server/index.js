require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/dbConfig');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const eventRoutes = require('./routes/eventRoutes');
const eventImageRoutes = require('./routes/eventImageRoutes');
const publicAuthRoutes = require('./routes/publicAuthRoutes');
const organizerAuthRoutes = require('./routes/organizerAuthRoutes');
const adminOrganizationRoutes = require("./routes/adminOrganization.routes");

const app = express();

const path = require('path');

/* ---------- cors for links ---------- */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:8080',
  'http://localhost:8081',
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

/* ---------- BODY PARSER ---------- */
app.use(express.json());
app.use(cookieParser());

/* ---------- routes  ---------- */
app.use('/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/events', eventImageRoutes);
app.use('/api/public-auth', publicAuthRoutes);
app.use('/api/organizer-auth', organizerAuthRoutes);
app.use("/api/admin", adminOrganizationRoutes);


/* ---------- folder for images ---------- */
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
const PORT = process.env.PORT || 3000 ;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});