import { defineStore } from 'pinia'
import { api } from '../boot/axios'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    payments: [],
    loading: false,
    error: null
  }),

  actions: {
    async checkout(checkoutData) {
      this.loading = true
      try {
        const response = await api.post('/payments/checkout', checkoutData)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async getPaymentStatus(reference) {
      try {
        const response = await api.get(`/payments/status/${reference}`)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})