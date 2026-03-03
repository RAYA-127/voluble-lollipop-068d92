import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/rentals/admin/analytics')
        setAnalytics(response.data.data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <nav className="flex gap-4">
            <Link to="/admin" className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">
              Dashboard
            </Link>
            <Link to="/admin/products" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100">
              Products
            </Link>
            <Link to="/admin/rentals" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100">
              Rentals
            </Link>
          </nav>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">Utilization Rate</span>
              <span className="p-2 bg-primary-100 rounded-lg">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics?.utilizationRate || 0}%</p>
            <p className="text-sm text-gray-500 mt-1">
              {analytics?.itemsRented || 0} of {analytics?.totalProducts || 0} items rented
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">Expected Revenue</span>
              <span className="p-2 bg-green-100 rounded-lg">💰</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">₹{analytics?.expectedRevenue || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Monthly recurring</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">Maintenance Load</span>
              <span className="p-2 bg-orange-100 rounded-lg">🔧</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics?.maintenanceLoad || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Items under maintenance</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-500 text-sm">Pending Requests</span>
              <span className="p-2 bg-yellow-100 rounded-lg">⏳</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analytics?.pendingRequests || 0}</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting confirmation</p>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Total Products</span>
                <span className="font-semibold text-gray-900">{analytics?.totalProducts || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Active Rentals</span>
                <span className="font-semibold text-gray-900">{analytics?.activeRentalsCount || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600">Items Currently Rented</span>
                <span className="font-semibold text-gray-900">{analytics?.itemsRented || 0}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Total Revenue (All Time)</span>
                <span className="font-semibold text-gray-900">₹{analytics?.totalRevenue || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                to="/admin/products"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">Manage Products</p>
                <p className="text-sm text-gray-500">Add, edit, or remove products</p>
              </Link>
              <Link
                to="/admin/rentals"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">Manage Rentals</p>
                <p className="text-sm text-gray-500">Track and update rental status</p>
              </Link>
              <a
                href="/products"
                target="_blank"
                className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <p className="font-medium text-gray-900">View Store</p>
                <p className="text-sm text-gray-500">Open the customer-facing store</p>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
