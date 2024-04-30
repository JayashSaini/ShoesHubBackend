const { Address } = require('../models/address.model.js');
const { ApiError } = require('../utils/apiError.js');
const { ApiResponse } = require('../utils/apiResponse.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { getMongoosePaginationOptions } = require('../utils/helper.js');

const createAddress = asyncHandler(async (req, res) => {
  const { addressLine1, addressLine2, pincode, city, state, phoneNumber } =
    req.body;
  const owner = req.user._id;

  const address = await Address.create({
    addressLine1,
    addressLine2,
    city,
    state,
    owner,
    pincode,
    phoneNumber,
  });

  return res
    .status(201)
    .json(new ApiResponse(200, address, 'Address created successfully'));
});

const getAllAddresses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const addressAggregation = Address.aggregate([
    {
      $match: {
        owner: req.user._id,
      },
    },
  ]);

  const addresses = await Address.aggregatePaginate(
    addressAggregation,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'totalAddresses',
        docs: 'addresses',
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, addresses, 'Addresses fetched successfully'));
});

const getAddressById = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOne({
    _id: addressId,
    owner: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, 'Address does not exist');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, address, 'Address fetched successfully'));
});

const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { addressLine1, addressLine2, pincode, city, state, phoneNumber } =
    req.body;
  const address = await Address.findOneAndUpdate(
    {
      _id: addressId,
      owner: req.user._id,
    },
    {
      $set: {
        addressLine1,
        addressLine2,
        city,
        state,
        pincode,
        phoneNumber,
      },
    },
    { new: true }
  );

  if (!address) {
    throw new ApiError(404, 'Address does not exist');
  }

  return res
    .status(200)
    .json(new ApiResponse(200, address, 'Address updated successfully'));
});

const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const address = await Address.findOneAndDelete({
    _id: addressId,
    owner: req.user._id,
  });

  if (!address) {
    throw new ApiError(404, 'Address does not exist');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { deletedAddress: address },
        'Address deleted successfully'
      )
    );
});

module.exports = {
  createAddress,
  getAllAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
};
