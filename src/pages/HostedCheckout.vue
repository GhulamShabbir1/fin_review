<template>
  <q-page class="q-pa-md hosted-checkout-page">
    <div class="q-mx-auto checkout-container" style="max-width: 520px;">
      <!-- Loading State -->
      <div v-if="loading" class="loading-overlay">
        <q-spinner-dots color="lime" size="60px" />
        <p class="loading-text">Loading checkout...</p>
      </div>

      <!-- Main Checkout Card -->
      <q-card class="glass-card elevated-hover checkout-card">
        <!-- Merchant Header -->
        <q-card-section class="merchant-header">
          <div class="row items-center">
            <q-avatar square size="48px" class="q-mr-md merchant-logo">
              <img :src="branding.logo_url || defaultLogo" @error="onLogoError" />
            </q-avatar>
            <div class="merchant-info">
              <div class="text-h6 text-white merchant-name">{{ branding.name || 'Merchant Store' }}</div>
              <div class="text-caption text-grey-5">Secure Checkout</div>
            </div>
            <q-space />
            <q-chip color="green" text-color="white" icon="lock" size="sm">
              Secure
            </q-chip>
          </div>
        </q-card-section>

        <q-separator color="rgba(189, 240, 0, 0.2)" />

        <!-- Order Summary -->
        <q-card-section class="order-summary">
          <div class="text-h6 text-lime q-mb-md">Order Summary</div>
          <div class="order-details">
            <div class="order-item">
              <span class="item-label">Description:</span>
              <span class="item-value">{{ description || 'Secure Purchase' }}</span>
            </div>
            <div class="order-item">
              <span class="item-label">Amount:</span>
              <span class="item-value amount">{{ formatCurrency(amount) }}</span>
            </div>
            <div class="order-item">
              <span class="item-label">Currency:</span>
              <span class="item-value">{{ currency || 'USD' }}</span>
            </div>
            <div class="order-item">
              <span class="item-label">Merchant ID:</span>
              <span class="item-value">#{{ merchantId }}</span>
            </div>
          </div>
        </q-card-section>

        <q-separator color="rgba(189, 240, 0, 0.2)" />

        <!-- Checkout Form -->
        <q-card-section class="checkout-form-section">
          <CheckoutForm
            :merchant-id="merchantId"
            :amount="amount"
            :currency="currency"
            :description="description"
            :branding="branding"
            @payment-success="onPaymentSuccess"
            @payment-error="onPaymentError"
          />
        </q-card-section>

        <!-- Security Footer -->
        <q-card-section class="security-footer">
          <div class="row items-center justify-center q-gutter-md">
            <div class="security-item">
              <q-icon name="lock" color="green" size="16px" />
              <span class="text-caption text-grey-5">SSL Encrypted</span>
            </div>
            <div class="security-item">
              <q-icon name="verified" color="blue" size="16px" />
              <span class="text-caption text-grey-5">PCI Compliant</span>
            </div>
            <div class="security-item">
              <q-icon name="shield" color="orange" size="16px" />
              <span class="text-caption text-grey-5">Fraud Protected</span>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Powered By Footer -->
      <div class="powered-by q-mt-md text-center">
        <div class="text-caption text-grey-6">
          Powered by <span class="text-lime">FinteckX</span> • Secure Payment Processing
        </div>
      </div>

      <!-- Error State -->
      <q-card v-if="error" class="error-card q-mt-md">
        <q-card-section>
          <div class="text-negative text-center">
            <q-icon name="error" size="24px" class="q-mb-sm" />
            <div class="text-subtitle2">{{ error }}</div>
            <q-btn flat color="negative" label="Try Again" @click="retryLoad" class="q-mt-sm" />
          </div>
        </q-card-section>
      </q-card>
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
const branding = ref({})
const merchantId = ref('')
const amount = ref(0)
const currency = ref('USD')
const description = ref('')

// Default values
const defaultLogo = 'https://placehold.co/100x100/121018/bdf000?text=Store'

// Methods
const loadCheckoutData = async () => {
  try {
    loading.value = true
    error.value = ''

    // Extract parameters
    merchantId.value = String(route.params.merchantId || '')
    amount.value = parseInt(route.query.amount) || 10000 // Default $100.00 in cents
    currency.value = String(route.query.currency || 'USD').toUpperCase()
    description.value = String(route.query.description || 'Secure purchase')

    console.log('🔄 Loading checkout for merchant:', merchantId.value)

    if (merchantId.value) {
      try {
        // ✅ Try to get merchant branding (endpoint not in your API docs)
        // This endpoint doesn't exist in your API, so we'll use fallback
        const response = await api.get(`/api/checkout/${merchantId.value}`)
        branding.value = response.data || {}
        console.log('✅ Merchant branding loaded:', branding.value)
      } catch {
        console.warn('⚠️ Merchant branding endpoint not available, using defaults')
        // Create default branding
        branding.value = {
          name: `Merchant ${merchantId.value}`,
          logo_url: defaultLogo,
          theme_color: '#BDF000',
          description: 'Secure online store'
        }
      }
    } else {
      throw new Error('Merchant ID is required')
    }

  } catch (err) {
    console.error('❌ Failed to load checkout data:', err)
    error.value = err.message || 'Failed to load checkout information'
  } finally {
    loading.value = false
  }
}

const retryLoad = () => {
  loadCheckoutData()
}

const onLogoError = () => {
  branding.value.logo_url = defaultLogo
}

const onPaymentSuccess = (paymentData) => {
  console.log('✅ Payment successful:', paymentData)
  
  $q.notify({
    type: 'positive',
    message: 'Payment completed successfully!',
    position: 'top',
    timeout: 3000
  })

  // Redirect to payment status page
  const paymentId = paymentData.id || paymentData.transaction_id || 'success'
  setTimeout(() => {
    router.push(`/payments/status/${paymentId}`)
  }, 1500)
}

const onPaymentError = (errorData) => {
  console.error('❌ Payment failed:', errorData)
  
  $q.notify({
    type: 'negative',
    message: errorData.message || 'Payment failed. Please try again.',
    position: 'top',
    timeout: 4000
  })

  // Optionally redirect to failure page
  setTimeout(() => {
    router.push('/payments/status/failed')
  }, 2000)
}

// Utility methods
const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.value || 'USD'
  }).format(amount / 100) // Convert from cents
}

// Lifecycle
onMounted(() => {
  loadCheckoutData()
})
</script>

<style scoped>
.hosted-checkout-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  position: relative;
}

.checkout-container {
  position: relative;
  z-index: 1;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.95);
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

.glass-card {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 20px;
  backdrop-filter: blur(12px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 30px rgba(189, 240, 0, 0.15);
}

.elevated-hover {
  transition: all 0.3s ease;
}

.elevated-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 40px rgba(189, 240, 0, 0.2);
}

.checkout-card {
  overflow: hidden;
}

.merchant-header {
  background: rgba(189, 240, 0, 0.05);
  padding: 24px;
}

.merchant-logo {
  border-radius: 8px;
  border: 2px solid rgba(189, 240, 0, 0.3);
  overflow: hidden;
}

.merchant-info .merchant-name {
  font-weight: 600;
  margin: 0;
}

.order-summary {
  padding: 24px;
}

.order-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.order-item:last-child {
  border-bottom: none;
}

.item-label {
  font-weight: 500;
  color: #999;
}

.item-value {
  color: #ffffff;
  font-weight: 500;
}

.item-value.amount {
  color: #4caf50;
  font-weight: 700;
  font-size: 1.1rem;
}

.checkout-form-section {
  padding: 24px;
}

.security-footer {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 4px;
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
  border-radius: 12px;
}

.text-lime {
  color: #BDF000;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hosted-checkout-page {
    padding: 16px;
  }
  
  .checkout-container {
    max-width: 100% !important;
  }
  
  .merchant-header {
    padding: 16px;
  }
  
  .order-summary,
  .checkout-form-section {
    padding: 16px;
  }
  
  .merchant-header .row {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .order-item {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }
}

@media (max-width: 480px) {
  .security-footer .row {
    flex-direction: column;
    gap: 8px;
  }
  
  .security-item {
    justify-content: center;
  }
}

/* Enhanced focus states */
.glass-card:focus-within {
  border-color: rgba(189, 240, 0, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.2);
}

/* Animation for loading */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.loading-overlay .loading-text {
  animation: pulse 2s infinite;
}
</style>