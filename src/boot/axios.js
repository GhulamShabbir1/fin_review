import axios from 'axios'

const api = axios.create({
<<<<<<< HEAD
  baseURL: 'http://13.51.167.136', // ✅ Your AWS deployment
=======
  baseURL: 'http://192.168.12.80:8000/api',
>>>>>>> 0ea6016444fe6a864e3d12e773b948dba9746cfb
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
      console.error('Network error - check if backend server is running and /api base path is correct')
    }
    return Promise.reject(error)
  }
)

export { api }
export default api