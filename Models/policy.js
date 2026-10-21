const db = require('../db');

async function listByTenant(tenantId) {
  const result = await db.query(`
    SELECT policies.*, customers.name AS customer_name
    FROM policies
    JOIN customers ON customers.id = policies.customer_id
    WHERE policies.tenant_id = $1
    ORDER BY policies.policy_number
  `, [tenantId]);
  return result.rows;
}

async function findById(id, tenantId) {
  const result = await db.query(
    'SELECT * FROM policies WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  return result.rows[0];
}

async function findByIdWithCustomer(id, tenantId) {
  const result = await db.query(`
    SELECT policies.*, customers.name AS customer_name
    FROM policies
    JOIN customers ON customers.id = policies.customer_id
    WHERE policies.id = $1 AND policies.tenant_id = $2
  `, [id, tenantId]);
  return result.rows[0];
}

async function create({ tenantId, customerId, policyNumber, premium, startDate, endDate }) {
  const result = await db.query(`
    INSERT INTO policies (tenant_id, customer_id, policy_number, premium, start_date, end_date)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `, [tenantId, customerId, policyNumber, premium, startDate, endDate]);
  return result.rows[0];
}

async function update(id, tenantId, { policyNumber, customerId, premium, startDate, endDate }) {
  const result = await db.query(`
    UPDATE policies
    SET policy_number = $1, customer_id = $2, premium = $3, start_date = $4, end_date = $5
    WHERE id = $6 AND tenant_id = $7
    RETURNING *
  `, [policyNumber, customerId, premium, startDate, endDate, id, tenantId]);
  return result.rows[0];
}

async function remove(id, tenantId) {
  await db.query(
    'DELETE FROM policies WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
}

module.exports = {
  listByTenant,
  findById,
  findByIdWithCustomer,
  create,
  update,
  remove
};