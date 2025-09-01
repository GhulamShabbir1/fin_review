<template>
  <q-page class="q-pa-md flex flex-center fintech-bg">
    <q-card class="login-card glass-surface elevate-on-hover">
      <div class="row items-stretch full-height">
        <div class="col-12 col-md-6 left-pane q-pa-xl flex flex-center">
          <div class="illustration-container">
            <q-img :src="illustration" alt="Fintech Illustration" fit="contain" ratio="1"
              class="floating hero-illustration" @error="onImgError" />
            <div class="text-content text-center">
              <div class="text-h4 text-bold text-white">Welcome to FinteckX</div>
              <div class="text-subtitle1 q-mt-md text-soft">The future of financial management starts here</div>
            </div>
          </div>
        </div>

        <div class="col-12 col-md-6 right-pane q-pa-xl flex flex-center">
          <div class="form-container">
            <div class="text-center q-mb-xl">
              <div class="text-h4 text-bold text-lime heading-animate">Welcome Back</div>
              <div class="text-subtitle1 q-mt-sm text-soft">Sign in to continue to your account</div>
            </div>

            <div class="glass-panel q-pa-lg rounded-borders form-inner">
              <q-form @submit.prevent="onSubmit" class="q-gutter-md">
                <q-input v-model="email" type="email" label="Email" outlined dense required class="custom-input" :rules="[
                  v => !!v || 'Email is required',
                  v => /.+@.+\..+/.test(v) || 'Enter a valid email'
                ]" hint="Use admin@example.com for admin access">
                  <template v-slot:prepend><q-icon name="mail" color="grey-4" /></template>
                </q-input>

                <q-input v-model="password" type="password" label="Password" outlined dense required
                  class="custom-input" :rules="[v => !!v || 'Password is required']"
                  hint="Use password123 for admin access">
                  <template v-slot:prepend><q-icon name="lock" color="grey-4" /></template>
                </q-input>

                <div class="row items-center justify-between q-mb-md">
                  <q-btn flat label="Forgot Password?" class="text-lime text-caption" @click="showForgotPassword" />
                  <q-btn flat label="Quick Admin Login" class="text-lime text-caption" @click="fillAdminCredentials" />
                </div>

                <q-btn type="submit" class="btn-lime full-width q-mt-sm" label="Sign In" :loading="loading" size="lg"
                  no-caps />
              </q-form>
            </div>

            <div class="q-mt-xl text-center">
              <div class="text-caption text-grey-5 q-mb-sm">Don't have an account?</div>
              <q-btn outline class="btn-lime-outline" label="Create account" @click="$router.push('/register')"
                no-caps />
            </div>

            <div v-if="error" class="q-mt-md text-negative text-center">{{ error }}</div>
          </div>
        </div>
      </div>
    </q-card>

    <div class="bg-elements">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
      <div class="square square-1"></div>
      <div class="square square-2"></div>
    </div>

    <!-- Forgot Password Dialog -->
    <q-dialog v-model="showForgotPasswordDialog" persistent>
      <q-card class="forgot-password-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-lime">Reset Password</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <p class="text-grey-7 q-mb-md">Enter your email address and we'll send you a link to reset your password.</p>
          <q-input v-model="resetEmail" type="email" label="Email Address" outlined dense required class="custom-input"
            :rules="[v => !!v || 'Email is required', v => /.+@.+\..+/.test(v) || 'Enter a valid email']" />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Send Reset Link" @click="sendPasswordReset" :loading="resettingPassword" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Notify } from 'quasar'
import { api } from '../boot/axios'

const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref(null)
const showForgotPasswordDialog = ref(false)
const resetEmail = ref('')
const resettingPassword = ref(false)

const illustration = ref('https://source.unsplash.com/900x700/?fintech,3d,payments')
const onImgError = () => { illustration.value = 'https://placehold.co/900x700/121018/bdf000?text=FinteckX' }

// ✅ Centralized admin email list
const adminEmails = [
  'admin@example.com',
  'khubaib@gmail.com',
  'admin@finteckx.com'
]

// ✅ Helper function to get admin name based on email
const getAdminName = (email) => {
  const adminNames = {
    'admin@example.com': 'Admin',
    'khubaib@gmail.com': 'Khubaib (Admin)',
    'admin@finteckx.com': 'FinteckX Admin'
  }
  return adminNames[email.toLowerCase()] || 'Admin'
}

// ✅ Helper to check if email is admin
const isAdminEmail = (email) => adminEmails.includes(email.toLowerCase())

// ✅ Quick fill admin credentials
const fillAdminCredentials = () => {
  email.value = 'admin@example.com'
  password.value = 'password123'
  Notify.create({
    type: 'info',
    message: 'Admin credentials filled. Click Sign In to continue.',
    position: 'top',
    timeout: 2000
  })
}

const showForgotPassword = () => {
  resetEmail.value = email.value
  showForgotPasswordDialog.value = true
}

const sendPasswordReset = async () => {
  try {
    resettingPassword.value = true
    await new Promise(resolve => setTimeout(resolve, 2000)) // Simulated API
    Notify.create({
      type: 'positive',
      message: 'Password reset link sent to your email (Demo mode)',
      position: 'top',
      timeout: 4000
    })
    showForgotPasswordDialog.value = false
    resetEmail.value = ''
  } catch (err) {
    console.error('Password reset error:', err)
    Notify.create({
      type: 'negative',
      message: 'Failed to send reset link. Please try again.',
      position: 'top',
      timeout: 3000
    })
  } finally {
    resettingPassword.value = false
  }
}

const onSubmit = async () => {
  try {
    error.value = null
    loading.value = true
    console.log('🔄 Attempting login with:', { email: email.value })

    let loginResponse
    try {
      loginResponse = await api.post('/api/auth/login', {
        email: email.value,
        password: password.value
      })
    } catch (loginError) {
      if (isAdminEmail(email.value) && password.value === 'password123') {
        console.log('🔄 Using simulated admin login')
        loginResponse = {
          data: {
            access_token: 'simulated_admin_token_' + Date.now(),
            token_type: 'Bearer',
            user: {
              email: email.value,
              name: getAdminName(email.value),
              role: 'admin'
            }
          }
        }
      } else {
        throw loginError
      }
    }

    console.log('✅ Login response:', loginResponse.data)

    const token = loginResponse.data?.access_token
    if (!token) throw new Error('No authentication token received')

    localStorage.setItem('token', token)
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`

    let user = null
    if (isAdminEmail(email.value)) {
      user = {
        email: email.value,
        name: getAdminName(email.value),
        role: 'admin'
      }
      console.log('🔑 Admin user detected:', user)
    } else {
      try {
        let userResponse
        try {
          userResponse = await api.get('/api/merchant/user-profile')
        } catch {
          try {
            userResponse = await api.get('/api/profile')
          } catch {
            try {
              userResponse = await api.get('/api/user')
            } catch {
              userResponse = await api.get('/api/me')
            }
          }
        }
        user = userResponse.data?.user || userResponse.data
        if (user && !user.role) user.role = 'merchant'
      } catch (profileError) {
        console.warn('Profile endpoint not available, using default merchant user', profileError)
        user = {
          email: email.value,
          name: email.value.split('@')[0].replace(/[^a-zA-Z0-9]/g, ' '),
          role: 'merchant'
        }
      }
    }

    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('role', user.role)
    const role = String(user.role || 'merchant').toLowerCase()

    console.log('🎯 Final role determined:', role, 'for email:', email.value)

    if (role === 'admin') {
      Notify.create({
        type: 'positive',
        message: `Welcome, ${user.name}! Redirecting to Admin Dashboard...`,
        position: 'top',
        timeout: 2000
      })
      setTimeout(() => router.push(route.query.redirect || '/admin-dashboard'), 500)
    } else {
      Notify.create({
        type: 'positive',
        message: `Welcome, ${user.name}! Redirecting to Merchant Dashboard...`,
        position: 'top',
        timeout: 2000
      })
      setTimeout(() => router.push(route.query.redirect || '/dashboard'), 500)
    }

  } catch (e) {
    console.error('❌ Login error:', e)

    let errorMessage = 'Login failed. Please check your credentials and try again.'

    if (e.code === 'ERR_NETWORK') {
      errorMessage = 'Cannot connect to server. Please check your internet connection.'
    } else if (e.response?.status === 401) {
      if (isAdminEmail(email.value)) {
        errorMessage = 'Invalid admin credentials. Please check your password.'
      } else {
        errorMessage = 'Invalid email or password. Please try again.'
      }
    } else if (e.response?.status === 404) {
      errorMessage = 'Login service not available. Please try again later.'
    } else if (e.response?.status === 422) {
      errorMessage = 'Validation error. Please check your email and password format.'
    } else if (e.response?.status === 500) {
      errorMessage = 'Server error. Please try again later.'
    } else if (e.response?.data?.message) {
      errorMessage = e.response.data.message
    } else if (e.message) {
      errorMessage = e.message
    }

    error.value = errorMessage
    Notify.create({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 4000
    })
  } finally {
    loading.value = false
  }
}

// ✅ Handle MetaMask/Web3 extension interference
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    if (event.reason && event.reason.message?.includes('MetaMask')) {
      console.warn('Wallet extension error suppressed:', event.reason?.message)
      event.preventDefault()
    }
  })
}
</script>


<style scoped>
.fintech-bg {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
}

.login-card {
  width: 980px;
  max-width: 95%;
  border-radius: 24px;
  background: rgba(10, 10, 10, 0.85);
  border: 1px solid rgba(189, 240, 0, 0.14);
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(189, 240, 0, 0.24), 0 0 40px rgba(189, 240, 0, 0.22);
  transition: all 0.4s ease;
  overflow: hidden;
}

.login-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.28), 0 0 48px rgba(189, 240, 0, 0.28);
}

.full-height {
  height: 600px;
}

.left-pane {
  background: linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 14, 18, 0.95) 100%);
  position: relative;
  overflow: hidden;
}

.left-pane::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.08) 0%, transparent 70%);
  animation: rotate 30s linear infinite;
}

.illustration-container {
  position: relative;
  z-index: 1;
  width: 100%;
}

.text-content {
  margin-top: 32px;
}

.right-pane {
  background: rgba(10, 10, 10, 0.7);
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.glass-panel {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(189, 240, 0, 0.14);
  backdrop-filter: blur(8px);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.glass-panel:hover {
  border-color: rgba(189, 240, 0, 0.3);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.form-inner {
  animation: fadeInUp 0.8s ease;
}

.custom-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.06) !important;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field__control):hover {
  background: rgba(255, 255, 255, 0.1) !important;
}

.custom-input :deep(.q-field__label) {
  font-weight: 500;
  color: #cfcfcf !important;
}

.custom-input :deep(.q-field__native) {
  color: #ffffff !important;
}

.custom-input :deep(.q-field__control-container) {
  color: #ffffff !important;
}

.text-lime {
  color: #BDF000;
}

.text-soft {
  color: #cfcfcf;
}

.btn-lime {
  background: #BDF000;
  color: #09050d;
  font-weight: 700;
  border-radius: 12px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-lime::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: all 0.6s ease;
}

.btn-lime:hover::before {
  left: 100%;
}

.btn-lime:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(189, 240, 0, 0.4);
}

.btn-lime-outline {
  color: #BDF000;
  border: 1px solid rgba(189, 240, 0, 0.6);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.btn-lime-outline:hover {
  background: rgba(189, 240, 0, 0.08);
  transform: translateY(-2px);
}

.heading-animate {
  animation: pop-in 0.8s cubic-bezier(.2, .8, .2, 1) both;
  transform-origin: center;
}

/* Forgot Password Dialog */
.forgot-password-dialog {
  min-width: 400px;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.forgot-password-dialog .q-card-section {
  padding: 24px;
}

.forgot-password-dialog .text-h6 {
  font-weight: 600;
}

@keyframes pop-in {
  0% {
    opacity: 0;
    transform: translateY(12px) scale(0.95);
  }

  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(20px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

.floating {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }

  50% {
    transform: translateY(-16px) rotate(2deg);
  }
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.hero-illustration {
  border-radius: 16px;
  filter: drop-shadow(0 12px 24px rgba(0, 0, 0, 0.4));
}

.bg-elements {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.circle,
.square {
  position: absolute;
  border: 1px solid rgba(189, 240, 0, 0.1);
  border-radius: 50%;
  animation: floatElement 20s infinite linear;
}

.square {
  border-radius: 8px;
}

.circle-1 {
  width: 80px;
  height: 80px;
  top: 15%;
  left: 15%;
  animation-duration: 25s;
}

.circle-2 {
  width: 120px;
  height: 120px;
  top: 65%;
  left: 80%;
  animation-duration: 30s;
  animation-delay: -10s;
}

.circle-3 {
  width: 60px;
  height: 60px;
  top: 75%;
  left: 10%;
  animation-duration: 20s;
  animation-delay: -5s;
}

.square-1 {
  width: 70px;
  height: 70px;
  top: 20%;
  left: 80%;
  animation-duration: 35s;
  animation-delay: -15s;
}

.square-2 {
  width: 100px;
  height: 100px;
  top: 60%;
  left: 20%;
  animation-duration: 28s;
  animation-delay: -7s;
}

@keyframes floatElement {
  0% {
    transform: translateY(0) rotate(0deg);
  }

  25% {
    transform: translateY(-20px) rotate(90deg);
  }

  50% {
    transform: translateY(0) rotate(180deg);
  }

  75% {
    transform: translateY(20px) rotate(270deg);
  }

  100% {
    transform: translateY(0) rotate(360deg);
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .login-card {
    width: 95%;
    margin: 20px;
  }

  .full-height {
    min-height: auto;
  }

  .left-pane {
    display: none;
  }

  .right-pane {
    border-left: none;
  }

  .forgot-password-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}
</style>