const { Router } = require('express');
const router = Router();
const { verifyJWT } = require('../middlewares/auth.middleware.js');
const {
  getWishlist,
  createAndAddItemToWishlist,
  removeProductFromWishlist,
} = require('../controllers/wishlist.controller.js');
const {
  mongoIdPathVariableValidator,
} = require('../validators/mongodb.validators.js');
const { validate } = require('../validators/validate.js');

router.use(verifyJWT);

router.route('/').get(getWishlist);
router
  .route('/:productId')
  .post(
    mongoIdPathVariableValidator('productId'),
    validate,
    createAndAddItemToWishlist
  )
  .delete(
    mongoIdPathVariableValidator('productId'),
    validate,
    removeProductFromWishlist
  );

module.exports = router;
