import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Package, Search, CheckCircle, XCircle, Trash2, Award, FileText, Download, AlertCircle } from 'lucide-react'

export default function ProductManagement() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [pendingAGMARK, setPendingAGMARK] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [categories, setCategories] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [showAGMARKModal, setShowAGMARKModal] = useState(false)
  const [agmarkGrade, setAgmarkGrade] = useState('')
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'all') // 'all' or 'agmark'
  const [showVerificationModal, setShowVerificationModal] = useState(false)
  const [verificationAction, setVerificationAction] = useState('') // 'verify' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    if (activeTab === 'agmark') {
      fetchPendingAGMARK()
    }
  }, [currentPage, statusFilter, categoryFilter, searchTerm, activeTab])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      })
      
      if (statusFilter) params.append('status', statusFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products?${params}`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Fetched products:', data)
        setProducts(data.products || [])
        setTotalPages(data.totalPages || 1)
      } else {
        console.error('Failed to fetch products:', response.status)
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/products/categories`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchPendingAGMARK = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/agmark/pending`, {
        method: 'GET',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setPendingAGMARK(data.products || [])
      }
    } catch (error) {
      console.error('Failed to fetch pending AGMARK verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAGMARKVerification = async (productId, action, reason = '') => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}/agmark`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          rejectionReason: action === 'reject' ? reason : undefined
        })
      })

      if (response.ok) {
        fetchPendingAGMARK()
        setShowVerificationModal(false)
        setSelectedProduct(null)
        setRejectionReason('')
        alert(`AGMARK certificate ${action === 'verify' ? 'verified' : 'rejected'} successfully!`)
      } else {
        const data = await response.json()
        alert(`Failed to ${action} AGMARK certificate: ${data.message}`)
      }
    } catch (error) {
      console.error(`Failed to ${action} AGMARK certificate:`, error)
      alert(`Failed to ${action} AGMARK certificate`)
    }
  }

  const handleStatusChange = async (productId, newStatus) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to update product status:', error)
    }
  }

  const handleAGMARKUpdate = async () => {
    if (!selectedProduct || !agmarkGrade) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${selectedProduct._id}/agmark`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isAGMARKCertified: true,
          agmarkGrade
        })
      })

      if (response.ok) {
        fetchProducts()
        setShowAGMARKModal(false)
        setAgmarkGrade('')
      }
    } catch (error) {
      console.error('Failed to update AGMARK:', error)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        fetchProducts()
      }
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading && products.length === 0) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground mt-1">Manage and verify all platform products</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'all'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          All Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('agmark')}
          className={`px-4 py-2 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'agmark'
              ? 'border-b-2 border-primary text-primary'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Award className="w-4 h-4" />
          Pending AGMARK Verifications ({pendingAGMARK.length})
        </button>
      </div>

      {/* All Products Tab */}
      {activeTab === 'all' && (
        <>
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="rejected">Rejected</option>
                </select>

                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-4 py-2 border rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>

                <Button onClick={fetchProducts} variant="outline">
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">Product</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Seller</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Price</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Stock</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">AGMARK</th>
                      <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {products.map((product) => (
                      <tr key={product._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {product.images?.[0] && (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="w-12 h-12 rounded object-cover"
                              />
                            )}
                            <div>
                              <div className="font-medium">{product.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {product.description?.substring(0, 50)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {product.sellerId?.email || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {product.categoryId?.name || product.category?.name || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">
                          ₹{product.price}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {product.stock || 0} {product.unit}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(product.status)}`}>
                            {product.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {product.agmarkCertified ? (
                            <div className="flex items-center gap-1 text-green-600">
                              <Award className="w-4 h-4" />
                              <span className="text-xs">{product.agmarkGrade}</span>
                            </div>
                          ) : product.agmarkVerificationStatus === 'pending' ? (
                            <span className="text-xs text-yellow-600 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Pending
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground">Not certified</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {product.status !== 'active' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(product._id, 'active')}
                                title="Approve"
                              >
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              </Button>
                            )}
                            {product.status !== 'rejected' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleStatusChange(product._id, 'rejected')}
                                title="Reject"
                              >
                                <XCircle className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                            {!product.agmarkCertified && !product.agmarkCertificateUrl && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  setSelectedProduct(product)
                                  setShowAGMARKModal(true)
                                }}
                                title="Add AGMARK"
                              >
                                <Award className="w-4 h-4 text-yellow-600" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteProduct(product._id)}
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-6">
                  <Button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="px-4 py-2 flex items-center">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Pending AGMARK Verifications Tab */}
      {activeTab === 'agmark' && (
        <div className="space-y-4">
          {pendingAGMARK.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Pending Verifications</h3>
                <p className="text-muted-foreground">All AGMARK certificates have been verified.</p>
              </CardContent>
            </Card>
          ) : (
            pendingAGMARK.map((product) => (
              <Card key={product._id}>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Left: Product Info */}
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        {product.images?.[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-24 h-24 rounded-lg object-cover"
                          />
                        )}
                        <div>
                          <h3 className="text-xl font-bold mb-1">{product.title}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {product.description}
                          </p>
                          <div className="flex flex-wrap gap-2 text-sm">
                            <span className="px-2 py-1 bg-muted rounded">
                              ₹{product.price}/{product.unit}
                            </span>
                            <span className="px-2 py-1 bg-muted rounded">
                              Stock: {product.stock} {product.unit}
                            </span>
                            <span className="px-2 py-1 bg-muted rounded">
                              {product.categoryId?.name || product.category?.name || 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Seller:</span>
                          <span className="font-medium">{product.sellerId?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{product.location || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Harvest Date:</span>
                          <span className="font-medium">
                            {product.harvestDate ? new Date(product.harvestDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expiry Date:</span>
                          <span className="font-medium">
                            {product.expiryDate ? new Date(product.expiryDate).toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: AGMARK Certificate Info */}
                    <div className="border-l pl-6">
                      <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Award className="w-5 h-5 text-yellow-600" />
                        AGMARK Certificate
                      </h4>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-muted-foreground">Certificate Number</label>
                          <p className="text-lg font-mono font-medium">{product.agmarkCertificateNumber}</p>
                        </div>

                        <div>
                          <label className="text-sm text-muted-foreground">Requested Grade</label>
                          <p className="text-lg font-medium">{product.agmarkGrade}</p>
                        </div>

                        <div>
                          <label className="text-sm text-muted-foreground mb-2 block">Certificate Document</label>
                          {product.agmarkCertificateUrl ? (
                            <div className="flex items-center gap-2">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <a
                                href={product.agmarkCertificateUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-sm"
                              >
                                View Certificate
                              </a>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => {
                                  const link = document.createElement('a')
                                  link.href = product.agmarkCertificateUrl
                                  link.download = `AGMARK_${product.agmarkCertificateNumber}.pdf`
                                  link.click()
                                }}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                          ) : (
                            <p className="text-sm text-red-600">No certificate uploaded</p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => {
                              setSelectedProduct(product)
                              setVerificationAction('verify')
                              setShowVerificationModal(true)
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Verify Certificate
                          </Button>
                          <Button
                            onClick={() => {
                              setSelectedProduct(product)
                              setVerificationAction('reject')
                              setShowVerificationModal(true)
                            }}
                            variant="destructive"
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* AGMARK Verification Modal */}
      {showVerificationModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] max-w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {verificationAction === 'verify' ? 'Verify' : 'Reject'} AGMARK Certificate
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Product: {selectedProduct.title}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Certificate Number: {selectedProduct.agmarkCertificateNumber}
            </p>

            {verificationAction === 'reject' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection..."
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]"
                  required
                />
              </div>
            )}

            {verificationAction === 'verify' && (
              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  This will mark the certificate as verified and automatically approve the product with AGMARK grade: <strong>{selectedProduct.agmarkGrade}</strong>
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowVerificationModal(false)
                  setRejectionReason('')
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (verificationAction === 'reject' && !rejectionReason.trim()) {
                    alert('Please provide a rejection reason')
                    return
                  }
                  handleAGMARKVerification(
                    selectedProduct._id,
                    verificationAction,
                    rejectionReason
                  )
                }}
                className={`flex-1 ${
                  verificationAction === 'verify'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {verificationAction === 'verify' ? 'Verify' : 'Reject'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Old AGMARK Modal (for manual certification) */}
      {showAGMARKModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add AGMARK Certification</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Product: {selectedProduct.title}
            </p>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">AGMARK Grade</label>
              <select
                value={agmarkGrade}
                onChange={(e) => setAgmarkGrade(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select Grade</option>
                <option value="A+">A+ (Premium)</option>
                <option value="A">A (Excellent)</option>
                <option value="B+">B+ (Good)</option>
                <option value="B">B (Standard)</option>
              </select>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  setShowAGMARKModal(false)
                  setAgmarkGrade('')
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAGMARKUpdate}
                disabled={!agmarkGrade}
                className="flex-1"
              >
                Certify
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
