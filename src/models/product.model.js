const mongoose = require('mongoose');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const productSchema = new mongoose.Schema(
  {
    category: {
      ref: 'Category',
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    description: {
      required: true,
      type: String,
    },
    mainImage: {
      required: true,
      type: {
        url: String,
        public_id: String,
      },
    },
    color: {
      type: String,
      required: true,
    },
    size: {
      type: [Number], // define a Array of numbers
      required: true,
    },
    name: {
      required: true,
      type: String,
    },
    owner: {
      ref: 'User',
      type: mongoose.Schema.Types.ObjectId,
    },
    price: {
      default: 0,
      type: Number,
    },
    stock: {
      default: 0,
      type: Number,
    },
    subImages: {
      type: [
        {
          url: String,
          public_id: String,
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

productSchema.plugin(mongooseAggregatePaginate);

const Product = mongoose.model('Product', productSchema);
module.exports = { Product };
