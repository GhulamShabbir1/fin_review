import { defineStore } from 'pinia'
import { api } from '../boot/axios'

export const useTransactionsStore = defineStore('transactions', {
  state: () => ({
    transactions: [],
    loading: false,
    error: null
  }),

  getters: {
    getTransactionById: (state) => (id) => {
      return state.transactions.find(t => t.id === id)
    }
  },

  actions: {
    async fetchTransactions() {
      this.loading = true
      try {
        const response = await api.get('/merchant/transactions')
        this.transactions = response.data.data || response.data
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchTransaction(id) {
      try {
        const response = await api.get(`/merchant/transactions/${id}`)
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async refundTransaction(paymentId, reason) {
      try {
        const response = await api.post(`/merchant/transactions/${paymentId}/refund`, {
          reason: reason
        })
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    async exportTransactions() {
      try {
        const response = await api.get('/merchant/transactions/export', {
          responseType: 'blob'
        })
        return response.data
      } catch (error) {
        this.error = error.message
        throw error
      }
    }
  }
})