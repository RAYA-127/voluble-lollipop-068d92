import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'

export default function Cart() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cart, removeFromCart, updateTenure, getCartTotal, getSecurityDepositTotal } = useCart()
  const [products, setProducts] = useState({})

  useEffect(() => {
    const fetchProducts = async () => {
      const productIds = [...new Set(cart.map(item => item.productId))]
      const productMap = {}
      
      for (const id of productIds) {
        try {
          const response = await api.get(`/products/${id}`)
          productMap[id] = response.data.data
        } catch (error) {
          console.error('Error fetching product:', error)
        }
      }
      setProducts(productMap)
    }

    if (cart.length > 0) {
      fetchProducts()
    }
  }, [cart])

  const handleTenureChange = (productId, newTenure) => {
    const product = products[productId]
    if (product) {
      updateTenure(productId, newTenure, product)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Cart is Empty</h2>
          <p className="text-gray-600 mb-8">Browse our products and add items to your cart</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div key={`${item.productId}-${item.tenure}`} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 flex-shrink-0 bg-gray-200 rounded-lg overflow-hidden">
                    <img
                      src={item.image || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          ₹{item.monthlyRent}/month × {item.tenure} months
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.productId, item.tenure)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Tenure Selection */}
                    <div className="mt-4">
                      <label className="text-sm text-gray-600">Tenure:</label>
                      <div className="flex gap-2 mt-1">
                        {[3, 6, 12].map(tenure => (
                          <button
                            key={tenure}
                            onClick={() => handleTenureChange(item.productId, tenure)}
                            className={`px-3 py-1 text-sm rounded ${
                              item.tenure === tenure
                                ? 'bg-primary-100 text-primary-700 font-medium'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {tenure} Mo
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mt-4 flex justify-between items-center">
                      <div>
                        <span className="text-lg font-bold text-gray-900">₹{item.total}</span>
                        <span className="text-sm text-gray-500"> total</span>
                      </div>
                      <div className="text-sm text-gray-500">
                        + ₹{item.securityDeposit} deposit
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cart.length} items)</span>
                  <span>₹{getCartTotal()}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Security Deposit (Refundable)</span>
                  <span>₹{getSecurityDepositTotal()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-gray-900">Total</span>
                  <span className="font-bold text-xl text-gray-900">
                    ₹{getCartTotal() + getSecurityDepositTotal()}
                  </span>
                </div>
              </div>

              {user ? (
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full btn btn-primary py-3"
                >
                  Proceed to Checkout
                </button>
              ) : (
                <div>
                  <Link
                    to="/login"
                    className="w-full btn btn-primary py-3 block text-center"
                  >
                    Login to Checkout
                  </Link>
                  <p className="text-sm text-gray-500 text-center mt-2">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-primary-600">Sign up</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
