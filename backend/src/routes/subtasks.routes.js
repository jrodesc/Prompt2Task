const { Router } = require('express');
const { toggle } = require('../controllers/subtasks.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();
router.use(authMiddleware);
router.patch('/:id/toggle', toggle);

module.exports = router;
