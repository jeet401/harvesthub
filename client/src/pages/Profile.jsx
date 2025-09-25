import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { api } from '../lib/api.js'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const [profileData, setProfileData] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await api.getProfile()
      setProfileData(response)
      setFormData({
        name: response.profile?.name || '',
        phone: response.profile?.phone || '',
        address: response.profile?.address || ''
      })
    } catch (error) {
      console.error('Profile fetch error:', error)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setUpdating(true)
      setError('')
      await api.updateProfile(formData)
      await fetchProfile() // Refresh data
      setIsEditing(false)
    } catch (error) {
      console.error('Profile update error:', error)
      setError('Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: profileData?.profile?.name || '',
      phone: profileData?.profile?.phone || '',
      address: profileData?.profile?.address || ''
    })
    setIsEditing(false)
    setError('')
  }

  const getRoleConfig = (role) => {
    const configs = {
      buyer: {
        title: 'Buyer Profile',
        icon: User,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
        description: 'Manage your buyer account and preferences'
      },
      farmer: {
        title: 'Farmer Profile',
        icon: User,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        description: 'Manage your farmer profile and farm details'
      },
      admin: {
        title: 'Admin Profile',
        icon: Shield,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        description: 'Administrator account management'
      }
    }
    return configs[role] || configs.buyer
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="h-64 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    )
  }

  const roleConfig = getRoleConfig(user?.role)
  const IconComponent = roleConfig.icon

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{roleConfig.title}</h1>
            <p className="text-muted-foreground mt-2">{roleConfig.description}</p>
          </div>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Edit Profile
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Account Information */}
          <Card>
            <CardHeader className={`${roleConfig.bgColor} rounded-t-lg`}>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-full">
                  <IconComponent className={`w-5 h-5 ${roleConfig.color}`} />
                </div>
                <CardTitle>Account Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="text-foreground">{profileData?.user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Role</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium capitalize ${roleConfig.bgColor} ${roleConfig.color}`}>
                    {profileData?.user?.role}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-gray-500" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Member Since</p>
                  <p className="text-foreground">
                    {profileData?.user?.createdAt ? 
                      new Date(profileData.user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 
                      'N/A'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Personal Information</CardTitle>
                {isEditing && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={updating}
                      className="flex items-center gap-1"
                    >
                      <Save className="w-3 h-3" />
                      {updating ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updating}
                      className="flex items-center gap-1"
                    >
                      <X className="w-3 h-3" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-3">
                <User className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Full Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-foreground">{profileData?.profile?.name || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your phone number"
                    />
                  ) : (
                    <p className="text-foreground">{profileData?.profile?.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-500">Address</p>
                  {isEditing ? (
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                      placeholder="Enter your address"
                      rows={3}
                    />
                  ) : (
                    <p className="text-foreground">{profileData?.profile?.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Role-specific additional information */}
        {user?.role === 'farmer' && (
          <Card>
            <CardHeader>
              <CardTitle>Farm Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Farm-specific features and details will be added here in future updates.
              </p>
            </CardContent>
          </Card>
        )}

        {user?.role === 'admin' && (
          <Card>
            <CardHeader>
              <CardTitle>Admin Settings</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-muted-foreground">
                Administrator-specific settings and controls will be available here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}