import axios from 'axios'

const api = axios.create({
  baseURL: 'https://71118e932cba.ngrok-free.app', // ✅ Your AWS deployment
 headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
  timeout: 30000
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network error - check if backend server is running on http://192.168.12.35:8000')
    }
    return Promise.reject(error)
  }
)

export { api }
export default api