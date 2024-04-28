const { ApiResponse } = require('../utils/apiResponse.js');
const { ApiError } = require('../utils/apiError.js');
const { Product } = require('../models/product.model.js');
const { Category } = require('../models/category.model.js');
const {
  uploadOnCloudinary,
  deleteImageonCloudinary,
} = require('../utils/cloudinary.js');
const { getMongoosePaginationOptions } = require('../utils/helper.js');
const { MAXIMUM_SUB_IMAGE_COUNT } = require('../constants.js');
const mongoose = require('mongoose');
const { asyncHandler } = require('../utils/asyncHandler.js');

const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const productAggregate = Product.aggregate([{ $match: {} }]);

  const products = await Product.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'totalProducts',
        docs: 'products',
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, products, 'Products fetched successfully'));
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock } = req.body;

  const categoryToBeAdded = await Category.findById(category);

  if (!categoryToBeAdded) {
    throw new ApiError(404, 'Category does not exist');
  }

  // Check if user has uploaded a main image
  if (!req.files?.mainImage || !req.files?.mainImage.length) {
    throw new ApiError(400, 'Main image is required');
  }

  const mainImageLocalPath = req.files?.mainImage[0]?.path;
  const mainImage = await uploadOnCloudinary(mainImageLocalPath);

  const subImages = [];
  if (req.files.subImages && req.files.subImages?.length) {
    for (let i = 0; i < req.files.subImages.length; i++) {
      const image = req.files.subImages[i];
      const imageLocalPath = image.path;
      const subImage = await uploadOnCloudinary(imageLocalPath);
      subImages.push({ url: subImage.url, public_id: subImage.public_id });
    }
  }

  const owner = req.user._id;

  const product = await Product.create({
    name,
    description,
    stock,
    price,
    owner,
    mainImage: {
      url: mainImage.url,
      public_id: mainImage.public_id,
    },
    subImages,
    category,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, product, 'Product created successfully'));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, description, category, price, stock } = req.body;

  const product = await Product.findById(productId);

  // Check the product existence
  if (!product) {
    throw new ApiError(404, 'Product does not exist');
  }

  let mainImage;
  if (req.files?.mainImage?.length) {
    const mainImageLocalPath = req.files?.mainImage[0]?.path;
    mainImage = await uploadOnCloudinary(mainImageLocalPath);
  } else {
    mainImage = product.mainImage;
  }

  let subImages = [];
  if (req.files.subImages && req.files.subImages?.length) {
    for (let i = 0; i < req.files.subImages.length; i++) {
      const image = req.files.subImages[i];
      const imageLocalPath = image.path;
      const subImage = await uploadOnCloudinary(imageLocalPath);
      subImages.push({ url: subImage.url, public_id: subImage.public_id });
    }
  }

  const existedSubImages = product.subImages.length; // total sub images already present in the project
  const newSubImages = subImages.length; // Newly uploaded sub images
  const totalSubImages = existedSubImages + newSubImages;

  if (totalSubImages > MAXIMUM_SUB_IMAGE_COUNT) {
    subImages.forEach(async (image) => {
      await deleteImageonCloudinary(image.public_id);
    });
    if (product.mainImage.url !== mainImage.url) {
      // If use has uploaded new main image remove the newly uploaded main image as there is no updation happening
      await deleteImageonCloudinary(mainImage.public_id);
    }
    throw new ApiError(
      400,
      'Maximum ' +
        MAXIMUM_SUB_IMAGE_COUNT +
        ' sub images are allowed for a product. There are already ' +
        existedSubImages +
        ' sub images attached to the product.'
    );
  }

  // If above checks are passed. We need to merge the existing sub images and newly uploaded sub images
  subImages = [...product.subImages, ...subImages];

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $set: {
        name,
        description,
        stock,
        price,
        category,
        mainImage,
        subImages,
      },
      stock,
    },
    {
      new: true,
    }
  );

  // Once the product is updated. Do some cleanup
  if (product.mainImage.url !== mainImage.url) {
    // If user is uploading new main image remove the previous one because we don't need that anymore
    await deleteImageonCloudinary(product.mainImage.public_id);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(404, 'Product does not exist');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, 'Product fetched successfully'));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const category = await Category.findById(categoryId).select('name _id');

  if (!category) {
    throw new ApiError(404, 'Category does not exist');
  }

  const productAggregate = Product.aggregate([
    {
      // match the products with provided category
      $match: {
        category: new mongoose.Types.ObjectId(categoryId),
      },
    },
  ]);

  const products = await Product.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'totalProducts',
        docs: 'products',
      },
    })
  );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { ...products, category },
        'Category products fetched successfully'
      )
    );
});

const removeProductSubImage = asyncHandler(async (req, res) => {
  const { productId, subImageId } = req.params;

  const product = await Product.findById(productId);

  // check for product existence
  if (!product) {
    throw new ApiError(404, 'Product does not exist');
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    productId,
    {
      $pull: {
        // pull an item from subImages with _id equals to subImageId
        subImages: {
          _id: new mongoose.Types.ObjectId(subImageId),
        },
      },
    },
    { new: true }
  );

  // retrieve the file object which is being removed
  const removedSubImage = product.subImages?.find((image) => {
    return image._id.toString() === subImageId;
  });

  if (removedSubImage) {
    await deleteImageonCloudinary(removedSubImage.public_id);
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedProduct, 'Sub image removed successfully')
    );
});

const deleteProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findOneAndDelete({
    _id: productId,
  });

  if (!product) {
    throw new ApiError(404, 'Product does not exist');
  }

  const productImages = [product.mainImage, ...product.subImages];

  productImages.forEach(async (image) => {
    await deleteImageonCloudinary(image.public_id);
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedProduct: product },
        'Product deleted successfully'
      )
    );
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  removeProductSubImage,
  getProductsByCategory,
};
