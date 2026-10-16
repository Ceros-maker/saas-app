const express = require('express');         
const customers = require ('../controllers/customers');
const router = express.Router();

router.get('/customers', customers.list);
router.get('/customers/new', customers.newForm);
router.get('/customers/:id/edit', customers.editForm);
router.get('/customers/:id', customers.show);
router.post('/customers', customers.create);
router.post('/customers/:id/edit', customers.update);
router.post('/customers/:id/delete', customers.remove);

module.exports = router;