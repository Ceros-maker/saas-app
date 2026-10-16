const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const db = new Database('saas.db');
db.pragma('foreign_keys = ON');

module.exports = db;