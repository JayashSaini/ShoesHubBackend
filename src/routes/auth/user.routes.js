const { Router } = require('express');
const {
  userRegister,
  userLogin,
  verifyEmail,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgottenPassword,
  userLogout,
} = require('../../controllers/auth/user.controllers.js');
const {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
} = require('../../validators/auth/user.validators.js');
const validate = require('../../validators/validate.js');
const { verifyJwt } = require('../../middlewares/auth.middleware.js');

const router = Router();

//unsecured routes
router.route('/register').post(userRegisterValidator(), validate, userRegister);
router.route('/login').post(userLoginValidator(), validate, userLogin);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/verify-email/:verificationToken').get(verifyEmail);

router
  .route('/forgot-password')
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);
router
  .route('/reset-password/:resetToken')
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword
  );

// Secured Routes
router.route('/logout').get(verifyJwt, userLogout);

module.exports = router;
