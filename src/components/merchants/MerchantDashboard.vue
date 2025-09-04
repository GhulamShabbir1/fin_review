<template>
  <div class="merchant-dashboard">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots size="50px" color="lime" />
      <div class="loading-text">Loading your dashboard...</div>
    </div>

    <!-- Welcome Section -->
    <div class="welcome-section q-mb-xl">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome back, <span class="highlight">{{ user.name || 'Merchant' }}</span>!
          </h1>
          <p class="welcome-subtitle">Manage your businesses and track your performance</p>
        </div>
        
        <div class="welcome-actions">
          <q-btn 
            flat 
            color="lime" 
            icon="add_business" 
            label="Add New Business" 
            class="action-btn"
            @click="showAddBusinessDialog = true"
          />
          
          <q-btn 
            flat 
            color="blue" 
            icon="payment" 
            label="Create Payment" 
            class="action-btn payment-btn"
            disabled
          />
          
          <q-btn 
            flat 
            color="lime" 
            icon="settings" 
            label="Settings" 
            class="action-btn btn-outline"
            disabled
          />
          
          <q-btn 
            flat 
            color="purple" 
            icon="person" 
            label="Profile" 
            class="action-btn btn-outline"
            disabled
          />
          
          <q-btn
            v-if="businesses.length > 0"
            flat 
            color="teal" 
            icon="receipt" 
            label="Transactions" 
            class="action-btn btn-outline"
            disabled
          />
          
          <q-btn
            v-if="businesses.length > 0"
            flat 
            color="orange" 
            icon="file_download" 
            label="Export Data" 
            class="action-btn btn-outline"
            disabled
          />
          
          <q-btn 
            flat 
            color="red" 
            icon="logout" 
            label="Logout" 
            class="action-btn btn-danger" 
            @click="logout" 
          />
        </div>
      </div>
    </div>

    <!-- Business Overview Statistics -->
    <div class="business-overview q-mb-xl">
      <div class="row q-gutter-lg">
        <div class="col">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-header">
                <q-icon name="store" size="32px" color="lime" />
                <div class="stat-value">{{ businesses.length }}</div>
              </div>
              <div class="stat-title">Total Businesses</div>
              <div class="stat-subtitle">{{ approvedBusinessCount }} approved</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-header">
                <q-icon name="account_balance" size="32px" color="blue" />
                <div class="stat-value">{{ stripeConnectedCount }}</div>
              </div>
              <div class="stat-title">Stripe Connected</div>
              <div class="stat-subtitle">Payment processing ready</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-header">
                <q-icon name="pending" size="32px" color="orange" />
                <div class="stat-value">{{ pendingBusinessCount }}</div>
              </div>
              <div class="stat-title">Pending Approval</div>
              <div class="stat-subtitle">Under admin review</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col">
          <q-card class="stat-card">
            <q-card-section>
              <div class="stat-header">
                <q-icon name="attach_money" size="32px" color="green" />
                <div class="stat-value">${{ formatNumber(totalRevenue) }}</div>
              </div>
              <div class="stat-title">Total Revenue</div>
              <div class="stat-subtitle">This month</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Simple Analytics Section -->
    <div class="analytics-section q-mb-xl">
      <h2 class="section-title">Analytics Overview</h2>
      
      <div class="row q-gutter-lg">
        <div class="col-12 col-md-6">
          <q-card class="chart-card">
            <q-card-section>
              <h3 class="chart-title">Revenue Trend</h3>
              <div class="chart-placeholder">
                <q-icon name="trending_up" size="48px" color="lime" />
                <p>Revenue data will be displayed here</p>
              </div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col-12 col-md-6">
          <q-card class="chart-card">
            <q-card-section>
              <h3 class="chart-title">Transaction Status</h3>
              <div class="chart-placeholder">
                <q-icon name="pie_chart" size="48px" color="blue" />
                <p>Transaction data will be displayed here</p>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Business Cards Section -->
    <div class="businesses-section q-mb-xl">
      <h2 class="section-title">Your Businesses</h2>
      
      <div class="row q-gutter-lg">
        <div 
          v-for="business in businesses" 
          :key="business.id"
          class="col-12 col-md-6 col-lg-4"
        >
          <q-card class="business-card">
            <q-card-section>
              <div class="business-header">
                <q-icon name="store" size="32px" color="lime" />
                <q-chip 
                  :color="getStatusColor(business.status)"
                  :label="business.status"
                  class="status-chip"
                />
              </div>
              
              <h3 class="business-name">{{ business.name || 'Business Name' }}</h3>
              <p class="business-description">{{ business.description || 'No description available' }}</p>
              
              <div class="business-stats">
                <div class="stat-item">
                  <span class="stat-label">Type:</span>
                  <span class="stat-value">{{ business.type || 'N/A' }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Created:</span>
                  <span class="stat-value">{{ formatDate(business.created_at) }}</span>
                </div>
              </div>
            </q-card-section>
            
            <q-card-actions align="right">
              <q-btn 
                flat 
                color="lime" 
                icon="visibility" 
                label="View" 
                disabled
              />
              <q-btn 
                flat 
                color="blue" 
                icon="edit" 
                label="Edit" 
                disabled
              />
            </q-card-actions>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Transactions Section -->
    <div class="transactions-section q-mb-xl">
      <h2 class="section-title">Recent Transactions</h2>
      
      <q-card class="transactions-card">
        <q-card-section>
          <div v-if="transactions.length === 0" class="no-transactions">
            <q-icon name="receipt" size="48px" color="grey" />
            <p>No transactions found</p>
          </div>
          
          <div v-else class="transactions-list">
            <div 
              v-for="transaction in recentTransactions" 
              :key="transaction.id"
              class="transaction-item"
            >
              <div class="transaction-info">
                <div class="transaction-id">#{{ transaction.id }}</div>
                <div class="transaction-amount">${{ formatNumber(transaction.amount) }}</div>
                <div class="transaction-status">
                  <q-chip 
                    :color="getTransactionStatusColor(transaction.status)"
                    :label="transaction.status"
                    class="status-chip"
                  />
                </div>
                <div class="transaction-date">{{ formatDate(transaction.created_at) }}</div>
              </div>
              
              <div class="transaction-actions">
                <q-btn 
                  flat 
                  round 
                  dense 
                  icon="visibility" 
                  color="lime"
                  disabled
                />
                <q-btn 
                  v-if="canRefund(transaction)"
                  flat 
                  round 
                  dense 
                  icon="refresh" 
                  color="orange"
                  @click="openRefund(transaction)"
                />
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Floating Action Button -->
    <div class="floating-action">
      <q-btn
        round
        color="lime"
        icon="add"
        size="lg"
        @click="showAddBusinessDialog = true"
      />
    </div>

    <!-- Add Business Dialog -->
    <AddBusinessDialog 
      v-model="showAddBusinessDialog"
      @business-added="onBusinessAdded"
    />

    <!-- Refund Dialog -->
    <q-dialog v-model="showRefundDialog" persistent class="refund-dialog">
      <q-card style="min-width: 420px">
        <q-card-section>
          <div class="text-h6">Refund Payment</div>
          <div class="text-subtitle2 q-mt-xs">Transaction #{{ refundTargetTx?.id }}</div>
        </q-card-section>
        <q-separator />
        <q-card-section>
          <div class="refund-summary q-mb-md">
            <div>Amount: <b>${{ formatNumber(refundTargetTx?.amount || 0) }}</b></div>
            <div>Status: <q-chip :label="refundTargetTx?.status" dense /></div>
          </div>
          <q-select
            v-model="refundReason"
            :options="refundReasons"
            label="Refund reason"
            outlined
            dense
            emit-value
            map-options
          />
          <q-input
            v-model="refundNote"
            type="textarea"
            label="Note (optional)"
            outlined
            dense
            autogrow
            class="q-mt-md"
          />
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat label="Cancel" color="grey" v-close-popup :disable="refundLoading" />
          <q-btn unelevated color="orange" :loading="refundLoading" label="Refund" @click="submitRefund" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'
import AddBusinessDialog from './AddBusinessDialog.vue'
import { useTransactionsStore } from '../../store/transactions'

const router = useRouter()
const auth = useAuthStore()
const $q = useQuasar()
const transactionsStore = useTransactionsStore()

// Reactive data
const loading = ref(false)
const user = ref({})
const totalRevenue = ref(0)
const businesses = ref([])
const transactions = ref([])
const showAddBusinessDialog = ref(false)
const showRefundDialog = ref(false)
const refundTargetTx = ref(null)
const refundReason = ref('duplicate')
const refundNote = ref('')
const refundLoading = ref(false)
const refundReasons = [
  { label: 'Duplicate charge', value: 'duplicate' },
  { label: 'Customer request', value: 'customer_request' },
  { label: 'Fraudulent', value: 'fraudulent' },
  { label: 'Product not delivered', value: 'not_delivered' },
  { label: 'Other', value: 'other' }
]

// Computed properties
const approvedBusinessCount = computed(() => 
  businesses.value.filter(b => b.status === 'approved').length
)

const pendingBusinessCount = computed(() => 
  businesses.value.filter(b => b.status === 'pending').length
)

const stripeConnectedCount = computed(() => 
  businesses.value.filter(b => b.stripe_account_id).length
)

const recentTransactions = computed(() => 
  transactions.value.slice(0, 10)
)

// Utility functions
const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const getStatusColor = (status) => {
  const colors = {
    'approved': 'positive',
    'pending': 'warning',
    'rejected': 'negative'
  }
  return colors[status] || 'grey'
}

const getTransactionStatusColor = (status) => {
  const colors = {
    'completed': 'positive',
    'pending': 'warning',
    'failed': 'negative',
    'refunded': 'info'
  }
  return colors[status] || 'grey'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString()
}

const canRefund = (transaction) => {
  return transaction.status === 'completed' && !transaction.refunded
}

const openRefund = (transaction) => {
  refundTargetTx.value = transaction
  refundReason.value = 'duplicate'
  refundNote.value = ''
  showRefundDialog.value = true
}

// Actions
const logout = async () => {
  try {
    await auth.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const onBusinessAdded = (business) => {
  businesses.value.unshift(business)
  $q.notify({
    message: 'Business added successfully!',
    color: 'positive',
    icon: 'check_circle'
  })
}

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true
  try {
    // Load merchant stats
    const [businessesResponse, transactionsResponse] = await Promise.all([
      api.get('/merchant/profile'),
      api.get('/merchant/transactions')
    ])

    // Set business data
    const businessData = businessesResponse.data.data || []
    businesses.value = Array.isArray(businessData) ? businessData : [businessData]

    // Set transaction data
    const transactionList = transactionsResponse.data.data || []
    transactions.value = transactionList
    totalRevenue.value = transactionList.reduce((sum, t) => sum + (t.amount || 0), 0)

  } catch (error) {
    console.error('Error loading dashboard data:', error)
    $q.notify({
      message: 'Failed to load dashboard data',
      color: 'negative',
      icon: 'error'
    })
  } finally {
    loading.value = false
  }
}

const refreshTransactions = async () => {
  try {
    const resp = await api.get('/merchant/transactions')
    const list = resp.data.data || []
    transactions.value = list
    totalRevenue.value = list.reduce((sum, t) => sum + (t.amount || 0), 0)
  } catch (e) {
    console.error('Refresh transactions failed', e)
  }
}

const submitRefund = async () => {
  if (!refundTargetTx.value) return
  refundLoading.value = true
  try {
    await transactionsStore.refundTransaction(refundTargetTx.value.id, refundReason.value)
    $q.notify({ type: 'positive', message: 'Refund processed successfully' })
    showRefundDialog.value = false
    await refreshTransactions()
  } catch (error) {
    console.error('Refund failed', error)
    $q.notify({ type: 'negative', message: error?.response?.data?.message || 'Refund failed' })
  } finally {
    refundLoading.value = false
  }
}

// Load user data
const loadUserData = async () => {
  try {
    const response = await api.get('/auth/profile')
    user.value = response.data.data || {}
  } catch (error) {
    console.error('Error loading user data:', error)
  }
}

// Lifecycle
onMounted(async () => {
  await loadUserData()
  await loadDashboardData()
})
</script>

<style scoped>
.merchant-dashboard {
  padding: 24px;
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-text {
  color: #bdf000;
  margin-top: 16px;
  font-size: 1.1rem;
}

.welcome-section {
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.1) 0%, rgba(189, 240, 0, 0.05) 100%);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  backdrop-filter: blur(10px);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 24px;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
}

.highlight {
  color: #bdf000;
  text-shadow: 0 0 20px rgba(189, 240, 0, 0.5);
}

.welcome-subtitle {
  font-size: 1.1rem;
  color: #ccc;
  margin: 8px 0 0 0;
}

.welcome-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 12px 24px;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.btn-outline {
  border: 2px solid #bdf000;
  color: #bdf000;
}

.btn-outline:hover {
  background: #bdf000;
  color: #09050d;
}

.btn-danger {
  background: #f44336;
  color: #ffffff;
}

.btn-danger:hover {
  background: #d32f2f;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 24px;
  text-align: center;
}

.stat-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(189, 240, 0, 0.3);
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #bdf000;
}

.stat-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-subtitle {
  font-size: 0.9rem;
  color: #ccc;
}

.chart-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(189, 240, 0, 0.3);
}

.chart-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 16px;
}

.chart-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #ccc;
  text-align: center;
}

.business-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.business-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(189, 240, 0, 0.3);
}

.business-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.business-name {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 16px 0 8px 0;
}

.business-description {
  color: #ccc;
  margin-bottom: 16px;
  line-height: 1.5;
}

.business-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  color: #ccc;
  font-size: 0.9rem;
}

.stat-value {
  color: #ffffff;
  font-weight: 500;
}

.transactions-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.transactions-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(189, 240, 0, 0.3);
}

.no-transactions {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #ccc;
  text-align: center;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

.transaction-info {
  display: flex;
  align-items: center;
  gap: 24px;
  flex: 1;
}

.transaction-id {
  color: #bdf000;
  font-weight: 500;
  min-width: 80px;
}

.transaction-amount {
  color: #ffffff;
  font-weight: 600;
  font-size: 1.1rem;
  min-width: 100px;
}

.transaction-date {
  color: #ccc;
  font-size: 0.9rem;
  min-width: 100px;
}

.transaction-actions {
  display: flex;
  gap: 8px;
}

.floating-action {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000;
}

.floating-action .q-btn {
  box-shadow: 0 4px 20px rgba(189, 240, 0.3);
}

.floating-action .q-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 25px rgba(189, 240, 0.5);
}

.status-chip {
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-actions {
    justify-content: center;
  }
  
  .stat-value {
    font-size: 2rem;
  }
  
  .transaction-info {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}
</style>