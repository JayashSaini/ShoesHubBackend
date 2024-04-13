const { Router } = require('express');
const {
  userRegister,
  userLogin,
  verifyEmail,
  refreshAccessToken,
  forgotPasswordRequest,
  resetForgottenPassword,
  userLogout,
  verifyOtp,
  handleSocialLogin,
} = require('../../controllers/auth/user.controllers.js');
const {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  userResetForgottenPasswordValidator,
  userVerifyOtpValidator,
} = require('../../validators/auth/user.validators.js');
const validate = require('../../validators/validate.js');
const { verifyJwt } = require('../../middlewares/auth.middleware.js');
require('../../passport/index.js'); // import the passport config
const passport = require('passport');

const router = Router();

//unsecured routes
router.route('/register').post(userRegisterValidator(), validate, userRegister);
router.route('/login').post(userLoginValidator(), validate, userLogin);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/verify-email/:verificationToken').get(verifyEmail);

router
  .route('/forgot-password')
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

router.route('/verify-otp').post(userVerifyOtpValidator(), validate, verifyOtp);

router
  .route('/reset-password/:resetToken')
  .post(
    userResetForgottenPasswordValidator(),
    validate,
    resetForgottenPassword
  );

// Secured Routes
router.route('/logout').get(verifyJwt, userLogout);

//SSO Routes

router.route('/google').get(
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  }),
  (req, res) => {
    res.send('redirecting to google...');
  }
);

router
  .route('/google/callback')
  .get(passport.authenticate('google'), handleSocialLogin);

module.exports = router;
