const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

// Show login form
router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { title: 'Login' });
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.render('login', { title: 'Login', error: 'Invalid email or password.' });
  }

  req.session.userId = user.id;
  req.session.tenantId = user.tenant_id;

  console.log(`[info] Login success: ${email} (user ${user.id}, tenant ${user.tenant_id})`);
  res.redirect('/dashboard');
});

// Show register form
router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { title: 'Register' });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { name, email, company, password } = req.body;

  if (!name || !email || !company || !password) {
    return res.render('register', { title: 'Register', error: 'All fields required' });
  }
  if (password.length < 6) {
    return res.render('register', { title: 'Register', error: 'Password must be at least 6 characters' });
  }

  const existingResult = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existingResult.rows.length > 0) {
    return res.render('register', { title: 'Register', error: 'Email already registered.' });
  }

  const slug = company.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');

  const tenantResult = await db.query(
    'INSERT INTO tenants (name, slug) VALUES ($1, $2) RETURNING id',
    [company, slug]
  );
  const tenantId = tenantResult.rows[0].id;

  const hash = bcrypt.hashSync(password, 10);
  const userResult = await db.query(
    'INSERT INTO users (email, password_hash, name, tenant_id, role) VALUES ($1, $2, $3, $4, $5) RETURNING id',
    [email, hash, name, tenantId, 'owner']
  );
  const userId = userResult.rows[0].id;

  req.session.userId = userId;
  req.session.tenantId = tenantId;

  console.log(`[info] Tenant registered: ${company} (tenant ${tenantId}) by ${email}`);
  res.redirect('/dashboard');
});

// Dashboard
router.get('/dashboard', async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const userResult = await db.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [req.session.userId]
  );
  const tenantResult = await db.query(
    'SELECT id, name FROM tenants WHERE id = $1',
    [req.session.tenantId]
  );

  res.render('dashboard', {
    title: 'Dashboard',
    user: userResult.rows[0],
    tenant: tenantResult.rows[0]
  });
});

// Logout
router.post('/logout', (req, res) => {
  const userId = req.session.userId;
  req.session.destroy(() => {
    console.log(`[info] Logout: user ${userId}`);
    res.redirect('/login');
  });
});

module.exports = router;