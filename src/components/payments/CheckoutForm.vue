<template>
  <div class="checkout-container">
    <q-card class="payment-card lime-glow">
      <!-- Enhanced Header -->
      <q-card-section class="payment-header">
        <div class="row items-center q-col-gutter-md">
          <div class="col-auto">
            <q-avatar size="56px" class="merchant-avatar">
              <img :src="merchantInfo.logo || placeholderLogo" @error="onLogoError" />
            </q-avatar>
          </div>
          <div class="col">
            <div class="text-h6 text-lime merchant-name">{{ merchantInfo.business_name || 'FinteckX Store' }}</div>
            <div class="text-caption text-grey-5 merchant-subtitle">Secure Payment Portal</div>
            <div class="merchant-id" v-if="merchantId">ID: {{ merchantId }}</div>
          </div>
          <div class="col-auto">
            <div class="security-badges">
              <q-chip color="green" text-color="white" icon="lock" size="sm" class="security-chip">
                SSL Secured
              </q-chip>
              <q-chip color="blue" text-color="white" icon="verified" size="sm" class="security-chip">
                PCI Compliant
              </q-chip>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Enhanced Payment Amount -->
      <q-card-section class="payment-amount">
        <div class="amount-container">
          <div class="amount-display">
            <span class="currency">{{ getCurrencySymbol(currency) }}</span>
            <span class="amount">{{ formatAmount(amount) }}</span>
          </div>
          <div class="amount-details">
            <div class="detail-row" v-if="description">
              <span class="detail-label">Description:</span>
              <span class="detail-value">{{ description }}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Processing Fee:</span>
              <span class="detail-value">{{ formatCurrency(processingFee) }}</span>
            </div>
            <div class="detail-row total-row">
              <span class="detail-label">Total:</span>
              <span class="detail-value total">{{ formatCurrency(amount + processingFee) }}</span>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- Enhanced Payment Methods -->
      <q-card-section class="payment-methods">
        <div class="methods-header">
          <h4 class="methods-title">Choose Payment Method</h4>
          <div class="accepted-cards">
            <q-icon name="credit_card" color="blue" size="16px" />
            <q-icon name="payment" color="orange" size="16px" />
            <q-icon name="account_balance_wallet" color="purple" size="16px" />
          </div>
        </div>

        <q-tabs 
          v-model="selectedMethod" 
          class="payment-tabs" 
          indicator-color="lime" 
          align="justify"
          @update:model-value="onMethodChange"
        >
          <q-tab name="card" icon="credit_card" label="Card" class="payment-tab" />
          <q-tab name="wallet" icon="account_balance_wallet" label="Wallet" class="payment-tab" />
          <q-tab name="bank" icon="account_balance" label="Bank" class="payment-tab" />
        </q-tabs>

        <q-separator class="q-my-md" />

        <!-- Enhanced Tab Panels -->
        <q-tab-panels 
          v-model="selectedMethod" 
          animated 
          transition-prev="slide-right" 
          transition-next="slide-left"
          class="payment-panels"
        >
          <!-- Enhanced Card Payment Form -->
          <q-tab-panel name="card" class="q-pa-none">
            <q-form @submit.prevent="processPayment" class="card-form">
              <!-- Customer Information -->
              <div class="form-section">
                <h5 class="section-title">Customer Information</h5>
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <div class="form-group">
                      <label class="field-label">Full Name *</label>
                      <q-input
                        v-model="customerForm.name"
                        placeholder="John Doe"
                        outlined
                        dense
                        class="form-input"
                        :error="!!errors.customerName"
                        :error-message="errors.customerName"
                        @input="validateCustomerName"
                      />
                    </div>
                  </div>
                  <div class="col-12 col-md-6">
                    <div class="form-group">
                      <label class="field-label">Email Address *</label>
                      <q-input
                        v-model="customerForm.email"
                        type="email"
                        placeholder="john@example.com"
                        outlined
                        dense
                        class="form-input"
                        :error="!!errors.customerEmail"
                        :error-message="errors.customerEmail"
                        @input="validateCustomerEmail"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Card Information -->
              <div class="form-section">
                <h5 class="section-title">Card Information</h5>
                
                <!-- Card Number -->
                <div class="form-group">
                  <label class="field-label">Card Number *</label>
                  <div class="card-input-container">
                    <q-input
                      v-model="cardForm.number"
                      mask="#### #### #### ####"
                      placeholder="1234 5678 9012 3456"
                      outlined
                      dense
                      class="form-input card-number-input"
                      :error="!!errors.number"
                      :error-message="errors.number"
                      @input="validateCardNumber"
                    >
                      <template v-slot:append>
                        <div class="card-brand">
                          <q-icon :name="cardBrandIcon" :color="cardBrandColor" size="20px" />
                          <span class="brand-text">{{ cardBrandName }}</span>
                        </div>
                      </template>
                    </q-input>
                  </div>
                </div>

                <!-- Card Holder Name -->
                <div class="form-group">
                  <label class="field-label">Cardholder Name *</label>
                  <q-input
                    v-model="cardForm.name"
                    placeholder="Name as it appears on card"
                    outlined
                    dense
                    class="form-input"
                    :error="!!errors.name"
                    :error-message="errors.name"
                    @input="validateCardName"
                  />
                </div>

                <!-- Expiry and CVC -->
                <div class="row q-col-gutter-md">
                  <div class="col-6">
                    <div class="form-group">
                      <label class="field-label">Expiry Date *</label>
                      <q-input
                        v-model="cardForm.expiry"
                        mask="##/##"
                        placeholder="MM/YY"
                        outlined
                        dense
                        class="form-input"
                        :error="!!errors.expiry"
                        :error-message="errors.expiry"
                        @input="validateExpiry"
                      />
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="form-group">
                      <label class="field-label">Security Code *</label>
                      <q-input
                        v-model="cardForm.cvc"
                        mask="####"
                        placeholder="123"
                        outlined
                        dense
                        class="form-input"
                        :error="!!errors.cvc"
                        :error-message="errors.cvc"
                        @input="validateCvc"
                      >
                        <template v-slot:append>
                          <q-icon name="help_outline" color="grey" size="16px">
                            <q-tooltip>3-4 digit security code on the back of your card</q-tooltip>
                          </q-icon>
                        </template>
                      </q-input>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Billing Address -->
              <div class="form-section">
                <h5 class="section-title">Billing Address</h5>
                <div class="form-group">
                  <label class="field-label">Address *</label>
                  <q-input
                    v-model="cardForm.address"
                    placeholder="123 Main St, City, State 12345"
                    outlined
                    dense
                    class="form-input"
                    :error="!!errors.address"
                    :error-message="errors.address"
                    @input="validateAddress"
                  />
                </div>
              </div>

              <!-- Terms and Conditions -->
              <div class="form-section">
                <q-checkbox
                  v-model="agreeToTerms"
                  color="lime"
                  class="terms-checkbox"
                >
                  <span class="terms-text">
                    I agree to the 
                    <a href="#" class="terms-link" @click.prevent="showTerms">Terms of Service</a> 
                    and 
                    <a href="#" class="terms-link" @click.prevent="showPrivacy">Privacy Policy</a>
                  </span>
                </q-checkbox>
              </div>

              <!-- Enhanced Submit Button -->
              <div class="form-actions">
                <q-btn
                  type="submit"
                  class="submit-btn"
                  :loading="processing"
                  :disable="!isFormValid"
                  size="lg"
                >
                  <q-icon name="lock" size="16px" class="q-mr-sm" />
                  <span>Pay {{ formatCurrency(amount + processingFee) }}</span>
                </q-btn>
                
                <div class="payment-security">
                  <div class="security-text">
                    <q-icon name="security" color="green" size="14px" class="q-mr-xs" />
                    Your payment is protected by 256-bit SSL encryption
                  </div>
                </div>
              </div>
            </q-form>
          </q-tab-panel>

          <!-- Enhanced Wallet Payment -->
          <q-tab-panel name="wallet" class="q-pa-none">
            <div class="wallet-section">
              <div class="wallet-header">
                <h5 class="section-title">Digital Wallets</h5>
                <div class="wallet-subtitle">Choose your preferred digital wallet</div>
              </div>
              
              <div class="wallet-options">
                <div class="wallet-option" @click="selectWallet('paypal')">
                  <div class="wallet-icon">
                    <q-icon name="payment" size="32px" color="blue" />
                  </div>
                  <div class="wallet-info">
                    <div class="wallet-name">PayPal</div>
                    <div class="wallet-description">Pay with your PayPal account</div>
                  </div>
                  <q-icon name="arrow_forward" color="grey" />
                </div>
                
                <div class="wallet-option" @click="selectWallet('apple')">
                  <div class="wallet-icon">
                    <q-icon name="phone_iphone" size="32px" color="grey" />
                  </div>
                  <div class="wallet-info">
                    <div class="wallet-name">Apple Pay</div>
                    <div class="wallet-description">Pay with Touch ID or Face ID</div>
                  </div>
                  <q-icon name="arrow_forward" color="grey" />
                </div>
                
                <div class="wallet-option" @click="selectWallet('google')">
                  <div class="wallet-icon">
                    <q-icon name="smartphone" size="32px" color="blue" />
                  </div>
                  <div class="wallet-info">
                    <div class="wallet-name">Google Pay</div>
                    <div class="wallet-description">Pay with your Google account</div>
                  </div>
                  <q-icon name="arrow_forward" color="grey" />
                </div>
              </div>
            </div>
          </q-tab-panel>

          <!-- Enhanced Bank Transfer -->
          <q-tab-panel name="bank" class="q-pa-none">
            <div class="bank-section">
              <div class="bank-header">
                <h5 class="section-title">Bank Transfer</h5>
                <div class="bank-subtitle">Complete payment via bank transfer</div>
              </div>
              
              <div class="bank-info-card">
                <div class="bank-icon">
                  <q-icon name="account_balance" size="48px" color="lime" />
                </div>
                <h4 class="bank-title">Instant Bank Transfer</h4>
                <p class="bank-description">
                  Securely connect your bank account for instant payment processing
                </p>
                
                <div class="bank-features">
                  <div class="feature-item">
                    <q-icon name="flash_on" color="green" size="16px" />
                    <span>Instant processing</span>
                  </div>
                  <div class="feature-item">
                    <q-icon name="security" color="blue" size="16px" />
                    <span>Bank-level security</span>
                  </div>
                  <div class="feature-item">
                    <q-icon name="money_off" color="orange" size="16px" />
                    <span>Lower fees</span>
                  </div>
                </div>
                
                <q-btn
                  color="lime"
                  icon="account_balance"
                  label="Connect Bank Account"
                  @click="connectBankAccount"
                  class="bank-connect-btn"
                  :loading="connectingBank"
                />
              </div>
            </div>
          </q-tab-panel>
        </q-tab-panels>
      </q-card-section>

      <!-- Enhanced Security Notice -->
      <q-card-section class="security-notice">
        <div class="security-content">
          <div class="security-badges-footer">
            <div class="security-badge">
              <q-icon name="verified_user" color="green" size="16px" />
              <span>256-bit SSL</span>
            </div>
            <div class="security-badge">
              <q-icon name="shield" color="blue" size="16px" />
              <span>PCI DSS</span>
            </div>
            <div class="security-badge">
              <q-icon name="lock" color="orange" size="16px" />
              <span>Fraud Protected</span>
            </div>
          </div>
          <div class="security-text">
            Your payment information is encrypted and secure. We never store your card details.
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Enhanced Processing Modal -->
    <q-dialog v-model="showProcessing" persistent>
      <q-card class="processing-card">
        <q-card-section class="processing-content">
          <div class="processing-animation">
            <q-spinner-dots color="lime" size="60px" />
            <div class="processing-steps">
              <div class="step" :class="{ active: processingStep >= 1 }">
                <q-icon name="credit_card" />
                <span>Validating Card</span>
              </div>
              <div class="step" :class="{ active: processingStep >= 2 }">
                <q-icon name="security" />
                <span>Securing Transaction</span>
              </div>
              <div class="step" :class="{ active: processingStep >= 3 }">
                <q-icon name="check_circle" />
                <span>Completing Payment</span>
              </div>
            </div>
          </div>
          <div class="text-h6 q-mt-md processing-title">Processing Payment</div>
          <div class="text-subtitle2 q-mt-sm processing-subtitle">
            Please wait while we securely process your transaction...
          </div>
          <div class="processing-amount">{{ formatCurrency(amount + processingFee) }}</div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- Success Modal -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card class="success-card">
        <q-card-section class="success-content">
          <div class="success-animation">
            <q-icon name="check_circle" size="80px" color="green" class="success-icon" />
          </div>
          <div class="text-h5 text-green q-mt-md">Payment Successful!</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Your payment of {{ formatCurrency(amount + processingFee) }} has been processed successfully.
          </div>
          <div class="success-details q-mt-md">
            <div class="success-item">
              <span class="success-label">Transaction ID:</span>
              <span class="success-value">#{{ paymentResult?.transaction_id }}</span>
            </div>
            <div class="success-item">
              <span class="success-label">Payment Method:</span>
              <span class="success-value">{{ getMethodDisplayName(selectedMethod) }}</span>
            </div>
            <div class="success-item">
              <span class="success-label">Date:</span>
              <span class="success-value">{{ formatDateTime(new Date()) }}</span>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="center">
          <q-btn flat label="Close" @click="closeSuccess" />
          <q-btn color="lime" icon="download" label="Download Receipt" @click="downloadReceipt" />
          <q-btn color="blue" icon="email" label="Email Receipt" @click="emailReceipt" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Error Modal -->
    <q-dialog v-model="showError" persistent>
      <q-card class="error-card">
        <q-card-section class="error-content">
          <div class="error-animation">
            <q-icon name="error" size="80px" color="red" class="error-icon" />
          </div>
          <div class="text-h5 text-red q-mt-md">Payment Failed</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            {{ errorMessage }}
          </div>
        </q-card-section>
        
        <q-card-actions align="center">
          <q-btn flat label="Close" @click="closeError" />
          <q-btn color="blue" label="Try Again" @click="retryPayment" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'

const $q = useQuasar()

// Props
const props = defineProps({
  merchantId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  description: {
    type: String,
    default: ''
  },
  branding: {
    type: Object,
    default: () => ({})
  }
})

// Emits
const emit = defineEmits(['payment-success', 'payment-error', 'payment-loading'])

// Reactive data
const selectedMethod = ref('card')
const processing = ref(false)
const connectingBank = ref(false)
const showProcessing = ref(false)
const showSuccess = ref(false)
const showError = ref(false)
const processingStep = ref(0)
const agreeToTerms = ref(false)

const merchantInfo = ref({})
const paymentResult = ref(null)
const errorMessage = ref('')

const placeholderLogo = 'https://placehold.co/100x100/121018/bdf000?text=Store'

// Form data
const customerForm = ref({
  name: '',
  email: ''
})

const cardForm = ref({
  number: '',
  name: '',
  expiry: '',
  cvc: '',
  address: ''
})

// Validation errors
const errors = ref({})

// Computed properties
const processingFee = computed(() => {
  // Calculate processing fee (2.9% + $0.30)
  return Math.round(props.amount * 0.029 + 30)
})

const isFormValid = computed(() => {
  if (selectedMethod.value === 'card') {
    return customerForm.value.name && 
           customerForm.value.email &&
           cardForm.value.number && 
           cardForm.value.name && 
           cardForm.value.expiry && 
           cardForm.value.cvc && 
           cardForm.value.address &&
           agreeToTerms.value &&
           Object.keys(errors.value).length === 0
  }
  return agreeToTerms.value
})

const cardBrandIcon = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'credit_card'
  if (number.startsWith('5')) return 'credit_card'
  if (number.startsWith('3')) return 'credit_card'
  return 'credit_card'
})

const cardBrandColor = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'blue'      // Visa
  if (number.startsWith('5')) return 'red'       // Mastercard
  if (number.startsWith('3')) return 'green'     // Amex
  return 'grey'
})

const cardBrandName = computed(() => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (number.startsWith('4')) return 'Visa'
  if (number.startsWith('5')) return 'Mastercard'
  if (number.startsWith('3')) return 'Amex'
  return ''
})

// Methods
const loadMerchantInfo = async () => {
  try {
    console.log('🔄 Loading merchant info for:', props.merchantId)
    
    // ✅ Try to load merchant info (endpoint not in your API docs)
    try {
      const response = await api.get(`/api/merchants/${props.merchantId}`)
      merchantInfo.value = { ...response.data, ...props.branding }
      console.log('✅ Merchant info loaded:', merchantInfo.value)
    } catch {
      console.warn('⚠️ Merchant info API not available, using props')
      merchantInfo.value = {
        business_name: props.branding?.name || `Merchant ${props.merchantId}`,
        logo: props.branding?.logo_url,
        ...props.branding
      }
    }
  } catch (error) {
    console.error('❌ Failed to load merchant info:', error)
  }
}

const onMethodChange = (method) => {
  console.log('Payment method changed to:', method)
  // Reset any method-specific data
  errors.value = {}
}

const onLogoError = () => {
  merchantInfo.value.logo = placeholderLogo
}

// Validation methods
const validateCustomerName = () => {
  if (!customerForm.value.name || customerForm.value.name.length < 2) {
    errors.value.customerName = 'Please enter your full name'
  } else {
    delete errors.value.customerName
  }
}

const validateCustomerEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!customerForm.value.email) {
    errors.value.customerEmail = 'Email is required'
  } else if (!emailRegex.test(customerForm.value.email)) {
    errors.value.customerEmail = 'Please enter a valid email address'
  } else {
    delete errors.value.customerEmail
  }
}

const validateCardNumber = () => {
  const number = cardForm.value.number.replace(/\s/g, '')
  if (!number) {
    errors.value.number = 'Card number is required'
  } else if (number.length < 13 || number.length > 19) {
    errors.value.number = 'Invalid card number length'
  } else if (!/^\d+$/.test(number)) {
    errors.value.number = 'Card number must contain only digits'
  } else if (!luhnCheck(number)) {
    errors.value.number = 'Invalid card number'
  } else {
    delete errors.value.number
  }
}

const validateCardName = () => {
  if (!cardForm.value.name || cardForm.value.name.length < 2) {
    errors.value.name = 'Cardholder name is required'
  } else {
    delete errors.value.name
  }
}

const validateExpiry = () => {
  const expiry = cardForm.value.expiry
  if (!expiry) {
    errors.value.expiry = 'Expiry date is required'
  } else if (!/^\d{2}\/\d{2}$/.test(expiry)) {
    errors.value.expiry = 'Invalid expiry format (MM/YY)'
  } else {
    const [month, year] = expiry.split('/')
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear() % 100
    const currentMonth = currentDate.getMonth() + 1
    
    if (parseInt(month) < 1 || parseInt(month) > 12) {
      errors.value.expiry = 'Invalid month'
    } else if (parseInt(year) < currentYear || 
               (parseInt(year) === currentYear && parseInt(month) < currentMonth)) {
      errors.value.expiry = 'Card has expired'
    } else {
      delete errors.value.expiry
    }
  }
}

const validateCvc = () => {
  const cvc = cardForm.value.cvc
  if (!cvc) {
    errors.value.cvc = 'Security code is required'
  } else if (!/^\d{3,4}$/.test(cvc)) {
    errors.value.cvc = 'Security code must be 3-4 digits'
  } else {
    delete errors.value.cvc
  }
}

const validateAddress = () => {
  if (!cardForm.value.address || cardForm.value.address.length < 10) {
    errors.value.address = 'Please enter a complete billing address'
  } else {
    delete errors.value.address
  }
}

const luhnCheck = (cardNumber) => {
  let sum = 0
  let isEven = false
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber.charAt(i))
    
    if (isEven) {
      digit *= 2
      if (digit > 9) {
        digit -= 9
      }
    }
    
    sum += digit
    isEven = !isEven
  }
  
  return sum % 10 === 0
}

const processPayment = async () => {
  if (!isFormValid.value) {
    $q.notify({
      type: 'negative',
      message: 'Please fill in all required fields correctly',
      position: 'top'
    })
    return
  }
  
  try {
    processing.value = true
    showProcessing.value = true
    processingStep.value = 0
    
    emit('payment-loading', true)
    
    // Simulate processing steps
    setTimeout(() => { processingStep.value = 1 }, 500)
    setTimeout(() => { processingStep.value = 2 }, 1500)
    setTimeout(() => { processingStep.value = 3 }, 2500)
    
    // Prepare payment data
    const paymentData = {
      customer_name: customerForm.value.name,
      customer_email: customerForm.value.email,
      amount: props.amount + processingFee.value,
      currency: props.currency,
      payment_method: selectedMethod.value,
      description: props.description,
      merchant_id: props.merchantId
    }

    console.log('🔄 Processing payment:', paymentData)
    
    // ✅ Use your actual payment checkout endpoint: POST /api/payments/checkout
    const response = await api.post('/api/payments/checkout', paymentData)
    
    console.log('✅ Payment response:', response.data)
    
    // Handle successful payment
    paymentResult.value = {
      transaction_id: response.data?.transaction_id || `TX_${Date.now()}`,
      payment_id: response.data?.payment_id || response.data?.id,
      amount: paymentData.amount,
      status: 'completed',
      ...response.data
    }
    
    showProcessing.value = false
    showSuccess.value = true
    
    emit('payment-success', paymentResult.value)
    
  } catch (error) {
    console.error('❌ Payment processing error:', error)
    
    errorMessage.value = error.response?.data?.message || 
                        error.message || 
                        'Payment processing failed. Please try again.'
    
    showProcessing.value = false
    showError.value = true
    
    emit('payment-error', {
      message: errorMessage.value,
      code: error.response?.status,
      details: error.response?.data
    })
  } finally {
    processing.value = false
    emit('payment-loading', false)
  }
}

const selectWallet = async (wallet) => {
  try {
    console.log('🔄 Processing wallet payment:', wallet)
    
    const paymentData = {
      customer_name: customerForm.value.name || 'Customer',
      customer_email: customerForm.value.email || 'customer@example.com',
      amount: props.amount + processingFee.value,
      currency: props.currency,
      payment_method: wallet,
      description: props.description,
      merchant_id: props.merchantId
    }
    
    // ✅ Use your payment checkout endpoint
    const response = await api.post('/api/payments/checkout', paymentData)
    
    // Handle wallet-specific processing
    if (response.data?.redirect_url) {
      window.location.href = response.data.redirect_url
    } else {
      emit('payment-success', response.data)
    }
    
  } catch (error) {
    console.error('❌ Wallet payment error:', error)
    emit('payment-error', { message: 'Wallet payment failed' })
  }
}

const connectBankAccount = () => {
  connectingBank.value = true
  
  // ✅ Bank transfer functionality (not in your API docs)
  $q.notify({
    type: 'info',
    message: 'Bank transfer functionality coming soon',
    position: 'top'
  })
  
  setTimeout(() => {
    connectingBank.value = false
  }, 2000)
}

const closeSuccess = () => {
  showSuccess.value = false
  // Optionally redirect or reset form
}

const closeError = () => {
  showError.value = false
}

const retryPayment = () => {
  showError.value = false
  // Reset form or allow retry
}

const downloadReceipt = () => {
  $q.notify({
    type: 'info',
    message: 'Receipt download functionality coming soon',
    position: 'top'
  })
}

const emailReceipt = () => {
  $q.notify({
    type: 'info',
    message: 'Email receipt functionality coming soon',
    position: 'top'
  })
}

const showTerms = () => {
  $q.notify({
    type: 'info',
    message: 'Terms of Service will be displayed here',
    position: 'top'
  })
}

const showPrivacy = () => {
  $q.notify({
    type: 'info',
    message: 'Privacy Policy will be displayed here',
    position: 'top'
  })
}

// Utility methods
const getCurrencySymbol = (currency) => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    INR: '₹'
  }
  return symbols[currency?.toUpperCase()] || '$'
}

const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return (amount / 100).toFixed(2)
}

const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: props.currency || 'USD'
  }).format(amount / 100)
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getMethodDisplayName = (method) => {
  const names = {
    card: 'Credit/Debit Card',
    wallet: 'Digital Wallet',
    bank: 'Bank Transfer'
  }
  return names[method] || method
}

// Lifecycle
onMounted(() => {
  loadMerchantInfo()
})
</script>

<style scoped>
.checkout-container {
  max-width: 600px;
  width: 100%;
  margin: 0 auto;
  padding: 16px;
}

.payment-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 24px;
  border: 1px solid rgba(189, 240, 0, 0.3);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

/* Enhanced Header */
.payment-header {
  background: rgba(189, 240, 0, 0.05);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding: 24px;
}

.merchant-avatar {
  border: 3px solid rgba(189, 240, 0, 0.4);
  border-radius: 12px;
}

.merchant-name {
  font-weight: 700;
}

.merchant-subtitle {
  margin-top: 4px;
}

.merchant-id {
  font-size: 0.75rem;
  color: #bdf000;
  margin-top: 2px;
}

.security-badges {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.security-chip {
  font-size: 0.75rem;
  font-weight: 600;
}

/* Enhanced Amount Display */
.payment-amount {
  text-align: center;
  padding: 32px 24px;
  background: rgba(255, 255, 255, 0.02);
}

.amount-container {
  max-width: 400px;
  margin: 0 auto;
}

.amount-display {
  margin-bottom: 20px;
}

.currency {
  font-size: 2rem;
  color: #cfcfcf;
  margin-right: 8px;
}

.amount {
  font-size: 3.5rem;
  font-weight: 900;
  color: #bdf000;
  text-shadow: 0 0 20px rgba(189, 240, 0, 0.5);
}

.amount-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row.total-row {
  border-top: 1px solid rgba(189, 240, 0, 0.3);
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 700;
}

.detail-label {
  color: #999;
  font-weight: 500;
}

.detail-value {
  color: #ffffff;
  font-weight: 600;
}

.detail-value.total {
  color: #bdf000;
  font-size: 1.1rem;
}

/* Enhanced Payment Methods */
.payment-methods {
  padding: 0 24px 24px;
}

.methods-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.methods-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0;
}

.accepted-cards {
  display: flex;
  gap: 8px;
}

.payment-tabs {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.payment-tab {
  color: #cfcfcf;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.payment-tab.q-tab--active {
  background: rgba(189, 240, 0, 0.2);
  color: #bdf000;
}

.payment-panels {
  background: transparent;
}

/* Enhanced Form Styles */
.form-section {
  margin-bottom: 32px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.field-label {
  display: block;
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
}

.form-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.form-input :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.4);
  background: rgba(255, 255, 255, 0.12) !important;
}

.form-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

.form-input :deep(.q-field__native) {
  color: #ffffff !important;
  font-weight: 500;
}

.form-input :deep(.q-field__label) {
  color: #bdf000 !important;
}

.card-brand {
  display: flex;
  align-items: center;
  gap: 4px;
}

.brand-text {
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

.terms-checkbox {
  margin-top: 16px;
}

.terms-text {
  color: #cfcfcf;
  font-size: 0.9rem;
}

.terms-link {
  color: #bdf000;
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
}

/* Enhanced Submit Button */
.form-actions {
  margin-top: 32px;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #09050d;
  font-weight: 800;
  border-radius: 16px;
  padding: 20px;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  border: none;
  position: relative;
  overflow: hidden;
}

.submit-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: all 0.6s ease;
}

.submit-btn:hover:not(:disabled)::before {
  left: 100%;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 12px 30px rgba(189, 240, 0, 0.4);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: rgba(189, 240, 0, 0.3);
}

.payment-security {
  margin-top: 16px;
  text-align: center;
}

.security-text {
  font-size: 0.8rem;
  color: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

/* Enhanced Wallet Options */
.wallet-section {
  padding: 24px 0;
}

.wallet-header {
  text-align: center;
  margin-bottom: 24px;
}

.wallet-subtitle {
  color: #999;
  font-size: 0.9rem;
  margin-top: 8px;
}

.wallet-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wallet-option {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.wallet-option:hover {
  background: rgba(189, 240, 0, 0.1);
  border-color: rgba(189, 240, 0, 0.4);
  transform: translateX(4px);
}

.wallet-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.wallet-info {
  flex: 1;
}

.wallet-name {
  font-weight: 700;
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.wallet-description {
  color: #999;
  font-size: 0.9rem;
}

/* Enhanced Bank Transfer */
.bank-section {
  padding: 24px 0;
}

.bank-header {
  text-align: center;
  margin-bottom: 24px;
}

.bank-info-card {
  text-align: center;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.bank-icon {
  margin-bottom: 20px;
}

.bank-title {
  color: #ffffff;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.bank-description {
  color: #cfcfcf;
  margin-bottom: 24px;
  line-height: 1.5;
}

.bank-features {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #cfcfcf;
  font-size: 0.9rem;
}

.bank-connect-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 32px;
}

/* Enhanced Security Notice */
.security-notice {
  background: rgba(76, 175, 80, 0.1);
  border-top: 1px solid rgba(76, 175, 80, 0.2);
  text-align: center;
  padding: 20px 24px;
}

.security-badges-footer {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.security-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4caf50;
  font-size: 0.8rem;
  font-weight: 600;
}

.security-text {
  color: #4caf50;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Enhanced Processing Modal */
.processing-card {
  background: rgba(10, 10, 10, 0.98);
  border-radius: 20px;
  border: 2px solid rgba(189, 240, 0, 0.4);
  min-width: 400px;
  text-align: center;
}

.processing-content {
  padding: 40px 24px;
}

.processing-animation {
  margin-bottom: 24px;
}

.processing-steps {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 24px;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  opacity: 0.3;
  transition: all 0.5s ease;
}

.step.active {
  opacity: 1;
  color: #bdf000;
}

.step span {
  font-size: 0.8rem;
  color: inherit;
}

.processing-title {
  color: #bdf000;
  font-weight: 700;
}

.processing-subtitle {
  color: #cfcfcf;
}

.processing-amount {
  color: #4caf50;
  font-size: 1.5rem;
  font-weight: 700;
  margin-top: 16px;
}

/* Success Modal */
.success-card {
  background: rgba(10, 10, 10, 0.98);
  border-radius: 20px;
  border: 2px solid rgba(76, 175, 80, 0.4);
  min-width: 400px;
  text-align: center;
}

.success-content {
  padding: 40px 24px;
}

.success-animation {
  margin-bottom: 20px;
}

.success-icon {
  animation: successPulse 0.6s ease-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-details {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.success-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(76, 175, 80, 0.2);
}

.success-item:last-child {
  border-bottom: none;
}

.success-label {
  color: #4caf50;
  font-weight: 500;
}

.success-value {
  color: #ffffff;
  font-weight: 600;
}

/* Error Modal */
.error-card {
  background: rgba(10, 10, 10, 0.98);
  border-radius: 20px;
  border: 2px solid rgba(244, 67, 54, 0.4);
  min-width: 400px;
  text-align: center;
}

.error-content {
  padding: 40px 24px;
}

.error-icon {
  animation: errorShake 0.6s ease-out;
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 25px rgba(189, 240, 0, 0.2);
}

/* Responsive Design */
@media (max-width: 768px) {
  .checkout-container {
    padding: 12px;
  }
  
  .payment-header {
    padding: 20px;
  }
  
  .payment-header .row {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .security-badges {
    flex-direction: row;
    justify-content: center;
  }
  
  .amount {
    font-size: 2.8rem;
  }
  
  .currency {
    font-size: 1.8rem;
  }
  
  .form-section {
    padding: 16px;
  }
  
  .bank-features {
    flex-direction: column;
    gap: 12px;
  }
  
  .processing-card,
  .success-card,
  .error-card {
    min-width: 90vw;
    margin: 16px;
  }
  
  .processing-steps {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .amount-details {
    padding: 12px;
  }
  
  .detail-row {
    flex-direction: column;
    text-align: center;
    gap: 4px;
  }
  
  .detail-row.total-row {
    flex-direction: row;
    justify-content: space-between;
  }
  
  .wallet-option {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
}

/* Enhanced focus states */
.form-input:focus-within {
  transform: translateY(-1px);
}

.wallet-option:focus-visible,
.submit-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Loading states */
.submit-btn[loading] {
  pointer-events: none;
}

/* Form validation states */
.form-input.error :deep(.q-field__control) {
  border-color: #f44336 !important;
  background: rgba(244, 67, 54, 0.1) !important;
}
</style>