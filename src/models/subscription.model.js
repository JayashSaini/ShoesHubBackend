const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const subscriptionSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
  },
  {
    timestamps: true,
  }
);

subscriptionSchema.plugin(mongooseAggregatePaginate);

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = { Subscription };
