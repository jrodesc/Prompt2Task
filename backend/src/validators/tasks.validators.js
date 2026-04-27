const { body } = require('express-validator');

const STATUSES = ['todo', 'in_progress', 'done', 'blocked'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const CATEGORIES = ['frontend', 'backend', 'database', 'devops', 'documentation', 'other'];

const taskCreateValidators = [
  body('title').trim().notEmpty().withMessage('El título es requerido').isLength({ max: 200 }),
  body('description').optional().isString(),
  body('status').optional().isIn(STATUSES).withMessage('Estado inválido'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Prioridad inválida'),
  body('category').optional().isIn(CATEGORIES).withMessage('Categoría inválida'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Fecha inválida'),
  body('projectId').optional({ nullable: true }).isInt(),
];

const taskUpdateValidators = [
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('description').optional().isString(),
  body('status').optional().isIn(STATUSES).withMessage('Estado inválido'),
  body('priority').optional().isIn(PRIORITIES).withMessage('Prioridad inválida'),
  body('category').optional().isIn(CATEGORIES).withMessage('Categoría inválida'),
  body('dueDate').optional({ nullable: true }).isISO8601().withMessage('Fecha inválida'),
  body('projectId').optional({ nullable: true }).isInt(),
];

module.exports = { taskCreateValidators, taskUpdateValidators };
