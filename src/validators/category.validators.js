const { body } = require("express-validator");

const categoryRequestBodyValidator = () => {
  return [
    body("name").trim().notEmpty().withMessage("Category name is required"),
  ];
};

module.exports = { categoryRequestBodyValidator };
