const { Pool } = require('pg');

const isLocal = !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:devpassword@localhost:5432/saas',
  ssl: isLocal ? false : { rejectUnauthorized: false }
});

module.exports = pool;