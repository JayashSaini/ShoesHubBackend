const { Router } = require("express");
const {
  createAddress,
  deleteAddress,
  getAddressById,
  getAllAddresses,
  updateAddress,
} = require("../controllers/address.controller.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");
const {
  createAddressValidator,
  updateAddressValidator,
} = require("../validators/address.validators.js");
const { validate } = require("../validators/validate.js");
const {
  mongoIdPathVariableValidator,
} = require("../validators/mongodb.validators.js");

const router = Router();

// All routes require authentication
router.use(verifyJWT);

router
  .route("/")
  .post(createAddressValidator(), validate, createAddress)
  .get(getAllAddresses);

router
  .route("/:addressId")
  .get(mongoIdPathVariableValidator("addressId"), validate, getAddressById)
  .delete(mongoIdPathVariableValidator("addressId"), validate, deleteAddress)
  .patch(
    updateAddressValidator(),
    mongoIdPathVariableValidator("addressId"),
    validate,
    updateAddress
  );

module.exports = router;
