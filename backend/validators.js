const { body, validationResult } = require('express-validator');

const videoValidationRules = () => [
  body('title').notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().isLength({ max: 2000 }),
  body('category').optional().isString(),
];


const commentValidationRules = () => [
  body('text').notEmpty().withMessage('Comment text is required').isLength({ max: 1000 }),
];

const authValidationRules = () => [
  body('email').isEmail().withMessage('Valid email is required'),
  body('name').optional().isString(),
  body('avatar').optional().isString(),
];

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { videoValidationRules, commentValidationRules, authValidationRules, validate };

