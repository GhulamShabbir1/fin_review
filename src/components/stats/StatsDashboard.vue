<template>
  <div class="stats-dashboard">
    <!-- Enhanced Charts Grid -->
    <div class="charts-grid">
      <!-- Enhanced Revenue Chart -->
      <div class="chart-card lime-glow revenue-chart">
        <div class="card-header">
          <div class="header-left">
            <h3 class="card-title">
              <q-icon name="trending_up" size="20px" color="lime" class="q-mr-sm" />
              Revenue Trends
            </h3>
            <div class="card-subtitle">Monthly revenue performance</div>
          </div>
          <div class="chart-actions">
            <q-btn-toggle v-model="revenueTimeframe" :options="timeframeOptions" color="lime" text-color="white"
              size="sm" @update:model-value="loadRevenueData" />
            <q-btn flat round dense icon="refresh" color="lime" @click="loadRevenueData" :loading="loadingRevenue" />
            <q-btn flat round dense icon="download" color="lime" @click="exportChart('revenue')" />
          </div>
        </div>
        <div class="chart-container">
          <div v-if="loadingRevenue" class="chart-loading">
            <q-spinner-dots color="lime" size="40px" />
            <p>Loading revenue data...</p>
          </div>
          <div v-else-if="revenueData.length > 0" class="chart-content">
            <div class="enhanced-revenue-chart">
              <div class="chart-stats">
                <div class="stat-item">
                  <span class="stat-label">Total Revenue:</span>
                  <span class="stat-value">${{ formatNumber(getTotalRevenue()) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Average:</span>
                  <span class="stat-value">${{ formatNumber(getAverageRevenue()) }}</span>
                </div>
                <div class="stat-item">
                  <span class="stat-label">Growth:</span>
                  <span class="stat-value" :class="getGrowthClass()">{{ getRevenueGrowth() }}%</span>
                </div>
              </div>
              <div class="revenue-bars">
                <div v-for="(item, index) in revenueData.slice(0, 12)" :key="index" class="revenue-bar"
                  @click="showRevenueDetails(item, index)">
                  <div class="bar-value">${{ formatNumber(item.revenue || item.value || 0) }}</div>
                  <div class="bar-fill" :style="{
                    height: getBarHeight(item.revenue || item.value || 0, revenueData),
                    background: getRevenueBarGradient(index)
                  }"></div>
                  <div class="bar-label">{{ item.date || item.label || `M${index + 1}` }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="analytics" size="48px" color="grey-5" />
            <p>No revenue data available</p>
            <q-btn flat color="lime" label="Load Sample Data" @click="loadSampleRevenue" />
          </div>
        </div>
      </div>

      <!-- Enhanced Payment Methods Chart -->
      <div class="chart-card lime-glow methods-chart">
        <div class="card-header">
          <div class="header-left">
            <h3 class="card-title">
              <q-icon name="payment" size="20px" color="blue" class="q-mr-sm" />
              Payment Methods
            </h3>
            <div class="card-subtitle">Distribution by payment type</div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="loadMethodsData" :loading="loadingMethods" />
            <q-btn flat round dense icon="download" color="lime" @click="exportChart('methods')" />
          </div>
        </div>
        <div class="chart-container">
          <div v-if="loadingMethods" class="chart-loading">
            <q-spinner-dots color="lime" size="40px" />
            <p>Loading payment methods...</p>
          </div>
          <div v-else-if="methodsData.length > 0" class="chart-content">
            <div class="methods-chart-content">
              <div class="methods-summary">
                <div class="total-transactions">
                  <span class="summary-label">Total Transactions:</span>
                  <span class="summary-value">{{ formatNumber(getTotalTransactions()) }}</span>
                </div>
              </div>
              <div class="methods-list">
                <div v-for="(method, index) in methodsData.slice(0, 6)" :key="index" class="method-item"
                  @click="showMethodDetails(method, index)">
                  <div class="method-info">
                    <div class="method-icon">
                      <q-icon :name="getPaymentMethodIcon(method.label)" size="20px" :color="method.color" />
                    </div>
                    <div class="method-details">
                      <div class="method-name">{{ method.label }}</div>
                      <div class="method-count">{{ formatNumber(method.count || 0) }} transactions</div>
                    </div>
                    <div class="method-percentage">{{ method.value }}%</div>
                  </div>
                  <div class="method-bar">
                    <div class="method-fill" :style="{
                      width: method.value + '%',
                      backgroundColor: method.color,
                      boxShadow: `0 0 10px ${method.color}40`
                    }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="payment" size="48px" color="grey-5" />
            <p>No payment method data available</p>
            <q-btn flat color="lime" label="Load Sample Data" @click="loadSampleMethods" />
          </div>
        </div>
      </div>

      <!-- Enhanced Transaction Trends -->
      <div class="chart-card lime-glow full-width trends-chart">
        <div class="card-header">
          <div class="header-left">
            <h3 class="card-title">
              <q-icon name="receipt_long" size="20px" color="purple" class="q-mr-sm" />
              Transaction Trends
            </h3>
            <div class="card-subtitle">Daily transaction volume and success rates</div>
          </div>
          <div class="chart-actions">
            <q-select v-model="trendsTimeframe" :options="trendsTimeframeOptions" dense outlined
              @update:model-value="loadTrendsData" style="min-width: 120px" />
            <q-btn flat round dense icon="refresh" color="lime" @click="loadTrendsData" :loading="loadingTrends" />
            <q-btn flat round dense icon="download" color="lime" @click="exportChart('trends')" />
          </div>
        </div>
        <div class="chart-container">
          <div v-if="loadingTrends" class="chart-loading">
            <q-spinner-dots color="lime" size="40px" />
            <p>Loading transaction trends...</p>
          </div>
          <div v-else-if="trendsData.length > 0" class="chart-content">
            <div class="trends-chart-content">
              <div class="trends-metrics">
                <div class="metric-card">
                  <div class="metric-value">{{ formatNumber(getAverageTransactions()) }}</div>
                  <div class="metric-label">Avg Daily</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ getSuccessRate() }}%</div>
                  <div class="metric-label">Success Rate</div>
                </div>
                <div class="metric-card">
                  <div class="metric-value">{{ getPeakDay() }}</div>
                  <div class="metric-label">Peak Day</div>
                </div>
              </div>
              <div class="trends-chart-area">
                <div class="chart-grid">
                  <div v-for="(item, index) in trendsData.slice(0, 14)" :key="index" class="trend-bar"
                    @click="showTrendDetails(item, index)">
                    <div class="trend-value">{{ formatNumber(item.transactions || item.value || 0) }}</div>
                    <div class="trend-fill" :style="{
                      height: getBarHeight(item.transactions || item.value || 0, trendsData),
                      background: getTrendBarGradient(item.success_rate || 85)
                    }"></div>
                    <div class="trend-label">{{ item.date || item.label || `D${index + 1}` }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="receipt_long" size="48px" color="grey-5" />
            <p>No transaction trend data available</p>
            <q-btn flat color="lime" label="Load Sample Data" @click="loadSampleTrends" />
          </div>
        </div>
      </div>

      <!-- Enhanced Checkout Time Analysis -->
      <div class="chart-card lime-glow checkout-chart">
        <div class="card-header">
          <div class="header-left">
            <h3 class="card-title">
              <q-icon name="timer" size="20px" color="orange" class="q-mr-sm" />
              Checkout Performance
            </h3>
            <div class="card-subtitle">Average checkout completion time</div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="loadCheckoutData" :loading="loadingCheckout" />
            <q-btn flat round dense icon="download" color="lime" @click="exportChart('checkout')" />
          </div>
        </div>
        <div class="chart-container">
          <div v-if="loadingCheckout" class="chart-loading">
            <q-spinner-dots color="lime" size="40px" />
            <p>Loading checkout data...</p>
          </div>
          <div v-else-if="checkoutTimeData.length > 0" class="chart-content">
            <div class="checkout-chart-content">
              <div class="checkout-metrics">
                <div class="checkout-metric">
                  <div class="metric-icon">
                    <q-icon name="speed" color="orange" size="24px" />
                  </div>
                  <div class="metric-info">
                    <div class="metric-value">{{ getAverageCheckoutTime() }}s</div>
                    <div class="metric-label">Average Time</div>
                  </div>
                </div>
                <div class="checkout-metric">
                  <div class="metric-icon">
                    <q-icon name="flash_on" color="green" size="24px" />
                  </div>
                  <div class="metric-info">
                    <div class="metric-value">{{ getFastestCheckout() }}s</div>
                    <div class="metric-label">Fastest</div>
                  </div>
                </div>
              </div>
              <div class="checkout-bars">
                <div v-for="(time, index) in checkoutTimeData.slice(0, 8)" :key="index" class="checkout-bar">
                  <div class="bar-time">{{ time }}s</div>
                  <div class="bar-fill" :style="{
                    height: getCheckoutBarHeight(time),
                    backgroundColor: getCheckoutBarColor(time)
                  }"></div>
                  <div class="bar-step">{{ checkoutTimeLabels[index] || `Step ${index + 1}` }}</div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="timer" size="48px" color="grey-5" />
            <p>No checkout time data available</p>
            <q-btn flat color="lime" label="Load Sample Data" @click="loadSampleCheckout" />
          </div>
        </div>
      </div>

      <!-- Enhanced Geography Chart -->
      <div class="chart-card lime-glow geography-chart">
        <div class="card-header">
          <div class="header-left">
            <h3 class="card-title">
              <q-icon name="public" size="20px" color="teal" class="q-mr-sm" />
              Geographic Distribution
            </h3>
            <div class="card-subtitle">Transactions by location</div>
          </div>
          <div class="chart-actions">
            <q-btn flat round dense icon="refresh" color="lime" @click="loadGeographyData"
              :loading="loadingGeography" />
            <q-btn flat round dense icon="download" color="lime" @click="exportChart('geography')" />
          </div>
        </div>
        <div class="chart-container">
          <div v-if="loadingGeography" class="chart-loading">
            <q-spinner-dots color="lime" size="40px" />
            <p>Loading geography data...</p>
          </div>
          <div v-else-if="geographyData.length > 0" class="chart-content">
            <div class="geography-chart-content">
              <div class="geography-summary">
                <div class="summary-stat">
                  <span class="summary-label">Top Region:</span>
                  <span class="summary-value">{{ getTopRegion() }}</span>
                </div>
                <div class="summary-stat">
                  <span class="summary-label">Countries:</span>
                  <span class="summary-value">{{ geographyData.length }}</span>
                </div>
              </div>
              <div class="geography-bars">
                <div v-for="(geo, index) in geographyData.slice(0, 8)" :key="index" class="geo-item"
                  @click="showGeographyDetails(geo, index)">
                  <div class="geo-info">
                    <div class="geo-flag">
                      <span class="flag-emoji">{{ getCountryFlag(geo.country || geo.label) }}</span>
                    </div>
                    <div class="geo-details">
                      <div class="geo-name">{{ geo.country || geo.label }}</div>
                      <div class="geo-count">{{ formatNumber(geo.transactions || geo.value || 0) }} transactions</div>
                    </div>
                    <div class="geo-percentage">{{ geo.percentage || Math.round((geo.value / getTotalGeoValue()) * 100)
                      }}%</div>
                  </div>
                  <div class="geo-bar">
                    <div class="geo-fill" :style="{
                      width: (geo.percentage || Math.round((geo.value / getTotalGeoValue()) * 100)) + '%',
                      backgroundColor: getGeoBarColor(index)
                    }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="chart-empty">
            <q-icon name="public" size="48px" color="grey-5" />
            <p>No geographic data available</p>
            <q-btn flat color="lime" label="Load Sample Data" @click="loadSampleGeography" />
          </div>
        </div>
      </div>
    </div>

    <!-- Enhanced Analytics Summary -->
    <div class="analytics-summary q-mt-xl">
      <q-card class="summary-card lime-glow">
        <q-card-section>
          <div class="summary-header">
            <h4 class="summary-title">
              <q-icon name="insights" size="24px" color="lime" class="q-mr-sm" />
              Analytics Summary
            </h4>
            <div class="summary-actions">
              <q-btn color="lime" icon="download" label="Export All Data" @click="exportAllData" :loading="exporting" />
              <q-btn color="blue" icon="refresh" label="Refresh All" @click="refreshAllData" :loading="refreshing" />
            </div>
          </div>

          <div class="summary-content">
            <div class="summary-grid">
              <div class="summary-metric">
                <div class="metric-header">
                  <q-icon name="trending_up" color="green" size="20px" />
                  <span class="metric-title">Performance</span>
                </div>
                <div class="metric-value">{{ getOverallPerformance() }}</div>
                <div class="metric-description">Based on revenue growth and transaction success rate</div>
              </div>

              <div class="summary-metric">
                <div class="metric-header">
                  <q-icon name="speed" color="blue" size="20px" />
                  <span class="metric-title">Efficiency</span>
                </div>
                <div class="metric-value">{{ getEfficiencyScore() }}</div>
                <div class="metric-description">Average checkout time and completion rate</div>
              </div>

              <div class="summary-metric">
                <div class="metric-header">
                  <q-icon name="public" color="purple" size="20px" />
                  <span class="metric-title">Reach</span>
                </div>
                <div class="metric-value">{{ getGlobalReach() }}</div>
                <div class="metric-description">Geographic distribution and market penetration</div>
              </div>

              <div class="summary-metric">
                <div class="metric-header">
                  <q-icon name="psychology" color="orange" size="20px" />
                  <span class="metric-title">Insights</span>
                </div>
                <div class="metric-value">{{ getInsightsCount() }}</div>
                <div class="metric-description">Actionable insights and recommendations</div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Chart Details Dialog -->
    <q-dialog v-model="showChartDetails" persistent>
      <q-card class="chart-details-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ selectedChartTitle }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedChartData" class="dialog-content">
          <div class="chart-detail-content">
            <div class="detail-value">{{ selectedChartData.value || selectedChartData.revenue || 'N/A' }}</div>
            <div class="detail-label">{{ selectedChartData.label || selectedChartData.date || 'Data Point' }}</div>
            <div class="detail-description" v-if="selectedChartData.description">
              {{ selectedChartData.description }}
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Global Loading State -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="60px" />
      <p class="loading-text">Loading analytics dashboard...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue' // Remove unused computed import
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'

const $q = useQuasar()

// Props
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({})
  }
})

// Reactive data
const loading = ref(false)
const loadingRevenue = ref(false)
const loadingMethods = ref(false)
const loadingTrends = ref(false)
const loadingCheckout = ref(false)
const loadingGeography = ref(false)
const exporting = ref(false)
const refreshing = ref(false)

// Chart data
const revenueData = ref([])
const methodsData = ref([])
const trendsData = ref([])
const checkoutTimeData = ref([])
const checkoutTimeLabels = ref([])
const geographyData = ref([])
const geographyLabels = ref([])

// Timeframe controls
const revenueTimeframe = ref('6months')
const trendsTimeframe = ref('30days')

// Dialog states
const showChartDetails = ref(false)
const selectedChartTitle = ref('')
const selectedChartData = ref(null)

// Options
const timeframeOptions = [
  { label: '7 Days', value: '7days' },
  { label: '30 Days', value: '30days' },
  { label: '6 Months', value: '6months' },
  { label: '1 Year', value: '1year' }
]

const trendsTimeframeOptions = [
  { label: 'Last 7 Days', value: '7days' },
  { label: 'Last 30 Days', value: '30days' },
  { label: 'Last 90 Days', value: '90days' }
]

// Methods
const loadAllData = async () => {
  try {
    loading.value = true
    console.log('🔄 Loading all analytics data...')

    await Promise.allSettled([
      loadRevenueData(),
      loadMethodsData(),
      loadTrendsData(),
      loadCheckoutData(),
      loadGeographyData()
    ])

    console.log('✅ All analytics data loaded')
  } catch (error) {
    console.error('❌ Failed to load analytics data:', error)
  } finally {
    loading.value = false
  }
}

const loadRevenueData = async () => {
  try {
    loadingRevenue.value = true
    console.log('🔄 Loading revenue data...')

    // ✅ Try to load from your backend (endpoint not in API docs)
    try {
      const response = await api.get('/admin/stats/revenue', {
        params: { timeframe: revenueTimeframe.value, ...props.filters }
      })
      revenueData.value = response.data?.data || response.data || []
      console.log('✅ Revenue data loaded from API:', revenueData.value.length)
    } catch (error) {
      console.warn('⚠️ Revenue API not available:', error.message)
      loadSampleRevenue()
    }
  } catch (error) {
    console.error('❌ Revenue data load error:', error)
    loadSampleRevenue()
  } finally {
    loadingRevenue.value = false
  }
}

const loadMethodsData = async () => {
  try {
    loadingMethods.value = true
    console.log('🔄 Loading payment methods data...')

    try {
      const response = await api.get('/admin/stats/methods', {
        params: props.filters
      })
      methodsData.value = response.data?.data || response.data || []
      console.log('✅ Methods data loaded from API:', methodsData.value.length)
    } catch {
      console.warn('⚠️ Payment methods API not available, using sample data')
      loadSampleMethods()
    }
  } catch (error) {
    console.error('❌ Methods data load error:', error)
    loadSampleMethods()
  } finally {
    loadingMethods.value = false
  }
}

const loadTrendsData = async () => {
  try {
    loadingTrends.value = true
    console.log('🔄 Loading transaction trends...')

    try {
      const response = await api.get('/admin/stats/transactions', {
        params: { timeframe: trendsTimeframe.value, ...props.filters }
      })
      trendsData.value = response.data?.data || response.data || []
      console.log('✅ Trends data loaded from API:', trendsData.value.length)
    } catch {
      console.warn('⚠️ Trends API not available, using sample data')
      loadSampleTrends()
    }
  } catch (error) {
    console.error('❌ Trends data load error:', error)
    loadSampleTrends()
  } finally {
    loadingTrends.value = false
  }
}

const loadCheckoutData = async () => {
  try {
    loadingCheckout.value = true
    console.log('🔄 Loading checkout time data...')

    try {
      const response = await api.get('/admin/stats/checkout-time', {
        params: props.filters
      })
      const data = response.data
      checkoutTimeData.value = data?.values || data?.data || []
      checkoutTimeLabels.value = data?.labels || []
      console.log('✅ Checkout data loaded from API:', checkoutTimeData.value.length)
    } catch {
      console.warn('⚠️ Checkout API not available, using sample data')
      loadSampleCheckout()
    }
  } catch (error) {
    console.error('❌ Checkout data load error:', error)
    loadSampleCheckout()
  } finally {
    loadingCheckout.value = false
  }
}

const loadGeographyData = async () => {
  try {
    loadingGeography.value = true
    console.log('🔄 Loading geography data...')

    try {
      const response = await api.get('/admin/stats/geography', {
        params: props.filters
      })
      const data = response.data
      geographyData.value = data?.data || data || []
      geographyLabels.value = data?.labels || []
      console.log('✅ Geography data loaded from API:', geographyData.value.length)
    } catch {
      console.warn('⚠️ Geography API not available, using sample data')
      loadSampleGeography()
    }
  } catch (error) {
    console.error('❌ Geography data load error:', error)
    loadSampleGeography()
  } finally {
    loadingGeography.value = false
  }
}

// Sample data loaders
const loadSampleRevenue = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  revenueData.value = months.map((month, index) => ({
    date: month,
    revenue: 125000 + (index * 15000) + Math.random() * 20000,
    transactions: 1200 + (index * 150) + Math.random() * 200
  }))
}

const loadSampleMethods = () => {
  methodsData.value = [
    { label: 'Credit Card', value: 45, color: '#bdf000', count: 1250 },
    { label: 'Debit Card', value: 30, color: '#2196f3', count: 830 },
    { label: 'Digital Wallet', value: 15, color: '#ff9800', count: 415 },
    { label: 'Bank Transfer', value: 8, color: '#9c27b0', count: 220 },
    { label: 'UPI', value: 2, color: '#4caf50', count: 55 }
  ]
}

const loadSampleTrends = () => {
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (13 - i))
    return {
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      transactions: 150 + Math.random() * 100,
      success_rate: 85 + Math.random() * 10,
      revenue: 12000 + Math.random() * 5000
    }
  })
  trendsData.value = days
}

const loadSampleCheckout = () => {
  checkoutTimeData.value = [2.1, 1.8, 3.2, 2.5, 1.9, 4.1, 2.8, 3.5]
  checkoutTimeLabels.value = ['Load', 'Info', 'Payment', 'Review', 'Process', 'Confirm', 'Receipt', 'Complete']
}

const loadSampleGeography = () => {
  geographyData.value = [
    { country: 'United States', value: 1250, percentage: 45 },
    { country: 'Canada', value: 680, percentage: 25 },
    { country: 'United Kingdom', value: 420, percentage: 15 },
    { country: 'Germany', value: 280, percentage: 10 },
    { country: 'France', value: 140, percentage: 5 }
  ]
}

// Chart interaction methods
const showRevenueDetails = (item) => {
  selectedChartTitle.value = `Revenue Details - ${item.date || item.label}`
  selectedChartData.value = {
    ...item,
    description: `Revenue data for ${item.date || item.label}`
  }
  showChartDetails.value = true
}

const showMethodDetails = (method) => {
  selectedChartTitle.value = `Payment Method - ${method.label}`
  selectedChartData.value = {
    ...method,
    description: `${method.label} accounts for ${method.value}%`
  }
  showChartDetails.value = true
}

const showTrendDetails = (item) => {
  selectedChartTitle.value = `Transaction Trend - ${item.date || item.label}`
  selectedChartData.value = {
    ...item,
    description: `${item.transactions || item.value || 0} transactions`
  }
  showChartDetails.value = true
}

const showGeographyDetails = (geo) => {
  selectedChartTitle.value = `Geographic Data - ${geo.country || geo.label}`
  selectedChartData.value = {
    ...geo,
    description: `${geo.percentage || 0}% of total transactions`
  }
  showChartDetails.value = true
}


// Data calculation methods
const getTotalRevenue = () => {
  return revenueData.value.reduce((sum, item) => sum + (item.revenue || item.value || 0), 0)
}

const getAverageRevenue = () => {
  if (revenueData.value.length === 0) return 0
  return getTotalRevenue() / revenueData.value.length
}

const getRevenueGrowth = () => {
  if (revenueData.value.length < 2) return 0
  const current = revenueData.value[revenueData.value.length - 1]?.revenue || 0
  const previous = revenueData.value[revenueData.value.length - 2]?.revenue || 0
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

const getGrowthClass = () => {
  const growth = getRevenueGrowth()
  if (growth > 0) return 'positive'
  if (growth < 0) return 'negative'
  return 'neutral'
}

const getTotalTransactions = () => {
  return methodsData.value.reduce((sum, method) => sum + (method.count || 0), 0)
}

const getAverageTransactions = () => {
  if (trendsData.value.length === 0) return 0
  return Math.round(trendsData.value.reduce((sum, item) => sum + (item.transactions || item.value || 0), 0) / trendsData.value.length)
}

const getSuccessRate = () => {
  if (trendsData.value.length === 0) return 0
  const avgSuccessRate = trendsData.value.reduce((sum, item) => sum + (item.success_rate || 85), 0) / trendsData.value.length
  return Math.round(avgSuccessRate)
}

const getPeakDay = () => {
  if (trendsData.value.length === 0) return 'N/A'
  const peakDay = trendsData.value.reduce((max, item) =>
    (item.transactions || item.value || 0) > (max.transactions || max.value || 0) ? item : max
  )
  return peakDay.date || peakDay.label || 'Unknown'
}

const getAverageCheckoutTime = () => {
  if (checkoutTimeData.value.length === 0) return 0
  const total = checkoutTimeData.value.reduce((sum, time) => sum + time, 0)
  return (total / checkoutTimeData.value.length).toFixed(1)
}

const getFastestCheckout = () => {
  if (checkoutTimeData.value.length === 0) return 0
  return Math.min(...checkoutTimeData.value).toFixed(1)
}

const getTopRegion = () => {
  if (geographyData.value.length === 0) return 'N/A'
  const topRegion = geographyData.value.reduce((max, geo) =>
    (geo.value || 0) > (max.value || 0) ? geo : max
  )
  return topRegion.country || topRegion.label || 'Unknown'
}

const getTotalGeoValue = () => {
  return geographyData.value.reduce((sum, geo) => sum + (geo.value || 0), 0)
}

// Summary calculations
const getOverallPerformance = () => {
  const revenueGrowth = Math.abs(getRevenueGrowth())
  const successRate = getSuccessRate()
  const score = Math.round((revenueGrowth + successRate) / 2)

  if (score >= 80) return 'Excellent'
  if (score >= 60) return 'Good'
  if (score >= 40) return 'Average'
  return 'Needs Improvement'
}

const getEfficiencyScore = () => {
  const avgTime = parseFloat(getAverageCheckoutTime())
  const successRate = getSuccessRate()

  // Lower checkout time is better
  const timeScore = Math.max(0, 100 - (avgTime * 10))
  const score = Math.round((timeScore + successRate) / 2)

  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 50) return 'Average'
  return 'Poor'
}

const getGlobalReach = () => {
  const countries = geographyData.value.length
  if (countries >= 10) return 'Global'
  if (countries >= 5) return 'Regional'
  if (countries >= 2) return 'Multi-Country'
  return 'Local'
}

const getInsightsCount = () => {
  let insights = 0

  // Revenue insights
  if (getRevenueGrowth() > 15) insights++
  if (getRevenueGrowth() < -10) insights++

  // Success rate insights
  if (getSuccessRate() > 95) insights++
  if (getSuccessRate() < 80) insights++

  // Checkout time insights
  const avgTime = parseFloat(getAverageCheckoutTime())
  if (avgTime < 2.0) insights++
  if (avgTime > 5.0) insights++

  // Geography insights
  if (geographyData.value.length > 8) insights++

  return insights
}

// Utility methods
const getBarHeight = (value, dataset) => {
  if (!dataset || dataset.length === 0) return '20px'

  const maxValue = Math.max(...dataset.map(item => item.revenue || item.value || item.transactions || 0))
  if (maxValue === 0) return '20px'

  const percentage = (value / maxValue) * 100
  return `${Math.max(percentage, 10)}%`
}

const getRevenueBarGradient = (index) => {
  const gradients = [
    'linear-gradient(180deg, #bdf000 0%, #8bc34a 100%)',
    'linear-gradient(180deg, #2196f3 0%, #1976d2 100%)',
    'linear-gradient(180deg, #ff9800 0%, #f57c00 100%)',
    'linear-gradient(180deg, #9c27b0 0%, #7b1fa2 100%)',
    'linear-gradient(180deg, #4caf50 0%, #388e3c 100%)',
    'linear-gradient(180deg, #f44336 0%, #d32f2f 100%)'
  ]
  return gradients[index % gradients.length]
}

const getTrendBarGradient = (successRate) => {
  if (successRate >= 95) return 'linear-gradient(180deg, #4caf50 0%, #388e3c 100%)'
  if (successRate >= 85) return 'linear-gradient(180deg, #bdf000 0%, #8bc34a 100%)'
  if (successRate >= 75) return 'linear-gradient(180deg, #ff9800 0%, #f57c00 100%)'
  return 'linear-gradient(180deg, #f44336 0%, #d32f2f 100%)'
}

const getCheckoutBarHeight = (time) => {
  const maxTime = Math.max(...checkoutTimeData.value)
  if (maxTime === 0) return '20px'
  return `${(time / maxTime) * 100}%`
}

const getCheckoutBarColor = (time) => {
  if (time <= 2) return '#4caf50'  // Green for fast
  if (time <= 3) return '#bdf000'  // Lime for good
  if (time <= 4) return '#ff9800'  // Orange for slow
  return '#f44336'  // Red for very slow
}

const getGeoBarColor = (index) => {
  const colors = ['#bdf000', '#2196f3', '#ff9800', '#9c27b0', '#4caf50', '#f44336', '#00bcd4', '#795548']
  return colors[index % colors.length]
}

const getPaymentMethodIcon = (method) => {
  const icons = {
    'Credit Card': 'credit_card',
    'Debit Card': 'credit_card',
    'Digital Wallet': 'account_balance_wallet',
    'Bank Transfer': 'account_balance',
    'UPI': 'smartphone',
    'PayPal': 'payment',
    'Apple Pay': 'phone_iphone',
    'Google Pay': 'smartphone'
  }
  return icons[method] || 'payment'
}

const getCountryFlag = (country) => {
  const flags = {
    'United States': '🇺🇸',
    'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'India': '🇮🇳',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵'
  }
  return flags[country] || '🌍'
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return Math.round(num).toString()
}

// const formatDateTime = (dateString) => {
//   if (!dateString) return 'N/A'
//   return new Date(dateString).toLocaleString('en-US', {
//     year: 'numeric',
//     month: 'short',
//     day: 'numeric',
//     hour: '2-digit',
//     minute: '2-digit'
//   })
// }

// Export methods
const exportChart = (chartType) => {
  let data, filename

  switch (chartType) {
    case 'revenue':
      data = revenueData.value
      filename = 'revenue_data.csv'
      break
    case 'methods':
      data = methodsData.value
      filename = 'payment_methods_data.csv'
      break
    case 'trends':
      data = trendsData.value
      filename = 'transaction_trends_data.csv'
      break
    case 'checkout':
      data = checkoutTimeData.value.map((time, index) => ({
        step: checkoutTimeLabels.value[index] || `Step ${index + 1}`,
        time: time
      }))
      filename = 'checkout_time_data.csv'
      break
    case 'geography':
      data = geographyData.value
      filename = 'geography_data.csv'
      break
    default:
      return
  }

  const csvContent = generateCSV(data)
  downloadCSV(csvContent, filename)

  $q.notify({
    type: 'positive',
    message: `${chartType} data exported successfully`,
    position: 'top'
  })
}

const exportAllData = async () => {
  try {
    exporting.value = true

    const allData = {
      revenue: revenueData.value,
      methods: methodsData.value,
      trends: trendsData.value,
      checkout: checkoutTimeData.value,
      geography: geographyData.value,
      exported_at: new Date().toISOString()
    }

    const csvContent = generateCSV(Object.entries(allData).map(([key, value]) => ({
      metric: key,
      data: JSON.stringify(value)
    })))

    downloadCSV(csvContent, `analytics_export_${new Date().toISOString().split('T')[0]}.csv`)

    $q.notify({
      type: 'positive',
      message: 'All analytics data exported successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Export error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to export data',
      position: 'top'
    })
  } finally {
    exporting.value = false
  }
}

const refreshAllData = async () => {
  try {
    refreshing.value = true
    await loadAllData()
    $q.notify({
      type: 'positive',
      message: 'All data refreshed successfully',
      position: 'top'
    })
  } catch (error) {
    console.error('Refresh error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh data',
      position: 'top'
    })
  } finally {
    refreshing.value = false
  }
}

const generateCSV = (data) => {
  if (!data || data.length === 0) return ''

  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
  ].join('\n')

  return csvContent
}

const downloadCSV = (csvContent, filename) => {
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

const refreshData = () => {
  loadAllData()
}

// Lifecycle
onMounted(() => {
  loadAllData()
})

defineExpose({
  refreshData
})
</script>

<style scoped>
.stats-dashboard {
  position: relative;
  min-height: 600px;
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  padding: 24px;
  border-radius: 20px;
}

/* Enhanced Charts Grid */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

/* Enhanced Chart Cards */
.chart-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  backdrop-filter: blur(10px);
  transition: all 0.4s ease;
  position: relative;
  overflow: hidden;
}

.chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #bdf000, #8bc34a, #4caf50);
}

.chart-card:hover {
  border-color: rgba(189, 240, 0, 0.4);
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

/* Enhanced Card Headers */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.header-left {
  flex: 1;
}

.card-title {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 4px 0;
  display: flex;
  align-items: center;
}

.card-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin: 0;
}

.chart-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* Enhanced Chart Containers */
.chart-container {
  min-height: 320px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

.chart-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #ccc;
}

.chart-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: #999;
  text-align: center;
}

.chart-content {
  width: 100%;
  height: 100%;
  padding: 20px;
}

/* Enhanced Revenue Chart */
.enhanced-revenue-chart {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.chart-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(189, 240, 0, 0.05);
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  display: block;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-value.positive {
  color: #4caf50;
}

.stat-value.negative {
  color: #f44336;
}

.revenue-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 200px;
  gap: 8px;
  flex: 1;
}

.revenue-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 60px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.revenue-bar:hover {
  transform: scale(1.05);
}

.bar-value {
  font-size: 0.7rem;
  color: #bdf000;
  font-weight: 600;
  min-height: 16px;
  text-align: center;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.bar-fill:hover {
  filter: brightness(1.2);
  transform: scaleY(1.05);
}

.bar-label {
  font-size: 0.7rem;
  color: #999;
  margin-top: 8px;
  text-align: center;
}

/* Enhanced Methods Chart */
.methods-chart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.methods-summary {
  text-align: center;
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(33, 150, 243, 0.05);
  border-radius: 8px;
}

.summary-label {
  font-size: 0.9rem;
  color: #999;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #2196f3;
  margin-left: 8px;
}

.methods-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-item {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.method-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateX(4px);
}

.method-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.method-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.method-details {
  flex: 1;
}

.method-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95rem;
}

.method-count {
  font-size: 0.8rem;
  color: #999;
}

.method-percentage {
  font-weight: 700;
  color: #bdf000;
  font-size: 1.1rem;
}

.method-bar {
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.method-fill {
  height: 100%;
  border-radius: 3px;
  transition: all 0.3s ease;
}

/* Enhanced Trends Chart */
.trends-chart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.trends-metrics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  gap: 16px;
}

.metric-card {
  text-align: center;
  padding: 16px;
  background: rgba(156, 39, 176, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(156, 39, 176, 0.2);
  flex: 1;
}

.metric-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #9c27b0;
  margin-bottom: 4px;
}

.metric-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.trends-chart-area {
  flex: 1;
}

.chart-grid {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 180px;
  gap: 4px;
}

.trend-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 40px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.trend-bar:hover {
  transform: scale(1.1);
}

.trend-value {
  font-size: 0.7rem;
  color: #9c27b0;
  font-weight: 600;
  min-height: 14px;
}

.trend-fill {
  width: 100%;
  border-radius: 3px 3px 0 0;
  min-height: 15px;
  transition: all 0.3s ease;
}

.trend-label {
  font-size: 0.6rem;
  color: #999;
  margin-top: 6px;
  text-align: center;
}

/* Enhanced Checkout Chart */
.checkout-chart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.checkout-metrics {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  gap: 16px;
}

.checkout-metric {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 152, 0, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 152, 0, 0.2);
  flex: 1;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.metric-info {
  flex: 1;
}

.checkout-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 160px;
  gap: 8px;
  flex: 1;
}

.checkout-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  max-width: 50px;
}

.bar-time {
  font-size: 0.7rem;
  color: #ff9800;
  font-weight: 600;
  min-height: 14px;
}

.bar-step {
  font-size: 0.6rem;
  color: #999;
  margin-top: 6px;
  text-align: center;
}

/* Enhanced Geography Chart */
.geography-chart-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.geography-summary {
  display: flex;
  justify-content: space-around;
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(0, 188, 212, 0.05);
  border-radius: 8px;
}

.summary-stat {
  text-align: center;
}

.geography-bars {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.geo-item {
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 6px;
}

.geo-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(4px);
}

.geo-info {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
}

.geo-flag {
  font-size: 1.2rem;
}

.geo-details {
  flex: 1;
}

.geo-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.9rem;
}

.geo-count {
  font-size: 0.75rem;
  color: #999;
}

.geo-percentage {
  font-weight: 700;
  color: #00bcd4;
  font-size: 0.9rem;
}

.geo-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.geo-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Analytics Summary */
.analytics-summary {
  margin-top: 32px;
}

.summary-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 16px;
}

.summary-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #bdf000;
  margin: 0;
  display: flex;
  align-items: center;
}

.summary-actions {
  display: flex;
  gap: 12px;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.summary-metric {
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.summary-metric:hover {
  border-color: rgba(189, 240, 0, 0.3);
  background: rgba(255, 255, 255, 0.08);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.metric-title {
  font-weight: 600;
  color: #ffffff;
}

.metric-description {
  font-size: 0.85rem;
  color: #999;
  line-height: 1.4;
  margin-top: 8px;
}

/* Chart Details Dialog */
.chart-details-dialog {
  min-width: 400px;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.dialog-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.chart-detail-content {
  text-align: center;
  padding: 20px;
}

.detail-value {
  font-size: 2rem;
  font-weight: 700;
  color: #bdf000;
  margin-bottom: 8px;
}

.detail-label {
  font-size: 1.1rem;
  color: #ffffff;
  margin-bottom: 12px;
}

.detail-description {
  font-size: 0.9rem;
  color: #999;
  line-height: 1.5;
}

/* Loading Overlay */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(10, 10, 10, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  z-index: 10;
}

.loading-text {
  color: #bdf000;
  margin-top: 20px;
  font-size: 1.2rem;
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 1400px) {
  .charts-grid {
    gap: 20px;
  }

  .chart-stats {
    flex-direction: column;
    gap: 8px;
  }
}

@media (max-width: 1024px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .trends-metrics {
    flex-direction: column;
    gap: 12px;
  }

  .checkout-metrics {
    flex-direction: column;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .stats-dashboard {
    padding: 16px;
  }

  .chart-card {
    padding: 16px;
  }

  .card-title {
    font-size: 1.1rem;
  }

  .chart-container {
    min-height: 250px;
  }

  .card-header {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .chart-actions {
    width: 100%;
    justify-content: space-between;
  }

  .revenue-bars,
  .checkout-bars {
    gap: 4px;
  }

  .revenue-bar,
  .checkout-bar {
    max-width: 35px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .chart-details-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .methods-list {
    gap: 12px;
  }

  .geography-bars {
    gap: 8px;
  }

  .chart-grid {
    gap: 2px;
  }

  .trend-bar {
    max-width: 25px;
  }
}

/* Print styles */
@media print {
  .stats-dashboard {
    background: white !important;
    color: black !important;
  }

  .chart-card {
    background: white !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
  }

  .chart-actions,
  .loading-overlay {
    display: none !important;
  }
}

/* Enhanced focus states */
.chart-card:focus-within {
  border-color: rgba(189, 240, 0, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(189, 240, 0, 0.3);
}

/* Performance optimizations */
.chart-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>