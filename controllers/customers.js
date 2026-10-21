const Customer = require('../models/customer');

exports.list = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const customers = await Customer.listByTenant(req.session.tenantId);

  console.log(`[info] User: ${req.session.userId} (tenant ${req.session.tenantId}) accessed customer list`);
  res.render('customers', { title: 'Customers', customers });
};

exports.newForm = (req, res) => {
  if (!req.session.userId) return res.redirect('/login');
  res.render('customer-new', { title: 'New Customer' });
};

exports.show = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const customer = await Customer.findById(req.params.id, req.session.tenantId);

  if (!customer) {
    console.log(`[warn] Isolation: user ${req.session.userId} attempted customer ${req.params.id}`);
    return res.status(404).send('Not found');
  }

  const policies = await Customer.listPoliciesForCustomer(customer.id, req.session.tenantId);

  res.render('customer', { title: customer.name, customer, policies });
};

exports.editForm = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const customer = await Customer.findById(req.params.id, req.session.tenantId);

  if (!customer) return res.status(404).send('Not found');

  res.render('customer-edit', { title: 'Edit Customer', customer });
};

exports.create = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { name, email, phone } = req.body;

  if (!name) {
    return res.render('customer-new', { title: 'New Customer', error: 'Name is required.' });
  }

  await Customer.create({
    tenantId: req.session.tenantId,
    name,
    email: email || null,
    phone: phone || null
  });

  console.log(`[info] Customer ${name} created by user ${req.session.userId}`);
  res.redirect('/customers');
};

exports.update = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const existing = await Customer.findById(req.params.id, req.session.tenantId);

  if (!existing) return res.status(404).send('Not found');

  const { name, email, phone } = req.body;

  if (!name) {
    return res.render('customer-edit', {
      title: 'Edit Customer',
      error: 'Name is required.',
      customer: existing
    });
  }

  await Customer.update(req.params.id, req.session.tenantId, {
    name,
    email: email || null,
    phone: phone || null
  });

  console.log(`[info] Customer ${req.params.id} updated by user ${req.session.userId}`);
  res.redirect('/customers/' + req.params.id);
};

exports.remove = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const existing = await Customer.findById(req.params.id, req.session.tenantId);

  if (!existing) return res.status(404).send('Not found');

  const policyCount = await Customer.countPolicies(req.params.id, req.session.tenantId);

  if (policyCount > 0) {
    return res.status(400).send(`Cannot delete: this customer has ${policyCount} policies.`);
  }

  await Customer.remove(req.params.id, req.session.tenantId);

  console.log(`[info] Customer ${req.params.id} deleted by user ${req.session.userId}`);
  res.redirect('/customers');
};