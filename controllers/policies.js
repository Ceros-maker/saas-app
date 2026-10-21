const Policy = require('../models/policy');
const Customer = require('../models/customer');

exports.list = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policies = await Policy.listByTenant(req.session.tenantId);

  res.render('policies', { title: 'Policies', policies });
};

exports.newForm = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const customers = await Customer.listByTenant(req.session.tenantId);

  res.render('policy-new', { title: 'New Policy', customers });
};

exports.show = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policy = await Policy.findByIdWithCustomer(req.params.id, req.session.tenantId);

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Policy not found');
  }

  res.render('policy', { title: policy.policy_number, policy });
};

exports.editForm = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const policy = await Policy.findById(req.params.id, req.session.tenantId);

  if (!policy) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  }

  const customers = await Customer.listByTenant(req.session.tenantId);

  res.render('policy-edit', { title: 'Edit Policy', policy, customers });
};

exports.create = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const { policy_number, customer_id, premium, start_date, end_date } = req.body;

  if (!policy_number || !customer_id || !premium || !start_date || !end_date) {
    const customers = await Customer.listByTenant(req.session.tenantId);
    console.log(`[warn] Policy create failed: missing fields. User ${req.session.userId}`);
    return res.render('policy-new', {
      title: 'New Policy',
      error: 'All fields required!',
      customers
    });
  }

  await Policy.create({
    tenantId: req.session.tenantId,
    customerId: customer_id,
    policyNumber: policy_number,
    premium: parseInt(premium, 10) * 100,
    startDate: start_date,
    endDate: end_date
  });

  console.log(`[info] Policy ${policy_number} created by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies');
};

exports.update = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const existing = await Policy.findById(req.params.id, req.session.tenantId);

  if (!existing) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  }

  const { policy_number, customer_id, premium, start_date, end_date } = req.body;

  if (!policy_number || !customer_id || !premium || !start_date || !end_date) {
    return res.render('policy-edit', {
      title: 'Edit Policy',
      error: 'All fields required',
      policy: existing
    });
  }

  await Policy.update(req.params.id, req.session.tenantId, {
    policyNumber: policy_number,
    customerId: customer_id,
    premium: parseInt(premium, 10) * 100,
    startDate: start_date,
    endDate: end_date
  });

  console.log(`[info] Policy ${req.params.id} updated by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies/' + req.params.id);
};

exports.remove = async (req, res) => {
  if (!req.session.userId) return res.redirect('/login');

  const existing = await Policy.findById(req.params.id, req.session.tenantId);

  if (!existing) {
    console.log(`[warn] Isolation: user ${req.session.userId} (tenant ${req.session.tenantId}) attempted to access policy ${req.params.id}`);
    return res.status(404).send('Not found');
  }

  await Policy.remove(req.params.id, req.session.tenantId);

  console.log(`[info] Policy ${req.params.id} deleted by user ${req.session.userId} (tenant ${req.session.tenantId})`);
  res.redirect('/policies');
};