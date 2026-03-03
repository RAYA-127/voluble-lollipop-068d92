require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Product = require('./models/Product');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/rentease';

const products = [
  // Furniture - Bedroom
  {
    name: 'Queen Size Bed with Storage',
    category: 'Furniture',
    subCategory: 'Bedroom',
    description: 'Spacious queen size bed with under-storage drawers. Perfect for modern bedrooms.',
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'],
    monthlyRent3Month: 899,
    monthlyRent6Month: 809,
    monthlyRent12Month: 719,
    securityDeposit: 5000,
    stockQuantity: 5,
    isAvailable: true
  },
  {
    name: 'Wooden Wardrobe',
    category: 'Furniture',
    subCategory: 'Bedroom',
    description: '3-door wooden wardrobe with mirror. Ample storage space for clothes.',
    images: ['https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800'],
    monthlyRent3Month: 649,
    monthlyRent6Month: 584,
    monthlyRent12Month: 519,
    securityDeposit: 4000,
    stockQuantity: 4,
    isAvailable: true
  },
  {
    name: 'Nightstand Set (2)',
    category: 'Furniture',
    subCategory: 'Bedroom',
    description: 'Pair of modern nightstands with drawers. Compact and stylish.',
    images: ['https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=800'],
    monthlyRent3Month: 249,
    monthlyRent6Month: 224,
    monthlyRent12Month: 199,
    securityDeposit: 1500,
    stockQuantity: 8,
    isAvailable: true
  },
  // Furniture - Living Room
  {
    name: '3-Seater Sofa',
    category: 'Furniture',
    subCategory: 'Living Room',
    description: 'Comfortable 3-seater sofa with premium fabric. Perfect for family gatherings.',
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'],
    monthlyRent3Month: 1199,
    monthlyRent6Month: 1079,
    monthlyRent12Month: 959,
    securityDeposit: 7000,
    stockQuantity: 3,
    isAvailable: true
  },
  {
    name: 'Coffee Table',
    category: 'Furniture',
    subCategory: 'Living Room',
    description: 'Modern glass-top coffee table with wooden legs. Elegant and functional.',
    images: ['https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=800'],
    monthlyRent3Month: 349,
    monthlyRent6Month: 314,
    monthlyRent12Month: 279,
    securityDeposit: 2000,
    stockQuantity: 6,
    isAvailable: true
  },
  {
    name: 'TV Unit',
    category: 'Furniture',
    subCategory: 'Living Room',
    description: 'Modern TV unit with storage compartments. Fits up to 55-inch TVs.',
    images: ['https://images.unsplash.com/photo-1615874959474-d609969a20ed?w=800'],
    monthlyRent3Month: 549,
    monthlyRent6Month: 494,
    monthlyRent12Month: 439,
    securityDeposit: 3500,
    stockQuantity: 4,
    isAvailable: true
  },
  {
    name: 'Dining Table Set (4 Seater)',
    category: 'Furniture',
    subCategory: 'Dining',
    description: '4-seater dining table with chairs. Perfect for small families.',
    images: ['https://images.unsplash.com/photo-1617806118233-18e1de247200?w=800'],
    monthlyRent3Month: 899,
    monthlyRent6Month: 809,
    monthlyRent12Month: 719,
    securityDeposit: 5000,
    stockQuantity: 3,
    isAvailable: true
  },
  {
    name: 'Office Desk',
    category: 'Furniture',
    subCategory: 'Office',
    description: 'Ergonomic office desk with cable management. Perfect for work-from-home.',
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800'],
    monthlyRent3Month: 499,
    monthlyRent6Month: 449,
    monthlyRent12Month: 399,
    securityDeposit: 3000,
    stockQuantity: 5,
    isAvailable: true
  },
  // Appliances - Electronics
  {
    name: '55-inch Smart TV',
    category: 'Appliance',
    subCategory: 'Electronics',
    description: '4K Ultra HD Smart TV with streaming apps. Perfect entertainment experience.',
    images: ['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800'],
    monthlyRent3Month: 1499,
    monthlyRent6Month: 1349,
    monthlyRent12Month: 1199,
    securityDeposit: 10000,
    stockQuantity: 2,
    isAvailable: true
  },
  {
    name: 'Air Conditioner (1.5 Ton)',
    category: 'Appliance',
    subCategory: 'Electronics',
    description: 'Split AC with inverter technology. Fast cooling and energy efficient.',
    images: ['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'],
    monthlyRent3Month: 1999,
    monthlyRent6Month: 1799,
    monthlyRent12Month: 1599,
    securityDeposit: 12000,
    stockQuantity: 2,
    isAvailable: true
  },
  // Appliances - Kitchen
  {
    name: 'Refrigerator (Double Door)',
    category: 'Appliance',
    subCategory: 'Kitchen Appliances',
    description: '256L double door refrigerator with frost-free technology.',
    images: ['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800'],
    monthlyRent3Month: 1299,
    monthlyRent6Month: 1169,
    monthlyRent12Month: 1039,
    securityDeposit: 8000,
    stockQuantity: 3,
    isAvailable: true
  },
  {
    name: 'Washing Machine (7 kg)',
    category: 'Appliance',
    subCategory: 'Kitchen Appliances',
    description: 'Fully automatic front-load washing machine. 7kg capacity.',
    images: ['https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800'],
    monthlyRent3Month: 1099,
    monthlyRent6Month: 989,
    monthlyRent12Month: 879,
    securityDeposit: 7000,
    stockQuantity: 3,
    isAvailable: true
  },
  {
    name: 'Microwave Oven',
    category: 'Appliance',
    subCategory: 'Kitchen Appliances',
    description: '20L solo microwave oven. Perfect for quick heating and cooking.',
    images: ['https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800'],
    monthlyRent3Month: 399,
    monthlyRent6Month: 359,
    monthlyRent12Month: 319,
    securityDeposit: 2500,
    stockQuantity: 5,
    isAvailable: true
  },
  {
    name: 'Dishwasher',
    category: 'Appliance',
    subCategory: 'Kitchen Appliances',
    description: '12-place setting dishwasher. Save time on cleaning.',
    images: ['https://images.unsplash.com/photo-1581622558663-b2e33377dfb2?w=800'],
    monthlyRent3Month: 899,
    monthlyRent6Month: 809,
    monthlyRent12Month: 719,
    securityDeposit: 6000,
    stockQuantity: 2,
    isAvailable: true
  },
  {
    name: 'Gaming Console',
    category: 'Appliance',
    subCategory: 'Electronics',
    description: 'Next-gen gaming console with controller. Ultimate gaming experience.',
    images: ['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'],
    monthlyRent3Month: 799,
    monthlyRent6Month: 719,
    monthlyRent12Month: 639,
    securityDeposit: 5000,
    stockQuantity: 3,
    isAvailable: true
  }
];

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    console.log('🗑️ Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@rentease.com',
      password: adminPassword,
      phone: '9999999999',
      role: 'admin',
      address: {
        street: '123 Admin Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001'
      }
    });
    console.log('👤 Admin user created: admin@rentease.com / admin123');

    // Create sample products
    await Product.insertMany(products);
    console.log(`📦 Created ${products.length} products`);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
