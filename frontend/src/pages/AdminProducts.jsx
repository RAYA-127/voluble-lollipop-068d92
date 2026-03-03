import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Furniture',
    subCategory: 'Bedroom',
    description: '',
    monthlyRent3Month: '',
    monthlyRent6Month: '',
    monthlyRent12Month: '',
    securityDeposit: '',
    stockQuantity: '',
    images: ['']
  })

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const response = await api.get('/products/admin/all')
      setProducts(response.data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const productData = {
        ...formData,
        monthlyRent3Month: Number(formData.monthlyRent3Month),
        monthlyRent6Month: Number(formData.monthlyRent6Month),
        monthlyRent12Month: Number(formData.monthlyRent12Month),
        securityDeposit: Number(formData.securityDeposit),
        stockQuantity: Number(formData.stockQuantity),
        images: formData.images.filter(img => img)
      }

      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, productData)
      } else {
        await api.post('/products', productData)
      }

      fetchProducts()
      closeModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to save product')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return
    try {
      await api.delete(`/products/${id}`)
      fetchProducts()
    } catch (error) {
      alert('Failed to delete product')
    }
  }

  const openEditModal = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      category: product.category,
      subCategory: product.subCategory,
      description: product.description,
      monthlyRent3Month: product.monthlyRent3Month,
      monthlyRent6Month: product.monthlyRent6Month,
      monthlyRent12Month: product.monthlyRent12Month,
      securityDeposit: product.securityDeposit,
      stockQuantity: product.stockQuantity,
      images: product.images
    })
    setShowModal(true)
  }

  const openAddModal = () => {
    setEditingProduct(null)
    setFormData({
      name: '',
      category: 'Furniture',
      subCategory: 'Bedroom',
      description: '',
      monthlyRent3Month: '',
      monthlyRent6Month: '',
      monthlyRent12Month: '',
      securityDeposit: '',
      stockQuantity: '',
      images: ['']
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
            <p className="text-gray-500 mt-1">Add, edit, and manage products</p>
          </div>
          <button
            onClick={openAddModal}
            className="btn btn-primary"
          >
            + Add Product
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex gap-4 mb-6">
          <Link to="/admin" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100">
            Dashboard
          </Link>
          <Link to="/admin/products" className="px-4 py-2 bg-primary-100 text-primary-700 rounded-lg font-medium">
            Products
          </Link>
          <Link to="/admin/rentals" className="px-4 py-2 bg-white text-gray-700 rounded-lg font-medium hover:bg-gray-100">
            Rentals
          </Link>
        </nav>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rent (3 Mo)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map(product => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.images[0] || 'https://via.placeholder.com/50'}
                          alt={product.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.subCategory}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{product.category}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium">₹{product.monthlyRent3Month}</td>
                    <td className="px-6 py-4 text-gray-600">{product.stockQuantity}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        product.isUnderMaintenance 
                          ? 'bg-orange-100 text-orange-800'
                          : product.isAvailable 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                      }`}>
                        {product.isUnderMaintenance ? 'Maintenance' : product.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(product)}
                        className="text-primary-600 hover:text-primary-700 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product._id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value, subCategory: e.target.value === 'Furniture' ? 'Bedroom' : 'Electronics' })}
                      className="input"
                    >
                      <option value="Furniture">Furniture</option>
                      <option value="Appliance">Appliance</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sub-Category</label>
                    <select
                      value={formData.subCategory}
                      onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                      className="input"
                    >
                      {formData.category === 'Furniture' ? (
                        <>
                          <option value="Bedroom">Bedroom</option>
                          <option value="Living Room">Living Room</option>
                          <option value="Dining">Dining</option>
                          <option value="Office">Office</option>
                        </>
                      ) : (
                        <>
                          <option value="Electronics">Electronics</option>
                          <option value="Kitchen Appliances">Kitchen Appliances</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent (3 Mo)</label>
                    <input
                      type="number"
                      required
                      value={formData.monthlyRent3Month}
                      onChange={(e) => setFormData({ ...formData, monthlyRent3Month: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent (6 Mo)</label>
                    <input
                      type="number"
                      required
                      value={formData.monthlyRent6Month}
                      onChange={(e) => setFormData({ ...formData, monthlyRent6Month: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rent (12 Mo)</label>
                    <input
                      type="number"
                      required
                      value={formData.monthlyRent12Month}
                      onChange={(e) => setFormData({ ...formData, monthlyRent12Month: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit</label>
                    <input
                      type="number"
                      required
                      value={formData.securityDeposit}
                      onChange={(e) => setFormData({ ...formData, securityDeposit: e.target.value })}
                      className="input"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                    <input
                      type="number"
                      required
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.images[0]}
                    onChange={(e) => setFormData({ ...formData, images: [e.target.value] })}
                    className="input"
                    placeholder="https://..."
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editingProduct ? 'Update Product' : 'Add Product'}
                  </button>
                  <button type="button" onClick={closeModal} className="btn btn-secondary flex-1">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
