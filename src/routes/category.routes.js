const { Router } = require('express');
const router = Router();

const { validate } = require('../validators/validate.js');
const {
  verifyJWT,
  verifyPermission,
} = require('../middlewares/auth.middleware.js');
const {
  createCategoryValidator,
  updateCategoryValidator,
} = require('../validators/category.validators.js');

const { UserRolesEnum } = require('../constants.js');
const {
  createCategory,
  getCategoryById,
  getAllCategories,
  updateCategory,
  deleteCategory,
  getAllChildCategories,
} = require('../controllers/category.controllers.js');

const {
  mongoIdPathVariableValidator,
  mongoIdRequestBodyValidator,
} = require('../validators/mongodb.validators.js');

router
  .route('/')
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    createCategoryValidator(),
    validate,
    createCategory
  )
  .get(getAllCategories);

router
  .route('/:categoryId')
  .get(mongoIdPathVariableValidator('categoryId'), validate, getCategoryById)
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator('categoryId'),
    validate,
    deleteCategory
  )
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    updateCategoryValidator(),
    mongoIdPathVariableValidator('categoryId'),
    validate,
    updateCategory
  );

router
  .route('/c/:parentCategoryId')
  .get(
    mongoIdPathVariableValidator('parentCategoryId'),
    validate,
    getAllChildCategories
  );

module.exports = router;
