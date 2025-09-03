import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../boot/axios'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || null)
  const loading = ref(false)
  const businessRegistered = ref(false)

  // ---------------- Getters ----------------
  const isAuthenticated = () => !!token.value
  const isAdmin = () => user.value?.role === 'admin'
  const isMerchant = () => user.value?.role === 'merchant'

  // ---------------- Helpers ----------------
  const setToken = (newToken) => {
    token.value = newToken
    if (newToken) {
      localStorage.setItem('token', newToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    } else {
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
    }
  }

  const setUser = (userData) => {
    if (userData) {
      user.value = userData
      localStorage.setItem('user', JSON.stringify(userData))
    } else {
      user.value = null
      localStorage.removeItem('user')
    }
  }

  // ---------------- API Actions ----------------
  const register = async (userData) => {
    loading.value = true
    try {
      // ✅ Using your actual endpoint: POST /api/auth/register
      const { data } = await api.post('/auth/register', {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        password_confirmation: userData.password_confirmation,
        role: userData.role || 'merchant' // default to merchant if not specified
      })

      // ✅ Save user info if backend returns it
      if (data?.user) setUser(data.user)

      // ❌ Do NOT set token here — token is only generated at login
      return { success: true, ...data }
    } catch (error) {
      console.error('❌ Registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Registration failed'
      }
    } finally {
      loading.value = false
    }
  }

  const login = async (credentials) => {
    loading.value = true
    try {
      // ✅ Using your actual endpoint: POST /api/auth/login (need to add to backend)
      const response = await api.post('/auth/login', {
        email: credentials.email,
        password: credentials.password
      })

      // ✅ Handle access_token properly
      if (!response.data?.access_token) {
        throw new Error('Invalid response format - No access token received')
      }

      // Set the token first
      setToken(response.data.access_token)

      // ✅ Create user object based on email since no profile endpoint available
      let userData = null
      if (credentials.email === 'admin@example.com') {
        userData = {
          email: 'admin@example.com',
          name: 'Admin',
          role: 'admin'
        }
      } else {
        userData = {
          email: credentials.email,
          name: credentials.email.split('@')[0],
          role: 'merchant'
        }
      }

      // Set user data
      setUser(userData)

      return {
        success: true,
        data: {
          user: userData,
          token: response.data.access_token
        }
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      // Clean up any partially set data
      setToken(null)
      setUser(null)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Login failed'
      }
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    try {
      if (token.value) {
        // ✅ Using your actual endpoint: POST /api/logout
        await api.post('/auth/logout')
      }
    } catch (error) {
      console.warn('⚠️ Logout error:', error)
    } finally {
      setToken(null)
      setUser(null)
    }
  }

  const getProfile = async () => {
    try {
      // ✅ No profile endpoint available in your API, so return stored user
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        return { success: true, user: userData }
      }
      throw new Error('No user data available')
    } catch (error) {
      console.error('❌ Profile error:', error)
      return {
        success: false,
        message: 'Failed to fetch profile'
      }
    }
  }

  // ---------------- Business Registration ----------------
  const registerBusiness = async (businessData) => {
    loading.value = true
    try {
      const formData = new FormData()

      Object.keys(businessData).forEach(key => {
        if (key === 'logo' && businessData[key] instanceof File) {
          formData.append('logo', businessData[key])
        } else if (key === 'payout_preferences' && Array.isArray(businessData[key])) {
          businessData[key].forEach((pref, index) => {
            formData.append(`payout_preferences[${index}]`, pref)
          })
        } else {
          formData.append(key, businessData[key])
        }
      })

      // ✅ Using your actual endpoint: POST /api/merchant/register
      const { data } = await api.post('/merchant/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      businessRegistered.value = true
      return { success: true, ...data }
    } catch (error) {
      console.error('❌ Business registration error:', error)
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Business registration failed'
      }
    } finally {
      loading.value = false
    }
  }

  // ---------------- Local Init ----------------
  const loadStoredData = () => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken) setToken(storedToken)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error('Error parsing stored user:', error)
        localStorage.removeItem('user')
      }
    }
  }

  loadStoredData()

  return {
    // State
    user,
    token,
    loading,
    businessRegistered,

    // Getters
    isAuthenticated,
    isAdmin,
    isMerchant,

    // Actions
    register,
    login,
    logout,
    getProfile,
    registerBusiness,
    setToken,
    setUser,
    loadStoredData
  }
})