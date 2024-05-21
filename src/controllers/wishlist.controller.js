const { ApiResponse } = require('../utils/apiResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { Wishlist } = require('../models/wishlist.model.js');
const { redis } = require('../config/redis.config.js');

const getWishlist = asyncHandler(async (req, res) => {
  const wishlistKey = `wishlist:${req.user._id}`;

  let wishlist = await redis.get(wishlistKey);

  if (wishlist) {
    wishlist = JSON.parse(wishlist);
    return res
      .status(200)
      .json(new ApiResponse(200, wishlist, 'Wishlist fetched successfully'));
  }

  wishlist = await Wishlist.findOne({ owner: req.user._id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ owner: req.user._id });
  }

  await redis.set(wishlistKey, JSON.stringify(wishlist), 'EX', 60);

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, 'Wishlist fetched successfully'));
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
