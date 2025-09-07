<template>
  <div class="admin-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header neon-card">
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="neon-text">Admin Dashboard</h1>
          <p class="text-secondary">Monitor and manage the entire platform</p>
        </div>
        <div class="header-actions">
          <q-btn class="neon-btn" @click="refreshData">
            <q-icon name="refresh" left />
            Refresh
          </q-btn>
          <q-btn class="neon-btn" @click="toggleRealTime">
            <q-icon :name="realTimeEnabled ? 'pause' : 'play_arrow'" left />
            {{ realTimeEnabled ? 'Pause' : 'Start' }} Real-time
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card neon-card" v-for="stat in stats" :key="stat.title">
        <div class="stat-icon">
          <q-icon :name="stat.icon" size="2rem" />
        </div>
        <div class="stat-content">
          <h3 class="stat-value">{{ stat.value }}</h3>
          <p class="stat-title">{{ stat.title }}</p>
          <div class="stat-change" :class="stat.changeClass">
            <q-icon :name="stat.changeIcon" size="1rem" />
            {{ stat.change }}
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-container neon-card">
        <h2 class="neon-text">Platform Revenue</h2>
        <div class="chart-wrapper">
          <canvas ref="revenueChart" v-if="!chartLoading"></canvas>
          <div v-else class="chart-loading">
            <q-spinner color="primary" size="3rem" />
            <p>Loading chart...</p>
          </div>
        </div>
      </div>
      
      <div class="chart-container neon-card">
        <h2 class="neon-text">Merchant Distribution</h2>
        <div class="chart-wrapper">
          <canvas ref="merchantChart" v-if="!chartLoading"></canvas>
          <div v-else class="chart-loading">
            <q-spinner color="primary" size="3rem" />
            <p>Loading chart...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Pending Approvals -->
    <div class="approvals-section neon-card">
      <div class="section-header">
        <h2 class="neon-text">Pending Merchant Approvals</h2>
        <q-badge color="orange" :label="pendingMerchants.length" />
      </div>
      
      <div class="merchants-list">
        <div 
          v-for="merchant in pendingMerchants" 
          :key="merchant.id"
          class="merchant-item"
        >
          <div class="merchant-info">
            <div class="merchant-details">
              <h4>{{ merchant.business_name }}</h4>
              <p>{{ merchant.owner_name }} - {{ merchant.email }}</p>
              <div class="merchant-meta">
                <span class="meta-item">
                  <q-icon name="business" size="1rem" />
                  {{ merchant.business_type }}
                </span>
                <span class="meta-item">
                  <q-icon name="calendar_today" size="1rem" />
                  {{ formatDate(merchant.created_at) }}
                </span>
              </div>
            </div>
            <div class="merchant-actions">
              <q-btn 
                class="neon-btn-success"
                @click="reviewMerchant(merchant, 'approved')"
                :loading="reviewLoading"
              >
                <q-icon name="check" left />
                Approve
              </q-btn>
              <q-btn 
                class="neon-btn-danger"
                @click="reviewMerchant(merchant, 'rejected')"
                :loading="reviewLoading"
              >
                <q-icon name="close" left />
                Reject
              </q-btn>
              <q-btn 
                class="neon-btn-small"
                @click="viewMerchantDetails(merchant)"
              >
                View Details
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Merchant Details Dialog -->
    <q-dialog v-model="merchantDialog" persistent>
      <q-card class="neon-card merchant-dialog">
        <q-card-section>
          <div class="text-h6 neon-text">Merchant Details</div>
        </q-card-section>
        
        <q-card-section v-if="selectedMerchant">
          <div class="merchant-details-content">
            <div class="detail-row">
              <strong>Business Name:</strong> {{ selectedMerchant.business_name }}
            </div>
            <div class="detail-row">
              <strong>Owner Name:</strong> {{ selectedMerchant.owner_name }}
            </div>
            <div class="detail-row">
              <strong>Email:</strong> {{ selectedMerchant.email }}
            </div>
            <div class="detail-row">
              <strong>Business Type:</strong> {{ selectedMerchant.business_type }}
            </div>
            <div class="detail-row">
              <strong>Phone:</strong> {{ selectedMerchant.phone }}
            </div>
            <div class="detail-row">
              <strong>Address:</strong> {{ selectedMerchant.address }}
            </div>
            <div class="detail-row">
              <strong>Registration Date:</strong> {{ formatDate(selectedMerchant.created_at) }}
            </div>
            <div class="detail-row">
              <strong>Status:</strong> 
              <q-badge :color="selectedMerchant.status === 'approved' ? 'green' : 'orange'">
                {{ selectedMerchant.status }}
              </q-badge>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat @click="merchantDialog = false">Close</q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'
import { useMerchantsStore } from 'src/stores/merchants'
import Chart from 'chart.js/auto'

export default {
  name: 'AdminDashboardPage',
  setup() {
    const $q = useQuasar()
    const authStore = useAuthStore()
    const merchantsStore = useMerchantsStore()
    
    const realTimeEnabled = ref(false)
    const statsUpdating = ref(false)
    const chartLoading = ref(true)
    const reviewLoading = ref(false)
    const merchantDialog = ref(false)
    const selectedMerchant = ref(null)
    
    const revenueChart = ref(null)
    const merchantChart = ref(null)
    let realTimeInterval = null
    
    const user = computed(() => authStore.user)
    
    const stats = ref([
      {
        title: 'Total Merchants',
        value: '0',
        icon: 'business',
        change: '+0%',
        changeClass: 'positive',
        changeIcon: 'trending_up'
      },
      {
        title: 'Total Transactions',
        value: '0',
        icon: 'receipt',
        change: '+0%',
        changeClass: 'positive',
        changeIcon: 'trending_up'
      },
      {
        title: 'Platform Revenue',
        value: '$0',
        icon: 'attach_money',
        change: '+0%',
        changeClass: 'positive',
        changeIcon: 'trending_up'
      },
      {
        title: 'Pending Approvals',
        value: '0',
        icon: 'pending',
        change: '+0%',
        changeClass: 'neutral',
        changeIcon: 'trending_flat'
      }
    ])
    
    const pendingMerchants = ref([])
    
    const loadDashboardData = async () => {
      try {
        statsUpdating.value = true
        await merchantsStore.fetchAdminDashboardStats()
        
        // Update stats with real data
        const dashboardData = merchantsStore.adminDashboardStats
        stats.value[0].value = dashboardData.totalMerchants || 0
        stats.value[1].value = dashboardData.totalTransactions || 0
        stats.value[2].value = `$${dashboardData.totalRevenue || 0}`
        stats.value[3].value = dashboardData.pendingApprovals || 0
        
        // Load pending merchants
        await merchantsStore.fetchPendingMerchants()
        pendingMerchants.value = merchantsStore.pendingMerchants
        
        // Initialize charts
        await initializeCharts()
        
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load dashboard data',
          position: 'top'
        })
      } finally {
        statsUpdating.value = false
        chartLoading.value = false
      }
    }
    
    const initializeCharts = async () => {
      // Revenue Chart
      if (revenueChart.value) {
        new Chart(revenueChart.value, {
          type: 'line',
          data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
              label: 'Platform Revenue',
              data: [50000, 75000, 60000, 90000, 85000, 120000],
              borderColor: '#00ffff',
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              tension: 0.4,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#ffffff'
                }
              }
            },
            scales: {
              x: {
                ticks: { color: '#ffffff' },
                grid: { color: '#333333' }
              },
              y: {
                ticks: { color: '#ffffff' },
                grid: { color: '#333333' }
              }
            }
          }
        })
      }
      
      // Merchant Chart
      if (merchantChart.value) {
        new Chart(merchantChart.value, {
          type: 'doughnut',
          data: {
            labels: ['Approved', 'Pending', 'Rejected'],
            datasets: [{
              data: [75, 15, 10],
              backgroundColor: [
                '#00ff88',
                '#ffff00',
                '#ff6b35'
              ],
              borderColor: '#1e1e1e',
              borderWidth: 2
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  color: '#ffffff'
                }
              }
            }
          }
        })
      }
    }
    
    const refreshData = () => {
      loadDashboardData()
    }
    
    const toggleRealTime = () => {
      realTimeEnabled.value = !realTimeEnabled.value
      
      if (realTimeEnabled.value) {
        realTimeInterval = setInterval(() => {
          refreshData()
        }, 30000) // Refresh every 30 seconds
      } else {
        if (realTimeInterval) {
          clearInterval(realTimeInterval)
          realTimeInterval = null
        }
      }
    }
    
    const reviewMerchant = async (merchant, action) => {
      reviewLoading.value = true
      try {
        await merchantsStore.reviewMerchant(merchant.id, action)
        
        $q.notify({
          type: 'positive',
          message: `Merchant ${action} successfully`,
          position: 'top'
        })
        
        // Remove from pending list
        pendingMerchants.value = pendingMerchants.value.filter(m => m.id !== merchant.id)
        
        // Update stats
        stats.value[3].value = pendingMerchants.value.length
        
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Failed to review merchant',
          position: 'top'
        })
      } finally {
        reviewLoading.value = false
      }
    }
    
    const viewMerchantDetails = (merchant) => {
      selectedMerchant.value = merchant
      merchantDialog.value = true
    }
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }
    
    onMounted(() => {
      loadDashboardData()
    })
    
    onUnmounted(() => {
      if (realTimeInterval) {
        clearInterval(realTimeInterval)
      }
    })
    
    return {
      user,
      stats,
      pendingMerchants,
      realTimeEnabled,
      statsUpdating,
      chartLoading,
      reviewLoading,
      merchantDialog,
      selectedMerchant,
      revenueChart,
      merchantChart,
      refreshData,
      toggleRealTime,
      reviewMerchant,
      viewMerchantDetails,
      formatDate
    }
  }
}
</script>

<style scoped>
.admin-dashboard {
  padding: 20px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.dashboard-header {
  margin-bottom: 30px;
  padding: 30px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.welcome-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 20px var(--neon-cyan);
}

.header-actions {
  display: flex;
  gap: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  padding: 25px;
  display: flex;
  align-items: center;
  gap: 20px;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 255, 255, 0.3);
}

.stat-icon {
  color: var(--neon-cyan);
}

.stat-content h3 {
  font-size: 2rem;
  margin: 0;
  color: var(--neon-cyan);
}

.stat-title {
  margin: 5px 0;
  color: var(--text-secondary);
}

.stat-change {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
}

.stat-change.positive {
  color: var(--neon-green);
}

.stat-change.negative {
  color: var(--neon-orange);
}

.stat-change.neutral {
  color: var(--text-secondary);
}

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.chart-container {
  padding: 25px;
}

.chart-container h2 {
  margin-bottom: 20px;
  text-shadow: 0 0 15px var(--neon-cyan);
}

.chart-wrapper {
  height: 300px;
  position: relative;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
}

.approvals-section {
  padding: 25px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  text-shadow: 0 0 15px var(--neon-cyan);
}

.merchants-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.merchant-item {
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  transition: all 0.3s ease;
}

.merchant-item:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
}

.merchant-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.merchant-details h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.merchant-details p {
  margin: 0 0 10px 0;
  color: var(--text-secondary);
}

.merchant-meta {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.merchant-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.merchant-dialog {
  min-width: 600px;
}

.merchant-details-content {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  color: var(--neon-cyan);
  min-width: 150px;
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .merchant-info {
    flex-direction: column;
    align-items: stretch;
  }
  
  .merchant-actions {
    justify-content: center;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>