const { ApiResponse } = require("../utils/apiResponse.js");
const { ApiError } = require("../utils/apiError.js");
const { Category } = require("../models/category.model.js");
const { getMongoosePaginationOptions } = require("../utils/helper.js");

const createCategory = async (req, res, next) => {
  try {
    const { name } = req.body;

    const category = await Category.create({ name, owner: req.user._id });

    return res
      .status(201)
      .json(new ApiResponse(200, category, "Category created successfully"));
  } catch (error) {
    next(error);
  }
};

const getAllCategories = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const categoryAggregate = Category.aggregate([{ $match: {} }]);

    const categories = await Category.aggregatePaginate(
      categoryAggregate,
      getMongoosePaginationOptions({
        page,
        limit,
        customLabels: {
          totalDocs: "totalCategories",
          docs: "categories",
        },
      })
    );
    return res
      .status(200)
      .json(
        new ApiResponse(200, categories, "Categories fetched successfully")
      );
  } catch (error) {
    next(error);
  }
};

const getCategoryById = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category) {
      throw new ApiError(404, "Category does not exist");
    }
    return res
      .status(200)
      .json(new ApiResponse(200, category, "Category fetched successfully"));
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const { name } = req.body;
    const category = await Category.findByIdAndUpdate(
      categoryId,
      {
        $set: {
          name,
        },
      },
      { new: true }
    );
    if (!category) {
      throw new ApiError(404, "Category does not exist");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, category, "Category updated successfully"));
  } catch (error) {
    next(error);
  }
};

const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);

    if (!category) {
      throw new ApiError(404, "Category does not exist");
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletedCategory: category },
          "Category deleted successfully"
        )
      );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
