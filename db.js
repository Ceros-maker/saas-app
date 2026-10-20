const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'saas',
  user: 'postgres',
  password: 'devpassword',
});

module.exports = pool;