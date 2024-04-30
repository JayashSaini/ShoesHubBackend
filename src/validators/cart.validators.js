const { body } = require("express-validator");
const { Product } = require("../models/product.model.js");

const addItemOrUpdateItemQuantityValidator = () => {
  return [
    body("quantity")
      .optional()
      .isInt({
        min: 1,
      })
      .withMessage("Quantity must be greater than 0"),
  ];
};

module.exports = { addItemOrUpdateItemQuantityValidator };
