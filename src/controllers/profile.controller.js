const { EcommProfile } = require('../models/profile.model.js');
const { ApiError } = require('../utils/apiError.js');
const { ApiResponse } = require('../utils/apiResponse.js');

const createProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone } = req.body;

    let profile = await EcommProfile.findOne({
      owner: req.user._id,
    });

    if (profile) {
      throw new ApiError(400, 'Profile already exists');
    }
    const userProfile = await EcommProfile.create({
      email,
      phoneNumber: phone,
      firstName,
      lastName,
      owner: req.user._id,
    });
    if (!userProfile) {
      throw new ApiError(500, 'Failed to create user profile');
    }
    res
      .status(200)
      .json(
        new ApiResponse(200, userProfile, 'User profile created successfully')
      );
  } catch (error) {
    next(error);
  }
};

const getMyEcomProfile = async (req, res, next) => {
  try {
    let profile = await EcommProfile.findOne({
      owner: req.user._id,
    });
    if (!profile) {
      throw new ApiError(404, 'Profile does not exist');
    }
    return res
      .status(200)
      .json(new ApiResponse(200, profile, 'User profile fetched successfully'));
  } catch (error) {
    next(error);
  }
};

const updateEcomProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phoneNumber, email } = req.body;
    const profile = await EcommProfile.findOneAndUpdate(
      {
        owner: req.user._id,
      },
      {
        $set: {
          firstName,
          lastName,
          phoneNumber,
          email,
        },
      },
      { new: true }
    );
    return res
      .status(200)
      .json(new ApiResponse(200, profile, 'User profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProfile,
  getMyEcomProfile,
  updateEcomProfile,
};
