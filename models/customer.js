const db = require('../db');

async function listByTenant(tenantId) {
  const result = await db.query(`
    SELECT customers.*,
      (SELECT COUNT(*) FROM policies WHERE policies.customer_id = customers.id) AS policy_count
    FROM customers
    WHERE customers.tenant_id = $1
    ORDER BY customers.name
  `, [tenantId]);
  return result.rows;
}

async function findById(id, tenantId) {
  const result = await db.query(
    'SELECT * FROM customers WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
  return result.rows[0];
}

async function create({ tenantId, name, email, phone }) {
  const result = await db.query(`
    INSERT INTO customers (tenant_id, name, email, phone)
    VALUES ($1, $2, $3, $4)
    RETURNING *
  `, [tenantId, name, email, phone]);
  return result.rows[0];
}

async function update(id, tenantId, { name, email, phone }) {
  const result = await db.query(`
    UPDATE customers
    SET name = $1, email = $2, phone = $3
    WHERE id = $4 AND tenant_id = $5
    RETURNING *
  `, [name, email, phone, id, tenantId]);
  return result.rows[0];
}

async function remove(id, tenantId) {
  await db.query(
    'DELETE FROM customers WHERE id = $1 AND tenant_id = $2',
    [id, tenantId]
  );
}

async function listPoliciesForCustomer(customerId, tenantId) {
  const result = await db.query(`
    SELECT * FROM policies
    WHERE customer_id = $1 AND tenant_id = $2
    ORDER BY policy_number
  `, [customerId, tenantId]);
  return result.rows;
}

async function countPolicies(customerId, tenantId) {
  const result = await db.query(
    'SELECT COUNT(*) AS n FROM policies WHERE customer_id = $1 AND tenant_id = $2',
    [customerId, tenantId]
  );
  return parseInt(result.rows[0].n, 10);
}

module.exports = {
  listByTenant,
  findById,
  create,
  update,
  remove,
  listPoliciesForCustomer,
  countPolicies
};
