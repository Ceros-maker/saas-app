const db = require('../db');

exports.list = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const result = await db.query(`
        SELECT customers.*,
        (SELECT COUNT(*) FROM policies WHERE policies.customer_id = customers.id) AS policy_count
        FROM customers
        WHERE customers.tenant_id = $1
        ORDER BY customers.name
    `, [req.session.tenantId]);

    console.log(`[info] User: ${req.session.userId} (tenant ${req.session.tenantId}) accessed customer list`);
    res.render('customers', { title: 'Customers', customers: result.rows });
};

exports.newForm = (req, res) => {
    if (!req.session.userId) return res.redirect('/login');
    res.render('customer-new', { title: 'New Customer' });
};

exports.show = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const customerResult = await db.query(
        'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.session.tenantId]
    );

    const customer = customerResult.rows[0];

    if (!customer) {
        console.log(`[warn] Isolation: user ${req.session.userId} attempted customer ${req.params.id}`);
        return res.status(404).send('Not found');
    }

    const policiesResult = await db.query(`
        SELECT * FROM policies
        WHERE customer_id = $1 AND tenant_id = $2
        ORDER BY policy_number
    `, [customer.id, req.session.tenantId]);

    res.render('customer', { title: customer.name, customer, policies: policiesResult.rows });
};

exports.editForm = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const result = await db.query(
        'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.session.tenantId]
    );

    const customer = result.rows[0];

    if (!customer) return res.status(404).send('Not found');

    res.render('customer-edit', { title: 'Edit Customer', customer });
};

exports.create = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const { name, email, phone } = req.body;

    if (!name) {
        return res.render('customer-new', { title: 'New Customer', error: 'Name is required.' });
    }

    await db.query(`
        INSERT INTO customers (tenant_id, name, email, phone)
        VALUES ($1, $2, $3, $4)
    `, [req.session.tenantId, name, email || null, phone || null]);

    console.log(`[info] Customer ${name} created by user ${req.session.userId}`);
    res.redirect('/customers');
};

exports.update = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const customerResult = await db.query(
        'SELECT id FROM customers WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.session.tenantId]
    );

    if (customerResult.rows.length === 0) return res.status(404).send('Not found');

    const { name, email, phone } = req.body;

    if (!name) {
        const fullResult = await db.query('SELECT * FROM customers WHERE id = $1', [req.params.id]);
        return res.render('customer-edit', {
            title: 'Edit Customer',
            error: 'Name is required.',
            customer: fullResult.rows[0]
        });
    }

    await db.query(`
        UPDATE customers
        SET name = $1, email = $2, phone = $3
        WHERE id = $4 AND tenant_id = $5
    `, [name, email || null, phone || null, req.params.id, req.session.tenantId]);

    console.log(`[info] Customer ${req.params.id} updated by user ${req.session.userId}`);
    res.redirect('/customers/' + req.params.id);
};

exports.remove = async (req, res) => {
    if (!req.session.userId) return res.redirect('/login');

    const customerResult = await db.query(
        'SELECT id FROM customers WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.session.tenantId]
    );

    if (customerResult.rows.length === 0) return res.status(404).send('Not found');

    const countResult = await db.query(
        'SELECT COUNT(*) AS n FROM policies WHERE customer_id = $1 AND tenant_id = $2',
        [req.params.id, req.session.tenantId]
    );

    const policyCount = parseInt(countResult.rows[0].n, 10);

    if (policyCount > 0) {
        return res.status(400).send(`Cannot delete: this customer has ${policyCount} policies.`);
    }

    await db.query('DELETE FROM customers WHERE id = $1 AND tenant_id = $2',
        [req.params.id, req.session.tenantId]);

    console.log(`[info] Customer ${req.params.id} deleted by user ${req.session.userId}`);
    res.redirect('/customers');
};