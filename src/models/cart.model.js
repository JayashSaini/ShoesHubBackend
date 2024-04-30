const mongoose = require("mongoose");
const cartSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    items: {
      type: [
        {
          productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
          },
          quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity can not be less then 1."],
            default: 1,
          },
        },
      ],
      default: [],
    },
    coupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      default: null,
    },
  },

  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
module.exports = { Cart };
