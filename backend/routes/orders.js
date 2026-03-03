const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Nodemailer transporter configuration
// For production, use environment variables for credentials
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  
  // Check if email is configured
  if (!emailUser || !emailPass) {
    console.warn('⚠️ Email not configured - order notifications will be disabled');
    return null;
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });
};

// Send order notification email to admin
const sendOrderNotification = async (order, user) => {
  try {
    const transporter = createTransporter();
    
    // Skip if email not configured
    if (!transporter) {
      console.log('ℹ️ Email notifications disabled - skipping');
      return false;
    }
    
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@rentease.com';
    
    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ${item.product?.name || 'Product'}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ${item.tenure} months
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ₹${item.monthlyRent}/month
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ₹${item.securityDeposit}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          ₹${item.total}
        </td>
      </tr>
    `).join('');

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #4F46E5; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #4F46E5; color: white; padding: 10px; text-align: left; }
          .footer { padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .total-row { font-weight: bold; background-color: #eee; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 NEW ORDER RECEIVED</h1>
          </div>
          <div class="content">
            <h2>Order Details</h2>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleString()}</p>
            
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${user.name}</p>
            <p><strong>Email:</strong> ${user.email}</p>
            <p><strong>Phone:</strong> ${user.phone || 'Not provided'}</p>
            
            <h3>Shipping Address</h3>
            <p>
              ${order.shippingAddress.street}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state}<br>
              Pincode: ${order.shippingAddress.pincode}
            </p>
            
            <h3>Payment Method</h3>
            <p><strong>💰 Cash on Delivery</strong></p>
            
            <h3>Order Items</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Tenure</th>
                  <th>Monthly Rent</th>
                  <th>Security Deposit</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="padding: 10px;">Total Security Deposit</td>
                  <td colspan="2" style="padding: 10px;">₹${order.totalSecurityDeposit}</td>
                </tr>
                <tr class="total-row">
                  <td colspan="3" style="padding: 10px;">Total Monthly Rent</td>
                  <td colspan="2" style="padding: 10px;">₹${order.totalMonthlyRent}</td>
                </tr>
              </tbody>
            </table>
            
            <h3>Delivery Date</h3>
            <p>${new Date(order.deliveryDate).toLocaleDateString()}</p>
          </div>
          <div class="footer">
            <p>RentEase - Furniture & Appliance Rental Platform</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: adminEmail,
      subject: `🚨 NEW ORDER RECEIVED - Order #${order._id.toString().slice(-6)}`,
      html: htmlBody
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Order notification email sent to admin');
    return true;
  } catch (error) {
    console.error('❌ Email notification error:', error.message);
    // Don't fail the order if email fails
    return false;
  }
};

// @route   POST /api/orders
// @desc    Create new order with COD
// @access  Private
router.post('/', protect, async (req, res, next) => {
  try {
    const { items, deliveryAddress, deliveryDate } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    if (!deliveryAddress || !deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.pincode) {
      return res.status(400).json({ message: 'Delivery address is required' });
    }

    if (!deliveryDate) {
      return res.status(400).json({ message: 'Delivery date is required' });
    }

    // Validate availability and calculate totals
    const orderItems = [];
    let totalSecurityDeposit = 0;
    let totalMonthlyRent = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }

      if (!product.isAvailable || product.isUnderMaintenance) {
        return res.status(400).json({ 
          message: `Product ${product.name} is not available` 
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

      const itemTotal = monthlyRent * item.tenure;

      orderItems.push({
        product: product._id,
        tenure: item.tenure,
        monthlyRent,
        securityDeposit: product.securityDeposit,
        total: itemTotal
      });

      totalSecurityDeposit += product.securityDeposit;
      totalMonthlyRent += itemTotal;
    }

    // Create order with COD only
    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      shippingAddress: {
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state || '',
        pincode: deliveryAddress.pincode
      },
      paymentMethod: 'Cash on Delivery',
      totalSecurityDeposit,
      totalMonthlyRent,
      deliveryDate: new Date(deliveryDate),
      status: 'Pending'
    });

    // Populate product details
    await order.populate('items.product');
    
    // Get user details for email
    const user = await User.findById(req.user.id);

    // Send email notification to admin
    await sendOrderNotification(order, user);

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders
// @desc    Get current user's orders
// @access  Private
router.get('/', protect, async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get('/:id', protect, async (req, res, next) => {
  try {
    const order = await Order.findOne({ 
      _id: req.params.id,
      user: req.user.id 
    }).populate('items.product');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/orders/admin/all
// @desc    Get all orders (Admin)
// @access  Private (Admin only)
router.get('/admin/all', protect, adminOnly, async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email phone')
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/orders/:id/status
// @desc    Update order status (Admin)
// @access  Private (Admin only)
router.put('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
