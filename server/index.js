require('dotenv').config();
const express = require('express');
const pool = require('./config/dbConfig');

const testRoutes = require('./routes/testRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const cors = require('cors');
app.use(express.json());
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174']


pool.query('SELECT 1')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => {
    console.error('❌ DB connection error', err);
    process.exit(1);
  });


app.use('/api/tests', testRoutes);
app.use('/api/events', eventRoutes);
app.use(cors({origin: allowedOrigins, credentials: true}))

app.get('/', (req, res) => {
  res.send('LivingCity API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

