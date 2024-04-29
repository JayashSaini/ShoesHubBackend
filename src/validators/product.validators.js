const { body } = require('express-validator');
const { mongoIdRequestBodyValidator } = require('./mongodb.validators.js');

const createProductValidator = () => {
  return [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description')
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('color').trim().notEmpty().withMessage('Color is required'),
    body('price')
      .trim()
      .notEmpty()
      .withMessage('Price is required')
      .isNumeric()
      .withMessage('Price must be a number'),
    body('size')
      .trim()
      .notEmpty()
      .withMessage('Size is required')
      .isArray({ min: 1 })
      .withMessage('Size must be a Array of numbers'),
    body('stock')
      .trim()
      .notEmpty()
      .withMessage('Stock is required')
      .isNumeric()
      .withMessage('Stock must be a number'),
    ...mongoIdRequestBodyValidator('category'),
  ];
};

const updateProductValidator = () => {
  return [
    body('name').optional().trim().notEmpty().withMessage('Name is required'),
    body('description')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Description is required'),
    body('color').optional().trim().notEmpty().withMessage('Color is required'),
    body('price')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Price is required')
      .isNumeric()
      .withMessage('Price must be a number'),
    body('size')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Size is required')
      .isArray({ min: 1 })
      .withMessage('Size must be a Array of numbers'),
    body('stock')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Stock is required')
      .isNumeric()
      .withMessage('Stock must be a number'),
    ...mongoIdRequestBodyValidator('category'),
  ];
};

module.exports = { createProductValidator, updateProductValidator };
