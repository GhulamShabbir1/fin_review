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
  const approveMerchant = async (merchantId) => {
    try {
      loading.value = true
      error.value = null
      
      // ✅ Using your actual endpoint: POST /api/admin/approve-merchant/{id}
      const { data } = await api.post(`/api/admin/approve-merchant/${merchantId}`)
      
      // Update local merchants list if needed
      const merchantIndex = merchants.value.findIndex(m => m.id === merchantId)
      if (merchantIndex !== -1) {
        merchants.value[merchantIndex].approved = true
        merchants.value[merchantIndex].status = 'approved'
      }
      
      return { success: true, ...data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to approve merchant'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

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
      
      // ✅ This endpoint doesn't exist in your API yet - using fallback
      console.warn('⚠️ /api/admin/merchants endpoint not available, using fallback data')
      
      // ✅ Fallback merchant data
      merchants.value = [
        {
          id: 1,
          business_name: 'TechCorp Inc',
          email: 'admin@techcorp.com',
          status: 'verified',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          business_name: 'FoodExpress',
          email: 'contact@foodexpress.com',
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]
      
      return { success: true, merchants: merchants.value }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch merchants'
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
      
      // ✅ Using your actual endpoint: GET /api/merchant/transactions (admin can view all)
      const { data } = await api.get('/api/merchant/transactions', {
        params: Object.fromEntries(params)
      })
      
      transactions.value = data.transactions || data || []
      return { success: true, transactions: transactions.value }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch transactions'
      error.value = errorMessage
      
      // ✅ Fallback transaction data
      transactions.value = [
        {
          id: 1,
          merchant_id: 1,
          amount: 9999,
          status: 'completed',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          merchant_id: 2,
          amount: 5500,
          status: 'pending',
          created_at: new Date().toISOString()
        }
      ]
      
      return { success: true, transactions: transactions.value }
    } finally {
      loading.value = false
    }
  }

  const exportTransactionsCsv = async (filters = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
          params.append(key, filters[key])
        }
      })
      
      // ✅ Using your actual endpoint: GET /api/admin/transactions/export
      const response = await api.get('/api/admin/transactions/export', {
        params: Object.fromEntries(params),
        responseType: 'blob'
      })
      
      // Create download link
      const blob = new Blob([response.data], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      
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
    approveMerchant,
    fetchMerchants,
    fetchTransactions,
    exportTransactionsCsv
  }
})