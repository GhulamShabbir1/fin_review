<template>
  <div class="merchant-dashboard">
    <!-- Header Section -->
    <div class="dashboard-header neon-card">
      <div class="header-content">
        <div class="welcome-section">
          <h1 class="neon-text">Welcome back, {{ user?.name || 'Merchant' }}!</h1>
          <p class="text-secondary">Manage your business and track your success</p>
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
        <h2 class="neon-text">Revenue Trends</h2>
        <div class="chart-wrapper">
          <canvas ref="revenueChart" v-if="!chartLoading"></canvas>
          <div v-else class="chart-loading">
            <q-spinner color="primary" size="3rem" />
            <p>Loading chart...</p>
          </div>
        </div>
      </div>
      
      <div class="chart-container neon-card">
        <h2 class="neon-text">Transaction Volume</h2>
        <div class="chart-wrapper">
          <canvas ref="volumeChart" v-if="!chartLoading"></canvas>
          <div v-else class="chart-loading">
            <q-spinner color="primary" size="3rem" />
            <p>Loading chart...</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="transactions-section neon-card">
      <div class="section-header">
        <h2 class="neon-text">Recent Transactions</h2>
        <q-btn class="neon-btn" @click="viewAllTransactions">
          View All
        </q-btn>
      </div>
      
      <div class="transactions-list">
        <div 
          v-for="transaction in recentTransactions" 
          :key="transaction.id"
          class="transaction-item"
        >
          <div class="transaction-info">
            <div class="transaction-customer">
              <h4>{{ transaction.customer_name }}</h4>
              <p>{{ transaction.customer_email }}</p>
            </div>
            <div class="transaction-amount">
              <span class="amount">${{ transaction.amount }}</span>
              <span class="status" :class="transaction.status">
                {{ transaction.status }}
              </span>
            </div>
          </div>
          <div class="transaction-actions">
            <q-btn 
              v-if="transaction.status === 'paid'"
              class="neon-btn-small"
              @click="processRefund(transaction)"
            >
              Refund
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Refund Dialog -->
    <q-dialog v-model="refundDialog" persistent>
      <q-card class="neon-card refund-dialog">
        <q-card-section>
          <div class="text-h6 neon-text">Process Refund</div>
        </q-card-section>
        
        <q-card-section>
          <div class="refund-info">
            <p><strong>Customer:</strong> {{ selectedTransaction?.customer_name }}</p>
            <p><strong>Amount:</strong> ${{ selectedTransaction?.amount }}</p>
            <p><strong>Transaction ID:</strong> {{ selectedTransaction?.id }}</p>
          </div>
          
          <q-input
            v-model="refundAmount"
            label="Refund Amount"
            type="number"
            :max="selectedTransaction?.amount"
            class="neon-input"
            outlined
          />
          
          <q-input
            v-model="refundReason"
            label="Refund Reason"
            type="textarea"
            class="neon-input"
            outlined
          />
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat @click="refundDialog = false">Cancel</q-btn>
          <q-btn class="neon-btn" @click="confirmRefund" :loading="refundLoading">
            Process Refund
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/store/auth'
import { useMerchantsStore } from 'src/store/merchants'
import Chart from 'chart.js/auto'

export default {
  name: 'MerchantDashboardPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore()
    const merchantsStore = useMerchantsStore()
    
    const realTimeEnabled = ref(false)
    const statsUpdating = ref(false)
    const chartLoading = ref(true)
    const refundDialog = ref(false)
    const refundLoading = ref(false)
    const selectedTransaction = ref(null)
    const refundAmount = ref(0)
    const refundReason = ref('')
    
    const revenueChart = ref(null)
    const volumeChart = ref(null)
    let realTimeInterval = null
    
    const user = computed(() => authStore.user)
    
    const stats = ref([
      {
        title: 'Total Revenue',
        value: '$0',
        icon: 'attach_money',
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
        title: 'Success Rate',
        value: '0%',
        icon: 'check_circle',
        change: '+0%',
        changeClass: 'positive',
        changeIcon: 'trending_up'
      },
      {
        title: 'Pending Refunds',
        value: '0',
        icon: 'pending',
        change: '+0%',
        changeClass: 'neutral',
        changeIcon: 'trending_flat'
      }
    ])
    
    const recentTransactions = ref([])
    
    const loadDashboardData = async () => {
      try {
        statsUpdating.value = true
        await merchantsStore.fetchDashboardStats()
        
        // Update stats with real data
        const dashboardData = merchantsStore.dashboardStats
        stats.value[0].value = `$${dashboardData.totalRevenue || 0}`
        stats.value[1].value = dashboardData.totalTransactions || 0
        stats.value[2].value = `${dashboardData.successRate || 0}%`
        stats.value[3].value = dashboardData.pendingRefunds || 0
        
        // Load recent transactions
        await merchantsStore.fetchTransactions()
        recentTransactions.value = merchantsStore.transactions.slice(0, 5)
        
        // Initialize charts
        await initializeCharts()
        
      } catch{
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
              label: 'Revenue',
              data: [12000, 19000, 15000, 25000, 22000, 30000],
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
      
      // Volume Chart
      if (volumeChart.value) {
        new Chart(volumeChart.value, {
          type: 'doughnut',
          data: {
            labels: ['Successful', 'Failed', 'Pending'],
            datasets: [{
              data: [85, 10, 5],
              backgroundColor: [
                '#00ff88',
                '#ff6b35',
                '#ffff00'
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
    
    const processRefund = (transaction) => {
      selectedTransaction.value = transaction
      refundAmount.value = transaction.amount
      refundDialog.value = true
    }
    
    const confirmRefund = async () => {
      if (!refundAmount.value || refundAmount.value <= 0) {
        $q.notify({
          type: 'negative',
          message: 'Please enter a valid refund amount',
          position: 'top'
        })
        return
      }
      
      refundLoading.value = true
      try {
        await merchantsStore.processRefund({
          transaction_id: selectedTransaction.value.id,
          amount: refundAmount.value,
          reason: refundReason.value
        })
        
        $q.notify({
          type: 'positive',
          message: 'Refund processed successfully',
          position: 'top'
        })
        
        refundDialog.value = false
        refreshData()
        
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Refund failed',
          position: 'top'
        })
      } finally {
        refundLoading.value = false
      }
    }
    
    const viewAllTransactions = () => {
      router.push('/merchant/transactions')
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
      recentTransactions,
      realTimeEnabled,
      statsUpdating,
      chartLoading,
      refundDialog,
      refundLoading,
      selectedTransaction,
      refundAmount,
      refundReason,
      revenueChart,
      volumeChart,
      refreshData,
      toggleRealTime,
      processRefund,
      confirmRefund,
      viewAllTransactions
    }
  }
}
</script>

<style scoped>
.merchant-dashboard {
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

.transactions-section {
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

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.transaction-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background: var(--bg-tertiary);
  border-radius: 10px;
  border: 1px solid var(--border-subtle);
  transition: all 0.3s ease;
}

.transaction-item:hover {
  border-color: var(--neon-cyan);
  box-shadow: 0 5px 15px rgba(0, 255, 255, 0.2);
}

.transaction-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex: 1;
  margin-right: 20px;
}

.transaction-customer h4 {
  margin: 0 0 5px 0;
  color: var(--text-primary);
}

.transaction-customer p {
  margin: 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.transaction-amount {
  text-align: right;
}

.amount {
  display: block;
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--neon-green);
}

.status {
  display: block;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 5px;
}

.status.paid {
  background: rgba(0, 255, 136, 0.2);
  color: var(--neon-green);
}

.status.failed {
  background: rgba(255, 107, 53, 0.2);
  color: var(--neon-orange);
}

.status.pending {
  background: rgba(255, 255, 0, 0.2);
  color: var(--neon-yellow);
}

.refund-dialog {
  min-width: 500px;
}

.refund-info {
  margin-bottom: 20px;
  padding: 15px;
  background: var(--bg-tertiary);
  border-radius: 8px;
}

.refund-info p {
  margin: 5px 0;
  color: var(--text-primary);
}

@media (max-width: 768px) {
  .charts-section {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .transaction-info {
    flex-direction: column;
    align-items: flex-start;
    margin-right: 0;
    margin-bottom: 15px;
  }
  
  .transaction-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>