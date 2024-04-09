const { body } = require('express-validator');
// const User = require('../../models/auth/user.model.js');
const { AvailableUserRoles } = require('../../constants.js');

const userRegisterValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid'),
    body('username')
      .trim()
      .notEmpty()
      .withMessage('Username is required')
      .isLowercase()
      .withMessage('Username must be lowercase')
      .isLength({ min: 3 })
      .withMessage('Username must be at lease 3 characters long')
      .custom((value) => {
        // Custom validation to check if the username contains only letters and numbers
        if (/^[a-zA-Z0-9]+$/.test(value)) {
          return true;
        } else {
          throw new Error('Username must contain only letters and numbers');
        }
      })
      .withMessage('Username must contain only letters and numbers')
      .custom((value) => {
        if (/[a-zA-Z]/.test(value)) {
          return true;
        } else {
          throw new Error('Username must contain at least one letter');
        }
      })
      .withMessage('Username must contain at least one letter'),
    // .custom(async (value) => {
    //   // Check if username already exists in the database
    //   const exitsingUser = await User.findOne({ username: value });
    //   if (exitsingUser) {
    //     throw new Error('Username already exists');
    //   }
    // }),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at lease 6 characters long'),
    body('role')
      .optional()
      .isIn(AvailableUserRoles)
      .withMessage('Invalid user role'),
  ];
};

const userLoginValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid'),
    body('password')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at lease 6 characters long'),
  ];
};

const userForgotPasswordValidator = () => {
  return [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required')
      .isEmail()
      .withMessage('Email is invalid'),
  ];
};

const userResetForgottenPasswordValidator = () => {
  return [
    body('newPassword')
      .trim()
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at lease 6 characters long'),
    body('confirmPassword')
      .trim()
      .notEmpty()
      .withMessage('confirm Password is required')
      .custom((value, { req }) => {
        // Check if the confirm password matches the new password
        if (value !== req.body.newPassword) {
          throw new Error(`Confirm password doesn't match`);
        }
        return true;
      }),
  ];
};

module.exports = {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
};
