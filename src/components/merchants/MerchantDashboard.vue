<template>
  <div class="merchant-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="50px" />
      <p class="loading-text">Loading your dashboard...</p>
    </div>

    <!-- Welcome Section with Logout -->
    <div class="welcome-section q-mb-xl animate-fade-in">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome back, <span class="highlight">{{ user.name || 'Merchant' }}</span>! 👋
          </h1>
          <p class="welcome-subtitle">
            Here's what's happening with your business today
          </p>
        </div>
        <div class="welcome-actions">
          <!-- Add Business Button -->
          <q-btn
            v-if="!profile.business_name"
            color="lime"
            icon="add_business"
            label="Add Business"
            class="action-btn btn-primary"
            @click="addBusiness"
          />
          <!-- New Transaction Button -->
          <q-btn
            v-else
            color="lime"
            icon="add"
            label="New Transaction"
            class="action-btn btn-primary"
            @click="createTransaction"
          />
          <!-- Settings Button -->
          <q-btn
            flat
            color="lime"
            icon="settings"
            label="Settings"
            class="action-btn btn-outline"
            @click="openSettings"
          />
          <!-- Logout Button -->
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

    <!-- KPI Cards -->
    <TopKpiCards :kpis="kpiData" class="animate-fade-in" style="animation-delay: 0.1s" />

    <!-- Main Content Grid -->
    <div class="dashboard-grid">
      <!-- Status and Profile Section -->
      <div class="left-column">
        <!-- Status Card -->
        <MerchantStatusCard 
          :status="merchantStatus" 
          :progress="onboardingProgress"
          :show-actions="true"
          :merchant-id="user.id"
          class="animate-fade-in"
          style="animation-delay: 0.2s"
          @status-updated="onStatusUpdated"
        />

        <!-- Profile Overview -->
        <div class="profile-card animate-fade-in" style="animation-delay: 0.3s">
          <div class="card-header">
            <h3 class="card-title">Business Profile</h3>
            <q-btn flat round dense icon="edit" color="lime" @click="editProfile" class="edit-btn" />
          </div>
          
          <div class="profile-content">
            <div class="profile-avatar">
              <q-avatar size="80px" square class="avatar-image">
                <img :src="profile.logo_url || placeholderLogo" alt="Business Logo" @error="onLogoError" />
              </q-avatar>
              <div class="avatar-ring"></div>
            </div>
            
            <div class="profile-details">
              <h4 class="business-name">{{ profile.business_name || 'No Business Added' }}</h4>
              <p class="business-email">{{ profile.email || user.email || 'business@example.com' }}</p>
              <p class="business-website">{{ profile.website || 'No website' }}</p>
              
              <div class="profile-stats">
                <div class="stat-item">
                  <span class="stat-value">{{ profileStats.transactions || 0 }}</span>
                  <span class="stat-label">Transactions</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ profileStats.customers || 0 }}</span>
                  <span class="stat-label">Customers</span>
                </div>
                <div class="stat-item">
                  <span class="stat-value">{{ profileStats.rating || '4.8' }}</span>
                  <span class="stat-label">Rating</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Add Business CTA if no business -->
          <div v-if="!profile.business_name" class="add-business-cta">
            <q-icon name="store" size="48px" color="lime" />
            <h4>Start Your Business Journey</h4>
            <p>Add your business details to get started with payments</p>
            <q-btn color="lime" label="Add Business Now" @click="addBusiness" />
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="right-column">
        <!-- Revenue Chart -->
        <div class="chart-card animate-fade-in" style="animation-delay: 0.4s">
          <div class="card-header">
            <h3 class="card-title">Revenue Overview</h3>
            <div class="chart-actions">
              <q-btn flat round dense icon="refresh" color="lime" @click="refreshChart" class="refresh-btn" />
              <q-btn flat round dense icon="more_vert" color="lime" />
            </div>
          </div>
          <div class="chart-container">
            <div v-if="revenueData.length > 0" class="simple-chart">
              <div class="chart-bars">
                <div v-for="(item, index) in revenueData.slice(0, 6)" :key="index" class="chart-bar">
                  <div class="bar-value">${{ formatNumber(item.revenue || 0) }}</div>
                  <div 
                    class="bar-fill" 
                    :style="{ height: getBarHeight(item.revenue || 0) }"
                  ></div>
                  <div class="bar-label">{{ item.month || `M${index + 1}` }}</div>
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">
              <q-icon name="analytics" size="48px" color="grey-5" />
              <p>No revenue data available</p>
            </div>
          </div>
        </div>

        <!-- Transaction Methods Chart -->
        <div class="chart-card animate-fade-in" style="animation-delay: 0.5s">
          <div class="card-header">
            <h3 class="card-title">Payment Methods</h3>
            <div class="chart-actions">
              <q-btn flat round dense icon="refresh" color="lime" @click="refreshMethodsChart" class="refresh-btn" />
            </div>
          </div>
          <div class="chart-container">
            <div v-if="methodsData.length > 0" class="methods-chart">
              <div v-for="method in methodsData.slice(0, 4)" :key="method.label" class="method-item">
                <div class="method-info">
                  <div class="method-name">{{ method.label }}</div>
                  <div class="method-value">{{ method.value }}%</div>
                </div>
                <div class="method-bar">
                  <div 
                    class="method-fill" 
                    :style="{ width: method.value + '%', backgroundColor: method.color }"
                  ></div>
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">
              <q-icon name="payment" size="48px" color="grey-5" />
              <p>No payment method data</p>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="transactions-card animate-fade-in" style="animation-delay: 0.6s">
          <div class="card-header">
            <h3 class="card-title">Recent Transactions</h3>
            <q-btn flat round dense icon="visibility" color="lime" @click="viewAllTransactions" class="view-all-btn" />
          </div>
          <div class="transactions-list">
            <div v-if="recentTransactions.length === 0" class="no-transactions">
              <q-icon name="receipt" size="48px" color="grey-5" />
              <p>No transactions yet</p>
              <q-btn v-if="profile.business_name" color="lime" label="Create First Transaction" @click="createTransaction" />
            </div>
            <div v-else v-for="transaction in recentTransactions" :key="transaction.id" class="transaction-item">
              <div class="transaction-info">
                <div class="customer-name">{{ transaction.customer_name || 'Customer' }}</div>
                <div class="transaction-date">{{ formatDate(transaction.created_at) }}</div>
              </div>
              <div class="transaction-amount">
                <span class="amount">{{ formatCurrency(transaction.amount) }}</span>
                <q-chip :color="getStatusColor(transaction.status)" :label="transaction.status" size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Additional Charts Section -->
    <div class="charts-section q-mt-xl animate-fade-in" style="animation-delay: 0.7s">
      <h3 class="section-title">Business Analytics</h3>
      <div class="charts-grid">
        <!-- Customer Growth Chart -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">Customer Growth</h3>
          </div>
          <div class="chart-container">
            <div v-if="customerData.length > 0" class="simple-chart">
              <div class="chart-bars">
                <div v-for="(item, index) in customerData.slice(0, 6)" :key="index" class="chart-bar">
                  <div class="bar-value">{{ item.customers || 0 }}</div>
                  <div 
                    class="bar-fill customer-bar" 
                    :style="{ height: getBarHeight(item.customers || 0) }"
                  ></div>
                  <div class="bar-label">{{ item.month || `M${index + 1}` }}</div>
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">
              <q-icon name="people" size="48px" color="grey-5" />
              <p>No customer data available</p>
            </div>
          </div>
        </div>

        <!-- Transaction Trends Chart -->
        <div class="chart-card">
          <div class="card-header">
            <h3 class="card-title">Transaction Trends</h3>
          </div>
          <div class="chart-container">
            <div v-if="trendsData.length > 0" class="simple-chart">
              <div class="chart-bars">
                <div v-for="(item, index) in trendsData.slice(0, 6)" :key="index" class="chart-bar">
                  <div class="bar-value">{{ item.count || 0 }}</div>
                  <div 
                    class="bar-fill trends-bar" 
                    :style="{ height: getBarHeight(item.count || 0) }"
                  ></div>
                  <div class="bar-label">{{ item.month || `M${index + 1}` }}</div>
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">
              <q-icon name="trending_up" size="48px" color="grey-5" />
              <p>No trend data available</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions Grid -->
    <div class="actions-section q-mt-xl animate-fade-in" style="animation-delay: 0.8s">
      <h3 class="section-title">Quick Actions</h3>
      <div class="actions-grid">
        <div class="action-item" @click="viewAnalytics">
          <div class="action-icon">
            <q-icon name="analytics" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">View Analytics</h4>
            <p class="action-description">Check your business performance metrics</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="generateInvoice">
          <div class="action-icon">
            <q-icon name="receipt_long" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Generate Invoice</h4>
            <p class="action-description">Create professional invoices for customers</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="exportData">
          <div class="action-icon">
            <q-icon name="download" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Export Data</h4>
            <p class="action-description">Download your business reports</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>

        <div class="action-item" @click="contactSupport">
          <div class="action-icon">
            <q-icon name="support_agent" size="24px" color="lime" />
          </div>
          <div class="action-content">
            <h4 class="action-title">Get Support</h4>
            <p class="action-description">Contact our support team</p>
          </div>
          <q-icon name="arrow_forward" class="action-arrow" color="lime" />
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-message q-mt-lg">
      <q-banner class="text-white bg-negative">
        {{ error }}
        <template v-slot:action>
          <q-btn flat color="white" label="Retry" @click="loadDashboardData" />
        </template>
      </q-banner>
    </div>

    <!-- Add Business Dialog -->
    <q-dialog v-model="showAddBusinessDialog" persistent>
      <q-card class="add-business-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add Your Business</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitBusiness" class="q-gutter-md">
            <q-input
              v-model="newBusiness.business_name"
              label="Business Name *"
              filled
              required
              :rules="[val => !!val || 'Business name is required']"
            />
            
            <q-input
              v-model="newBusiness.website"
              label="Website"
              filled
              type="url"
              hint="Optional: Your business website"
            />
            
            <q-input
              v-model="newBusiness.bank_account_name"
              label="Bank Account Name *"
              filled
              required
              :rules="[val => !!val || 'Bank account name is required']"
            />
            
            <q-input
              v-model="newBusiness.bank_account_number"
              label="Bank Account Number *"
              filled
              required
              :rules="[val => !!val || 'Bank account number is required']"
            />
            
            <q-input
              v-model="newBusiness.bank_name"
              label="Bank Name *"
              filled
              required
              :rules="[val => !!val || 'Bank name is required']"
            />
            
            <q-input
              v-model="newBusiness.bank_routing_number"
              label="Bank Routing Number *"
              filled
              required
              :rules="[val => !!val || 'Bank routing number is required']"
            />
            
            <q-input
              v-model="newBusiness.business_address"
              label="Business Address"
              filled
              type="textarea"
              hint="Optional: Your business address"
            />
            
            <q-input
              v-model="newBusiness.business_phone"
              label="Business Phone"
              filled
              hint="Optional: Your business phone number"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Add Business" @click="submitBusiness" :loading="submittingBusiness" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'
import TopKpiCards from '../stats/TopKpiCards.vue'
import MerchantStatusCard from './MerchantStatusCard.vue'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const error = ref('')
const profile = ref({})
const profileStats = ref({})
const revenueData = ref([])
const methodsData = ref([])
const customerData = ref([])
const trendsData = ref([])
const recentTransactions = ref([])

// Add Business Dialog
const showAddBusinessDialog = ref(false)
const submittingBusiness = ref(false)
const newBusiness = ref({
  business_name: '',
  website: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_name: '',
  bank_routing_number: '',
  business_address: '',
  business_phone: ''
})

// Computed properties
const user = computed(() => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : { name: 'Merchant', email: 'merchant@example.com' }
  } catch {
    return { name: 'Merchant', email: 'merchant@example.com' }
  }
})

const merchantStatus = computed(() => profile.value.status || 'pending')

const onboardingProgress = computed(() => {
  const required = ['business_name', 'logo_url', 'bank_account_name', 'bank_account_number']
  const completed = required.filter(field => profile.value[field])
  return Math.round((completed.length / required.length) * 100)
})

const kpiData = computed(() => [
  {
    title: 'Total Revenue',
    value: formatCurrency(profileStats.value.total_revenue || 0),
    change: profileStats.value.revenue_change || '+0%',
    trend: profileStats.value.revenue_trend || 'neutral',
    icon: 'trending_up',
    color: 'lime'
  },
  {
    title: 'Transactions',
    value: profileStats.value.transactions || 0,
    change: profileStats.value.transactions_change || '+0%',
    trend: profileStats.value.transactions_trend || 'neutral',
    icon: 'receipt',
    color: 'blue'
  },
  {
    title: 'Success Rate',
    value: `${profileStats.value.success_rate || 0}%`,
    change: profileStats.value.success_rate_change || '+0%',
    trend: profileStats.value.success_rate_trend || 'neutral',
    icon: 'check_circle',
    color: 'green'
  },
  {
    title: 'Active Customers',
    value: profileStats.value.customers || 0,
    change: profileStats.value.customers_change || '+0%',
    trend: profileStats.value.customers_trend || 'neutral',
    icon: 'people',
    color: 'purple'
  }
])

const placeholderLogo = 'https://placehold.co/200x200/121018/bdf000?text=Logo'

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('🔄 Loading dashboard data...')
    
    // Load merchant profile
    await loadMerchantProfile()
    
    // Load transactions
    await loadRecentTransactions()
    
    // Load analytics data
    await loadAnalyticsData()
    
    console.log('✅ Dashboard data loaded successfully')
    
  } catch (err) {
    console.error('❌ Error loading dashboard data:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

const loadMerchantProfile = async () => {
  try {
    console.log('🔄 Loading merchant profile...')
    
    // ✅ Try multiple profile endpoints
    let profileResponse
    try {
      profileResponse = await api.get('/api/merchant/profile')
    } catch {
      try {
        profileResponse = await api.get('/api/profile')
      } catch {
        try {
          profileResponse = await api.get('/api/user')
        } catch {
          throw new Error('No profile endpoint available')
        }
      }
    }
    
    profile.value = profileResponse.data?.merchant || profileResponse.data?.user || profileResponse.data || {}
    console.log('✅ Profile loaded:', profile.value)
    
  } catch (profileError) {
    console.warn('⚠️ Profile endpoint not available, using user data from localStorage',profileError)
    
    // Use user data from localStorage as fallback
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        profile.value = {
          email: userData.email,
          business_name: userData.business_name || '',
          status: 'pending',
          ...userData
        }
      } catch {
        profile.value = { email: user.value.email, status: 'pending' }
      }
    }
  }
}

const loadRecentTransactions = async () => {
  try {
    console.log('🔄 Loading recent transactions...')
    
    // ✅ Use your actual API endpoint: GET /api/merchant/transactions
    const response = await api.get('/api/merchant/transactions', {
      params: { limit: 5, sort: 'desc' }
    })
    
    // Handle different response formats
    const data = response.data
    if (data.transactions) {
      recentTransactions.value = data.transactions
    } else if (Array.isArray(data)) {
      recentTransactions.value = data
    } else if (data.data) {
      recentTransactions.value = data.data
    } else {
      recentTransactions.value = []
    }
    
    console.log('✅ Recent transactions loaded:', recentTransactions.value.length)
    
  } catch (transactionsError) {
    console.warn('⚠️ Transactions API not available, using sample data',transactionsError)
    recentTransactions.value = generateSampleTransactions()
  }
}

const loadAnalyticsData = async () => {
  try {
    console.log('🔄 Loading analytics data...')
    
    // Load revenue data
    try {
      const revenueResponse = await api.get('/api/merchant/analytics/revenue')
      revenueData.value = revenueResponse.data?.data || revenueResponse.data || []
    } catch {
      revenueData.value = generateSampleRevenue()
    }
    
    // Load payment methods data
    try {
      const methodsResponse = await api.get('/api/merchant/analytics/payment-methods')
      methodsData.value = methodsResponse.data?.data || methodsResponse.data || []
    } catch {
      methodsData.value = generateSampleMethods()
    }
    
    // Load customer data
    try {
      const customerResponse = await api.get('/api/merchant/analytics/customers')
      customerData.value = customerResponse.data?.data || customerResponse.data || []
    } catch {
      customerData.value = generateSampleCustomers()
    }
    
    // Load trends data
    try {
      const trendsResponse = await api.get('/api/merchant/analytics/trends')
      trendsData.value = trendsResponse.data?.data || trendsResponse.data || []
    } catch {
      trendsData.value = generateSampleTrends()
    }
    
    // Calculate profile stats from real data
    calculateProfileStats()
    
    console.log('✅ Analytics data loaded')
    
  } catch (analyticsError) {
    console.warn('⚠️ Analytics APIs not available, using sample data',analyticsError)
    loadSampleAnalytics()
  }
}

const calculateProfileStats = () => {
  if (recentTransactions.value.length > 0) {
    const totalRevenue = recentTransactions.value.reduce((sum, t) => sum + (t.amount || 0), 0)
    const completedTransactions = recentTransactions.value.filter(t => t.status === 'completed')
    const uniqueCustomers = new Set(recentTransactions.value.map(t => t.customer_email)).size
    
    profileStats.value = {
      total_revenue: totalRevenue,
      transactions: recentTransactions.value.length,
      success_rate: Math.round((completedTransactions.length / recentTransactions.value.length) * 100),
      customers: uniqueCustomers,
      revenue_change: '+12%',
      transactions_change: '+8%',
      success_rate_change: '+5%',
      customers_change: '+15%',
      revenue_trend: 'up',
      transactions_trend: 'up',
      success_rate_trend: 'up',
      customers_trend: 'up'
    }
  } else {
    profileStats.value = {
      total_revenue: 0,
      transactions: 0,
      success_rate: 0,
      customers: 0,
      revenue_change: '+0%',
      transactions_change: '+0%',
      success_rate_change: '+0%',
      customers_change: '+0%',
      revenue_trend: 'neutral',
      transactions_trend: 'neutral',
      success_rate_trend: 'neutral',
      customers_trend: 'neutral'
    }
  }
}

const generateSampleTransactions = () => {
  return [
    {
      id: 1,
      customer_name: 'John Doe',
      customer_email: 'john@example.com',
      amount: 12500, // $125.00 in cents
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    },
    {
      id: 2,
      customer_name: 'Jane Smith',
      customer_email: 'jane@example.com',
      amount: 8750, // $87.50 in cents
      status: 'pending',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString()
    },
    {
      id: 3,
      customer_name: 'Bob Johnson',
      customer_email: 'bob@example.com',
      amount: 15000, // $150.00 in cents
      status: 'completed',
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString()
    }
  ]
}

const generateSampleRevenue = () => {
  return [
    { month: 'Jan', revenue: 125000 },
    { month: 'Feb', revenue: 138000 },
    { month: 'Mar', revenue: 156000 },
    { month: 'Apr', revenue: 142000 },
    { month: 'May', revenue: 168000 },
    { month: 'Jun', revenue: 184000 }
  ]
}

const generateSampleMethods = () => {
  return [
    { label: 'Credit Card', value: 45, color: '#bdf000' },
    { label: 'Debit Card', value: 30, color: '#2196f3' },
    { label: 'Digital Wallet', value: 15, color: '#ff9800' },
    { label: 'Bank Transfer', value: 10, color: '#9c27b0' }
  ]
}

const generateSampleCustomers = () => {
  return [
    { month: 'Jan', customers: 45 },
    { month: 'Feb', customers: 52 },
    { month: 'Mar', customers: 61 },
    { month: 'Apr', customers: 58 },
    { month: 'May', customers: 67 },
    { month: 'Jun', customers: 74 }
  ]
}

const generateSampleTrends = () => {
  return [
    { month: 'Jan', count: 125 },
    { month: 'Feb', count: 138 },
    { month: 'Mar', count: 156 },
    { month: 'Apr', count: 142 },
    { month: 'May', count: 168 },
    { month: 'Jun', count: 184 }
  ]
}

const loadSampleAnalytics = () => {
  revenueData.value = generateSampleRevenue()
  methodsData.value = generateSampleMethods()
  customerData.value = generateSampleCustomers()
  trendsData.value = generateSampleTrends()
  calculateProfileStats()
}

const onStatusUpdated = (statusData) => {
  if (statusData.status) {
    profile.value.status = statusData.status
  }
  if (statusData.progress !== undefined) {
    // Update any progress-related data
  }
}

const addBusiness = () => {
  showAddBusinessDialog.value = true
}

const submitBusiness = async () => {
  try {
    submittingBusiness.value = true
    
    // Validate required fields
    if (!newBusiness.value.business_name || !newBusiness.value.bank_account_name || 
        !newBusiness.value.bank_account_number || !newBusiness.value.bank_name) {
      throw new Error('Please fill in all required fields')
    }
    
    // ✅ Use your business registration endpoint: POST /api/merchant/register
    const response = await api.post('/api/merchant/register', {
      business_name: newBusiness.value.business_name,
      website: newBusiness.value.website,
      bank_account_name: newBusiness.value.bank_account_name,
      bank_account_number: newBusiness.value.bank_account_number,
      bank_name: newBusiness.value.bank_name,
      bank_routing_number: newBusiness.value.bank_routing_number,
      business_address: newBusiness.value.business_address,
      business_phone: newBusiness.value.business_phone
    })
    
    console.log('✅ Business registered:', response.data)
    
    $q.notify({
      type: 'positive',
      message: 'Business added successfully!',
      position: 'top'
    })
    
    showAddBusinessDialog.value = false
    
    // Update profile with new business data
    profile.value = { ...profile.value, ...newBusiness.value, status: 'pending' }
    
    // Reset form
    newBusiness.value = {
      business_name: '',
      website: '',
      bank_account_name: '',
      bank_account_number: '',
      bank_name: '',
      bank_routing_number: '',
      business_address: '',
      business_phone: ''
    }
    
    // Reload dashboard data
    await loadDashboardData()
    
  } catch (err) {
    console.error('❌ Business registration error:', err)
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to add business. Please try again.',
      position: 'top'
    })
  } finally {
    submittingBusiness.value = false
  }
}

const createTransaction = () => {
  router.push('/checkout')
}

const openSettings = () => {
  router.push('/settings')
}

const editProfile = () => {
  router.push('/profile')
}

const refreshChart = () => {
  loadAnalyticsData()
}

const refreshMethodsChart = () => {
  loadAnalyticsData()
}

const viewAllTransactions = () => {
  router.push('/transactions')
}

const generateInvoice = () => {
  $q.notify({
    type: 'info',
    message: 'Invoice generation coming soon!',
    position: 'top'
  })
}

const exportData = () => {
  $q.notify({
    type: 'info',
    message: 'Data export coming soon!',
    position: 'top'
  })
}

const contactSupport = () => {
  router.push('/support')
}

const viewAnalytics = () => {
  router.push('/stats')
}

const logout = async () => {
  try {
    // ✅ Try to use your logout endpoint: POST /api/logout
    try {
      await api.post('/api/logout')
    } catch {
      console.warn('⚠️ Logout API call failed, proceeding with local cleanup')
    }

    // Clear local storage
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')

    // Clear axios headers
    delete api.defaults.headers.common['Authorization']

    $q.notify({
      type: 'positive',
      message: 'Logged out successfully',
      position: 'top'
    })

    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
    router.push('/login')
  }
}

const onLogoError = () => {
  profile.value.logo_url = placeholderLogo
}

// Utility methods
const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100) // Convert from cents
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'green',
    pending: 'orange',
    failed: 'red',
    processing: 'blue',
    refunded: 'purple'
  }
  return colors[status] || 'grey'
}

const getBarHeight = (value) => {
  if (!value) return '10px'
  const maxValue = Math.max(...revenueData.value.map(item => item.revenue || 0))
  if (maxValue === 0) return '10px'
  return `${Math.max((value / maxValue) * 100, 10)}%`
}

// Lifecycle
onMounted(() => {
  loadDashboardData()
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

.btn-primary {
  background: #bdf000;
  color: #09050d;
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
  border: 2px solid #ff4444;
  color: #ff4444;
}

.btn-danger:hover {
  background: #ff4444;
  color: #ffffff;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 24px;
}

.left-column,
.right-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.profile-card,
.chart-card,
.transactions-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.profile-card:hover,
.chart-card:hover,
.transactions-card:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.refresh-btn,
.view-all-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
}

.edit-btn:hover,
.refresh-btn:hover,
.view-all-btn:hover {
  background: rgba(189, 240, 0, 0.1);
  transform: scale(1.1);
}

.profile-content {
  display: flex;
  gap: 20px;
  align-items: center;
}

.profile-avatar {
  position: relative;
}

.avatar-image {
  border: 2px solid rgba(189, 240, 0, 0.3);
  transition: all 0.3s ease;
}

.avatar-ring {
  position: absolute;
  top: -4px;
  left: -4px;
  right: -4px;
  bottom: -4px;
  border: 2px solid rgba(189, 240, 0, 0.2);
  border-radius: 16px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.7;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.profile-details {
  flex: 1;
}

.business-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.business-email,
.business-website {
  color: #ccc;
  margin: 4px 0;
  font-size: 0.9rem;
}

.profile-stats {
  display: flex;
  gap: 20px;
  margin-top: 16px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 1.1rem;
  font-weight: 600;
  color: #bdf000;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.add-business-cta {
  text-align: center;
  padding: 40px 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: 20px;
}

.add-business-cta h4 {
  color: #bdf000;
  margin: 16px 0 8px 0;
  font-size: 1.2rem;
}

.add-business-cta p {
  color: #ccc;
  margin: 0 0 20px 0;
  font-size: 0.9rem;
  line-height: 1.5;
}

.chart-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.simple-chart {
  width: 100%;
  height: 100%;
  padding: 20px;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  gap: 8px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 40px;
}

.bar-value {
  font-size: 0.7rem;
  color: #bdf000;
  font-weight: 600;
  min-height: 16px;
}

.bar-fill {
  width: 100%;
  background: linear-gradient(180deg, #bdf000 0%, #8bc34a 100%);
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
}

.bar-fill.customer-bar {
  background: linear-gradient(180deg, #2196f3 0%, #1976d2 100%);
}

.bar-fill.trends-bar {
  background: linear-gradient(180deg, #9c27b0 0%, #7b1fa2 100%);
}

.bar-label {
  font-size: 0.7rem;
  color: #999;
  margin-top: 8px;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #999;
  text-align: center;
}

.methods-chart {
  padding: 20px;
  width: 100%;
}

.method-item {
  margin-bottom: 20px;
}

.method-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.method-name {
  font-weight: 500;
  color: #ffffff;
}

.method-value {
  font-weight: 600;
  color: #bdf000;
}

.method-bar {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.method-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.transactions-list {
  max-height: 300px;
  overflow-y: auto;
}

.no-transactions {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-transactions p {
  margin: 16px 0;
  font-size: 1.1rem;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  border-radius: 8px;
}

.transaction-item:hover {
  background: rgba(189, 240, 0, 0.05);
  transform: translateX(4px);
}

.transaction-item:last-child {
  border-bottom: none;
}

.customer-name {
  font-weight: 500;
  color: #ffffff;
}

.transaction-date {
  font-size: 0.8rem;
  color: #999;
  margin-top: 4px;
}

.transaction-amount {
  display: flex;
  align-items: center;
  gap: 12px;
}

.amount {
  font-weight: 600;
  color: #4caf50;
}

.charts-section {
  margin-top: 48px;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 32px 0;
  text-align: center;
  position: relative;
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 3px;
  background: linear-gradient(90deg, #bdf000, #8bc34a);
  border-radius: 2px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 24px;
}

.actions-section {
  margin-top: 48px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 24px;
}

.action-item {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  gap: 20px;
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.action-item:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-6px);
  box-shadow: 
    0 16px 40px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(189, 240, 0, 0.2),
    0 0 40px rgba(189, 240, 0, 0.2);
}

.action-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, transparent, rgba(189, 240, 0, 0.05), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-item:hover::before {
  opacity: 1;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.action-item:hover .action-icon {
  background: rgba(189, 240, 0, 0.2);
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.3);
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  transition: all 0.3s ease;
}

.action-item:hover .action-title {
  color: #bdf000;
}

.action-description {
  font-size: 0.9rem;
  color: #ccc;
  margin: 0;
  line-height: 1.5;
  transition: all 0.3s ease;
}

.action-item:hover .action-description {
  color: #e0e0e0;
}

.action-arrow {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.action-item:hover .action-arrow {
  opacity: 1;
  transform: translateX(0);
}

/* Add Business Dialog Styles */
.add-business-dialog {
  min-width: 600px;
  max-width: 80vw;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.add-business-dialog .text-h6 {
  color: #bdf000;
  font-weight: 600;
}

.add-business-dialog :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.add-business-dialog :deep(.q-field__native) {
  color: #ffffff;
}

.add-business-dialog :deep(.q-field__label) {
  color: #bdf000;
}

/* Animation Classes */
.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.error-message {
  margin-top: 24px;
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .merchant-dashboard {
    padding: 16px;
  }
  
  .welcome-section {
    padding: 24px;
    border-radius: 16px;
  }
  
  .welcome-content {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-actions {
    flex-direction: column;
    width: 100%;
  }
  
  .profile-content {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
  
  .profile-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-item {
    padding: 20px;
  }
  
  .add-business-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .welcome-title {
    font-size: 1.8rem;
  }
  
  .profile-card,
  .chart-card,
  .transactions-card {
    padding: 20px;
    border-radius: 16px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .chart-actions {
    align-self: flex-end;
  }
  
  .transaction-item {
    padding: 12px;
  }
  
  .action-item {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .action-icon {
    width: 48px;
    height: 48px;
  }
}

/* Enhanced focus states */
.action-item:focus-visible,
.transaction-item:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Performance optimizations */
.action-item,
.transaction-item,
.profile-card,
.chart-card,
.transactions-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>