import axios from 'axios'
import { useQuasar } from 'quasar'

const api = axios.create({
  baseURL: 'http://13.51.167.136/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
  timeout: 30000
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const $q = useQuasar()
    
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token')
      delete api.defaults.headers.common['Authorization']
      
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    } else if (error.response?.status === 403) {
      // Forbidden
      $q.notify({
        type: 'negative',
        message: 'You do not have permission to perform this action',
        position: 'top'
      })
    } else if (error.response?.status === 422) {
      // Validation errors
      const errors = error.response.data.errors
      const firstError = Object.values(errors)[0]
      $q.notify({
        type: 'negative',
        message: Array.isArray(firstError) ? firstError[0] : firstError,
        position: 'top'
      })
    } else if (error.response?.status >= 500) {
      // Server errors
      $q.notify({
        type: 'negative',
        message: 'Server error. Please try again later.',
        position: 'top'
      })
    } else if (error.code === 'ECONNABORTED') {
      // Timeout
      $q.notify({
        type: 'negative',
        message: 'Request timeout. Please check your connection.',
        position: 'top'
      })
    }
    
    return Promise.reject(error)
  }
)

export { api }