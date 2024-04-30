const { body } = require('express-validator');

const createAddressValidator = () => {
  return [
    body('addressLine1')
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('addressLine2')
      .trim()
      .notEmpty()
      .withMessage('Address line 2 is required'),
    body('city').trim().notEmpty().withMessage('city/town is required'),
    body('state').trim().notEmpty().withMessage('state is required'),
    body('pincode')
      .trim()
      .notEmpty()
      .withMessage('Pincode is required')
      .isNumeric()
      .isLength({ max: 6, min: 6 })
      .withMessage('Invalid pincode'),
    body('phoneNumber')
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Invalid phone number format'),
  ];
};

const updateAddressValidator = () => {
  return [
    body('addressLine1')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Address line 1 is required'),
    body('addressLine2')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Address line 2 is required'),
    body('city')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('city/town is required'),
    body('state').optional().trim().notEmpty().withMessage('state is required'),
    body('pincode')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Pincode is required')
      .isNumeric()
      .isLength({ max: 6, min: 6 })
      .withMessage('Invalid pincode'),
    body('phoneNumber')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Phone number is required')
      .matches(/^[6-9]\d{9}$/)
      .withMessage('Invalid phone number format'),
  ];
};

module.exports = { createAddressValidator, updateAddressValidator };
