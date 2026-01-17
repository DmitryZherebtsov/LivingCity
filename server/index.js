require('dotenv').config();
const express = require('express');
const pool = require('./config/dbConfig');

const testRoutes = require('./routes/testRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
app.use(express.json());

// тест з'єднання з БД
pool.query('SELECT 1')
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch(err => {
    console.error('❌ DB connection error', err);
    process.exit(1);
  });

// routes
app.use('/api/tests', testRoutes);
app.use('/api/events', eventRoutes);

// root
app.get('/', (req, res) => {
  res.send('LivingCity API is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

