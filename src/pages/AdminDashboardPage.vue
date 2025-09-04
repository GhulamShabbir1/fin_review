<template>
  <div class="admin-dashboard grid-background">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner-3d"></div>
      <p class="loading-text">Loading admin dashboard...</p>
    </div>

    <!-- Welcome Section with 3D Elements -->
    <div class="welcome-section q-mb-xl card-3d">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome, <span class="highlight lime-glow">{{ user.name || 'Admin' }}</span>! 👑
          </h1>
          <p class="welcome-subtitle">
            Manage platform operations and monitor merchant activities
          </p>
        </div>
        
        <!-- 3D Action Buttons -->
        <div class="welcome-actions">
          <q-btn
            color="lime"
            icon="people"
            label="Manage Merchants"
            class="btn-3d action-btn"
            @click="navigateToMerchants"
          />

          <q-btn
            color="blue"
            icon="analytics"
            label="View Analytics"
            class="btn-3d action-btn"
            @click="showAnalytics"
          />

          <q-btn 
            flat 
            color="lime" 
            icon="settings" 
            label="Settings" 
            class="btn-3d action-btn btn-outline"
            @click="openSettings" 
          />
          
          <q-btn 
            flat 
            color="purple" 
            icon="person" 
            label="Profile" 
            class="btn-3d action-btn btn-outline"
            @click="editProfile" 
          />
          
          <q-btn 
            flat 
            color="red" 
            icon="logout" 
            label="Logout" 
            class="btn-3d action-btn btn-danger" 
            @click="logout" 
          />
        </div>
      </div>
    </div>

    <!-- Platform Overview Statistics with 3D Cards -->
    <div class="platform-overview q-mb-xl">
      <div class="row q-gutter-lg">
        <div class="col">
          <q-card class="stat-card card-3d lime-glow">
            <q-card-section>
              <div class="stat-header">
                <div class="icon-3d rotate-infinite">
                  <q-icon name="store" size="32px" color="lime" />
                </div>
                <div class="stat-value">{{ totalMerchants }}</div>
              </div>
              <div class="stat-title">Total Merchants</div>
              <div class="stat-subtitle">{{ activeMerchants }} active</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col">
          <q-card class="stat-card card-3d lime-glow">
            <q-card-section>
              <div class="stat-header">
                <div class="icon-3d rotate-infinite">
                  <q-icon name="receipt" size="32px" color="blue" />
                </div>
                <div class="stat-value">{{ totalTransactions }}</div>
              </div>
              <div class="stat-title">Total Transactions</div>
              <div class="stat-subtitle">${{ formatNumber(totalRevenue) }} revenue</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col">
          <q-card class="stat-card card-3d lime-glow">
            <q-card-section>
              <div class="stat-header">
                <div class="icon-3d rotate-infinite">
                  <q-icon name="pending" size="32px" color="orange" />
                </div>
                <div class="stat-value">{{ pendingMerchants }}</div>
              </div>
              <div class="stat-title">Pending Approval</div>
              <div class="stat-subtitle">Awaiting review</div>
            </q-card-section>
          </q-card>
        </div>
        
        <div class="col">
          <q-card class="stat-card card-3d lime-glow">
            <q-card-section>
              <div class="stat-header">
                <div class="icon-3d rotate-infinite">
                  <q-icon name="trending_up" size="32px" color="green" />
                </div>
                <div class="stat-value">{{ platformGrowth }}%</div>
              </div>
              <div class="stat-title">Platform Growth</div>
              <div class="stat-subtitle">This month</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- 3D Analytics Charts Section -->
    <div class="analytics-section q-mb-xl">
      <h2 class="section-title lime-glow">Platform Analytics</h2>
      
      <div class="row q-gutter-lg">
        <!-- Revenue Chart with 3D Effect -->
        <div class="col-12 col-md-6">
          <div class="chart-3d">
            <h3 class="chart-title">Revenue Analytics</h3>
            <div class="chart-container">
              <div class="modern-chart revenue-chart">
                <div class="chart-bars">
                  <div 
                    v-for="(item, index) in revenueData" 
                    :key="index"
                    class="chart-bar"
                    :style="{ height: getBarHeight(item.revenue || item.value || 0, revenueData) }"
                    @mouseenter="showRevenueDetails(item)"
                  >
                    <div class="bar-fill shimmer"></div>
                    <div class="bar-label">{{ item.date || item.month }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Merchant Growth Chart with 3D Effect -->
        <div class="col-12 col-md-6">
          <div class="chart-3d">
            <h3 class="chart-title">Merchant Growth</h3>
            <div class="chart-container">
              <div class="modern-chart growth-chart">
                <div class="chart-line">
                  <svg class="line-svg" viewBox="0 0 100 40">
                    <path 
                      class="line-path shimmer"
                      :d="getGrowthLinePath()"
                      fill="none"
                      stroke="url(#limeGradient)"
                      stroke-width="2"
                    />
                    <defs>
                      <linearGradient id="limeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" style="stop-color:#bdf000;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#32cd32;stop-opacity:1" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Transaction Trends Chart -->
      <div class="row q-mt-lg">
        <div class="col-12">
          <div class="chart-3d">
            <h3 class="chart-title">Transaction Trends</h3>
            <div class="chart-container">
              <div class="modern-chart trends-chart">
                <div class="chart-donut">
                  <div 
                    v-for="(method, index) in transactionData" 
                    :key="index"
                    class="donut-segment"
                    :style="{ 
                      '--rotation': `${index * (360 / transactionData.length)}deg`,
                      '--percentage': `${method.value || method.percentage || 0}%`
                    }"
                    @mouseenter="showTransactionDetails(method)"
                  >
                    <div class="segment-fill shimmer"></div>
                  </div>
                </div>
                <div class="donut-center">
                  <div class="center-text">{{ getTotalTransactions() }}</div>
                  <div class="center-label">Transactions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity with 3D Cards -->
    <div class="activity-section q-mb-xl">
      <h2 class="section-title lime-glow">Recent Activity</h2>
      
      <div class="activity-grid">
        <div 
          v-for="activity in recentActivities" 
          :key="activity.id"
          class="activity-card card-3d"
        >
          <div class="activity-header">
            <div class="activity-icon image-3d">
              <q-icon :name="getActivityIcon(activity.type)" size="24px" :color="getActivityColor(activity.type)" />
            </div>
            <div class="activity-status">
              <q-chip 
                :color="getActivityStatusColor(activity.status)"
                :label="activity.status"
                class="status-chip"
              />
            </div>
          </div>
          
          <div class="activity-content">
            <h3 class="activity-title">{{ activity.title }}</h3>
            <p class="activity-description">{{ activity.description }}</p>
            
            <div class="activity-meta">
              <div class="meta-item">
                <span class="meta-label">Time:</span>
                <span class="meta-value">{{ formatTime(activity.timestamp) }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">User:</span>
                <span class="meta-value">{{ activity.user }}</span>
              </div>
            </div>
          </div>
          
          <div class="activity-actions">
            <q-btn 
              flat 
              color="lime" 
              icon="visibility" 
              label="View" 
              class="btn-3d"
              @click="viewActivity(activity)"
            />
            <q-btn 
              flat 
              color="blue" 
              icon="edit" 
              label="Action" 
              class="btn-3d"
              @click="takeAction(activity)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Actions with 3D Effects -->
    <div class="quick-actions q-mb-xl">
      <h2 class="section-title lime-glow">Quick Actions</h2>
      
      <div class="actions-grid">
        <div class="action-card card-3d" @click="approveAllPending">
          <div class="action-icon rotate-infinite">
            <q-icon name="check_circle" size="48px" color="green" />
          </div>
          <h3>Approve All Pending</h3>
          <p>Bulk approve pending merchant applications</p>
        </div>
        
        <div class="action-card card-3d" @click="generateReport">
          <div class="action-icon rotate-infinite">
            <q-icon name="assessment" size="48px" color="blue" />
          </div>
          <h3>Generate Report</h3>
          <p>Create comprehensive platform report</p>
        </div>
        
        <div class="action-card card-3d" @click="backupSystem">
          <div class="action-icon rotate-infinite">
            <q-icon name="backup" size="48px" color="purple" />
          </div>
          <h3>System Backup</h3>
          <p>Create system backup and restore point</p>
        </div>
        
        <div class="action-card card-3d" @click="sendNotifications">
          <div class="action-icon rotate-infinite">
            <q-icon name="notifications" size="48px" color="orange" />
          </div>
          <h3>Send Notifications</h3>
          <p>Send platform-wide announcements</p>
        </div>
      </div>
    </div>

    <!-- 3D Floating Action Button -->
    <div class="floating-action">
      <q-btn
        round
        color="lime"
        icon="add"
        size="lg"
        class="btn-3d lime-glow"
        @click="showQuickActions"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../store/auth'
import { useQuasar } from 'quasar'
import api from '../boot/axios'

const router = useRouter()
const auth = useAuthStore()
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const user = ref({})
const totalMerchants = ref(0)
const activeMerchants = ref(0)
const totalTransactions = ref(0)
const totalRevenue = ref(0)
const pendingMerchants = ref(0)
const platformGrowth = ref(0)
const revenueData = ref([])
const transactionData = ref([])
const recentActivities = ref([])

// Chart functions
const getBarHeight = (value, data) => {
  const maxValue = Math.max(...data.map(item => item.revenue || item.value || 0))
  return maxValue > 0 ? `${(value / maxValue) * 100}%` : '0%'
}

const getGrowthLinePath = () => {
  if (!revenueData.value.length) return 'M0,20 L100,20'
  
  const points = revenueData.value.map((item, index) => {
    const x = (index / (revenueData.value.length - 1)) * 100
    const y = 40 - ((item.revenue || item.value || 0) / Math.max(...revenueData.value.map(d => d.revenue || d.value || 0))) * 40
    return `${x},${y}`
  })
  
  return `M${points.join(' L')}`
}

const getTotalTransactions = () => {
  return transactionData.value.reduce((sum, item) => sum + (item.value || item.percentage || 0), 0)
}

// Utility functions
const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

// Activity functions
const getActivityIcon = (type) => {
  const icons = {
    'merchant_approved': 'check_circle',
    'merchant_rejected': 'close',
    'transaction_completed': 'receipt',
    'payment_received': 'payment',
    'system_alert': 'warning',
    'user_login': 'login'
  }
  return icons[type] || 'info'
}

const getActivityColor = (type) => {
  const colors = {
    'merchant_approved': 'green',
    'merchant_rejected': 'red',
    'transaction_completed': 'blue',
    'payment_received': 'green',
    'system_alert': 'orange',
    'user_login': 'purple'
  }
  return colors[type] || 'grey'
}

const getActivityStatusColor = (status) => {
  const colors = {
    'completed': 'green',
    'pending': 'orange',
    'failed': 'red',
    'processing': 'blue'
  }
  return colors[status] || 'grey'
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString()
}

// Action functions
const navigateToMerchants = () => {
  router.push('/admin/merchants')
}

const showAnalytics = () => {
  $q.notify({
    message: 'Analytics view opened',
    color: 'lime',
    icon: 'analytics'
  })
}

const openSettings = () => {
  router.push('/admin/settings')
}

const editProfile = () => {
  router.push('/admin/profile')
}

const logout = async () => {
  try {
    await auth.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}

const approveAllPending = () => {
  $q.notify({
    message: 'Bulk approval initiated',
    color: 'green',
    icon: 'check_circle'
  })
}

const generateReport = () => {
  $q.notify({
    message: 'Report generation started',
    color: 'blue',
    icon: 'assessment'
  })
}

const backupSystem = () => {
  $q.notify({
    message: 'System backup initiated',
    color: 'purple',
    icon: 'backup'
  })
}

const sendNotifications = () => {
  $q.notify({
    message: 'Notification system opened',
    color: 'orange',
    icon: 'notifications'
  })
}

const showQuickActions = () => {
  $q.notify({
    message: 'Quick actions menu',
    color: 'lime',
    icon: 'menu'
  })
}

const viewActivity = (activity) => {
  $q.notify({
    message: `Viewing activity: ${activity.title}`,
    color: 'blue',
    icon: 'visibility'
  })
}

const takeAction = (activity) => {
  $q.notify({
    message: `Taking action on: ${activity.title}`,
    color: 'green',
    icon: 'edit'
  })
}

const showRevenueDetails = (item) => {
  $q.notify({
    message: `Revenue: $${item.revenue || item.value || 0}`,
    color: 'lime',
    icon: 'trending_up'
  })
}

const showTransactionDetails = (method) => {
  $q.notify({
    message: `Method: ${method.name || method.label}`,
    color: 'blue',
    icon: 'receipt'
  })
}

// Load dashboard data
const loadDashboardData = async () => {
  loading.value = true
  try {
    // Load platform stats
    const [merchantsResponse, transactionsResponse, statsResponse] = await Promise.all([
      api.get('/admin/merchants'),
      api.get('/admin/transactions'),
      api.get('/admin/stats/revenue')
    ])

    // Set merchant data
    const merchants = merchantsResponse.data.data || []
    totalMerchants.value = merchants.length
    activeMerchants.value = merchants.filter(m => m.status === 'verified').length
    pendingMerchants.value = merchants.filter(m => m.status === 'pending').length

    // Set transaction data
    const transactions = transactionsResponse.data.data || []
    totalTransactions.value = transactions.length
    totalRevenue.value = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)

    // Set revenue data
    revenueData.value = statsResponse.data.data || []

    // Set transaction data for charts
    transactionData.value = [
      { name: 'Credit Card', value: 45, percentage: 45 },
      { name: 'Bank Transfer', value: 30, percentage: 30 },
      { name: 'Digital Wallet', value: 15, percentage: 15 },
      { name: 'Other', value: 10, percentage: 10 }
    ]

    // Calculate platform growth
    const thisMonth = new Date().getMonth()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const thisMonthMerchants = merchants.filter(m => new Date(m.created_at).getMonth() === thisMonth).length
    const lastMonthMerchants = merchants.filter(m => new Date(m.created_at).getMonth() === lastMonth).length
    platformGrowth.value = lastMonthMerchants > 0 ? Math.round(((thisMonthMerchants - lastMonthMerchants) / lastMonthMerchants) * 100) : 0

    // Set recent activities
    recentActivities.value = [
      {
        id: 1,
        type: 'merchant_approved',
        title: 'Merchant Approved',
        description: 'New merchant account has been verified and approved',
        status: 'completed',
        user: 'Admin User',
        timestamp: new Date()
      },
      {
        id: 2,
        type: 'transaction_completed',
        title: 'Transaction Completed',
        description: 'Large payment transaction processed successfully',
        status: 'completed',
        user: 'System',
        timestamp: new Date(Date.now() - 3600000)
      },
      {
        id: 3,
        type: 'system_alert',
        title: 'System Alert',
        description: 'Platform performance metrics updated',
        status: 'processing',
        user: 'System',
        timestamp: new Date(Date.now() - 7200000)
      }
    ]

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
.admin-dashboard-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
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

.breadcrumb-section {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(189, 240, 0, 0.1);
}

.admin-content {
  padding: 24px;
}

/* Enhanced Welcome Section */
.welcome-section {
  background: linear-gradient(135deg, rgba(189, 240, 0, 0.15) 0%, rgba(189, 240, 0, 0.05) 100%);
  border-radius: 24px;
  padding: 40px;
  border: 2px solid rgba(189, 240, 0, 0.2);
  position: relative;
  overflow: hidden;
}

.welcome-section::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(189, 240, 0, 0.1) 0%, transparent 70%);
  animation: rotate 60s linear infinite;
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 32px;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 2.8rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
}

.highlight {
  color: #bdf000;
  text-shadow: 0 0 20px rgba(189, 240, 0, 0.5);
}

.welcome-subtitle {
  font-size: 1.2rem;
  color: #ccc;
  margin: 12px 0 16px 0;
}

.platform-status {
  margin-top: 16px;
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
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

/* Enhanced KPI Cards */
.kpi-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.4s ease;
  overflow: hidden;
  position: relative;
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #bdf000, #8bc34a, #4caf50);
}

.kpi-card:hover {
  border-color: rgba(189, 240, 0, 0.4);
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3);
}

.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background: rgba(189, 240, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Analytics Section Styles */
.analytics-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 1.5rem;
  font-weight: 600;
}

.section-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 24px;
}

.chart-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.chart-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.chart-header {
  margin-bottom: 20px;
}

.chart-title {
  color: #ffffff;
  margin: 0 0 8px 0;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  font-weight: 600;
}

.chart-subtitle {
  color: #999;
  font-size: 0.9rem;
  margin: 0;
}

.chart-container {
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-loading {
  text-align: center;
  color: #999;
}

.chart-loading p {
  margin: 16px 0 0 0;
}

.chart-empty {
  text-align: center;
  color: #999;
}

.chart-empty p {
  margin: 16px 0 0 0;
}

.chart-content {
  width: 100%;
}

/* Revenue Chart Styles */
.revenue-chart {
  width: 100%;
}

.chart-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.stat-label {
  display: block;
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}

.stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.revenue-bars {
  display: flex;
  gap: 8px;
  align-items: end;
  height: 200px;
  padding: 20px 0;
}

.revenue-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.revenue-bar:hover {
  transform: scale(1.05);
}

.bar-value {
  font-size: 0.8rem;
  color: #ffffff;
  margin-bottom: 8px;
  font-weight: 600;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
}

.bar-label {
  font-size: 0.75rem;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

/* Growth Chart Styles */
.growth-chart {
  width: 100%;
}

.growth-line {
  position: relative;
  height: 200px;
  margin-top: 20px;
}

.growth-svg {
  width: 100%;
  height: 100%;
}

.growth-path {
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
}

.growth-points {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.growth-point {
  position: absolute;
  width: 12px;
  height: 12px;
  background: #4CAF50;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  transform: translate(-50%, -50%);
}

.growth-point:hover {
  transform: translate(-50%, -50%) scale(1.5);
  background: #2196F3;
}

.point-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.growth-point:hover .point-tooltip {
  opacity: 1;
}

/* Transaction Chart Styles */
.transaction-chart {
  width: 100%;
}

.transaction-bars {
  display: flex;
  gap: 8px;
  align-items: end;
  height: 200px;
  padding: 20px 0;
}

.transaction-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.transaction-bar:hover {
  transform: scale(1.05);
}

.bar-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bar-success {
  width: 100%;
  background: #4CAF50;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
}

.bar-failed {
  width: 100%;
  background: #F44336;
  border-radius: 0 0 4px 4px;
  min-height: 20px;
  transition: all 0.3s ease;
}

/* Performance Metrics Styles */
.performance-metrics {
  width: 100%;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.metric-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateY(-2px);
}

.metric-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.metric-content {
  flex: 1;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.metric-label {
  color: #999;
  font-size: 0.9rem;
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(76, 175, 80, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.trend-value {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4caf50;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 8px;
  line-height: 1;
}

.kpi-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ccc;
  margin-bottom: 8px;
}

.kpi-subtitle {
  font-size: 0.9rem;
  color: #bdf000;
  font-weight: 500;
}

/* Enhanced Merchants Section */
.merchants-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #bdf000;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.merchant-stats-enhanced {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.stat-card-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card-mini:hover {
  background: rgba(189, 240, 0, 0.1);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-2px);
}

.stat-icon-mini {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content-mini {
  flex: 1;
}

.stat-value-mini {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  line-height: 1;
}

.stat-label-mini {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 4px;
}

.merchant-filters {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Enhanced Table */
.enhanced-merchant-table {
  background: transparent;
}

.enhanced-merchant-table :deep(.q-table__thead th) {
  background: rgba(189, 240, 0, 0.1);
  color: #ffffff;
  font-weight: 700;
  border-bottom: 2px solid rgba(189, 240, 0, 0.3);
  padding: 16px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.enhanced-merchant-table :deep(.q-table__tbody tr) {
  transition: all 0.3s ease;
}

.enhanced-merchant-table :deep(.q-table__tbody tr:hover) {
  background: rgba(189, 240, 0, 0.08);
  transform: translateX(4px);
}

.enhanced-merchant-table :deep(.q-table__tbody td) {
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

.business-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.business-avatar {
  border: 2px solid rgba(189, 240, 0, 0.3);
  border-radius: 8px;
}

.business-info {
  display: flex;
  flex-direction: column;
}

.business-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95rem;
}

.business-email {
  font-size: 0.8rem;
  color: #999;
}

.date-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.date-primary {
  font-weight: 600;
  color: #ffffff;
}

.date-secondary {
  font-size: 0.75rem;
  color: #bdf000;
}

.bank-info {
  display: flex;
  flex-direction: column;
}

.bank-name {
  font-weight: 500;
  color: #ffffff;
  font-size: 0.9rem;
}

.bank-number {
  font-size: 0.8rem;
  color: #999;
  font-family: monospace;
}

.status-chip {
  font-weight: 600;
  text-transform: capitalize;
  border-radius: 16px;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* Enhanced Actions Grid */
.enhanced-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
}

.action-card-enhanced {
  cursor: pointer;
  transition: all 0.4s ease;
  border-radius: 20px;
  overflow: hidden;
}

.action-card-enhanced:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
}

.action-background {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 20px;
  padding: 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  overflow: hidden;
}

.action-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(189, 240, 0, 0.1), transparent);
  transition: all 0.6s ease;
}

.action-card-enhanced:hover .action-background::before {
  left: 100%;
}

.action-icon-enhanced {
  width: 72px;
  height: 72px;
  border-radius: 18px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.action-card-enhanced:hover .action-icon-enhanced {
  background: rgba(189, 240, 0, 0.2);
  transform: scale(1.1) rotate(5deg);
}

.action-content-enhanced {
  flex: 1;
}

.action-content-enhanced h4 {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  transition: all 0.3s ease;
}

.action-card-enhanced:hover .action-content-enhanced h4 {
  color: #bdf000;
}

.action-content-enhanced p {
  font-size: 0.95rem;
  color: #ccc;
  margin: 0 0 12px 0;
  line-height: 1.5;
}

.action-stats {
  display: flex;
  gap: 8px;
}

.stat-badge {
  background: rgba(189, 240, 0, 0.2);
  color: #bdf000;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.action-arrow-enhanced {
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;
}

.action-card-enhanced:hover .action-arrow-enhanced {
  opacity: 1;
  transform: translateX(0);
}

/* Dialogs */
.add-merchant-dialog,
.merchant-details-dialog {
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 20px;
}

.add-merchant-dialog {
  min-width: 600px;
  max-width: 80vw;
}

.add-merchant-dialog .text-h6 {
  color: #bdf000;
  font-weight: 700;
}

.add-merchant-dialog :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.add-merchant-dialog :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.3);
}

.add-merchant-dialog :deep(.q-field__native) {
  color: #ffffff;
}

.add-merchant-dialog :deep(.q-field__label) {
  color: #bdf000;
}

.dialog-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.dialog-content {
  padding: 24px;
}

.merchant-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-section.full-width {
  grid-column: 1 / -1;
}

.section-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  color: #999;
  font-weight: 500;
}

.detail-value {
  color: #ffffff;
  font-weight: 600;
}

/* Animations */
.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

.section-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 32px 0;
  position: relative;
  padding-left: 16px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(180deg, #bdf000, #8bc34a);
  border-radius: 2px;
}

.text-grey-6 {
  color: #999;
}

.error-message {
  margin-top: 24px;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .enhanced-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 1024px) {
  .welcome-content {
    flex-direction: column;
    text-align: center;
  }

  .welcome-title {
    font-size: 2.2rem;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .enhanced-actions-grid {
    grid-template-columns: 1fr;
  }

  .merchant-details-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .admin-content {
    padding: 16px;
  }

  .welcome-section {
    padding: 24px;
  }

  .welcome-title {
    font-size: 1.8rem;
  }

  .kpi-section .row {
    flex-direction: column;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .add-merchant-dialog {
    min-width: 90vw;
    margin: 16px;
  }

  .header-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .merchant-filters .row {
    flex-direction: column;
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}

/* Enhanced focus states */
.kpi-card:focus-visible,
.action-card-enhanced:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Performance optimizations */
.kpi-card,
.action-card-enhanced {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>