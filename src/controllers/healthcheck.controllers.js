const { ApiResponse } = require('../utils/apiResponse');
const { asyncHandler } = require('../utils/asyncHandler');

const healthcheck = asyncHandler((req, res) => {
  res.status(200).json(new ApiResponse(200, {}, 'Server is running perfectly'));
});

module.exports = { healthcheck };
