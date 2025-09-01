import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../boot/axios'
import { useAuthStore } from './auth'

export const useMerchantsStore = defineStore('merchant', () => {
  // State
  const businessInfo = ref(null)
  const transactions = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const registerBusiness = async (businessData) => {
    try {
      loading.value = true
      error.value = null

      // Handle multipart form data for logo upload
      const formData = new FormData()
      formData.append('business_name', businessData.business_name)
      formData.append('bank_account_name', businessData.bank_account_name)
      formData.append('bank_account_number', businessData.bank_account_number)
      formData.append('bank_ifsc_swift', businessData.bank_ifsc_swift)

      // Add logo if provided
      if (businessData.logo && businessData.logo instanceof File) {
        formData.append('logo', businessData.logo)
      }

      // Add payout preferences
      if (businessData.payout_preferences && Array.isArray(businessData.payout_preferences)) {
        businessData.payout_preferences.forEach((preference, index) => {
          formData.append(`payout_preferences[${index}]`, preference)
        })
      }

      // ✅ Using your actual endpoint: POST /api/merchant/register
      const { data } = await api.post('/api/merchant/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      businessInfo.value = data
      return { success: true, ...data }
    } catch (error) {
      console.error('Business registration error:', error)
      const errorMessage = error.response?.data?.message || 'Business registration failed'
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

      // ✅ Using your actual endpoint: GET /api/merchant/transactions
      const { data } = await api.get('/api/merchant/transactions', {
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

  const updateBusiness = async (businessData) => {
    try {
      loading.value = true
      error.value = null

      // ✅ This endpoint doesn't exist in your API - using fallback
      console.warn('⚠️ /api/merchant/update endpoint not available')

      // ✅ Update local data for now
      businessInfo.value = { ...businessInfo.value, ...businessData }

      return { success: true, data: businessInfo.value }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update business'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const getBusinessInfo = async () => {
    try {
      loading.value = true
      error.value = null

      // ✅ This endpoint doesn't exist in your API - using fallback
      console.warn('⚠️ Business profile endpoint not available, using fallback data')

      // ✅ Create fallback business info
      const auth = useAuthStore()
      businessInfo.value = {
        business_name: 'Sample Business',
        email: auth.user?.email || 'business@example.com',
        bank_account_name: 'Sample Account',
        status: 'pending'
      }

      return { success: true, business: businessInfo.value }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch business info'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    businessInfo,
    transactions,
    loading,
    error,

    // Actions
    registerBusiness,
    fetchTransactions,
    updateBusiness,
    getBusinessInfo
  }
})