import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../boot/axios'

export const useAdminStore = defineStore('admin', () => {
  // State
  const merchants = ref([])
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const fetchMerchants = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null

      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })

      const { data } = await api.get('/api/admin/merchants', {
        params: Object.fromEntries(params)
      })

      merchants.value = data.merchants || data || []
      return { success: true, merchants: merchants.value }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch merchants'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const approveMerchant = async (merchantId) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post(`/api/admin/approve-merchant/${merchantId}`)
      
      // Update local merchant status
      const merchant = merchants.value.find(m => m.id === merchantId)
      if (merchant) {
        merchant.status = 'approved'
      }
      
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve merchant'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const fetchTransactions = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null

      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })

      const { data } = await api.get('/api/admin/transactions', {
        params: Object.fromEntries(params)
      })

      transactions.value = data.transactions || data || []
      return { success: true, transactions: transactions.value }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch transactions'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const exportTransactions = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null

      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })

      const response = await api.get('/api/admin/transactions/export', {
        params: Object.fromEntries(params),
        responseType: 'blob'
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `admin-transactions-${Date.now()}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()

      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to export transactions'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    merchants,
    transactions,
    loading,
    error,

    // Actions
    fetchMerchants,
    approveMerchant,
    fetchTransactions,
    exportTransactions
  }
})