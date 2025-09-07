import { defineStore } from 'pinia'
import { api } from 'src/boot/axios'

export const useMerchantsStore = defineStore('merchants', {
  state: () => ({
    merchants: [],
    transactions: [],
    dashboardStats: {},
    adminDashboardStats: {},
    pendingMerchants: [],
    loading: false,
    error: null
  }),

  getters: {
    getMerchantById: (state) => (id) => {
      return state.merchants.find(merchant => merchant.id === id)
    },
    
    getTransactionById: (state) => (id) => {
      return state.transactions.find(transaction => transaction.id === id)
    },
    
    getTransactionsByStatus: (state) => (status) => {
      return state.transactions.filter(transaction => transaction.status === status)
    }
  },

  actions: {
    // Dashboard Stats
    async fetchDashboardStats() {
      try {
        this.loading = true
        const response = await api.get('/merchants/dashboard/stats')
        this.dashboardStats = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch dashboard stats'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Admin Dashboard Stats
    async fetchAdminDashboardStats() {
      try {
        this.loading = true
        const response = await api.get('/admin/dashboard/stats')
        this.adminDashboardStats = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch admin dashboard stats'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Transactions
    async fetchTransactions(params = {}) {
      try {
        this.loading = true
        const response = await api.get('/merchants/transactions', { params })
        this.transactions = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch transactions'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Pending Merchants (Admin)
    async fetchPendingMerchants() {
      try {
        this.loading = true
        const response = await api.get('/admin/merchants/pending')
        this.pendingMerchants = response.data.data
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to fetch pending merchants'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Review Merchant (Admin)
    async reviewMerchant(merchantId, action) {
      try {
        this.loading = true
        const response = await api.post(`/admin/merchants/${merchantId}/review`, {
          action: action
        })
        
        // Remove from pending list
        this.pendingMerchants = this.pendingMerchants.filter(m => m.id !== merchantId)
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to review merchant'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Process Refund
    async processRefund(refundData) {
      try {
        this.loading = true
        const response = await api.post('/merchants/refunds', refundData)
        
        // Update transaction in local state
        const transactionIndex = this.transactions.findIndex(t => t.id === refundData.transaction_id)
        if (transactionIndex !== -1) {
          this.transactions[transactionIndex].status = 'refunded'
          if (!this.transactions[transactionIndex].refunds) {
            this.transactions[transactionIndex].refunds = []
          }
          this.transactions[transactionIndex].refunds.push(response.data.data)
        }
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to process refund'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Export Transactions
    async exportTransactions(format = 'csv', params = {}) {
      try {
        this.loading = true
        const response = await api.get('/merchants/transactions/export', {
          params: { ...params, format },
          responseType: 'blob'
        })
        
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]))
        const link = document.createElement('a')
        link.href = url
        link.setAttribute('download', `transactions.${format}`)
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
        
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to export transactions'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Business Registration
    async registerBusiness(businessData) {
      try {
        this.loading = true
        const response = await api.post('/merchants/business/register', businessData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to register business'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Update Business Profile
    async updateBusinessProfile(merchantId, businessData) {
      try {
        this.loading = true
        const response = await api.put(`/merchants/${merchantId}/business`, businessData)
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to update business profile'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Get Stripe Onboarding Link
    async getStripeOnboardingLink() {
      try {
        this.loading = true
        const response = await api.get('/merchants/stripe/onboarding-link')
        return response.data
      } catch (error) {
        this.error = error.response?.data?.message || 'Failed to get Stripe onboarding link'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Clear error
    clearError() {
      this.error = null
    }
  }
})