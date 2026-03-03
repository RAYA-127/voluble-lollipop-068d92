import { useState, useEffect } from 'react'
import api from '../services/api'

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-purple-100 text-purple-800',
  Active: 'bg-green-100 text-green-800',
  Returned: 'bg-gray-100 text-gray-800',
  Cancelled: 'bg-red-100 text-red-800',
  Maintenance: 'bg-orange-100 text-orange-800'
}

export default function MyRentals() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedRental, setExpandedRental] = useState(null)

  useEffect(() => {
    const fetchRentals = async () => {
      try {
        const response = await api.get('/rentals')
        setRentals(response.data.data)
      } catch (error) {
        console.error('Error fetching rentals:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRentals()
  }, [])

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Rentals</h1>

        {rentals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500 text-lg mb-4">You haven't placed any rental orders yet</p>
            <a href="/products" className="btn btn-primary">Browse Products</a>
          </div>
        ) : (
          <div className="space-y-4">
            {rentals.map(rental => (
              <div key={rental._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Rental Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedRental(expandedRental === rental._id ? null : rental._id)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">Order #{rental._id.slice(-8)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[rental.status]}`}>
                          {rental.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        Placed on {formatDate(rental.createdAt)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">₹{rental.totalAmount}</p>
                      <p className="text-sm text-gray-500">
                        + ₹{rental.securityDeposit} deposit
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {rental.items.length} item{rental.items.length > 1 ? 's' : ''}
                    </span>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${expandedRental === rental._id ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedRental === rental._id && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50">
                    {/* Delivery Address */}
                    <div className="mb-6">
                      <h3 className="font-medium text-gray-900 mb-2">Delivery Address</h3>
                      <p className="text-gray-600 text-sm">
                        {rental.deliveryAddress.street}, {rental.deliveryAddress.city}, {rental.deliveryAddress.state} - {rental.deliveryAddress.pincode}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Items</h3>
                      {rental.items.map((item, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 flex gap-4">
                          <img
                            src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                            alt={item.product?.name}
                            className="w-20 h-20 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.tenure} months tenure
                            </p>
                            <div className="mt-2 flex gap-4 text-sm">
                              <span className="text-gray-600">
                                <span className="font-medium">₹{item.monthlyRent}</span>/month
                              </span>
                              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[item.status]}`}>
                                {item.status}
                              </span>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              Delivery: {formatDate(item.deliveryDate)} | Ends: {formatDate(item.endDate)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
