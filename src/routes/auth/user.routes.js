const { Router } = require('express');
const {
  userRegister,
  userLogin,
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

module.exports = router;
