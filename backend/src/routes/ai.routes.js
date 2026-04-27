const { Router } = require('express');
const { generateTasks } = require('../controllers/ai.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { body } = require('express-validator');
const validate = require('../middleware/validate.middleware');

const router = Router();
router.use(authMiddleware);

router.post('/generate', [
  body('prompt').trim().notEmpty().withMessage('El prompt es requerido').isLength({ max: 2000 }),
], validate, generateTasks);

module.exports = router;
