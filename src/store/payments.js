import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../boot/axios'

export const usePaymentsStore = defineStore('payments', () => {
  // State
  const checkoutSession = ref(null)
  const paymentStatus = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const refunds = ref([])

  // Actions
  const createCheckoutSession = async (checkoutData) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/api/payments/checkout', {
        merchant_id: checkoutData.merchant_id,
        amount: checkoutData.amount,
        currency: checkoutData.currency || 'usd',
        method: checkoutData.method || 'card',
        customer: checkoutData.customer,
        cart: checkoutData.cart,
        return_url_success: checkoutData.return_url_success || `${window.location.origin}/payment/success`,
        return_url_failure: checkoutData.return_url_failure || `${window.location.origin}/payment/cancel`
      })

      checkoutSession.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create checkout session'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const getPaymentStatus = async (reference) => {
    try {
      loading.value = true
      error.value = null

      const response = await api.get(`/api/payments/status/${reference}`)
      
      paymentStatus.value = response.data
      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch payment status'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  const processRefund = async (paymentId, amount = null, reason = '') => {
    try {
      loading.value = true
      error.value = null

      const response = await api.post('/api/payments/refund', {
        payment_id: paymentId,
        amount: amount,
        reason: reason
      })

      // Add to refunds list
      refunds.value.unshift({
        id: response.data.id,
        payment_id: paymentId,
        amount: amount || response.data.amount,
        reason: reason,
        status: 'processed',
        created_at: new Date().toISOString()
      })

      return { success: true, data: response.data }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process refund'
      error.value = errorMessage
      return { success: false, message: errorMessage }
    } finally {
      loading.value = false
    }
  }

  return {
    // State
    checkoutSession,
    paymentStatus,
    loading,
    error,
    refunds,

    // Actions
    createCheckoutSession,
    getPaymentStatus,
    processRefund
  }
})