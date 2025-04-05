const Joi = require('joi');

/**
 * Middleware for validating request data
 */

// Validate user registration data
const validateRegistration = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required().min(3).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().required().min(8),
    role: Joi.string().valid('admin', 'user').default('user')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

// Validate user login data
const validateLogin = (req, res, next) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin
};
