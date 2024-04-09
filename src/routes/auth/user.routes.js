const { Router } = require('express');
const {
  userRegister,
  userLogin,
  verifyEmail,
  refreshAccessToken,
} = require('../../controllers/auth/user.controllers.js');
const {
  userRegisterValidator,
  userLoginValidator,
} = require('../../validators/auth/user.validators.js');
const validate = require('../../validators/validate.js');

const router = Router();

//unsecured routes
router.route('/register').post(userRegisterValidator(), validate, userRegister);
router.route('/login').post(userLoginValidator(), validate, userLogin);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/verify-email/:verificationToken').get(verifyEmail);

module.exports = router;
