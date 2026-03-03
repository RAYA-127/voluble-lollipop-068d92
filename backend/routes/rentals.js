const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');

// @route   POST /api/rentals
// @desc    Create new rental order
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, deliveryAddress } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in rental' });
    }

    // Validate availability and calculate totals
    const rentalItems = [];
    let totalAmount = 0;
    let totalSecurityDeposit = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isAvailable || product.isUnderMaintenance) {
        return res.status(400).json({ 
          message: `Product ${product.name} is not available for rental` 
        });
      }

      // Get monthly rent based on tenure
      let monthlyRent;
      switch (item.tenure) {
        case 3:
          monthlyRent = product.monthlyRent3Month;
          break;
        case 6:
          monthlyRent = product.monthlyRent6Month;
          break;
        case 12:
          monthlyRent = product.monthlyRent12Month;
          break;
        default:
          monthlyRent = product.monthlyRent3Month;
      }

      const startDate = new Date(item.deliveryDate);
      const endDate = new Date(startDate);
      endDate.setMonth(endDate.getMonth() + item.tenure);

      rentalItems.push({
        product: product._id,
        tenure: item.tenure,
        monthlyRent,
        startDate,
        endDate,
        deliveryDate: startDate,
        status: 'Pending'
      });

      totalAmount += monthlyRent * item.tenure;
      totalSecurityDeposit += product.securityDeposit;
    }

    const rental = await Rental.create({
      user: req.user.id,
      items: rentalItems,
      totalAmount,
      securityDeposit: totalSecurityDeposit,
      deliveryAddress,
      status: 'Pending'
    });

    // Populate product details
    await rental.populate('items.product');

    res.status(201).json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rentals
// @desc    Get current user's rentals
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const rentals = await Rental.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rentals/:id
// @desc    Get single rental
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const rental = await Rental.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    }).populate('items.product');

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    res.json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rentals/admin
// @desc    Get all rentals (Admin)
// @access  Private (Admin only)
router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    const rentals = await Rental.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: rentals
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/rentals/:id/status
// @desc    Update rental status (Admin)
// @access  Private (Admin only)
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, itemId } = req.body;

    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ message: 'Rental not found' });
    }

    // If updating specific item status
    if (itemId) {
      const itemIndex = rental.items.findIndex(
        item => item._id.toString() === itemId
      );

      if (itemIndex === -1) {
        return res.status(404).json({ message: 'Item not found in rental' });
      }

      rental.items[itemIndex].status = status;

      // Check if all items have same status
      const allStatuses = rental.items.map(item => item.status);
      const uniqueStatuses = [...new Set(allStatuses)];
      
      if (uniqueStatuses.length === 1) {
        rental.status = status;
      }
    } else {
      // Update all items status
      rental.items.forEach(item => {
        item.status = status;
      });
      rental.status = status;
    }

    // If rental is delivered, update product availability
    if (status === 'Delivered' || status === 'Active') {
      for (const item of rental.items) {
        if (item.status === 'Delivered' || item.status === 'Active') {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stockQuantity: -1 }
          });
        }
      }
    }

    // If rental is returned, restore product availability
    if (status === 'Returned') {
      for (const item of rental.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stockQuantity: 1 }
        });
      }
    }

    await rental.save();

    res.json({
      success: true,
      data: rental
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/rentals/admin/analytics
// @desc    Get analytics data (Admin)
// @access  Private (Admin only)
router.get('/admin/analytics', protect, adminOnly, async (req, res, next) => {
  try {
    // Total products
    const totalProducts = await Product.countDocuments();

    // Products under maintenance
    const maintenanceCount = await Product.countDocuments({ isUnderMaintenance: true });

    // Active rentals count
    const activeRentals = await Rental.find({ 
      status: { $in: ['Active', 'Delivered', 'Confirmed'] }
    });

    // Calculate items rented
    let itemsRented = 0;
    activeRentals.forEach(rental => {
      rental.items.forEach(item => {
        if (['Active', 'Delivered', 'Confirmed'].includes(item.status)) {
          itemsRented++;
        }
      });
    });

    // Utilization Rate
    const utilizationRate = totalProducts > 0 
      ? ((itemsRented / totalProducts) * 100).toFixed(2) 
      : 0;

    // Expected Revenue (monthly)
    let expectedRevenue = 0;
    activeRentals.forEach(rental => {
      rental.items.forEach(item => {
        if (item.status === 'Active') {
          expectedRevenue += item.monthlyRent;
        }
      });
    });

    // Maintenance Load
    const maintenanceLoad = maintenanceCount;

    // Pending requests
    const pendingCount = await Rental.countDocuments({ status: 'Pending' });

    // Total Revenue
    const allRentals = await Rental.find({ 
      status: { $in: ['Active', 'Delivered', 'Returned'] }
    });
    
    let totalRevenue = 0;
    allRentals.forEach(rental => {
      totalRevenue += rental.totalAmount;
    });

    res.json({
      success: true,
      data: {
        utilizationRate: Number(utilizationRate),
        expectedRevenue,
        maintenanceLoad,
        pendingRequests: pendingCount,
        totalRevenue,
        totalProducts,
        itemsRented,
        activeRentalsCount: activeRentals.length
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
