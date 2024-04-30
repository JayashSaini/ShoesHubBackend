const { Router } = require("express");
const {
  addItemOrUpdateItemQuantity,
  clearCart,
  getUserCart,
  removeItemFromCart,
  createCart,
} = require("../controllers/cart.controller.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");
const {
  addItemOrUpdateItemQuantityValidator,
} = require("../validators/cart.validators.js");
const { validate } = require("../validators/validate.js");
const {
  mongoIdPathVariableValidator,
} = require("../validators/mongodb.validators.js");

const router = Router();

router.use(verifyJWT);

router.route("/").get(getUserCart);
router.route("/").post(createCart);

router.route("/clear").delete(clearCart);

router
  .route("/item/:productId")
  .post(
    mongoIdPathVariableValidator("productId"),
    addItemOrUpdateItemQuantityValidator(),
    validate,
    addItemOrUpdateItemQuantity
  )
  .delete(
    mongoIdPathVariableValidator("productId"),
    validate,
    removeItemFromCart
  );

module.exports = router;
