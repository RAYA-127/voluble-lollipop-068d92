import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
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

const statusFlow = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Delivered', 'Cancelled'],
  Delivered: ['Active', 'Maintenance', 'Cancelled'],
  Active: ['Returned', 'Maintenance'],
  Maintenance: ['Active'],
  Returned: [],
  Cancelled: []
}

export default function AdminRentals() {
  const [rentals, setRentals] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedRental, setExpandedRental] = useState(null)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchRentals()
  }, [])

  const fetchRentals = async () => {
    setLoading(true)
    try {
      const response = await api.get('/rentals/admin/all')
      setRentals(response.data.data)
    } catch (error) {
      console.error('Error fetching rentals:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (rentalId, newStatus, itemId = null) => {
    try {
      await api.put(`/rentals/${rentalId}/status`, {
        status: newStatus,
        itemId
      })
      fetchRentals()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update status')
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const filteredRentals = filter === 'all' 
    ? rentals 
    : rentals.filter(r => r.status === filter)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rental Management</h1>
            <p className="text-gray-500 mt-1">Track and manage all rentals</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex gap-4 mb-6">
          <Link to="/admin" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100">
            Dashboard
          </Link>
          <Link to="/admin/products" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100">
            Products
          </Link>
          <Link to="/admin/rentals" className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">
            Rentals
          </Link>
        </nav>

        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'Pending', 'Confirmed', 'Delivered', 'Active', 'Returned', 'Cancelled'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                filter === status
                  ? 'bg-primary-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {status === 'all' ? 'All' : status}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : filteredRentals.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl">
            <p className="text-gray-500">No rentals found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRentals.map(rental => (
              <div key={rental._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                {/* Rental Header */}
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedRental(expandedRental === rental._id ? null : rental._id)}
                >
                  <div className="flex justify-between items-start flex-wrap gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm text-gray-500">Order #{rental._id.slice(-8)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[rental.status]}`}>
                          {rental.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <span>Customer: {rental.user?.name}</span>
                        <span className="text-gray-300">|</span>
                        <span>{rental.user?.email}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
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

                  {/* Quick Actions */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {statusFlow[rental.status]?.map(nextStatus => (
                      <button
                        key={nextStatus}
                        onClick={(e) => {
                          e.stopPropagation()
                          updateStatus(rental._id, nextStatus)
                        }}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          nextStatus === 'Cancelled'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        Mark as {nextStatus}
                      </button>
                    ))}
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
                        <div key={index} className="bg-white rounded-lg p-4 flex flex-col md:flex-row gap-4">
                          <img
                            src={item.product?.images?.[0] || 'https://via.placeholder.com/80'}
                            alt={item.product?.name}
                            className="w-20 h-20 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                            <p className="text-sm text-gray-500">
                              {item.tenure} months tenure @ ₹{item.monthlyRent}/month
                            </p>
                            <div className="mt-2 flex flex-wrap items-center gap-3">
                              <span className={`px-2 py-0.5 rounded text-xs ${statusColors[item.status]}`}>
                                {item.status}
                              </span>
                              <span className="text-sm text-gray-500">
                                Delivery: {formatDate(item.deliveryDate)}
                              </span>
                              <span className="text-sm text-gray-500">
                                End: {formatDate(item.endDate)}
                              </span>
                            </div>
                            
                            {/* Item-level status update */}
                            {statusFlow[item.status]?.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {statusFlow[item.status].map(nextStatus => (
                                  <button
                                    key={nextStatus}
                                    onClick={() => updateStatus(rental._id, nextStatus, item._id)}
                                    className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  >
                                    → {nextStatus}
                                  </button>
                                ))}
                              </div>
                            )}
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
