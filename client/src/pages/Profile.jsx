import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { api } from '../lib/api.js'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit, Save, X } from 'lucide-react'
import MagicBento from '../components/MagicBento.jsx'
import MagicCard from '../components/MagicCard.jsx'

export default function Profile() {
  const { user } = useAuth()
  const { isDarkMode } = useTheme()
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
        color: isDarkMode ? 'text-blue-400' : 'text-blue-600',
        bgColor: isDarkMode ? 'bg-blue-900/30' : 'bg-blue-100',
        description: 'Manage your buyer account and preferences'
      },
      farmer: {
        title: 'Farmer Profile',
        icon: User,
        color: isDarkMode ? 'text-green-400' : 'text-green-600',
        bgColor: isDarkMode ? 'bg-green-900/30' : 'bg-green-100',
        description: 'Manage your farmer profile and farm details'
      },
      admin: {
        title: 'Admin Profile',
        icon: Shield,
        color: isDarkMode ? 'text-red-400' : 'text-red-600',
        bgColor: isDarkMode ? 'bg-red-900/30' : 'bg-red-100',
        description: 'Administrator account management'
      }
    }
    return configs[role] || configs.buyer
  }

  if (loading) {
    return (
      <MagicBento className={`min-h-screen ${isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
        : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
      }`}>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <div className={`h-8 rounded w-1/3 animate-pulse ${isDarkMode 
              ? 'bg-gradient-to-r from-gray-700 to-gray-600' 
              : 'bg-gradient-to-r from-gray-200 to-gray-300'
            }`} />
            <MagicCard className="h-64 animate-pulse" />
          </div>
        </div>
      </MagicBento>
    )
  }

  const roleConfig = getRoleConfig(user?.role)
  const IconComponent = roleConfig.icon

  return (
    <MagicBento className={`min-h-screen ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
      : 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50'
    }`}>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="float-animation">
              <h1 className={`text-4xl font-bold bg-gradient-to-r ${isDarkMode 
                ? 'from-emerald-400 to-green-300' 
                : 'from-emerald-700 to-green-600'
              } bg-clip-text text-transparent`}>
                {roleConfig.title} ✨
              </h1>
              <p className={`mt-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{roleConfig.description}</p>
            </div>
            {!isEditing && (
              <Button 
                onClick={() => setIsEditing(true)} 
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>

          {error && (
            <MagicCard className={`border-2 p-4 ${isDarkMode 
              ? 'bg-red-900/20 border-red-700/50' 
              : 'bg-red-50 border-red-200'
            }`} glowIntensity="low">
              <p className={isDarkMode ? 'text-red-300' : 'text-red-700'}>{error}</p>
            </MagicCard>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Information */}
            <MagicCard glowIntensity="medium">
              <div className={`p-4 ${roleConfig.bgColor} rounded-t-xl`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full shadow-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <IconComponent className={`w-5 h-5 ${roleConfig.color}`} />
                  </div>
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Account Information</h3>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Email</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{profileData?.user?.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Shield className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Role</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium capitalize shadow-sm ${roleConfig.bgColor} ${roleConfig.color}`}>
                      {profileData?.user?.role}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Member Since</p>
                    <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>
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
              </div>
            </MagicCard>

            {/* Personal Information */}
            <MagicCard glowIntensity="medium">
              <div className={`p-4 rounded-t-xl ${isDarkMode 
                ? 'bg-gradient-to-r from-blue-900/30 to-cyan-900/30' 
                : 'bg-gradient-to-r from-blue-50 to-cyan-50'
              }`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Personal Information</h3>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleSave}
                        disabled={updating}
                        className="flex items-center gap-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
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
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <User className={`w-4 h-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 shadow-sm ${isDarkMode 
                          ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900'
                        }`}
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <p className={isDarkMode ? 'text-white' : 'text-gray-900'}>{profileData?.profile?.name || 'Not provided'}</p>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 shadow-sm"
                        placeholder="Enter your phone number"
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.profile?.phone || 'Not provided'}</p>
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-gray-900 shadow-sm"
                        placeholder="Enter your address"
                        rows={3}
                      />
                    ) : (
                      <p className="text-gray-900">{profileData?.profile?.address || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>
            </MagicCard>
          </div>

          {/* Role-specific additional information */}
          {user?.role === 'farmer' && (
            <MagicCard glowIntensity="low">
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-900">🚜 Farm Details</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Farm-specific features and details will be added here in future updates.
                </p>
              </div>
            </MagicCard>
          )}

          {user?.role === 'admin' && (
            <MagicCard glowIntensity="low">
              <div className="p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-t-xl">
                <h3 className="text-lg font-semibold text-gray-900">⚙️ Admin Settings</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600">
                  Administrator-specific settings and controls will be available here.
                </p>
              </div>
            </MagicCard>
          )}
        </div>
      </div>
    </MagicBento>
  )
}