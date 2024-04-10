const { ApiError } = require('../utils/apiError.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { User } = require('../models/auth/user.model.js');
const jwt = require('jsonwebtoken');

const verifyJwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header('Authorization')?.replace('Bearer', '');

  if (!token) {
    throw new ApiError(401, 'Unauthorized request');
  }

  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      '-password -refreshToken -emailVerificationToken -emailVerificationExpiry'
    );

    if (!user) {
      throw new ApiError(401, 'Invalid access token');
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error?.message || 'Invalid access token');
  }
});

module.exports = {
  verifyJwt,
};
