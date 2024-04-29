const { ApiResponse } = require('../utils/apiResponse.js');
const { ApiError } = require('../utils/apiError.js');
const { Category } = require('../models/category.model.js');
const {
  getMongoosePaginationOptions,
  capitalize,
} = require('../utils/helper.js');
const { asyncHandler } = require('../utils/asyncHandler.js');

const createCategory = asyncHandler(async (req, res) => {
  const { name, parentCategory, childCategory } = req.body;

  if (parentCategory) {
    const getParentCategory = await Category.findById(parentCategory);
    if (!getParentCategory) {
      throw new ApiError(404, 'Parent category does not exist');
    }
  }
  if (childCategory) {
    const getChildCategory = await Category.findById(childCategory);
    if (!getChildCategory) {
      throw new ApiError(404, 'Child category does not exist');
    }
  }

  const category = await Category.create({
    name: capitalize(name),
    owner: req.user._id,
    parentCategory: parentCategory ? parentCategory : undefined,
    childCategory: childCategory ? childCategory : undefined,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, category, 'Category created successfully'));
});

const getAllCategories = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const categoryAggregate = Category.aggregate([{ $match: {} }]);

  const categories = await Category.aggregatePaginate(
    categoryAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'totalCategories',
        docs: 'categories',
      },
    })
  );
  return res
    .status(200)
    .json(new ApiResponse(200, categories, 'Categories fetched successfully'));
});

const getCategoryById = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findById(categoryId);
  if (!category) {
    throw new ApiError(404, 'Category does not exist');
  }
  return res
    .status(200)
    .json(new ApiResponse(200, category, 'Category fetched successfully'));
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, childCategory, parentCategory } = req.body;
  const { categoryId } = req.params;
  if (parentCategory) {
    const getParentCategory = await Category.findById(parentCategory);
    if (!getParentCategory) {
      throw new ApiError(404, 'Parent category does not exist');
    }
  }
  if (childCategory) {
    const getChildCategory = await Category.findById(childCategory);
    if (!getChildCategory) {
      throw new ApiError(404, 'Child category does not exist');
    }
  }

  const category = await Category.findByIdAndUpdate(
    categoryId,
    {
      $set: {
        name: capitalize(name),
        childCategory,
        parentCategory,
      },
    },
    { new: true }
  );
  if (!category) {
    throw new ApiError(404, 'Category does not exist');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, category, 'Category updated successfully'));
});

const getAllChildCategories = asyncHandler(async (req, res) => {
  const { parentCategoryId } = req.params;

  let childCategories = await Category.find({
    parentCategory: parentCategoryId,
  }).select('-owner -createdAt -updatedAt -__v');

  if (childCategories.length == 0) {
    childCategories = [];
  }
  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { childCategories },
        'Child categories fetched successfully'
      )
    );
});

const deleteCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const category = await Category.findByIdAndDelete(categoryId);

  if (!category) {
    throw new ApiError(404, 'Category does not exist');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedCategory: category },
        'Category deleted successfully'
      )
    );
});

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  getAllChildCategories,
};
