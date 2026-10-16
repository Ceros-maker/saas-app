const express = require('express');         
const policies = require ('../controllers/policies');
const router = express.Router();

router.get('/policies', policies.list);
router.get('/policies/new', policies.newForm);
router.post('/policies', policies.create);
router.get('/policies/:id', policies.show);
router.get('/policies/:id/edit', policies.editForm);
router.post('/policies/:id/edit', policies.update);
router.post('/policies/:id/delete', policies.remove);

module.exports = router;