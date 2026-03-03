# RentEase - Furniture & Appliance Rental Platform

## 1. Project Overview

- **Project Name**: RentEase
- **Type**: Fullstack E-commerce Web Application (MERN Stack)
- **Core Functionality**: A rental platform for furniture and appliances with tenure-based pricing, inventory management, and admin dashboard
- **Target Users**: Customers seeking affordable furniture/appliance rentals, and administrators managing inventory

---

## 2. Technical Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + Bcrypt
- **Image Storage**: Base64 (for simplicity)

### Frontend

- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Forms**: React Hook Form

---

## 3. Database Schema

### User Model

```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  phone: String,
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date
}
```

### Product Model

```javascript
{
  name: String (required),
  category: String (enum: ['Furniture', 'Appliance']),
  subCategory: String (enum: ['Bedroom', 'Living Room', 'Kitchen', 'Dining', 'Electronics', 'Kitchen Appliances']),
  description: String,
  images: [String],
  monthlyRent3Month: Number,
  monthlyRent6Month: Number,
  monthlyRent12Month: Number,
  securityDeposit: Number,
  stockQuantity: Number,
  isAvailable: Boolean,
  isUnderMaintenance: Boolean,
  createdAt: Date
}
```

### Rental Model

```javascript
{
  user: ObjectId (ref: User),
  items: [{
    product: ObjectId (ref: Product),
    tenure: Number (3, 6, or 12 months),
    monthlyRent: Number,
    startDate: Date,
    endDate: Date,
    deliveryDate: Date,
    status: String (enum: ['Pending', 'Confirmed', 'Delivered', 'Active', 'Returned', 'Maintenance', 'Cancelled'])
  }],
  totalAmount: Number,
  status: String (enum: ['Pending', 'Confirmed', 'Delivered', 'Active', 'Returned', 'Cancelled']),
  deliveryAddress: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  createdAt: Date
}
```

---

## 4. API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products (with filters)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Rentals

- `POST /api/rentals` - Create rental order
- `GET /api/rentals` - Get user's rentals
- `GET /api/rentals/admin` - Get all rentals (Admin)
- `PUT /api/rentals/:id/status` - Update rental status (Admin)

---

## 5. UI/UX Specification

### Color Palette

- **Primary**: `#2563EB` (Blue-600)
- **Primary Dark**: `#1D4ED8` (Blue-700)
- **Secondary**: `#10B981` (Emerald-500)
- **Accent**: `#F59E0B` (Amber-500)
- **Background**: `#F9FAFB` (Gray-50)
- **Surface**: `#FFFFFF` (White)
- **Text Primary**: `#111827` (Gray-900)
- **Text Secondary**: `#6B7280` (Gray-500)
- **Error**: `#EF4444` (Red-500)
- **Success**: `#10B981` (Emerald-500)

### Typography

- **Font Family**: Inter (Google Fonts)
- **Headings**: Bold, sizes 2rem-1.25rem
- **Body**: Regular, size 1rem
- **Small**: Regular, size 0.875rem

### Responsive Breakpoints

- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 6. Pages & Components

### Public Pages

1. **Home Page** - Hero banner, featured products, categories
2. **Products Page** - Grid with filters (category, price), search
3. **Product Detail Page** - Images, tenure pricing selector, add to cart

### User Pages

4. **Login/Register** - Authentication forms
5. **Cart** - Items with tenure selection, total calculation
6. **Checkout** - Delivery date picker, address confirmation
7. **My Rentals** - Order history and status

### Admin Pages

8. **Admin Dashboard** - Stats overview (Utilization Rate, Revenue, Maintenance Load)
9. **Product Management** - CRUD interface for products
10. **Rental Management** - Status tracking and updates

---

## 7. Key Features

### Tenure Pricing Logic

- 3 months: Base price
- 6 months: 10% discount
- 12 months: 20% discount

### Cart Functionality

- Stores product + selected tenure
- Persists across sessions
- Updates total based on tenure

### Availability Check

- Backend verifies stock before checkout
- Prevents over-rental

### Analytics (Admin KPIs)

- Utilization Rate: (Items Rented / Total Items) × 100
- Expected Revenue: Sum of all active monthly rentals
- Maintenance Load: Count of items under maintenance

---

## 8. Acceptance Criteria

1. ✓ Users can browse products with category and price filters
2. ✓ Users can view tenure-based pricing on product details
3. ✓ Users can add items to cart with selected tenure
4. ✓ Users can checkout with delivery date selection
5. ✓ Users can view their rental history
6. ✓ Admins can manage (CRUD) products
7. ✓ Admins can track and update rental statuses
8. ✓ Admin dashboard shows analytics (Utilization, Revenue, Maintenance)
9. ✓ Responsive design works on mobile, tablet, and desktop
10. ✓ JWT authentication secures user and admin routes
