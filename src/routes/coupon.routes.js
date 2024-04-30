const { Router } = require("express");
const {
  applyCoupon,
  createCoupon,
  deleteCoupon,
  getAllCoupons,
  getCouponById,
  getValidCouponsForCustomer,
  removeCouponFromCart,
  updateCoupon,
  updateCouponActiveStatus,
} = require("../controllers/coupon.controller.js");
const {
  verifyPermission,
  verifyJWT,
} = require("../middlewares/auth.middleware.js");
const {
  applyCouponCodeValidator,
  couponActivityStatusValidator,
  createCouponValidator,
  updateCouponValidator,
} = require("../validators/coupon.validators.js");
const { validate } = require("../validators/validate.js");
const { UserRolesEnum } = require("../constants.js");
const {
  mongoIdPathVariableValidator,
} = require("../validators/mongodb.validators.js");

const router = Router();

// * CUSTOMER ROUTES
router.use(verifyJWT);

router
  .route("/c/apply")
  .post(applyCouponCodeValidator(), validate, applyCoupon);
router.route("/c/remove").post(removeCouponFromCart);
// get coupons that customer can apply based on coupons active status and customer's cart value
router.route("/customer/available").get(getValidCouponsForCustomer);

// * ADMIN ROUTES
router.use(verifyPermission([UserRolesEnum.ADMIN]));

router
  .route("/")
  .get(getAllCoupons)
  .post(createCouponValidator(), validate, createCoupon);

router
  .route("/:couponId")
  .get(mongoIdPathVariableValidator("couponId"), validate, getCouponById)
  .patch(
    mongoIdPathVariableValidator("couponId"),
    updateCouponValidator(),
    validate,
    updateCoupon
  )
  .delete(mongoIdPathVariableValidator("couponId"), validate, deleteCoupon);

router
  .route("/status/:couponId")
  .patch(
    mongoIdPathVariableValidator("couponId"),
    couponActivityStatusValidator(),
    validate,
    updateCouponActiveStatus
  );

module.exports = router;
