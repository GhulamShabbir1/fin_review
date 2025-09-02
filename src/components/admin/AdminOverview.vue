<template>
  <div class="admin-overview">
    <!-- Animated background elements -->
    <div class="animated-bg">
      <div v-for="i in 15" :key="i" class="floating-particle" :style="particleStyle(i)"></div>
    </div>

    <!-- Platform Stats -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow animate-fade-in continuous-pulse" style="animation-delay: 0.1s">
          <div class="stat-glow"></div>
          <q-card-section class="text-center">
            <q-icon name="store" size="48px" color="lime" class="q-mb-md icon-animate continuous-float" />
            <div class="text-h4 text-lime count-up-animation">{{ stats.totalMerchants }}</div>
            <div class="text-caption">Total Merchants</div>
            <div class="text-caption text-green q-mt-xs">
              <q-icon name="trending_up" size="16px" />
              +{{ stats.newMerchantsThisMonth }} this month
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow animate-fade-in continuous-pulse" style="animation-delay: 0.2s">
          <div class="stat-glow"></div>
          <q-card-section class="text-center">
            <q-icon name="receipt_long" size="48px" color="lime" class="q-mb-md icon-animate continuous-float" style="animation-delay: 0.3s" />
            <div class="text-h4 text-lime">{{ formatCurrency(stats.totalRevenue) }}</div>
            <div class="text-caption">Total Revenue</div>
            <div class="text-caption text-green q-mt-xs">
              <q-icon name="trending_up" size="16px" />
              +{{ stats.revenueGrowth }}% vs last month
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow animate-fade-in continuous-pulse" style="animation-delay: 0.3s">
          <div class="stat-glow"></div>
          <q-card-section class="text-center">
            <q-icon name="payments" size="48px" color="lime" class="q-mb-md icon-animate continuous-float" style="animation-delay: 0.5s" />
            <div class="text-h4 text-lime">{{ stats.totalTransactions }}</div>
            <div class="text-caption">Transactions</div>
            <div class="text-caption text-green q-mt-xs">
              <q-icon name="trending_up" size="16px" />
              {{ stats.successRate }}% success rate
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card orange-glow animate-fade-in continuous-pulse" style="animation-delay: 0.4s">
          <div class="stat-glow orange"></div>
          <q-card-section class="text-center">
            <q-icon name="pending_actions" size="48px" color="orange" class="q-mb-md icon-animate continuous-float" style="animation-delay: 0.7s" />
            <div class="text-h4 text-orange">{{ stats.pendingApprovals }}</div>
            <div class="text-caption">Pending Approvals</div>
            <div class="text-caption text-grey q-mt-xs">
              <q-icon name="schedule" size="16px" />
              Requires attention
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="row q-col-gutter-lg q-mb-xl">
      <div class="col-12 col-md-8">
        <q-card class="lime-glow animate-fade-in continuous-glow" style="animation-delay: 0.5s">
          <q-card-section>
            <div class="text-h6 text-lime q-mb-md">Quick Actions</div>
            <div class="row q-col-gutter-md">
              <div class="col-12 col-sm-6">
                <q-btn color="lime" icon="store" label="Review Merchants" class="full-width q-mb-sm btn-animate enhanced-btn"
                  @click="navigateWithAnimation('/admin/merchants?status=pending')">
                  <div class="btn-hover-effect"></div>
                </q-btn>
                <q-btn color="blue" icon="analytics" label="View Analytics" class="full-width q-mb-sm btn-animate enhanced-btn"
                  @click="navigateWithAnimation('/admin-dashboard')">
                  <div class="btn-hover-effect"></div>
                </q-btn>
                <q-btn color="purple" icon="receipt_long" label="Transaction Report"
                  class="full-width q-mb-sm btn-animate enhanced-btn" @click="navigateWithAnimation('/transactions')">
                  <div class="btn-hover-effect"></div>
                </q-btn>
              </div>
              <div class="col-12 col-sm-6">
                <q-btn color="orange" icon="support_agent" label="Support Tickets"
                  class="full-width q-mb-sm btn-animate enhanced-btn" @click="navigateWithAnimation('/admin/support')">
                  <div class="btn-hover-effect"></div>
                </q-btn>
                <q-btn color="teal" icon="settings" label="System Settings" class="full-width q-mb-sm btn-animate enhanced-btn"
                  @click="navigateWithAnimation('/admin/settings')">
                  <div class="btn-hover-effect"></div>
                </q-btn>
                <q-btn color="grey" icon="download" label="Export Data" class="full-width q-mb-sm btn-animate enhanced-btn"
                  @click="exportData">
                  <div class="btn-hover-effect"></div>
                </q-btn>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="lime-glow animate-fade-in continuous-glow" style="animation-delay: 0.6s">
          <q-card-section>
            <div class="text-h6 text-lime q-mb-md">Recent Activity</div>
            <div class="activity-list smooth-scroll">
              <div v-for="(activity, index) in recentActivity" :key="activity.id"
                class="activity-item q-mb-md animate-fade-in" :style="`animation-delay: ${0.7 + (index * 0.1)}s`">
                <div class="row items-center">
                  <div class="col-auto">
                    <q-avatar size="32px" :color="getActivityColor(activity.type)" class="avatar-animate continuous-bounce">
                      <q-icon :name="getActivityIcon(activity.type)" color="white" />
                    </q-avatar>
                  </div>
                  <div class="col">
                    <div class="text-body2">{{ activity.message }}</div>
                    <div class="text-caption text-grey">{{ formatTime(activity.timestamp) }}</div>
                  </div>
                </div>
                <div class="activity-glow" :class="getActivityColor(activity.type)"></div>
              </div>
            </div>
            <q-btn flat color="lime" label="View All Activity" class="full-width q-mt-md btn-animate enhanced-btn"
              @click="navigateWithAnimation('/admin/activity')">
              <div class="btn-hover-effect"></div>
            </q-btn>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Charts Row -->
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-md-8">
        <q-card class="lime-glow animate-fade-in continuous-glow" style="animation-delay: 0.8s">
          <q-card-section>
            <div class="text-h6 text-lime q-mb-md">Revenue Trend</div>
            <div class="chart-container">
              <canvas ref="revenueChart" height="300" class="chart-animate"></canvas>
              <div class="chart-hover-info"></div>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <div class="col-12 col-md-4">
        <q-card class="lime-glow animate-fade-in continuous-glow" style="animation-delay: 0.9s">
          <q-card-section>
            <div class="text-h6 text-lime q-mb-md">Merchant Status</div>
            <div class="chart-container">
              <canvas ref="merchantChart" height="300" class="chart-animate"></canvas>
              <div class="chart-hover-info"></div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { Chart, registerables } from 'chart.js'
import api from '../../boot/axios'
import { useRouter } from 'vue-router'
const router = useRouter()

Chart.register(...registerables)

const $q = useQuasar()

const stats = ref({
  totalMerchants: 0,
  newMerchantsThisMonth: 0,
  totalRevenue: 0,
  revenueGrowth: 0,
  totalTransactions: 0,
  successRate: 0,
  pendingApprovals: 0
})

const recentActivity = ref([])
const revenueChart = ref(null)
const merchantChart = ref(null)

let revenueChartInstance = null
let merchantChartInstance = null

const loadStats = async () => {
  try {
    const response = await api.get('/api/admin/stats/overview')
    stats.value = response.data
    animateValue('totalMerchants', 0, stats.value.totalMerchants, 1500)
    animateValue('newMerchantsThisMonth', 0, stats.value.newMerchantsThisMonth, 1500)
    animateValue('totalRevenue', 0, stats.value.totalRevenue, 1500)
    animateValue('revenueGrowth', 0, stats.value.revenueGrowth, 1500)
    animateValue('totalTransactions', 0, stats.value.totalTransactions, 1500)
    animateValue('successRate', 0, stats.value.successRate, 1500)
    animateValue('pendingApprovals', 0, stats.value.pendingApprovals, 1500)
  } catch (error) {
    console.error('Failed to load stats:', error)
    stats.value = {
      totalMerchants: 1247,
      newMerchantsThisMonth: 23,
      totalRevenue: 2847500,
      revenueGrowth: 12.5,
      totalTransactions: 45678,
      successRate: 98.7,
      pendingApprovals: 3
    }
    setTimeout(() => {
      animateValue('totalMerchants', 0, stats.value.totalMerchants, 1500)
      animateValue('newMerchantsThisMonth', 0, stats.value.newMerchantsThisMonth, 1500)
      animateValue('totalRevenue', 0, stats.value.totalRevenue, 1500)
      animateValue('revenueGrowth', 0, stats.value.revenueGrowth, 1500)
      animateValue('totalTransactions', 0, stats.value.totalTransactions, 1500)
      animateValue('successRate', 0, stats.value.successRate, 1500)
      animateValue('pendingApprovals', 0, stats.value.pendingApprovals, 1500)
    }, 500)
  }
}

const animateValue = (statKey, start, end, duration) => {
  if (start === end) return
  const range = end - start
  const increment = end > start ? 1 : -1
  const stepTime = Math.max(10, Math.abs(Math.floor(duration / Math.max(1, range))))
  const timer = setInterval(() => {
    start += increment
    stats.value[statKey] = start
    if (start === end) clearInterval(timer)
  }, stepTime)
}

const loadRecentActivity = async () => {
  try {
    const response = await api.get('/api/admin/activity/recent')
    recentActivity.value = response.data
  } catch (error) {
    console.error('Failed to load activity:', error)
    recentActivity.value = [
      { id: 1, type: 'merchant_approved', message: 'Merchant "TechCorp Inc" approved', timestamp: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 2, type: 'transaction', message: 'Large transaction: $15,000 processed', timestamp: new Date(Date.now() - 1000 * 60 * 60) },
      { id: 3, type: 'merchant_registered', message: 'New merchant "FoodExpress" registered', timestamp: new Date(Date.now() - 1000 * 60 * 120) },
      { id: 4, type: 'support_ticket', message: 'Support ticket #1234 resolved', timestamp: new Date(Date.now() - 1000 * 60 * 180) }
    ]
  }
}

const createRevenueChart = () => {
  const ctx = revenueChart.value.getContext('2d')
  
  // Create gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, 300)
  gradient.addColorStop(0, 'rgba(189, 240, 0, 0.4)')
  gradient.addColorStop(1, 'rgba(189, 240, 0, 0.05)')
  
  revenueChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [{
        label: 'Revenue',
        data: [1200000, 1350000, 1420000, 1580000, 1650000, 1847500],
        borderColor: '#bdf000',
        backgroundColor: gradient,
        tension: 0.4,
        fill: true,
        pointBackgroundColor: '#bdf000',
        pointBorderColor: '#000',
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBorderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { 
        duration: 2000, 
        easing: 'easeOutQuart',
        onProgress: function(animation) {
          // Add shimmer effect during animation
          if (animation.currentStep / animation.numSteps > 0.5) {
            const chart = this;
            const ctx = chart.ctx;
            const chartArea = chart.chartArea;
            
            if (!chartArea) return;
            
            const chartHeight = chartArea.bottom - chartArea.top;
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, 'transparent');
            gradient.addColorStop(0.4, 'rgba(189, 240, 0, 0.2)');
            gradient.addColorStop(0.6, 'rgba(189, 240, 0, 0.2)');
            gradient.addColorStop(1, 'transparent');
            
            ctx.save();
            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = gradient;
            ctx.fillRect(chartArea.left, chartArea.top, chartArea.right - chartArea.left, chartHeight);
            ctx.restore();
          }
        }
      },
      plugins: { 
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(25, 25, 25, 0.9)',
          titleColor: '#bdf000',
          bodyColor: '#fff',
          borderColor: '#bdf000',
          borderWidth: 1,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context) {
              return '$' + (context.raw / 1000000).toFixed(1) + 'M';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: {
            color: '#ccc',
            callback: (value) => '$' + (value / 1000000).toFixed(1) + 'M'
          }
        },
        x: {
          grid: { 
            color: 'rgba(255, 255, 255, 0.1)',
            drawBorder: false
          },
          ticks: { color: '#ccc' }
        }
      },
      interaction: {
        intersect: false,
        mode: 'index'
      }
    }
  })
}

const createMerchantChart = () => {
  const ctx = merchantChart.value.getContext('2d')
  
  // Add shadow effect to the chart
  Chart.register({
    id: 'chart-shadow',
    beforeDraw: (chart) => {
      const ctx = chart.ctx;
      ctx.save();
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 5;
      ctx.restore();
    }
  });
  
  merchantChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Verified', 'Pending', 'Rejected', 'Suspended'],
      datasets: [{
        data: [1180, 45, 12, 10],
        backgroundColor: ['#4CAF50', '#FF9800', '#F44336', '#9E9E9E'],
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#121212',
        hoverOffset: 10
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { 
        duration: 2000, 
        easing: 'easeOutQuart',
        animateRotate: true,
        animateScale: true
      },
      plugins: {
        legend: { 
          position: 'bottom', 
          labels: { 
            color: '#ccc', 
            padding: 20,
            font: {
              size: 11
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(25, 25, 25, 0.9)',
          titleColor: '#bdf000',
          bodyColor: '#fff',
          borderColor: '#bdf000',
          borderWidth: 1,
          cornerRadius: 8,
          callbacks: {
            label: function(context) {
              const label = context.label || '';
              const value = context.raw;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      },
      cutout: '65%'
    }
  })
}

const exportData = () => {
  $q.dialog({
    title: 'Export Data',
    message: 'What would you like to export?',
    options: {
      type: 'radio', model: 'merchants', items: [
        { label: 'Merchants List', value: 'merchants' },
        { label: 'Transaction Report', value: 'transactions' },
        { label: 'Revenue Report', value: 'revenue' },
        { label: 'All Data', value: 'all' }
      ]
    },
    cancel: true,
    persistent: true
  }).onOk(async (value) => {
    try {
      const response = await api.get(`/api/admin/export/${value}`, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${value}_export_${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      $q.notify({ type: 'positive', message: 'Export completed successfully', position: 'bottom-right' })
    } catch (error) {
      console.error('Export failed:', error)
      $q.notify({ type: 'negative', message: 'Export failed', position: 'bottom-right' })
    }
  })
}

const navigateWithAnimation = (route) => {
  document.querySelector('.admin-overview').style.opacity = 0
  document.querySelector('.admin-overview').style.transition = 'opacity 0.3s ease'
  setTimeout(() => {
    $q.loading.show({ message: 'Loading...', boxClass: 'bg-lime text-white', spinnerColor: 'white' })
    setTimeout(() => {
      router.push(route)
      $q.loading.hide()
    }, 500)
  }, 300)
}

const getActivityColor = (type) => {
  switch (type) {
    case 'merchant_approved': return 'green'
    case 'merchant_registered': return 'blue'
    case 'transaction': return 'purple'
    case 'support_ticket': return 'orange'
    default: return 'grey'
  }
}
const getActivityIcon = (type) => {
  switch (type) {
    case 'merchant_approved': return 'check_circle'
    case 'merchant_registered': return 'store'
    case 'transaction': return 'payments'
    case 'support_ticket': return 'support_agent'
    default: return 'info'
  }
}
const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
const formatTime = (timestamp) => {
  const now = new Date()
  const time = new Date(timestamp)
  const diff = now - time
  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return time.toLocaleDateString()
}
const enableSmoothScrolling = () => { document.documentElement.style.scrollBehavior = 'smooth' }

const particleStyle = (index) => {
  const size = Math.random() * 6 + 2;
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    animationDelay: `${index * 0.7}s`,
    animationDuration: `${15 + Math.random() * 20}s`,
    opacity: Math.random() * 0.4 + 0.1
  };
}

onMounted(async () => {
  enableSmoothScrolling()
  await loadStats()
  await loadRecentActivity()
  setTimeout(() => {
    createRevenueChart()
    createMerchantChart()
  }, 500)
})
onBeforeUnmount(() => {
  if (revenueChartInstance) revenueChartInstance.destroy()
  if (merchantChartInstance) merchantChartInstance.destroy()
  document.documentElement.style.scrollBehavior = 'auto'
})
</script>

<style scoped>
.admin-overview {
  padding: 20px;
  opacity: 1;
  transition: opacity 0.5s ease;
  position: relative;
  overflow: hidden;
}

.animated-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.floating-particle {
  position: absolute;
  background: rgba(189, 240, 0, 0.15);
  border-radius: 50%;
  animation: float-particle 25s infinite ease-in-out;
  z-index: 0;
}

@keyframes float-particle {
  0%, 100% {
    transform: translate(0, 0) rotate(0deg);
  }
  25% {
    transform: translate(20px, -40px) rotate(10deg);
  }
  50% {
    transform: translate(-30px, -70px) rotate(-10deg);
  }
  75% {
    transform: translate(10px, -20px) rotate(5deg);
  }
}

.stat-card {
  background: linear-gradient(145deg, #121212, #0a0a0a);
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  position: relative;
  overflow: hidden;
  z-index: 1;
}

.stat-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.25) !important;
}

.stat-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at center, rgba(189, 240, 0, 0.1) 0%, transparent 60%);
  opacity: 0;
  transition: opacity 0.5s ease;
  pointer-events: none;
  z-index: -1;
}

.stat-card:hover .stat-glow {
  opacity: 1;
}

.stat-glow.orange {
  background: radial-gradient(circle at center, rgba(255, 152, 0, 0.1) 0%, transparent 60%);
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
  transition: all 0.4s ease;
  background: linear-gradient(145deg, #121212, #0a0a0a);
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}

.orange-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 152, 0, 0.2), 0 0 20px rgba(255, 152, 0, 0.15);
}

.lime-glow:hover, .orange-glow:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.25);
  transform: translateY(-5px);
}

.orange-glow:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 152, 0, 0.3), 0 0 30px rgba(255, 152, 0, 0.25);
}

.continuous-pulse {
  animation: pulse-glow 3s infinite ease-in-out;
}

@keyframes pulse-glow {
  0%, 100% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
  }
  50% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.25);
  }
}

.continuous-glow {
  animation: subtle-glow 4s infinite alternate;
}

@keyframes subtle-glow {
  0% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
  }
  100% {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.25), 0 0 25px rgba(189, 240, 0, 0.2);
  }
}

.continuous-float {
  animation: floating 3s infinite ease-in-out;
}

@keyframes floating {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.continuous-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

.chart-container {
  position: relative;
  height: 300px;
}

.chart-hover-info {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  opacity: 0;
  background: radial-gradient(circle at center, rgba(189, 240, 0, 0.05) 0%, transparent 70%);
  transition: opacity 0.3s ease;
  border-radius: 0 0 16px 16px;
}

.q-card:hover .chart-hover-info {
  opacity: 1;
}

.activity-list {
  max-height: 300px;
  overflow-y: auto;
  position: relative;
}

.activity-list.smooth-scroll {
  scroll-behavior: smooth;
}

.activity-item {
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: rgba(30, 30, 30, 0.5);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  border-left: 3px solid transparent;
}

.activity-item:hover {
  transform: translateX(8px) scale(1.02);
  background: rgba(40, 40, 40, 0.7);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.activity-item.green { border-left-color: #4CAF50; }
.activity-item.blue { border-left-color: #2196F3; }
.activity-item.purple { border-left-color: #9C27B0; }
.activity-item.orange { border-left-color: #FF9800; }

.activity-glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(189, 240, 0, 0.05) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.activity-item:hover .activity-glow {
  opacity: 1;
}

.activity-glow.green { background: linear-gradient(90deg, transparent 0%, rgba(76, 175, 80, 0.05) 100%); }
.activity-glow.blue { background: linear-gradient(90deg, transparent 0%, rgba(33, 150, 243, 0.05) 100%); }
.activity-glow.purple { background: linear-gradient(90deg, transparent 0%, rgba(156, 39, 176, 0.05) 100%); }
.activity-glow.orange { background: linear-gradient(90deg, transparent 0%, rgba(255, 152, 0, 0.05) 100%); }

.enhanced-btn {
  position: relative;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  border-radius: 10px;
  font-weight: 600;
}

.enhanced-btn:hover {
  transform: translateY(-3px) scale(1.03);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.btn-hover-effect {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.7s ease;
}

.enhanced-btn:hover .btn-hover-effect {
  left: 100%;
}

.text-lime {
  color: #bdf000;
  text-shadow: 0 0 10px rgba(189, 240, 0, 0.3);
}

.text-green {
  color: #4CAF50;
}

.text-grey {
  color: #999;
}

.animate-fade-in {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.count-up-animation {
  font-variant-numeric: tabular-nums;
}

/* Custom scrollbar for activity list */
.activity-list::-webkit-scrollbar {
  width: 6px;
}

.activity-list::-webkit-scrollbar-track {
  background: rgba(40, 40, 40, 0.5);
  border-radius: 10px;
}

.activity-list::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.3);
  border-radius: 10px;
}

.activity-list::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.5);
}
</style>