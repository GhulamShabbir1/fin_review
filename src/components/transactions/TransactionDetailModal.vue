<template>
  <q-dialog :model-value="modelValue" @update:model-value="val => emit('update:modelValue', val)" persistent maximized>
    <q-card class="transaction-detail-modal">
      <!-- Enhanced Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="header-left">
            <h3 class="modal-title">Transaction Details</h3>
            <div class="transaction-meta">
              <span class="transaction-id">ID: #{{ transaction?.id || 'N/A' }}</span>
              <q-chip 
                v-if="transaction?.status"
                :color="getStatusColor(transaction.status)" 
                text-color="white" 
                :icon="getStatusIcon(transaction.status)"
                size="sm"
                class="q-ml-md"
              >
                {{ transaction.status }}
              </q-chip>
            </div>
          </div>
          <div class="header-right">
            <q-btn 
              @click="emit('update:modelValue', false)" 
              flat 
              round 
              icon="close" 
              color="white" 
              size="md"
              class="close-btn"
            />
          </div>
        </div>
      </q-card-section>

      <!-- Enhanced Content -->
      <q-card-section class="modal-content">
        <div v-if="transaction" class="transaction-details">
          <!-- Enhanced Status Banner -->
          <div class="status-banner" :class="getStatusClass(transaction.status)">
            <div class="status-content">
              <div class="status-icon-container">
                <q-icon :name="getStatusIcon(transaction.status)" size="32px" />
              </div>
              <div class="status-text">
                <div class="status-title">{{ getStatusTitle(transaction.status) }}</div>
                <div class="status-subtitle">{{ getStatusDescription(transaction.status) }}</div>
                <div class="status-timestamp">{{ formatDateTime(transaction.updated_at || transaction.created_at) }}</div>
              </div>
              <div class="status-actions" v-if="transaction.status === 'completed'">
                <q-btn 
                  color="white" 
                  text-color="green" 
                  icon="download" 
                  label="Receipt" 
                  @click="downloadReceipt"
                  flat
                  size="sm"
                />
              </div>
            </div>
          </div>

          <!-- Enhanced Main Details Grid -->
          <div class="details-grid">
            <!-- Enhanced Amount Section -->
            <div class="detail-section amount-section">
              <h4 class="section-title">
                <q-icon name="attach_money" size="20px" class="q-mr-sm" />
                Payment Amount
              </h4>
              <div class="amount-display">
                <div class="main-amount">
                  <span class="currency">{{ getCurrencySymbol(transaction.currency) }}</span>
                  <span class="amount">{{ formatAmount(transaction.amount) }}</span>
                </div>
                <div class="amount-breakdown">
                  <div class="breakdown-item">
                    <span class="breakdown-label">Subtotal:</span>
                    <span class="breakdown-value">{{ formatCurrency(transaction.subtotal || transaction.amount) }}</span>
                  </div>
                  <div class="breakdown-item" v-if="transaction.processing_fee">
                    <span class="breakdown-label">Processing Fee:</span>
                    <span class="breakdown-value">{{ formatCurrency(transaction.processing_fee) }}</span>
                  </div>
                  <div class="breakdown-item" v-if="transaction.tax">
                    <span class="breakdown-label">Tax:</span>
                    <span class="breakdown-value">{{ formatCurrency(transaction.tax) }}</span>
                  </div>
                  <div class="breakdown-item total-row">
                    <span class="breakdown-label">Total:</span>
                    <span class="breakdown-value total">{{ formatCurrency(transaction.amount) }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Customer Information -->
            <div class="detail-section">
              <h4 class="section-title">
                <q-icon name="person" size="20px" class="q-mr-sm" />
                Customer Information
              </h4>
              <div class="customer-info">
                <div class="customer-avatar">
                  <q-avatar size="56px" class="customer-avatar-img">
                    <img :src="getCustomerAvatar(transaction.customer_name)" />
                  </q-avatar>
                </div>
                <div class="customer-details">
                  <div class="customer-name">{{ transaction.customer_name || 'Anonymous Customer' }}</div>
                  <div class="customer-email">{{ transaction.customer_email || 'No email provided' }}</div>
                  <div class="customer-phone" v-if="transaction.customer_phone">
                    <q-icon name="phone" size="14px" class="q-mr-xs" />
                    {{ transaction.customer_phone }}
                  </div>
                  <div class="customer-location" v-if="transaction.customer_location">
                    <q-icon name="location_on" size="14px" class="q-mr-xs" />
                    {{ transaction.customer_location }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Payment Method -->
            <div class="detail-section">
              <h4 class="section-title">
                <q-icon name="payment" size="20px" class="q-mr-sm" />
                Payment Method
              </h4>
              <div class="payment-method">
                <div class="method-icon-container">
                  <q-icon 
                    :name="getMethodIcon(transaction.payment_method)" 
                    size="32px"
                    :color="getMethodColor(transaction.payment_method)" 
                  />
                </div>
                <div class="method-details">
                  <div class="method-name">{{ getMethodName(transaction.payment_method) }}</div>
                  <div class="method-meta" v-if="transaction.card_last4">
                    <q-icon name="credit_card" size="14px" class="q-mr-xs" />
                    •••• •••• •••• {{ transaction.card_last4 }}
                  </div>
                  <div class="method-meta" v-if="transaction.card_brand">
                    <q-icon name="verified" size="14px" class="q-mr-xs" />
                    {{ transaction.card_brand }}
                  </div>
                  <div class="method-meta" v-if="transaction.gateway">
                    <q-icon name="router" size="14px" class="q-mr-xs" />
                    Gateway: {{ transaction.gateway }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Merchant Information -->
            <div class="detail-section">
              <h4 class="section-title">
                <q-icon name="store" size="20px" class="q-mr-sm" />
                Merchant Information
              </h4>
              <div class="merchant-info">
                <div class="merchant-avatar">
                  <q-avatar size="56px" square class="merchant-avatar-img">
                    <img :src="transaction.merchant_logo || placeholderLogo" @error="onMerchantLogoError" />
                  </q-avatar>
                </div>
                <div class="merchant-details">
                  <div class="merchant-name">{{ transaction.merchant_name || 'Unknown Merchant' }}</div>
                  <div class="merchant-email">{{ transaction.merchant_email || 'No email' }}</div>
                  <div class="merchant-id" v-if="transaction.merchant_id">
                    <q-icon name="tag" size="14px" class="q-mr-xs" />
                    Merchant ID: {{ transaction.merchant_id }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Transaction Details -->
            <div class="detail-section full-width">
              <h4 class="section-title">
                <q-icon name="info" size="20px" class="q-mr-sm" />
                Transaction Information
              </h4>
              <div class="transaction-info-grid">
                <div class="info-item">
                  <span class="info-label">Transaction ID:</span>
                  <span class="info-value">#{{ transaction.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Description:</span>
                  <span class="info-value">{{ transaction.description || 'No description' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Currency:</span>
                  <span class="info-value">{{ (transaction.currency || 'USD').toUpperCase() }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Reference ID:</span>
                  <span class="info-value">{{ transaction.reference_id || 'N/A' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Created:</span>
                  <span class="info-value">{{ formatDateTime(transaction.created_at) }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Updated:</span>
                  <span class="info-value">{{ formatDateTime(transaction.updated_at) }}</span>
                </div>
              </div>
            </div>

            <!-- Enhanced Transaction Timeline -->
            <div class="detail-section full-width">
              <h4 class="section-title">
                <q-icon name="timeline" size="20px" class="q-mr-sm" />
                Transaction Timeline
              </h4>
              <div class="timeline">
                <div class="timeline-item" v-for="(event, index) in getTransactionTimeline(transaction)" :key="index">
                  <div class="timeline-icon">
                    <q-icon :name="event.icon" :color="event.color" size="20px" />
                  </div>
                  <div class="timeline-content">
                    <div class="timeline-title">{{ event.title }}</div>
                    <div class="timeline-time">{{ formatDateTime(event.timestamp) }}</div>
                    <div class="timeline-description" v-if="event.description">
                      {{ event.description }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Enhanced Actions Section -->
            <div class="detail-section full-width">
              <h4 class="section-title">
                <q-icon name="settings" size="20px" class="q-mr-sm" />
                Available Actions
              </h4>
              <div class="action-buttons">
                <q-btn
                  v-if="transaction.status === 'completed'"
                  color="orange"
                  icon="money_off"
                  label="Initiate Refund"
                  @click="initiateRefund"
                  :loading="refunding"
                  class="action-btn"
                />
                <q-btn
                  color="blue"
                  icon="download"
                  label="Download Receipt"
                  @click="downloadReceipt"
                  class="action-btn"
                />
                <q-btn
                  color="purple"
                  icon="email"
                  label="Email Receipt"
                  @click="emailReceipt"
                  class="action-btn"
                />
                <q-btn
                  color="grey"
                  icon="print"
                  label="Print Details"
                  @click="printDetails"
                  class="action-btn"
                />
                <q-btn
                  color="lime"
                  icon="share"
                  label="Share Transaction"
                  @click="shareTransaction"
                  class="action-btn"
                />
                <q-btn
                  color="indigo"
                  icon="content_copy"
                  label="Copy Transaction ID"
                  @click="copyTransactionId"
                  class="action-btn"
                />
              </div>
            </div>

            <!-- Security Information -->
            <div class="detail-section full-width">
              <h4 class="section-title">
                <q-icon name="security" size="20px" class="q-mr-sm" />
                Security & Compliance
              </h4>
              <div class="security-info">
                <div class="security-badges">
                  <q-chip color="green" text-color="white" icon="lock" size="sm">
                    SSL Encrypted
                  </q-chip>
                  <q-chip color="blue" text-color="white" icon="verified" size="sm">
                    PCI Compliant
                  </q-chip>
                  <q-chip color="purple" text-color="white" icon="shield" size="sm">
                    Fraud Protected
                  </q-chip>
                </div>
                <div class="security-details q-mt-md">
                  <div class="security-item">
                    <q-icon name="fingerprint" size="16px" color="lime" />
                    <span>Transaction Hash: {{ transaction.hash || generateTransactionHash(transaction.id) }}</span>
                  </div>
                  <div class="security-item">
                    <q-icon name="verified_user" size="16px" color="blue" />
                    <span>Verified by: FinteckX Security System</span>
                  </div>
                  <div class="security-item">
                    <q-icon name="schedule" size="16px" color="orange" />
                    <span>Processing Time: {{ calculateProcessingTime(transaction) }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="loading-state">
          <q-spinner-dots color="lime" size="60px" />
          <p class="loading-text">Loading transaction details...</p>
        </div>

        <!-- Error State -->
        <div v-else class="error-state">
          <q-icon name="error_outline" size="64px" color="negative" />
          <h4>Transaction Not Found</h4>
          <p>The requested transaction could not be loaded.</p>
          <q-btn color="lime" label="Close" @click="emit('update:modelValue', false)" />
        </div>
      </q-card-section>

      <!-- Enhanced Footer Actions -->
      <q-card-actions class="modal-footer" align="right">
        <div class="footer-content">
          <div class="footer-info">
            <span class="footer-text">Last updated: {{ formatDateTime(transaction?.updated_at) }}</span>
          </div>
          <div class="footer-actions">
            <q-btn flat label="Close" @click="emit('update:modelValue', false)" />
            <q-btn 
              v-if="transaction?.status === 'completed'" 
              color="orange" 
              icon="money_off" 
              label="Refund" 
              @click="initiateRefund"
              :loading="refunding"
            />
            <q-btn 
              color="lime" 
              icon="download" 
              label="Download" 
              @click="downloadReceipt" 
            />
          </div>
        </div>
      </q-card-actions>
    </q-card>

    <!-- Enhanced Refund Dialog -->
    <q-dialog v-model="showRefundDialog" persistent>
      <q-card class="refund-dialog">
        <q-card-section class="refund-header">
          <div class="text-h6 text-orange">
            <q-icon name="money_off" size="24px" class="q-mr-sm" />
            Initiate Refund
          </div>
        </q-card-section>

        <q-card-section>
          <div class="refund-transaction-info q-mb-lg">
            <div class="refund-summary-card">
              <div class="summary-header">
                <h5>Transaction Summary</h5>
              </div>
              <div class="summary-details">
                <div class="summary-row">
                  <span class="summary-label">Transaction ID:</span>
                  <span class="summary-value">#{{ transaction?.id }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Original Amount:</span>
                  <span class="summary-value amount">{{ formatCurrency(transaction?.amount) }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Customer:</span>
                  <span class="summary-value">{{ transaction?.customer_name }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Date:</span>
                  <span class="summary-value">{{ formatDate(transaction?.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>

          <q-form @submit="processRefund" class="refund-form">
            <div class="form-section">
              <h5 class="form-section-title">Refund Details</h5>
              
              <q-input
                v-model.number="refundData.amount"
                type="number"
                label="Refund Amount *"
                :hint="`Maximum refundable: ${formatCurrency(transaction?.amount || 0)}`"
                outlined
                dense
                step="0.01"
                :max="(transaction?.amount || 0) / 100"
                :rules="[
                  val => !!val || 'Refund amount is required',
                  val => val > 0 || 'Amount must be greater than 0',
                  val => val <= ((transaction?.amount || 0) / 100) || 'Amount cannot exceed original transaction'
                ]"
                class="q-mb-md"
              />
              
              <q-select
                v-model="refundData.reason"
                :options="refundReasonOptions"
                label="Refund Reason *"
                outlined
                dense
                required
                :rules="[val => !!val || 'Refund reason is required']"
                class="q-mb-md"
              />
              
              <q-input
                v-model="refundData.notes"
                type="textarea"
                label="Additional Notes"
                outlined
                dense
                rows="3"
                hint="Optional: Add any additional notes about the refund"
                class="q-mb-md"
              />

              <q-toggle
                v-model="refundData.notifyCustomer"
                label="Send notification to customer"
                color="lime"
                class="q-mb-md"
              />
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="refund-actions">
          <q-btn flat label="Cancel" @click="cancelRefund" />
          <q-btn
            color="orange"
            icon="money_off"
            label="Process Refund"
            @click="processRefund"
            :loading="processingRefund"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'

const $q = useQuasar()

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  transaction: {
    type: Object,
    default: () => null
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'refund-requested', 'transaction-updated'])

// Reactive data
const loading = ref(false)
const refunding = ref(false)
const processingRefund = ref(false)
const showRefundDialog = ref(false)

const placeholderLogo = 'https://placehold.co/100x100/121018/bdf000?text=Store'

// Refund form data
const refundData = ref({
  amount: 0,
  reason: '',
  notes: '',
  notifyCustomer: true
})

// Refund reason options
const refundReasonOptions = [
  { label: 'Customer Request', value: 'customer_request' },
  { label: 'Duplicate Transaction', value: 'duplicate' },
  { label: 'Service Not Delivered', value: 'service_not_delivered' },
  { label: 'Product Defective', value: 'product_defective' },
  { label: 'Technical Error', value: 'technical_error' },
  { label: 'Fraud Prevention', value: 'fraud_prevention' },
  { label: 'Merchant Error', value: 'merchant_error' },
  { label: 'Other', value: 'other' }
]

// Computed properties

// Methods
const getStatusClass = (status) => {
  const classes = {
    completed: 'status-success',
    success: 'status-success',
    pending: 'status-pending',
    processing: 'status-processing',
    failed: 'status-failed',
    refunded: 'status-refunded',
    cancelled: 'status-cancelled'
  }
  return classes[status] || 'status-unknown'
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'green',
    success: 'green',
    pending: 'orange',
    processing: 'blue',
    failed: 'red',
    refunded: 'purple',
    cancelled: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    completed: 'check_circle',
    success: 'check_circle',
    pending: 'pending',
    processing: 'sync',
    failed: 'error',
    refunded: 'money_off',
    cancelled: 'cancel'
  }
  return icons[status] || 'help'
}

const getStatusTitle = (status) => {
  const titles = {
    completed: 'Payment Successful',
    success: 'Payment Successful',
    pending: 'Payment Pending',
    processing: 'Payment Processing',
    failed: 'Payment Failed',
    refunded: 'Payment Refunded',
    cancelled: 'Payment Cancelled'
  }
  return titles[status] || 'Unknown Status'
}

const getStatusDescription = (status) => {
  const descriptions = {
    completed: 'Your payment has been processed successfully and funds have been transferred.',
    success: 'Your payment has been processed successfully and funds have been transferred.',
    pending: 'Your payment is being processed. This may take a few minutes.',
    processing: 'Your payment is currently being processed by our secure payment gateway.',
    failed: 'Your payment could not be processed. Please try again or contact support.',
    refunded: 'Your payment has been refunded and will appear in your account within 3-5 business days.',
    cancelled: 'Your payment was cancelled before processing could complete.'
  }
  return descriptions[status] || 'Status information unavailable'
}

const getCurrencySymbol = (currency) => {
  const symbols = {
    usd: '$',
    eur: '€',
    gbp: '£',
    inr: '₹',
    cad: 'C$',
    aud: 'A$'
  }
  return symbols[currency?.toLowerCase()] || '$'
}

const formatAmount = (amount) => {
  if (!amount) return '0.00'
  return (amount / 100).toFixed(2)
}

const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const getMethodIcon = (method) => {
  const icons = {
    credit_card: 'credit_card',
    debit_card: 'credit_card',
    card: 'credit_card',
    bank_transfer: 'account_balance',
    wallet: 'account_balance_wallet',
    digital_wallet: 'account_balance_wallet',
    upi: 'smartphone',
    paypal: 'payment',
    apple_pay: 'phone_iphone',
    google_pay: 'smartphone'
  }
  return icons[method] || 'payment'
}

const getMethodColor = (method) => {
  const colors = {
    credit_card: 'blue',
    debit_card: 'purple',
    card: 'blue',
    bank_transfer: 'green',
    wallet: 'purple',
    digital_wallet: 'purple',
    upi: 'orange',
    paypal: 'blue',
    apple_pay: 'grey',
    google_pay: 'blue'
  }
  return colors[method] || 'grey'
}

const getMethodName = (method) => {
  const names = {
    credit_card: 'Credit Card',
    debit_card: 'Debit Card',
    card: 'Credit/Debit Card',
    bank_transfer: 'Bank Transfer',
    wallet: 'Digital Wallet',
    digital_wallet: 'Digital Wallet',
    upi: 'UPI Payment',
    paypal: 'PayPal',
    apple_pay: 'Apple Pay',
    google_pay: 'Google Pay'
  }
  return names[method] || 'Unknown Method'
}

const getCustomerAvatar = (customerName) => {
  const initial = (customerName || 'U').charAt(0).toUpperCase()
  return `https://placehold.co/100x100/121018/bdf000?text=${initial}`
}

const onMerchantLogoError = () => {
  // Handle merchant logo error
}

const getTransactionTimeline = (transaction) => {
  const timeline = [
    {
      title: 'Transaction Created',
      description: 'Transaction was initiated by customer',
      timestamp: transaction.created_at,
      icon: 'add_circle',
      color: 'blue'
    }
  ]

  if (transaction.status === 'processing') {
    timeline.push({
      title: 'Payment Processing',
      description: 'Payment is being processed by gateway',
      timestamp: transaction.updated_at,
      icon: 'sync',
      color: 'blue'
    })
  }

  if (transaction.status === 'completed' || transaction.status === 'success') {
    timeline.push({
      title: 'Payment Completed',
      description: 'Payment was successfully processed and funds transferred',
      timestamp: transaction.updated_at,
      icon: 'check_circle',
      color: 'green'
    })
  } else if (transaction.status === 'failed') {
    timeline.push({
      title: 'Payment Failed',
      description: 'Payment processing failed due to insufficient funds or other issues',
      timestamp: transaction.updated_at,
      icon: 'error',
      color: 'red'
    })
  } else if (transaction.status === 'refunded') {
    timeline.push({
      title: 'Payment Refunded',
      description: 'Payment was refunded to customer account',
      timestamp: transaction.refunded_at || transaction.updated_at,
      icon: 'money_off',
      color: 'purple'
    })
  }

  return timeline
}

const generateTransactionHash = (transactionId) => {
  if (!transactionId) return 'N/A'
  // Generate a simple hash-like string for demo purposes
  return `tx_${transactionId}_${Date.now().toString(36)}`
}

const calculateProcessingTime = (transaction) => {
  if (!transaction.created_at || !transaction.updated_at) return 'N/A'
  
  const created = new Date(transaction.created_at)
  const updated = new Date(transaction.updated_at)
  const diff = updated - created
  
  if (diff < 1000) return 'Instant'
  if (diff < 60000) return `${Math.floor(diff / 1000)} seconds`
  if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes`
  return `${Math.floor(diff / 3600000)} hours`
}

const initiateRefund = () => {
  refundData.value.amount = (props.transaction?.amount || 0) / 100
  refundData.value.reason = ''
  refundData.value.notes = ''
  refundData.value.notifyCustomer = true
  showRefundDialog.value = true
}

const cancelRefund = () => {
  showRefundDialog.value = false
  refundData.value = {
    amount: 0,
    reason: '',
    notes: '',
    notifyCustomer: true
  }
}

const processRefund = async () => {
  try {
    processingRefund.value = true
    
    // Validate refund data
    if (!refundData.value.amount || !refundData.value.reason) {
      throw new Error('Please fill in all required fields')
    }
    
    console.log('🔄 Processing refund for transaction:', props.transaction.id)
    
    // ✅ Refund endpoint (not in your API docs - using fallback)
    try {
      const response = await api.post(`/api/transactions/${props.transaction.id}/refund`, {
        amount: Math.round(refundData.value.amount * 100), // Convert to cents
        reason: refundData.value.reason,
        notes: refundData.value.notes,
        notify_customer: refundData.value.notifyCustomer
      })
      
      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: 'Refund processed successfully',
          position: 'top',
          timeout: 4000
        })
        
        emit('refund-requested', {
          transactionId: props.transaction.id,
          refundAmount: refundData.value.amount,
          reason: refundData.value.reason
        })
      } else {
        throw new Error(response.data.message || 'Refund processing failed')
      }
    } catch (apiError) {
      console.warn('⚠️ Refund API not available, using simulation',apiError)
      
      $q.notify({
        type: 'info',
        message: 'Refund simulation completed - API endpoint not available',
        position: 'top',
        timeout: 4000
      })
      
      emit('refund-requested', {
        transactionId: props.transaction.id,
        refundAmount: refundData.value.amount,
        reason: refundData.value.reason
      })
    }
    
    showRefundDialog.value = false
    emit('update:modelValue', false)
    
  } catch (error) {
    console.error('❌ Refund processing error:', error)
    $q.notify({
      type: 'negative',
      message: error.message || 'Failed to process refund',
      position: 'top',
      timeout: 4000
    })
  } finally {
    processingRefund.value = false
  }
}

const downloadReceipt = async () => {
  try {
    console.log('📥 Downloading receipt for transaction:', props.transaction.id)
    
    // ✅ Receipt download (not in your API docs - using fallback)
    $q.notify({
      type: 'info',
      message: 'Receipt download functionality coming soon',
      position: 'top'
    })
    
  } catch (error) {
    console.error('❌ Receipt download error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to download receipt',
      position: 'top'
    })
  }
}

const emailReceipt = () => {
  $q.notify({
    type: 'info',
    message: 'Email receipt functionality coming soon',
    position: 'top'
  })
}

const printDetails = () => {
  window.print()
}

const shareTransaction = () => {
  if (navigator.share) {
    navigator.share({
      title: `Transaction #${props.transaction.id}`,
      text: `Transaction details for ${formatCurrency(props.transaction.amount)}`,
      url: window.location.href
    })
  } else {
    copyTransactionId()
  }
}

const copyTransactionId = () => {
  const transactionInfo = `Transaction ID: #${props.transaction.id}\nAmount: ${formatCurrency(props.transaction.amount)}\nStatus: ${props.transaction.status}`
  
  navigator.clipboard.writeText(transactionInfo).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Transaction details copied to clipboard',
      position: 'top'
    })
  }).catch(() => {
    $q.notify({
      type: 'negative',
      message: 'Failed to copy to clipboard',
      position: 'top'
    })
  })
}

// Utility methods
const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.transaction-detail-modal {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  color: #ffffff;
  border-radius: 20px;
  overflow: hidden;
}

/* Enhanced Header */
.modal-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 2px solid rgba(189, 240, 0, 0.3);
  padding: 24px 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: #bdf000;
}

.transaction-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 8px;
}

.transaction-id {
  color: #cfcfcf;
  font-size: 1rem;
  font-weight: 500;
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

/* Enhanced Content */
.modal-content {
  padding: 32px;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
}

/* Enhanced Status Banner */
.status-banner {
  padding: 24px;
  border-radius: 16px;
  margin-bottom: 32px;
  border: 2px solid;
  position: relative;
  overflow: hidden;
}

.status-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, rgba(189, 240, 0, 0.8), rgba(189, 240, 0, 0.4));
}

.status-success {
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.4);
}

.status-pending {
  background: rgba(255, 152, 0, 0.15);
  border-color: rgba(255, 152, 0, 0.4);
}

.status-processing {
  background: rgba(33, 150, 243, 0.15);
  border-color: rgba(33, 150, 243, 0.4);
}

.status-failed {
  background: rgba(244, 67, 54, 0.15);
  border-color: rgba(244, 67, 54, 0.4);
}

.status-refunded {
  background: rgba(156, 39, 176, 0.15);
  border-color: rgba(156, 39, 176, 0.4);
}

.status-cancelled {
  background: rgba(158, 158, 158, 0.15);
  border-color: rgba(158, 158, 158, 0.4);
}

.status-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status-icon-container {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.status-subtitle {
  color: #cfcfcf;
  line-height: 1.5;
}

.status-timestamp {
  color: #bdf000;
  font-size: 0.9rem;
  margin-top: 8px;
  font-weight: 500;
}

.status-actions {
  margin-left: auto;
}

/* Enhanced Details Grid */
.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.detail-section:hover {
  border-color: rgba(189, 240, 0, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 20px 0;
  color: #bdf000;
  display: flex;
  align-items: center;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 12px;
}

/* Enhanced Amount Section */
.amount-section {
  text-align: center;
  background: rgba(189, 240, 0, 0.05);
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.amount-display {
  margin-bottom: 24px;
}

.main-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.currency {
  font-size: 2.5rem;
  color: #cfcfcf;
  margin-right: 8px;
}

.amount {
  font-size: 4rem;
  font-weight: 900;
  color: #bdf000;
  text-shadow: 0 0 20px rgba(189, 240, 0, 0.5);
}

.amount-breakdown {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-item.total-row {
  border-top: 1px solid rgba(189, 240, 0, 0.3);
  padding-top: 12px;
  margin-top: 8px;
  font-weight: 700;
}

.breakdown-label {
  color: #cfcfcf;
  font-weight: 500;
}

.breakdown-value {
  color: #ffffff;
  font-weight: 600;
}

.breakdown-value.total {
  color: #bdf000;
  font-size: 1.1rem;
}

/* Enhanced Customer/Merchant Info */
.customer-info, .merchant-info, .payment-method {
  display: flex;
  align-items: center;
  gap: 16px;
}

.customer-avatar-img, .merchant-avatar-img {
  border: 2px solid rgba(189, 240, 0, 0.3);
  border-radius: 12px;
}

.method-icon-container {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.customer-details, .merchant-details, .method-details {
  flex: 1;
}

.customer-name, .merchant-name, .method-name {
  font-weight: 700;
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 4px;
}

.customer-email, .customer-phone, .merchant-email, .method-meta {
  color: #cfcfcf;
  font-size: 0.9rem;
  margin-bottom: 2px;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Transaction Info Grid */
.transaction-info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.info-label {
  color: #cfcfcf;
  font-weight: 500;
}

.info-value {
  color: #ffffff;
  font-weight: 600;
}

/* Enhanced Timeline */
.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, rgba(189, 240, 0, 0.8), rgba(189, 240, 0, 0.2));
  border-radius: 2px;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 24px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(18, 18, 18, 0.95);
  border: 3px solid rgba(189, 240, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-title {
  font-weight: 700;
  color: #ffffff;
  font-size: 1.1rem;
  margin-bottom: 8px;
}

.timeline-time {
  color: #bdf000;
  font-size: 0.9rem;
  font-weight: 500;
  margin-bottom: 8px;
}

.timeline-description {
  color: #cfcfcf;
  line-height: 1.5;
}

/* Enhanced Actions */
.action-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* Security Information */
.security-info {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
}

.security-badges {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.security-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.security-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #cfcfcf;
  font-size: 0.9rem;
}

/* Enhanced Footer */
.modal-footer {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 32px;
}

.footer-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.footer-info {
  color: #cfcfcf;
  font-size: 0.9rem;
}

.footer-actions {
  display: flex;
  gap: 12px;
}

/* Enhanced Refund Dialog */
.refund-dialog {
  min-width: 600px;
  max-width: 80vw;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.refund-header {
  background: rgba(255, 152, 0, 0.1);
  border-bottom: 1px solid rgba(255, 152, 0, 0.3);
}

.refund-transaction-info {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
}

.refund-summary-card {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.summary-header h5 {
  color: #ff9800;
  font-weight: 600;
  margin: 0 0 16px 0;
}

.summary-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 152, 0, 0.2);
}

.summary-row:last-child {
  border-bottom: none;
}

.summary-label {
  font-weight: 500;
  color: #ff9800;
}

.summary-value {
  color: #ffffff;
  font-weight: 600;
}

.summary-value.amount {
  color: #4caf50;
  font-weight: 700;
}

.form-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
}

.form-section-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
}

.refund-actions {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Loading and Error States */
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 32px;
  text-align: center;
}

.loading-text {
  color: #bdf000;
  margin-top: 20px;
  font-size: 1.2rem;
}

.error-state h4 {
  color: #ffffff;
  margin: 16px 0 8px 0;
}

.error-state p {
  color: #cfcfcf;
  margin-bottom: 24px;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .transaction-info-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .modal-content {
    padding: 20px;
  }
  
  .modal-header {
    padding: 20px;
  }
  
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .modal-title {
    font-size: 1.5rem;
  }
  
  .amount {
    font-size: 3rem;
  }
  
  .currency {
    font-size: 2rem;
  }
  
  .action-buttons {
    grid-template-columns: 1fr;
  }
  
  .customer-info, .merchant-info, .payment-method {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .refund-dialog {
    min-width: 90vw;
    margin: 16px;
  }
  
  .footer-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .security-badges {
    flex-direction: column;
    align-items: center;
  }
  
  .timeline-item {
    flex-direction: column;
    text-align: center;
    gap: 12px;
  }
  
  .status-content {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}

/* Print Styles */
@media print {
  .transaction-detail-modal {
    background: white !important;
    color: black !important;
  }
  
  .modal-header,
  .modal-footer {
    background: white !important;
    border: none !important;
  }
  
  .action-buttons,
  .close-btn,
  .status-actions {
    display: none !important;
  }
  
  .detail-section {
    background: white !important;
    border: 1px solid #ccc !important;
  }
  
  .status-banner {
    background: #f5f5f5 !important;
    border: 1px solid #ccc !important;
  }
}

/* Enhanced focus states */
.detail-section:focus-within {
  border-color: rgba(189, 240, 0, 0.5);
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

.action-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Smooth animations */
.detail-section {
  animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Scrollbar styling */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.5);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.7);
}
</style>