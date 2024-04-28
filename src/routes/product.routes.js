const { Router } = require('express');
const router = Router();

const {
  verifyJWT,
  verifyPermission,
} = require('../middlewares/auth.middleware.js');
const { UserRolesEnum, MAXIMUM_SUB_IMAGE_COUNT } = require('../constants.js');

const {
  createProductValidator,
  updateProductValidator,
} = require('../validators/product.validators.js');
const { upload } = require('../middlewares/multer.middleware.js');
const validate = require('../validators/validate.js');
const {
  compressImages,
} = require('../middlewares/image-compress.middleware.js');
const {
  mongoIdPathVariableValidator,
} = require('../validators/mongodb.validators.js');
const {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  removeProductSubImage,
} = require('../controllers/product.controllers.js');

router
  .route('/')
  .get(getAllProducts)
  .post(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    upload.fields([
      {
        name: 'mainImage',
        maxCount: 1,
      },
      {
        // frontend will send at max 4 `subImages` keys with file object which we will save in the backend
        name: 'subImages',
        maxCount: MAXIMUM_SUB_IMAGE_COUNT, // maximum number of subImages is 4
      },
    ]),
    createProductValidator(),
    validate,
    compressImages,
    createProduct
  );

router
  .route('/:productId')
  .get(mongoIdPathVariableValidator('productId'), validate, getProductById)
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    upload.fields([
      {
        name: 'mainImage',
        maxCount: 1,
      },
      {
        name: 'subImages',
        maxCount: MAXIMUM_SUB_IMAGE_COUNT, // maximum number of subImages is 4
      },
    ]),
    mongoIdPathVariableValidator('productId'),
    updateProductValidator(),
    validate,
    updateProduct
  )
  .delete(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator('productId'),
    validate,
    deleteProduct
  );

router
  .route('/category/:categoryId')
  .get(
    mongoIdPathVariableValidator('categoryId'),
    validate,
    getProductsByCategory
  );

router
  .route('/remove/subimage/:productId/:subImageId')
  .patch(
    verifyJWT,
    verifyPermission([UserRolesEnum.ADMIN]),
    mongoIdPathVariableValidator('productId'),
    mongoIdPathVariableValidator('subImageId'),
    validate,
    removeProductSubImage
  );

module.exports = router;
