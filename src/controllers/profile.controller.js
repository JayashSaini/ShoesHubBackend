const { EcommProfile } = require('../models/profile.model.js');
const { ApiResponse } = require('../utils/apiResponse.js');

const getMyEcomProfile = async (req, res, next) => {
  try {
    let profile = await EcommProfile.findOne({
      owner: req.user._id,
    });
    if (!profile) {
      profile = await EcommProfile.create({
        email: 'john@gmail.com',
        phoneNumber: '9192100000',
        firstName: 'John',
        lastName: 'Deo',
        owner: req.user._id,
      });
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

    // Check if a profile exists for the current user
    let profile = await EcommProfile.findOne({ owner: req.user._id });

    if (!profile) {
      // If no profile exists, create a new one
      profile = await EcommProfile.create({
        owner: req.user._id,
        firstName,
        lastName,
        phoneNumber,
        email,
      });
    } else {
      // If a profile exists, update it
      profile = await EcommProfile.findOneAndUpdate(
        { owner: req.user._id },
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
    }

    // Send response
    return res
      .status(200)
      .json(new ApiResponse(200, profile, 'User profile updated successfully'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyEcomProfile,
  updateEcomProfile,
};
