const { Router } = require('express');
const { userRegister } = require('../../controllers/auth/user.controllers.js');
const {
  userRegisterValidator,
} = require('../../validators/auth/user.validators.js');
const validate = require('../../validators/validate.js');

const router = Router();

//unsecured routes
router.route('/register').post(userRegisterValidator(), validate, userRegister);

module.exports = router;
