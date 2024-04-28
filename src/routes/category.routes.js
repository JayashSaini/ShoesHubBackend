const { Router } = require("express");
const router = Router();

const { validate } = require("../validators/validate.js");
const {
  verifyJWT,
  verifyPermission,
} = require("../middlewares/auth.middleware.js");
const {
  categoryRequestBodyValidator,
} = require("../validators/category.validators.js");

const { UserRolesEnum } = require("../constants.js");
const {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/category.controller.js");

const {
  mongoIdPathVariableValidator,
} = require("../validators/mongodb.validators.js");

router
  .route("/")
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    categoryRequestBodyValidator(),
    validate,
    createCategory
  )
  .get(getAllCategories);

router
  .route("/:categoryId")
  .get(mongoIdPathVariableValidator("categoryId"), validate, getCategoryById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator("categoryId"),
    validate,
    deleteCategory
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    categoryRequestBodyValidator(),
    mongoIdPathVariableValidator("categoryId"),
    validate,
    updateCategory
  );

module.exports = router;
