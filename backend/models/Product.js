const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Furniture', 'Appliance']
  },
  subCategory: {
    type: String,
    required: [true, 'Sub-category is required'],
    enum: ['Bedroom', 'Living Room', 'Kitchen', 'Dining', 'Electronics', 'Kitchen Appliances', 'Office']
  },
  description: {
    type: String,
    default: ''
  },
  images: [{
    type: String
  }],
  monthlyRent3Month: {
    type: Number,
    required: [true, 'Monthly rent for 3 months is required'],
    min: 0
  },
  monthlyRent6Month: {
    type: Number,
    required: [true, 'Monthly rent for 6 months is required'],
    min: 0
  },
  monthlyRent12Month: {
    type: Number,
    required: [true, 'Monthly rent for 12 months is required'],
    min: 0
  },
  securityDeposit: {
    type: Number,
    required: [true, 'Security deposit is required'],
    min: 0
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 1
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isUnderMaintenance: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ name: 'text', description: 'text' });

// Virtual for rented quantity
productSchema.virtual('rentedQuantity').get(function() {
  return this.stockQuantity - (this.isAvailable ? this.stockQuantity : 0);
});

module.exports = mongoose.model('Product', productSchema);
