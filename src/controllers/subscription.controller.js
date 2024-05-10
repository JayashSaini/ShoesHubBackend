const { ApiResponse } = require('../utils/apiResponse.js');
const { ApiError } = require('../utils/apiError.js');
const { asyncHandler } = require('../utils/asyncHandler.js');
const { Subscription } = require('../models/subscription.model.js');
const { getMongoosePaginationOptions } = require('../utils/helper.js');
const { subscriptionSendmail } = require('../utils/mail.js');

const createSubscription = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || email.trim() === '') {
    throw new ApiError(400, 'Email is required');
  }

  if (!email.match(emailRegex)) {
    throw new ApiError(400, 'Invalid email format');
  }

  const alreadySubscribed = await Subscription.findOne({
    email,
  });

  if (alreadySubscribed) {
    throw new ApiError(400, 'Email is already subscribed');
  }
  await subscriptionSendmail({
    email: email,
    subject: 'ShoesHub Subscription',
    content: 'SHOESHUB500OFF',
  });

  const newSubscription = await Subscription.create({
    email,
  });
  if (!newSubscription) {
    throw new ApiError(400, 'try again Something went wrong');
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        'Check your email for getting Rs.500 FLAT OFF Coupon Code'
      )
    );
});

const getAllSubscription = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const subscribedAggregate = Subscription.aggregate([{ $match: {} }]);

  const subscribers = await Subscription.aggregatePaginate(
    subscribedAggregate,
    getMongoosePaginationOptions({
      page,
      limit,
      customLabels: {
        totalDocs: 'totalsubscribers',
        docs: 'subscribers',
      },
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, subscribers, 'Products fetched successfully'));
});

module.exports = {
  createSubscription,
  getAllSubscription,
};
