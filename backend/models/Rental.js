const mongoose = require('mongoose');

const rentalItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  tenure: {
    type: Number,
    required: true,
    enum: [3, 6, 12]
  },
  monthlyRent: {
    type: Number,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  deliveryDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Active', 'Returned', 'Maintenance', 'Cancelled'],
    default: 'Pending'
  }
}, { _id: true });

const rentalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [rentalItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    default: 0
  },
  securityDeposit: {
    type: Number,
    required: true,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Delivered', 'Active', 'Returned', 'Cancelled'],
    default: 'Pending'
  },
  deliveryAddress: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Rental', rentalSchema);
