<template>
  <div class="checkout-router">
    <!-- Checkout page -->
    <q-slide-transition>
      <CheckoutPage v-if="showCheckout" key="checkout" />
    </q-slide-transition>
    
    <!-- Payment status page -->
    <q-slide-transition>
      <PaymentStatus v-if="showStatus" key="status" />
    </q-slide-transition>
    
    <!-- Error page -->
    <q-slide-transition>
      <div v-if="showError" class="error-container" key="error">
        <q-card class="error-card modern-card">
          <q-card-section class="text-center">
            <div class="error-icon">
              <q-icon name="error" size="64px" color="negative" />
            </div>
            <div class="text-h5 text-negative q-mt-md">Checkout Error</div>
            <div class="text-subtitle1 q-mt-sm text-grey-6">{{ errorMessage }}</div>
            <q-btn
              label="Try Again"
              class="btn-primary q-mt-lg"
              @click="retryCheckout"
              :loading="retrying"
            />
          </q-card-section>
        </q-card>
      </div>
    </q-slide-transition>
    
    <!-- Loading state -->
    <q-fade-transition>
      <div v-if="checkoutState === 'loading'" class="loading-container" key="loading">
        <div class="loading-content">
          <q-spinner-dots size="50px" color="lime" />
          <div class="loading-text">Initializing secure checkout...</div>
          <div class="loading-subtext">Preparing your payment environment</div>
          <div class="loading-progress">
            <div class="progress-bar">
              <div class="progress-fill"></div>
            </div>
          </div>
        </div>
      </div>
    </q-fade-transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import CheckoutPage from './CheckoutPage.vue'
import PaymentStatus from '../payments/PaymentStatus.vue'

const route = useRoute()

// Reactive data
const checkoutState = ref('loading') // loading, checkout, status, error
const errorMessage = ref('')
const retrying = ref(false)

// Computed properties
const showCheckout = computed(() => checkoutState.value === 'checkout')
const showStatus = computed(() => checkoutState.value === 'status')
const showError = computed(() => checkoutState.value === 'error')

// Watch for route changes
watch(() => route.query, (newQuery) => {
  if (newQuery.status) {
    checkoutState.value = 'status'
  }
}, { immediate: true })

// Methods
const retryCheckout = async () => {
  retrying.value = true
  await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate retry delay
  checkoutState.value = 'loading'
  initializeCheckout()
  retrying.value = false
}

const initializeCheckout = async () => {
  try {
    // Check if this is a payment status page
    if (route.query.status) {
      checkoutState.value = 'status'
      return
    }
    
    // Validate required parameters
    const requiredParams = ['amount', 'merchant']
    const missingParams = requiredParams.filter(param => !route.query[param])
    
    if (missingParams.length > 0) {
      errorMessage.value = `Missing required parameters: ${missingParams.join(', ')}`
      checkoutState.value = 'error'
      return
    }
    
    // Validate amount
    const amount = parseFloat(route.query.amount)
    if (isNaN(amount) || amount <= 0) {
      errorMessage.value = 'Invalid amount specified. Please check your payment details.'
      checkoutState.value = 'error'
      return
    }
    
    // Simulate initialization delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Initialize checkout
    checkoutState.value = 'checkout'
    
  } catch (error) {
    console.error('Failed to initialize checkout:', error)
    errorMessage.value = 'Failed to initialize checkout. Please try again.'
    checkoutState.value = 'error'
  }
}

// Lifecycle
onMounted(() => {
  initializeCheckout()
})
</script>

<style scoped>
.checkout-router {
  min-height: 100vh;
  background: linear-gradient(135deg, #09050d 0%, #121018 50%, #171719 100%);
  position: relative;
}

.loading-container, .error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.loading-content {
  text-align: center;
  max-width: 400px;
}

.loading-text {
  color: #bdfd00;
  font-size: 1.2rem;
  font-weight: 600;
  margin-top: 20px;
}

.loading-subtext {
  color: #888;
  font-size: 0.9rem;
  margin-top: 8px;
}

.loading-progress {
  margin-top: 30px;
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  position: relative;
}

.progress-fill {
  position: absolute;
  height: 100%;
  width: 30%;
  background: linear-gradient(90deg, #bdfd00, #a0d000);
  border-radius: 2px;
  animation: progressPulse 2s ease-in-out infinite;
}

.error-card {
  max-width: 500px;
  width: 100%;
  background: rgba(23, 23, 25, 0.95);
  border-radius: 20px;
  overflow: hidden;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  overflow: hidden;
}

.error-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 107, 107, 0.1), transparent);
  transition: left 0.7s ease;
}

.error-card:hover::before {
  left: 100%;
}

.modern-card {
  background: rgba(23, 23, 25, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.error-icon {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(255, 107, 107, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  animation: pulse 2s ease-in-out infinite;
}

.btn-primary {
  background: linear-gradient(135deg, #bdfd00, #a0d000);
  color: #09050d;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  padding: 12px 32px;
  transition: all 0.3s ease;
  min-width: 140px;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.btn-primary:hover::before {
  left: 100%;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(189, 253, 0, 0.3);
}

.btn-primary:active {
  transform: translateY(0);
}

.text-negative {
  color: #ff6b6b;
  font-weight: 600;
}

/* Pulse animation */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.05);
  }
}

@keyframes progressPulse {
  0%, 100% {
    transform: translateX(0%);
    width: 30%;
  }
  50% {
    transform: translateX(233%);
    width: 40%;
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .loading-container, .error-container {
    padding: 16px;
  }
  
  .error-card {
    max-width: 100%;
    border-radius: 16px;
  }
  
  .loading-text {
    font-size: 1.1rem;
  }
  
  .loading-subtext {
    font-size: 0.85rem;
  }
  
  .error-icon {
    width: 80px;
    height: 80px;
  }
  
  .text-h5 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .loading-content {
    max-width: 300px;
  }
  
  .loading-text {
    font-size: 1rem;
  }
  
  .btn-primary {
    padding: 10px 24px;
    min-width: 120px;
  }
}

/* Smooth scrolling */
.checkout-router {
  scroll-behavior: smooth;
}

/* Custom scrollbar */
.checkout-router::-webkit-scrollbar {
  width: 8px;
}

.checkout-router::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.checkout-router::-webkit-scrollbar-thumb {
  background: rgba(189, 253, 0, 0.3);
  border-radius: 4px;
}

.checkout-router::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 253, 0, 0.5);
}

/* Enhanced focus states */
.btn-primary:focus {
  outline: 2px solid rgba(189, 253, 0, 0.5);
  outline-offset: 2px;
}

/* Loading animation enhancements */
:deep(.q-spinner) {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Glow effect for cards */
.modern-card {
  position: relative;
}

.modern-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(189, 253, 0, 0.5), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-card:hover::before {
  opacity: 1;
}
</style>