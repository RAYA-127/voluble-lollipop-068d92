import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTenure, setSelectedTenure] = useState(3)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await api.get(`/products/${id}`)
        setProduct(response.data.data)
      } catch (error) {
        console.error('Error fetching product:', error)
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  const handleAddToCart = () => {
    if (product && product.isAvailable && !product.isUnderMaintenance) {
      addToCart(product, selectedTenure)
      setAddedToCart(true)
      setTimeout(() => setAddedToCart(false), 2000)
    }
  }

  const getPrice = () => {
    if (!product) return 0
    switch (selectedTenure) {
      case 3: return product.monthlyRent3Month
      case 6: return product.monthlyRent6Month
      case 12: return product.monthlyRent12Month
      default: return product.monthlyRent3Month
    }
  }

  const getTotal = () => {
    return getPrice() * selectedTenure
  }

  const getSavings = () => {
    if (!product) return 0
    return (product.monthlyRent3Month * selectedTenure) - getTotal()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <span 
            className="cursor-pointer hover:text-primary-600" 
            onClick={() => navigate('/products')}
          >
            Products
          </span>
          <span className="mx-2">/</span>
          <span className="cursor-pointer hover:text-primary-600" onClick={() => navigate(`/products?category=${product.category}`)}>
            {product.category}
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-900">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div className="bg-white rounded-xl overflow-hidden">
            <img
              src={product.images[0] || 'https://via.placeholder.com/600x400'}
              alt={product.name}
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Details Section */}
          <div className="bg-white rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-sm font-medium rounded-full">
                {product.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full">
                {product.subCategory}
              </span>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Stock Status */}
            <div className="flex items-center mb-6">
              <span className={`w-3 h-3 rounded-full mr-2 ${
                product.isAvailable && !product.isUnderMaintenance 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}></span>
              <span className="text-gray-700">
                {product.isUnderMaintenance 
                  ? 'Under Maintenance' 
                  : product.isAvailable 
                    ? `In Stock (${product.stockQuantity} available)` 
                    : 'Out of Stock'}
              </span>
            </div>

            {/* Tenure Selection */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Select Tenure</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { tenure: 3, label: '3 Months', price: product.monthlyRent3Month, popular: false },
                  { tenure: 6, label: '6 Months', price: product.monthlyRent6Month, popular: true },
                  { tenure: 12, label: '12 Months', price: product.monthlyRent12Month, popular: false }
                ].map(option => (
                  <button
                    key={option.tenure}
                    onClick={() => setSelectedTenure(option.tenure)}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedTenure === option.tenure
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-900">{option.label}</div>
                    <div className="text-lg font-bold text-primary-600">₹{option.price}</div>
                    <div className="text-xs text-gray-500">/month</div>
                    {option.popular && (
                      <div className="mt-1 text-xs text-accent-500 font-medium">Best Value</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Savings Badge */}
            {getSavings() > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6">
                <p className="text-green-700 font-medium">
                  🎉 You save ₹{getSavings()} with {selectedTenure} months tenure!
                </p>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Monthly Rent</span>
                <span className="text-2xl font-bold text-gray-900">₹{getPrice()}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Duration</span>
                <span className="text-gray-900">{selectedTenure} months</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Security Deposit (Refundable)</span>
                <span className="text-gray-900">₹{product.securityDeposit}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-2xl font-bold text-gray-900">₹{getTotal()}</span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!product.isAvailable || product.isUnderMaintenance}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                addedToCart
                  ? 'bg-green-500 text-white'
                  : product.isAvailable && !product.isUnderMaintenance
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {addedToCart ? '✓ Added to Cart!' : !product.isAvailable ? 'Out of Stock' : product.isUnderMaintenance ? 'Under Maintenance' : 'Add to Cart'}
            </button>

            {/* Features */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free Delivery
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Free Installation
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Damage Protection
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Easy Returns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
