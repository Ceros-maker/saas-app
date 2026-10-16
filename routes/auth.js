const express = require('express');
const bcrypt = require('bcrypt');
const db = require('../db');

const router = express.Router();

router.get('/login', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('login', { title: 'Login' });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    console.log(`[warn] Login failed: ${email} (user ${user.id}, tenant ${user.tenant_id})`);
    return res.render('login', { title: 'Login', error: 'Invalid email or password.'});
  }

  req.session.userId = user.id;
  req.session.tenantId = user.tenant_id;

  console.log(`[info] Login success: ${email} (user ${user.id}, tenant ${user.tenant_id})`);
  res.redirect('/dashboard');
});

router.get('/register', (req, res) => {
  if (req.session.userId) return res.redirect('/dashboard');
  res.render('register', { title: 'Register' });
});

router.post('/register', (req, res) => {
  const { name, email, company, password } = req.body;

  //Validation of credentials
  if (!name || !email || !company || !password) {
    return res.render('register', { title: 'Register', error: 'All fields required'});
  }
  if (password.length < 6) {
    return res.render('register', { title: 'Register', error: 'Password must be at least 6 characters'});
  }

  //Checks if email is already in the db
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.render('register', { title: 'Register', error: 'Email already registered.'});
  }

  //Create the tenant
  const tenantResult = db.prepare('INSERT INTO tenants (name, slug) VALUES (?,?)').run(
    company,
    company.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')
  );

  //Create the user as the tenant's owner
  const hash = bcrypt.hashSync(password, 10);
  const userResult = db.prepare(
    'INSERT INTO users (email, password_hash, name, tenant_id, role) VALUES (?, ?, ?, ?, ?)'
  ).run(email, hash, name, tenantResult.lastInsertRowid, 'owner');

  req.session.userId = userResult.lastInsertRowid;
  req.session.tenantId = tenantResult.lastInsertRowid;

  console.log(`[info] Tenant registered: ${company} (tenant ${tenantResult.lastInsertRowid}) by ${email}`);
  res.redirect('/dashboard');
});


router.get('/dashboard', (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  
  const user = db.prepare(
    'SELECT id, name, email, role FROM users WHERE id = ?'
  ).get(req.session.userId);

  const tenant = db.prepare(
    'SELECT id, name FROM tenants WHERE id = ?'
  ).get(req.session.tenantId);

  console.log(`[info] User : ${req.session.userId} (tenant ${req.session.tenantId}) entered the dashboard.`);
  res.render('dashboard', { title: 'Dashboard', user, tenant });
});

router.post('/logout', (req, res) => {
  const userId = req.session.userId;
  req.session.destroy(() => {
    console.log(`[info] Logout: user ${userId}`);
    res.redirect('/login')
  });
});


module.exports = router;