const { body } = require('express-validator');

const createCategoryValidator = () => {
  return [
    body('name').trim().notEmpty().withMessage('Category name is required'),
    body('childCategory')
      .optional()
      .isMongoId()
      .withMessage('childCategory Id is not a MongoId'),
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('parentCategory Id is not a MongoId'),
  ];
};

const updateCategoryValidator = () => {
  return [
    body('name')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Category name is required'),
    body('childCategory')
      .optional()
      .isMongoId()
      .withMessage('parentCategory Id is not a MongoId'),
    body('parentCategory')
      .optional()
      .isMongoId()
      .withMessage('parentCategory Id is not a MongoId'),
  ];
};

module.exports = { createCategoryValidator, updateCategoryValidator };
