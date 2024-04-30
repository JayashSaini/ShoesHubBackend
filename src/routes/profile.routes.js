const { Router } = require("express");
const {
  getMyEcomProfile,
  createProfile,
  updateEcomProfile,
} = require("../controllers/profile.controller.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");
const { profileValidator } = require("../validators/profile.validators.js");
const { validate } = require("../validators/validate.js");

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getMyEcomProfile)
  .post(profileValidator(), validate, createProfile)
  .patch(profileValidator(), validate, updateEcomProfile);

module.exports = router;
