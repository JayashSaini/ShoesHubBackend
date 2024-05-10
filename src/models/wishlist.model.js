const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema(
  {
    products: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    },
    owner: {
      ref: 'User',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = { Wishlist };
