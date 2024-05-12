const { ApiResponse } = require('../utils/apiResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { Wishlist } = require('../models/wishlist.model.js');

const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ owner: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({
      owner: req.user._id,
    });
  }
  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'wishlist fetched successfully'));
});

const createAndAddItemToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOneAndUpdate(
    { owner: req.user._id },
    { $addToSet: { products: productId } },
    { upsert: true, new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'Item added to wishlist'));
});

const removeProductFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOneAndUpdate(
    { owner: req.user._id },
    { $pull: { products: productId } },
    { upsert: true, new: true }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'Product removed to wishlist'));
});
module.exports = {
  getWishlist,
  createAndAddItemToWishlist,
  removeProductFromWishlist,
};
