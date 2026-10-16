const db = require('../db');
console.log('controllers/policies.js loaded');

exports.list = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
 //let user_tenant_id =req.session.tenant_id
 console.log('---current user :',req.session)
  const policies = db.prepare(`
    SELECT policies.*, customers.name AS customer_name 
    FROM policies
    JOIN customers ON customers.id = policies.customer_id
    WHERE policies.tenant_id = ?
    ORDER BY policies.policy_number
  `).all(req.session.tenantId);

  res.render('policies', { title: 'Policies', policies });
};

exports.newForm = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const customers = db.prepare(
    'SELECT id, name FROM customers WHERE tenant_id = ? ORDER BY name'
  ).all(req.session.tenantId);

  res.render('policy-new', { title: 'New Policy', customers });
};

exports.show = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policy = db.prepare(
    `SELECT policies.*, customers.name AS customer_name
    FROM policies
    JOIN customers ON customers.id = policies.customer_id
    WHERE policies.id = ? AND policies.tenant_id = ?
  `).get(req.params.id, req.session.tenantId);

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Policy not found');
  };

  res.render('policy', { title: policy.policy_number, policy });
};

exports.editForm = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policy = db.prepare(
    'SELECT * FROM policies WHERE id = ? AND tenant_id = ?'
  ).get(req.params.id, req.session.tenantId);

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  };

  const customers = db.prepare(
    'SELECT id, name FROM customers WHERE tenant_id = ? ORDER BY name'
  ).all(Request.session.tenantId);

  res.render('policy-edit', { title: 'Edit Policy', policy, customers });
};

exports.create = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { policy_number, customer_id, premium, start_date, end_date } = req.body;

  if (!policy_number || !customer_id || !premium || !start_date || !end_date) {
    const customers = db.prepare('SELECT id, name FROM customers WHERE tenant_id = ?').all(req.session.tenantId);
    console.log(`[warn] Policy create failed: missing fields. User ${req.session.userId}`);
    return res.render('policy-new', { title: 'New Policy', error: 'All fields required!' });
  }

  db.prepare(`
    INSERT INTO policies (tenant_id, policy_number, customer_id, premium, start_date, end_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    req.session.tenantId,
    policy_number,
    customer_id,
    parseInt(premium, 10) * 100,
    start_date,
    end_date
  );

  console.log(`[info] Policy ${policy_number} created by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies');
};

exports.update = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policy = db.prepare(
    'SELECT id FROM policies WHERE id = ? AND tenant_id = ?'
  ).get(req.params.id, req.session.tenantId);

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  };

  const { policy_number, customer_id, premium, start_date, end_date } = req.body;

  if (!policy_number || !customer_id || !premium || !start_date || !end_date) {
    const fullPolicy = db.prepare('SELECT * FROM policies WHERE id = ?').get(req.params.id);
    return res.render('policy-edit', {
      title: 'Edit Policy',
      error: 'All fields required',
      policy: fullPolicy
    });
    
  }

  db.prepare(`
    UPDATE policies
    SET policy_number = ?, customer_id = ?, premium = ?, start_date = ?, end_date = ?
    WHERE id = ? AND tenant_id = ?
  `).run(
    policy_number,
    customer_id,
    parseInt(premium, 10) * 100,
    start_date,
    end_date,
    req.params.id,
    req.session.tenantId
  );

  console.log(`[info] Policy ${req.params.id} updated by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies/' + req.params.id);
};

exports.remove = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policy = db.prepare(
    'SELECT id FROM policies WHERE id = ? AND tenant_id = ?'
  ).get(req.params.id, req.session.tenantId);

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  };

  db.prepare('DELETE FROM policies WHERE id = ? AND tenant_id = ?').run(
    req.params.id,
    req.session.tenantId
  );

  console.log(`[info] Policy ${req.params.id} deleted by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies');
};