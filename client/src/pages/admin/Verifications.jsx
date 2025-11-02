import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { CheckCircle, XCircle, Award } from 'lucide-react'

export default function Verifications() {
  const [verifications, setVerifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVerifications()
  }, [])

  const fetchVerifications = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/verifications`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        setVerifications(data.verifications || [])
      }
    } catch (error) {
      console.error('Failed to fetch verifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' })
      })

      if (response.ok) {
        fetchVerifications()
      }
    } catch (error) {
      console.error('Failed to approve product:', error)
    }
  }

  const handleReject = async (productId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/admin/products/${productId}/status`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' })
      })

      if (response.ok) {
        fetchVerifications()
      }
    } catch (error) {
      console.error('Failed to reject product:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pending Verifications</h1>
        <p className="text-muted-foreground mt-1">Review and approve product listings</p>
      </div>

      {verifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Pending Verifications</h3>
            <p className="text-muted-foreground">All products have been reviewed</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verifications.map((product) => (
            <Card key={product._id}>
              <CardHeader>
                <CardTitle className="text-lg">{product.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.images?.[0] && (
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
                
                <div className="space-y-2 text-sm">
                  <div>
                    <strong>Seller:</strong> {product.sellerId?.email}
                  </div>
                  <div>
                    <strong>Category:</strong> {product.category?.name}
                  </div>
                  <div>
                    <strong>Price:</strong> ₹{product.price}
                  </div>
                  <div>
                    <strong>Stock:</strong> {product.stock} {product.unit}
                  </div>
                  <div>
                    <strong>Description:</strong>
                    <p className="text-muted-foreground mt-1">{product.description}</p>
                  </div>
                  <div>
                    <strong>Submitted:</strong> {new Date(product.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => handleApprove(product._id)}
                    className="flex-1"
                    variant="default"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(product._id)}
                    className="flex-1"
                    variant="destructive"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
