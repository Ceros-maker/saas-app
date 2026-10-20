const db = require('../db');

exports.list = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const result = await db.query(`
    SELECT policies.*, customers.name AS customer_name
    FROM policies
    JOIN customers ON customers.id = policies.customer_id
    WHERE policies.tenant_id = $1
    ORDER BY policies.policy_number
  `, [req.session.tenantId]);

  res.render('policies', { title: 'Policies', policies: result.rows });
};

exports.newForm = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const result = await db.query(
    'SELECT id, name FROM customers WHERE tenant_id = $1 ORDER BY name',
    [req.session.tenantId]
  );

  res.render('policy-new', { title: 'New Policy', customers: result.rows });
};

exports.show = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const result = await db.query(`
    SELECT policies.*, customers.name AS customer_name
    FROM policies
    JOIN customers ON customers.id = policies.customer_id
    WHERE policies.id = $1 AND policies.tenant_id = $2
  `, [req.params.id, req.session.tenantId]);

  const policy = result.rows[0];

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Policy not found');
  }

  res.render('policy', { title: policy.policy_number, policy });
};

exports.editForm = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policyResult = await db.query(
    'SELECT * FROM policies WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.session.tenantId]
  );

  const policy = policyResult.rows[0];

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  }

  const customersResult = await db.query(
    'SELECT id, name FROM customers WHERE tenant_id = $1 ORDER BY name',
    [req.session.tenantId]
  );

  res.render('policy-edit', { title: 'Edit Policy', policy, customers: customersResult.rows });
};

exports.create = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { policy_number, customer_id, premium, start_date, end_date } = req.body;

  if (!policy_number || !customer_id || !premium || !start_date || !end_date) {
    const customersResult = await db.query(
      'SELECT id, name FROM customers WHERE tenant_id = $1',
      [req.session.tenantId]
    );
    console.log(`[warn] Policy create failed: missing fields. User ${req.session.userId}`);
    return res.render('policy-new', {
      title: 'New Policy',
      error: 'All fields required!',
      customers: customersResult.rows
    });
  }

  await db.query(`
    INSERT INTO policies (tenant_id, policy_number, customer_id, premium, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6)
  `, [
    req.session.tenantId,
    policy_number,
    customer_id,
    parseInt(premium, 10) * 100,
    start_date,
    end_date
  ]);

  console.log(`[info] Policy ${policy_number} created by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies');
};

exports.update = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policyResult = await db.query(
    'SELECT id FROM policies WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.session.tenantId]
  );

  if (policyResult.rows.length === 0) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  }

  const { policy_number, customer_id, premium, start_date, end_date } = req.body;

  if (!policy_number || !customer_id || !premium || !start_date || !end_date) {
    const fullPolicyResult = await db.query('SELECT * FROM policies WHERE id = $1', [req.params.id]);
    return res.render('policy-edit', {
      title: 'Edit Policy',
      error: 'All fields required',
      policy: fullPolicyResult.rows[0]
    });
  }

  await db.query(`
    UPDATE policies
    SET policy_number = $1, customer_id = $2, premium = $3, start_date = $4, end_date = $5
    WHERE id = $6 AND tenant_id = $7
  `, [
    policy_number,
    customer_id,
    parseInt(premium, 10) * 100,
    start_date,
    end_date,
    req.params.id,
    req.session.tenantId
  ]);

  console.log(`[info] Policy ${req.params.id} updated by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies/' + req.params.id);
};

exports.remove = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policyResult = await db.query(
    'SELECT id FROM policies WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.session.tenantId]
  );

  if (policyResult.rows.length === 0) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  }

  await db.query('DELETE FROM policies WHERE id = $1 AND tenant_id = $2',
    [req.params.id, req.session.tenantId]);

  console.log(`[info] Policy ${req.params.id} deleted by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies');
};