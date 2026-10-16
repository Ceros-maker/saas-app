const db = require('../db');

exports.list = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const customers = db.prepare(`
        SELECT customers.*,
        (SELECT COUNT(*) FROM policies WHERE policies.customer_id = customers.id) AS policy_count
        FROM customers
        WHERE customers.tenant_id = ?
        ORDER BY customers.name
    `).all(req.session.tenantId);

    console.log(`[info] User: ${req.session.userId} (tenant ${req.session.tenantId} accessed customer list)`)
    res.render('customers', { title: 'Customers', customers });
};

exports.newForm = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('customer-new', { title: 'New Customer' });
};

exports.show = (req, res) => {
    if (!req.session.userId) res.redirect('/login');

    const customer = db.prepare(
        'SELECT * FROM customers WHERE id = ? AND tenant_id = ?'
    ).get(req.params.id, req.session.tenantId);

    if (!customer) {
        console.log(`[warn] Isolation: user ${req.session.userId} attempted customer ${req.params.id}`);
        return res.status(404).send('Not found');
    }

    const policies = db.prepare(`
        SELECT * FROM policies
        WHERE customer_id = ? AND tenant_id = ?
        ORDER BY policy_number
        `).all(customer.indexOf, req.session.tenantId);

    res.render('customer', { title: customer.name, customer, policies });
};

exports.editForm = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const customer = db.prepare(
        'SELECT * FROM customers WHERE id = ? AND tenant_id = ?'
    ).get(req.params.id, req.session.tenantId);

    if (!customer) return res.status(404).send('Not found');

    res.render('customer-edit', { title: 'Edit Customer', customer });
};

exports.create = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { name, email, phone } = req.body;

    if (!name) {
        res.render('customer-new', { title: 'New Customer', error: 'Name is required.'});
    }

    db.prepare(`
        INSERT INTO customers (tenant_id, name, email, phone)
        VALUES (?, ?, ?, ?)
    `).run(req.session.tenantId, name, email || null, phone || null);

    console.log(`[info] Customer ${name} created by user ${req.session.userId}`);
    res.redirect('/customers');    
};

exports.update = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

  const customer = db.prepare(
    'SELECT id FROM customers WHERE id = ? AND tenant_id = ?'
  ).get(req.params.id, req.session.tenantId);

  if (!customer) return res.status(404).send('Not found');

  const { name, email, phone } = req.body;

  if (!name) {
    const full = db.prepare('SELECT * FROM customers WHERE id = ?').get(req.params.id);
    return res.render('customer-edit', { title: 'Edit Customer', error: 'Name is required.', customer: full });
  }

  db.prepare(`
    UPDATE customers
    SET name = ?, email = ?, phone = ?
    WHERE id = ? AND tenant_id = ?
  `).run(name, email || null, phone || null, req.params.id, req.session.tenantId);

  console.log(`[info] Customer ${req.params.id} updated by user ${req.session.userId}`);
  res.redirect('/customers/' + req.params.id);
};

exports.remove = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

  const customer = db.prepare(
    'SELECT id FROM customers WHERE id = ? AND tenant_id = ?'
  ).get(req.params.id, req.session.tenantId);

  if (!customer) return res.status(404).send('Not found');

  const policyCount = db.prepare(
    'SELECT COUNT(*) AS n FROM policies WHERE customer_id = ?'
  ).get(req.params.id).n;

  if (policyCount > 0) {
    return res.status(400).send(`Cannot delete: this customer has ${policyCount} policies.`);
  }

  db.prepare('DELETE FROM customers WHERE id = ? AND tenant_id = ?').run(
    req.params.id,
    req.session.tenantId
  );

  console.log(`[info] Customer ${req.params.id} deleted by user ${req.session.userId}`);
  res.redirect('/customers');
};