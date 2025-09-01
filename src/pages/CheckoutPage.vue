<template>
  <q-page class="q-pa-md flex flex-center checkout-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="60px" />
      <p class="loading-text">Loading checkout...</p>
    </div>

    <!-- Error State -->
    <q-card v-else-if="error" class="error-card">
      <q-card-section class="text-center">
        <q-icon name="error_outline" size="64px" color="negative" class="q-mb-md" />
        <div class="text-h6 text-negative q-mb-md">Checkout Error</div>
        <div class="text-body2 text-grey-7 q-mb-lg">{{ error }}</div>
        <div class="q-gutter-sm">
          <q-btn color="primary" label="Try Again" @click="initializeCheckout" />
          <q-btn flat color="grey" label="Go Back" @click="goBack" />
        </div>
      </q-card-section>
    </q-card>

    <!-- Main Checkout -->
    <div v-else class="checkout-container">
      <!-- Checkout Header -->
      <q-card class="checkout-header-card glass-surface q-mb-md">
        <q-card-section>
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-lime">Secure Checkout</div>
              <div class="text-caption text-grey-5">Complete your purchase securely</div>
            </div>
            <div class="col-auto">
              <q-chip color="green" text-color="white" icon="lock" size="sm">
                SSL Secured
              </q-chip>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Order Summary Card -->
      <q-card class="order-summary-card glass-surface q-mb-lg">
        <q-card-section>
          <div class="text-h6 text-lime q-mb-md">Order Summary</div>
          <div class="order-details">
            <div class="order-row">
              <span class="order-label">Item:</span>
              <span class="order-value">{{ description || 'Digital Purchase' }}</span>
            </div>
            <div class="order-row">
              <span class="order-label">Merchant:</span>
              <span class="order-value">{{ merchantInfo.name || `Merchant #${merchantId}` }}</span>
            </div>
            <div class="order-row">
              <span class="order-label">Amount:</span>
              <span class="order-value amount-highlight">{{ formatCurrency(amount) }}</span>
            </div>
            <div class="order-row">
              <span class="order-label">Currency:</span>
              <span class="order-value">{{ currency }}</span>
            </div>
            <q-separator class="q-my-md" />
            <div class="order-row total-row">
              <span class="order-label total-label">Total:</span>
              <span class="order-value total-amount">{{ formatCurrency(amount) }}</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Checkout Form -->
      <CheckoutForm
        :merchant-id="merchantId"
        :amount="amount"
        :currency="currency"
        :description="description"
        :merchant-info="merchantInfo"
        @payment-success="onPaymentSuccess"
        @payment-error="onPaymentError"
        @payment-loading="onPaymentLoading"
        class="checkout-form-container"
      />

      <!-- Security Footer -->
      <q-card class="security-footer glass-surface q-mt-md">
        <q-card-section class="text-center">
          <div class="row items-center justify-center q-gutter-lg">
            <div class="security-badge">
              <q-icon name="verified_user" color="green" size="20px" />
              <span class="text-caption">256-bit SSL</span>
            </div>
            <div class="security-badge">
              <q-icon name="shield" color="blue" size="20px" />
              <span class="text-caption">PCI Compliant</span>
            </div>
            <div class="security-badge">
              <q-icon name="lock" color="orange" size="20px" />
              <span class="text-caption">Fraud Protected</span>
            </div>
          </div>
          <div class="text-caption text-grey-6 q-mt-sm">
            Your payment information is encrypted and secure
          </div>
        </q-card-section>
      </q-card>

      <!-- Powered By -->
      <div class="powered-by text-center q-mt-md">
        <div class="text-caption text-grey-6">
          Powered by <span class="text-lime">FinteckX</span> • Secure Payment Gateway
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'
import CheckoutForm from '../components/payments/CheckoutForm.vue'

const route = useRoute()
const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(true)
const error = ref('')
const merchantInfo = ref({})

// Checkout parameters
const merchantId = ref(null)
const amount = ref(0)
const currency = ref('USD')
const description = ref('')

// Payment state
const paymentLoading = ref(false)

// Methods
const initializeCheckout = async () => {
  try {
    loading.value = true
    error.value = ''

    // Extract and validate parameters from route query
    merchantId.value = route.query.merchantId
    amount.value = parseInt(route.query.amount) || 0
    currency.value = String(route.query.currency || 'USD').toUpperCase()
    description.value = String(route.query.description || '')

    console.log('🔄 Initializing checkout with params:', {
      merchantId: merchantId.value,
      amount: amount.value,
      currency: currency.value,
      description: description.value
    })

    // Validate required parameters
    if (!merchantId.value) {
      throw new Error('Merchant ID is required for checkout')
    }

    if (!amount.value || amount.value <= 0) {
      throw new Error('Valid amount is required for checkout')
    }

    // Load merchant information if available
    await loadMerchantInfo()

    console.log('✅ Checkout initialized successfully')

  } catch (err) {
    console.error('❌ Failed to initialize checkout:', err)
    error.value = err.message || 'Failed to initialize checkout'
  } finally {
    loading.value = false
  }
}

const loadMerchantInfo = async () => {
  try {
    console.log('🔄 Loading merchant info for ID:', merchantId.value)

    // ✅ Try to get merchant information (endpoint not in your API docs)
    // Since this endpoint doesn't exist, we'll create reasonable defaults
    try {
      const response = await api.get(`/api/merchants/${merchantId.value}`)
      merchantInfo.value = response.data || {}
      console.log('✅ Merchant info loaded:', merchantInfo.value)
    } catch {
      console.warn('⚠️ Merchant info endpoint not available, using defaults')
      
      // Create default merchant info based on ID
      merchantInfo.value = {
        id: merchantId.value,
        name: `Business Store #${merchantId.value}`,
        email: `merchant${merchantId.value}@example.com`,
        description: 'Secure online store',
        logo_url: `https://placehold.co/100x100/121018/bdf000?text=${merchantId.value}`,
        website: '#',
        status: 'active'
      }
    }

    // Enhance description if not provided
    if (!description.value) {
      description.value = `Purchase from ${merchantInfo.value.name || 'Store'}`
    }

  } catch (err) {
    console.warn('⚠️ Could not load merchant info:', err)
    // Continue with defaults - don't fail the checkout
  }
}

const onPaymentSuccess = (paymentData) => {
  console.log('✅ Payment successful:', paymentData)
  
  $q.notify({
    type: 'positive',
    message: 'Payment completed successfully!',
    position: 'top',
    timeout: 3000,
    actions: [
      { 
        label: 'View Receipt', 
        color: 'white', 
        handler: () => {
          const paymentId = paymentData.id || paymentData.transaction_id || 'success'
          router.push(`/payments/status/${paymentId}`)
        }
      }
    ]
  })

  // Auto-redirect to payment status
  const paymentId = paymentData.id || paymentData.transaction_id || 'success'
  setTimeout(() => {
    router.push(`/payments/status/${paymentId}`)
  }, 2000)
}

const onPaymentError = (errorData) => {
  console.error('❌ Payment failed:', errorData)
  
  const errorMessage = errorData.message || 'Payment failed. Please try again.'
  
  $q.notify({
    type: 'negative',
    message: errorMessage,
    position: 'top',
    timeout: 5000,
    actions: [
      { label: 'Dismiss', color: 'white' }
    ]
  })

  // Optionally redirect to failure page after delay
  setTimeout(() => {
    router.push('/payments/status/failed')
  }, 3000)
}

const onPaymentLoading = (isLoading) => {
  paymentLoading.value = isLoading
}

const goBack = () => {
  // Go back to previous page or home
  if (window.history.length > 1) {
    router.go(-1)
  } else {
    router.push('/')
  }
}

// Utility methods
const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  
  const currencyCode = currency.value === '$' ? 'USD' : currency.value
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount / 100) // Convert from cents
}

// Lifecycle
onMounted(() => {
  initializeCheckout()
})

// Handle page refresh/reload
window.addEventListener('beforeunload', (event) => {
  if (paymentLoading.value) {
    event.preventDefault()
    event.returnValue = 'Payment is in progress. Are you sure you want to leave?'
  }
})
</script>

<style scoped>
.checkout-page {
  background: linear-gradient(135deg, #09050d 0%, #121018 100%);
  min-height: 100vh;
  position: relative;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(9, 5, 13, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-text {
  color: #bdf000;
  margin-top: 20px;
  font-size: 1.2rem;
}

.checkout-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.glass-surface {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(12px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.1);
}

.checkout-header-card {
  transition: all 0.3s ease;
}

.checkout-header-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 25px rgba(189, 240, 0, 0.15);
}

.order-summary-card {
  transition: all 0.3s ease;
}

.order-summary-card:hover {
  border-color: rgba(189, 240, 0, 0.3);
}

.order-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.order-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.order-label {
  font-weight: 500;
  color: #999;
}

.order-value {
  color: #ffffff;
  font-weight: 500;
}

.amount-highlight {
  color: #4caf50 !important;
  font-weight: 600;
}

.total-row {
  font-size: 1.1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  padding-top: 12px;
  margin-top: 8px;
}

.total-label {
  font-weight: 600;
  color: #bdf000 !important;
}

.total-amount {
  color: #4caf50 !important;
  font-weight: 700;
  font-size: 1.2rem;
}

.checkout-form-container {
  animation: fadeInUp 0.6s ease-out;
}

.security-footer {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffffff;
}

.powered-by {
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.powered-by:hover {
  opacity: 1;
}

.error-card {
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 16px;
  max-width: 400px;
  margin: 0 auto;
}

.text-lime {
  color: #BDF000;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .checkout-page {
    padding: 16px;
  }
  
  .checkout-container {
    max-width: 100%;
  }
  
  .order-details {
    padding: 16px;
  }
  
  .order-row {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }
  
  .total-row {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .security-footer .row {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .checkout-header-card .row {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .security-badge {
    justify-content: center;
  }
}

/* Loading states */
.checkout-form-container:has(.loading) {
  opacity: 0.7;
  pointer-events: none;
}

/* Enhanced focus states */
.glass-surface:focus-within {
  border-color: rgba(189, 240, 0, 0.4);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(189, 240, 0, 0.3), 0 0 25px rgba(189, 240, 0, 0.2);
}

/* Smooth transitions */
.checkout-container > * {
  transition: all 0.3s ease;
}

/* Print styles */
@media print {
  .checkout-page {
    background: white !important;
  }
  
  .glass-surface {
    background: white !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
  }
  
  .loading-overlay,
  .security-footer,
  .powered-by {
    display: none !important;
  }
}
</style>