const { Router } = require('express');
const { getAll, getOne, create, update, remove, getMetrics } = require('../controllers/tasks.controller');
const { taskCreateValidators, taskUpdateValidators } = require('../validators/tasks.validators');
const validate = require('../middleware/validate.middleware');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

router.use(authMiddleware);

router.get('/metrics', getMetrics);
router.get('/', getAll);
router.get('/:id', getOne);
router.post('/', taskCreateValidators, validate, create);
router.put('/:id', taskUpdateValidators, validate, update);
router.delete('/:id', remove);

module.exports = router;
