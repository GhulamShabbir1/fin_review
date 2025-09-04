import { defineStore } from 'pinia'
import { api } from '../boot/axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: false,
    userRole: null
  }),

  getters: {
    isAdmin: (state) => state.userRole === 'admin',
    isMerchant: (state) => state.userRole === 'merchant'
  },

  actions: {
    async register(userData) {
      const response = await api.post('/auth/register', userData)
      if (response.data.token) {
        this.setToken(response.data.token)
        this.setUser(response.data.user)
      }
      return response.data
    },

    async login(credentials) {
      const response = await api.post('/auth/login', credentials)
      if (response.data.token) {
        this.setToken(response.data.token)
        this.setUser(response.data.user)
        this.setUserRole(response.data.user.role)
      }
      return response.data
    },

    async getProfile() {
      const response = await api.get('/auth/profile')
      this.setUser(response.data.user)
      this.setUserRole(response.data.user.role)
      return response.data
    },

    async logout() {
      try {
        await api.post('/auth/logout')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.clearAuth()
      }
    },

    async registerBusiness(businessData) {
      const response = await api.post('/merchant/register', businessData)
      return response.data
    },

    setToken(token) {
      this.token = token
      this.isAuthenticated = true
      localStorage.setItem('token', token)
    },

    setUser(user) {
      this.user = user
      this.isAuthenticated = true
    },

    setUserRole(role) {
      this.userRole = role
    },

    clearAuth() {
      this.user = null
      this.token = null
      this.isAuthenticated = false
      this.userRole = null
      localStorage.removeItem('token')
    }
  }
})