const { ApiResponse } = require('../utils/apiResponse.js');
const { ApiError } = require('../utils/apiError.js');
const { Product } = require('../models/product.model.js');
const { Category } = require('../models/category.model.js');
const {
  uploadOnCloudinary,
  deleteImageOnCloudinary,
} = require('../utils/cloudinary.js');
const { getMongoosePaginationOptions } = require('../utils/helper.js');
const { MAXIMUM_SUB_IMAGE_COUNT } = require('../constants.js');
const mongoose = require('mongoose');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { redis } = require('../config/redis.config.js');

const SortAndFilter = (sortType) => {
  switch (sortType) {
    case 'oldest':
      return { $sort: { createdAt: 1 } }; // Assuming createdAt field exists

    case 'newest':
      return { $sort: { createdAt: -1 } }; // Assuming createdAt field exists

    case 'aToz':
      return { $sort: { name: 1 } }; // Assuming productName field exists

    case 'zToa':
      return { $sort: { name: -1 } }; // Assuming productName field exists

    case 'highToLow':
      return { $sort: { price: -1 } }; // Assuming price field exists

    case 'lowToHigh':
      return { $sort: { price: 1 } }; // Assuming price field exists
    default:
      return { $sort: { randomOrder: 1 } }; // Default sorting by randomOrder
  }
};

const getAllProducts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sortType = 'latest' } = req.query;
  const cacheKey = `products:page:${page}:limit:${limit}:sort:${sortType}`;

  // Attempt to fetch cached data
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    const products = JSON.parse(cachedData);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          'Products fetched successfully from cache'
        )
      );
  }

  // Fetch data from the database
  const sortStage = SortAndFilter(sortType);
  const productAggregate = Product.aggregate([
    { $match: {} },
    {
      $addFields: {
        randomOrder: { $rand: {} },
      },
    },
    {
      $sort: {
        randomOrder: 1,
      },
    },
    sortStage,
  ]);

  const products = await Product.aggregatePaginate(
    productAggregate,
    getMongoosePaginationOptions({ page, limit })
  );

  // Cache the data
  await redis.set(cacheKey, JSON.stringify(products), 'EX', 60); // Cache for 60 seconds

  return res
    .status(200)
    .json(new ApiResponse(200, products, 'Products fetched successfully'));
});

const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, stock, color, size } = req.body;

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
    color,
    size,
    subImages,
    category,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, product, 'Product created successfully'));
});

const updateProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { name, description, category, price, stock, color, size } = req.body;

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
      await deleteImageOnCloudinary(image.public_id);
    });
    if (product.mainImage.url !== mainImage.url) {
      // If use has uploaded new main image remove the newly uploaded main image as there is no updation happening
      await deleteImageOnCloudinary(mainImage.public_id);
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
        color,
        size,
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
    await deleteImageOnCloudinary(product.mainImage.public_id);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedProduct, 'Product updated successfully'));
});

const getProductById = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  let product;
  const cachedProduct = await redis.get(`product:${productId}`);

  if (cachedProduct) {
    product = JSON.parse(cachedProduct);
  } else {
    product = await Product.findById(productId);

    if (!product) {
      throw new ApiError(404, 'Product does not exist');
    }

    await redis.set(`product:${productId}`, JSON.stringify(product), 'EX', 60);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, product, 'Product fetched successfully'));
});

const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10, sortType = 'latest' } = req.query;

  // Construct cache key with category, page, limit, and sortType
  const cacheKey = `category:${categoryId}:page:${page}:limit:${limit}:sort:${sortType}`;

  // Try to get the cached data
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    const responseData = JSON.parse(cachedData);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          'Category products fetched successfully from cache'
        )
      );
  }

  const category = await Category.findById(categoryId).select('name _id');

  if (!category) {
    throw new ApiError(404, 'Category does not exist');
  }

  const sortStage = SortAndFilter(sortType);

  const productAggregate = Product.aggregate([
    {
      $match: {
        category: new mongoose.Types.ObjectId(categoryId),
      },
    },
    {
      $addFields: {
        randomOrder: { $rand: {} },
      },
    },
    sortStage,
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

  const responseData = { ...products, category };

  // Cache the result
  await redis.set(cacheKey, JSON.stringify(responseData), 'EX', 60); // Cache for 60 seconds

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        responseData,
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
    await deleteImageOnCloudinary(removedSubImage.public_id);
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
    await deleteImageOnCloudinary(image.public_id);
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

const getProductsByParentCategoryId = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  let { limit = 10, page = 1, sortType = 'latest' } = req.query;
  limit = parseInt(limit);
  page = parseInt(page);

  const skip = (page - 1) * limit;
  const sortStage = SortAndFilter(sortType);

  // Construct cache key with categoryId, limit, page, and sortType
  const cacheKey = `parentCategory:${categoryId}:limit:${limit}:page:${page}:sort:${sortType}`;

  // Try to get the cached data
  const cachedData = await redis.get(cacheKey);

  if (cachedData) {
    const responseData = JSON.parse(cachedData);
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          responseData,
          'Products fetched successfully from cache'
        )
      );
  }

  const productAggregate = [
    {
      $match: {
        parentCategory: new mongoose.Types.ObjectId(categoryId),
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: 'category',
        as: 'ProductCategory',
      },
    },
    {
      $unwind: '$ProductCategory',
    },
    {
      $group: {
        _id: '$_id',
        categoryName: { $first: '$name' },
        mergedProductCategory: { $push: '$ProductCategory' },
      },
    },
    {
      $unwind: '$mergedProductCategory',
    },
    {
      $replaceRoot: { newRoot: '$mergedProductCategory' },
    },
    {
      $addFields: {
        randomOrder: { $rand: {} },
      },
    },
    sortStage,
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];

  const products = await Category.aggregate(productAggregate);

  // Cache the result
  await redis.set(cacheKey, JSON.stringify(products), 'EX', 60); // Cache for 60 seconds

  return res
    .status(200)
    .json(new ApiResponse(200, products, 'Products fetched successfully'));
});

module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProduct,
  removeProductSubImage,
  getProductsByCategory,
  getProductsByParentCategoryId,
};
