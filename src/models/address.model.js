const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      required: true,
      type: String,
    },
    addressLine2: {
      type: String,
    },
    city: {
      required: true,
      type: String,
    },
    state: {
      required: true,
      type: String,
    },
    owner: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
    },
    pincode: {
      required: true,
      type: String,
    },
    phoneNumber: {
      required: true,
      type: Number,
    },
  },
  { timestamps: true }
);

addressSchema.plugin(mongooseAggregatePaginate);

const Address = mongoose.model('Address', addressSchema);
module.exports = { Address };
