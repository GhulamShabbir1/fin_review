<template>
  <div class="kpi-cards">
    <div class="row q-col-gutter-lg">
      <div class="col-12 col-sm-6 col-lg-3" v-for="(kpi, index) in kpis" :key="index">
        <q-card 
          class="kpi-card lime-glow" 
          :class="`kpi-${kpi.color}`"
          @click="onKpiClick(kpi)"
        >
          <q-card-section class="kpi-content">
            <!-- Enhanced Header -->
            <div class="kpi-header">
              <div class="kpi-icon-container">
                <div class="kpi-icon" :style="{ backgroundColor: getIconBackground(kpi.color) }">
                  <q-icon :name="kpi.icon" size="28px" :color="kpi.color" />
                </div>
                <div class="icon-glow" :style="{ boxShadow: `0 0 20px ${getColorHex(kpi.color)}40` }"></div>
              </div>
              <div class="kpi-trend" :class="kpi.trend">
                <q-icon :name="getTrendIcon(kpi.trend)" size="14px" />
                <span class="trend-text">{{ kpi.change }}</span>
              </div>
            </div>
            
            <!-- Enhanced Body -->
            <div class="kpi-body">
              <div class="kpi-value-container">
                <div class="kpi-value" :style="{ color: getColorHex(kpi.color) }">
                  {{ formatKpiValue(kpi.value) }}
                </div>
                <div class="kpi-unit" v-if="kpi.unit">{{ kpi.unit }}</div>
              </div>
              <div class="kpi-title">{{ kpi.title }}</div>
              <div class="kpi-subtitle" v-if="kpi.subtitle">{{ kpi.subtitle }}</div>
            </div>
            
            <!-- Enhanced Footer -->
            <div class="kpi-footer">
              <div class="progress-container">
                <div class="progress-info">
                  <span class="progress-label">{{ getProgressLabel(kpi) }}</span>
                  <span class="progress-percentage">{{ Math.round(getProgressValue(kpi) * 100) }}%</span>
                </div>
                <q-linear-progress 
                  :value="getProgressValue(kpi)" 
                  :color="kpi.color" 
                  size="6px"
                  class="kpi-progress"
                  rounded
                />
              </div>
              
              <!-- Additional KPI Info -->
              <div class="kpi-meta" v-if="kpi.target || kpi.lastPeriod">
                <div class="meta-item" v-if="kpi.target">
                  <q-icon name="flag" size="12px" color="grey-5" />
                  <span class="meta-text">Target: {{ formatKpiValue(kpi.target) }}</span>
                </div>
                <div class="meta-item" v-if="kpi.lastPeriod">
                  <q-icon name="history" size="12px" color="grey-5" />
                  <span class="meta-text">Last period: {{ formatKpiValue(kpi.lastPeriod) }}</span>
                </div>
              </div>
            </div>
          </q-card-section>

          <!-- Hover Overlay -->
          <div class="kpi-overlay">
            <div class="overlay-content">
              <q-icon name="analytics" size="24px" color="white" />
              <span class="overlay-text">View Details</span>
            </div>
          </div>
        </q-card>
      </div>
    </div>

    <!-- KPI Details Dialog -->
    <q-dialog v-model="showKpiDetails" persistent>
      <q-card class="kpi-details-dialog">
        <q-card-section class="dialog-header">
          <div class="header-content">
            <div class="header-left">
              <div class="header-icon">
                <q-icon :name="selectedKpi?.icon" size="32px" :color="selectedKpi?.color" />
              </div>
              <div class="header-text">
                <div class="text-h6">{{ selectedKpi?.title }}</div>
                <div class="text-caption text-grey-5">Detailed Analytics</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup />
          </div>
        </q-card-section>

        <q-card-section v-if="selectedKpi" class="dialog-content">
          <div class="kpi-detailed-info">
            <!-- Current Value Display -->
            <div class="current-value-section q-mb-lg">
              <div class="current-value">
                <span class="value-number" :style="{ color: getColorHex(selectedKpi.color) }">
                  {{ formatKpiValue(selectedKpi.value) }}
                </span>
                <span class="value-unit" v-if="selectedKpi.unit">{{ selectedKpi.unit }}</span>
              </div>
              <div class="value-description">{{ selectedKpi.description || 'Current value for this metric' }}</div>
            </div>

            <!-- Trend Analysis -->
            <div class="trend-analysis q-mb-lg">
              <h5 class="analysis-title">Trend Analysis</h5>
              <div class="trend-details">
                <div class="trend-item">
                  <span class="trend-label">Change from last period:</span>
                  <span class="trend-value" :class="selectedKpi.trend">
                    <q-icon :name="getTrendIcon(selectedKpi.trend)" size="16px" />
                    {{ selectedKpi.change }}
                  </span>
                </div>
                <div class="trend-item" v-if="selectedKpi.target">
                  <span class="trend-label">Progress to target:</span>
                  <span class="trend-value">
                    {{ Math.round((selectedKpi.value / selectedKpi.target) * 100) }}%
                  </span>
                </div>
                <div class="trend-item" v-if="selectedKpi.lastPeriod">
                  <span class="trend-label">Previous period:</span>
                  <span class="trend-value">{{ formatKpiValue(selectedKpi.lastPeriod) }}</span>
                </div>
              </div>
            </div>

            <!-- Historical Data -->
            <div class="historical-data" v-if="selectedKpi.historical">
              <h5 class="analysis-title">Historical Performance</h5>
              <div class="historical-chart">
                <div class="chart-bars">
                  <div 
                    v-for="(point, idx) in selectedKpi.historical.slice(-6)" 
                    :key="idx" 
                    class="chart-bar"
                  >
                    <div 
                      class="bar-fill" 
                      :style="{ 
                        height: getBarHeight(point.value, selectedKpi.historical),
                        backgroundColor: getColorHex(selectedKpi.color)
                      }"
                    ></div>
                    <div class="bar-label">{{ point.period }}</div>
                    <div class="bar-value">{{ formatKpiValue(point.value) }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Insights -->
            <div class="kpi-insights" v-if="getKpiInsights(selectedKpi).length > 0">
              <h5 class="analysis-title">Insights</h5>
              <div class="insights-list">
                <div 
                  v-for="insight in getKpiInsights(selectedKpi)" 
                  :key="insight.id" 
                  class="insight-item"
                  :class="insight.type"
                >
                  <q-icon :name="insight.icon" size="16px" :color="insight.color" />
                  <span class="insight-text">{{ insight.text }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn color="lime" icon="download" label="Export Data" @click="exportKpiData" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

// Props
defineProps({
  kpis: {
    type: Array,
    required: true,
    default: () => []
  }
})

// Reactive data
const showKpiDetails = ref(false)
const selectedKpi = ref(null)

// Methods
const getTrendIcon = (trend) => {
  const icons = {
    up: 'trending_up',
    down: 'trending_down',
    neutral: 'trending_flat',
    positive: 'trending_up',
    negative: 'trending_down',
    stable: 'trending_flat'
  }
  return icons[trend] || 'trending_flat'
}

const getProgressValue = (kpi) => {
  // Enhanced progress calculation
  if (kpi.progress !== undefined) {
    return Math.min(Math.max(kpi.progress, 0), 1)
  }
  
  if (kpi.target && kpi.value) {
    return Math.min(kpi.value / kpi.target, 1)
  }
  
  // Smart progress calculation based on KPI type and value
  const value = typeof kpi.value === 'string' ? parseFloat(kpi.value.replace(/[^0-9.-]/g, '')) : kpi.value
  
  if (kpi.title.toLowerCase().includes('rate') || kpi.title.toLowerCase().includes('%')) {
    return Math.min(value / 100, 1)
  }
  
  if (kpi.title.toLowerCase().includes('revenue')) {
    return Math.min(value / 1000000, 1) // Assume $1M target
  }
  
  if (kpi.title.toLowerCase().includes('transaction')) {
    return Math.min(value / 10000, 1) // Assume 10K target
  }
  
  if (kpi.title.toLowerCase().includes('customer') || kpi.title.toLowerCase().includes('merchant')) {
    return Math.min(value / 1000, 1) // Assume 1K target
  }
  
  // Default fallback
  return Math.min(value / 100, 1)
}

const getProgressLabel = (kpi) => {
  if (kpi.progressLabel) return kpi.progressLabel
  
  const progress = getProgressValue(kpi)
  if (progress >= 0.9) return 'Excellent'
  if (progress >= 0.7) return 'Good'
  if (progress >= 0.5) return 'Average'
  if (progress >= 0.3) return 'Below Target'
  return 'Needs Attention'
}

const getIconBackground = (color) => {
  const backgrounds = {
    lime: 'rgba(189, 240, 0, 0.15)',
    blue: 'rgba(33, 150, 243, 0.15)',
    green: 'rgba(76, 175, 80, 0.15)',
    purple: 'rgba(156, 39, 176, 0.15)',
    orange: 'rgba(255, 152, 0, 0.15)',
    red: 'rgba(244, 67, 54, 0.15)',
    teal: 'rgba(0, 150, 136, 0.15)',
    indigo: 'rgba(63, 81, 181, 0.15)'
  }
  return backgrounds[color] || 'rgba(189, 240, 0, 0.15)'
}

const getColorHex = (color) => {
  const colors = {
    lime: '#bdf000',
    blue: '#2196f3',
    green: '#4caf50',
    purple: '#9c27b0',
    orange: '#ff9800',
    red: '#f44336',
    teal: '#009688',
    indigo: '#3f51b5'
  }
  return colors[color] || '#bdf000'
}

const formatKpiValue = (value) => {
  if (typeof value === 'string') return value
  if (!value && value !== 0) return '0'
  
  // Format large numbers
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  
  // Format decimals
  if (value % 1 !== 0) {
    return value.toFixed(2)
  }
  
  return value.toString()
}

const onKpiClick = (kpi) => {
  selectedKpi.value = kpi
  showKpiDetails.value = true
}

const getBarHeight = (value, historicalData) => {
  if (!historicalData || historicalData.length === 0) return '20px'
  
  const maxValue = Math.max(...historicalData.map(point => point.value))
  const minHeight = 20
  const maxHeight = 100
  
  if (maxValue === 0) return `${minHeight}px`
  
  const height = minHeight + ((value / maxValue) * (maxHeight - minHeight))
  return `${height}px`
}

const getKpiInsights = (kpi) => {
  if (!kpi) return []
  
  const insights = []
  const value = typeof kpi.value === 'string' ? parseFloat(kpi.value.replace(/[^0-9.-]/g, '')) : kpi.value
  const change = parseFloat(kpi.change?.replace(/[^0-9.-]/g, '')) || 0
  
  // Performance insights
  if (kpi.trend === 'up' || kpi.trend === 'positive') {
    insights.push({
      id: 'performance',
      type: 'positive',
      icon: 'trending_up',
      color: 'green',
      text: `${kpi.title} is performing well with ${kpi.change} improvement`
    })
  } else if (kpi.trend === 'down' || kpi.trend === 'negative') {
    insights.push({
      id: 'performance',
      type: 'warning',
      icon: 'trending_down',
      color: 'orange',
      text: `${kpi.title} has declined by ${kpi.change} - requires attention`
    })
  }
  
  // Target insights
  if (kpi.target && value) {
    const targetProgress = (value / kpi.target) * 100
    if (targetProgress >= 100) {
      insights.push({
        id: 'target',
        type: 'success',
        icon: 'flag',
        color: 'green',
        text: 'Target achieved! Consider setting a higher goal'
      })
    } else if (targetProgress >= 80) {
      insights.push({
        id: 'target',
        type: 'info',
        icon: 'flag',
        color: 'blue',
        text: `${Math.round(targetProgress)}% of target reached - on track`
      })
    } else if (targetProgress < 50) {
      insights.push({
        id: 'target',
        type: 'warning',
        icon: 'flag',
        color: 'orange',
        text: `Only ${Math.round(targetProgress)}% of target - needs improvement`
      })
    }
  }
  
  // Value-specific insights
  if (kpi.title.toLowerCase().includes('revenue') && change > 15) {
    insights.push({
      id: 'revenue',
      type: 'success',
      icon: 'attach_money',
      color: 'green',
      text: 'Exceptional revenue growth - consider scaling operations'
    })
  }
  
  if (kpi.title.toLowerCase().includes('transaction') && change > 20) {
    insights.push({
      id: 'transactions',
      type: 'info',
      icon: 'receipt_long',
      color: 'blue',
      text: 'High transaction volume - monitor system performance'
    })
  }
  
  return insights.slice(0, 3) // Limit to 3 insights
}

const exportKpiData = () => {
  if (!selectedKpi.value) return
  
  const csvData = generateKpiCSV(selectedKpi.value)
  downloadCSV(csvData, `${selectedKpi.value.title.toLowerCase().replace(/\s+/g, '_')}_data.csv`)
  
  $q.notify({
    type: 'positive',
    message: 'KPI data exported successfully',
    position: 'top'
  })
}

const generateKpiCSV = (kpi) => {
  const headers = ['Period', 'Value', 'Change', 'Target']
  const rows = []
  
  if (kpi.historical) {
    kpi.historical.forEach(point => {
      rows.push([
        point.period,
        point.value,
        point.change || 'N/A',
        kpi.target || 'N/A'
      ])
    })
  } else {
    rows.push([
      'Current',
      kpi.value,
      kpi.change || 'N/A',
      kpi.target || 'N/A'
    ])
  }
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n')
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
</script>

<style scoped>
.kpi-cards {
  margin-bottom: 32px;
}

/* Enhanced KPI Card */
.kpi-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  backdrop-filter: blur(10px);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, transparent, rgba(189, 240, 0, 0.8), transparent);
  transform: translateX(-100%);
  transition: transform 0.6s ease;
}

.kpi-card:hover::before {
  transform: translateX(100%);
}

.kpi-card:hover {
  transform: translateY(-8px) scale(1.02);
  border-color: rgba(189, 240, 0, 0.4);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.2);
}

.kpi-content {
  padding: 24px;
  position: relative;
  z-index: 2;
}

/* Enhanced Header */
.kpi-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.kpi-icon-container {
  position: relative;
}

.kpi-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  position: relative;
  z-index: 1;
}

.icon-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 16px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.kpi-card:hover .icon-glow {
  opacity: 1;
}

.kpi-card:hover .kpi-icon {
  transform: scale(1.1) rotate(5deg);
}

.kpi-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.kpi-trend.up,
.kpi-trend.positive {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.kpi-trend.down,
.kpi-trend.negative {
  color: #f44336;
  background: rgba(244, 67, 54, 0.15);
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.kpi-trend.neutral,
.kpi-trend.stable {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.15);
  border: 1px solid rgba(255, 152, 0, 0.3);
}

.trend-text {
  font-weight: 700;
  letter-spacing: 0.3px;
}

/* Enhanced Body */
.kpi-body {
  margin-bottom: 20px;
}

.kpi-value-container {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 12px;
}

.kpi-value {
  font-size: 2.5rem;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 0 20px currentColor;
  transition: all 0.3s ease;
}

.kpi-card:hover .kpi-value {
  transform: scale(1.05);
}

.kpi-unit {
  font-size: 1rem;
  color: #999;
  font-weight: 500;
}

.kpi-title {
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
  letter-spacing: 0.3px;
}

.kpi-subtitle {
  color: #999;
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Enhanced Footer */
.kpi-footer {
  margin-top: 20px;
}

.progress-container {
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 0.8rem;
  color: #999;
  font-weight: 500;
}

.progress-percentage {
  font-size: 0.8rem;
  color: #bdf000;
  font-weight: 700;
}

.kpi-progress {
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
}

.kpi-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-text {
  font-size: 0.75rem;
  color: #999;
}

/* Hover Overlay */
.kpi-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  backdrop-filter: blur(2px);
}

.kpi-card:hover .kpi-overlay {
  opacity: 1;
}

.overlay-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-weight: 600;
}

.overlay-text {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* KPI Color Variants */
.kpi-lime {
  border-left: 4px solid #bdf000;
}

.kpi-blue {
  border-left: 4px solid #2196f3;
}

.kpi-green {
  border-left: 4px solid #4caf50;
}

.kpi-purple {
  border-left: 4px solid #9c27b0;
}

.kpi-orange {
  border-left: 4px solid #ff9800;
}

.kpi-red {
  border-left: 4px solid #f44336;
}

.kpi-teal {
  border-left: 4px solid #009688;
}

.kpi-indigo {
  border-left: 4px solid #3f51b5;
}

/* KPI Details Dialog */
.kpi-details-dialog {
  min-width: 600px;
  max-width: 80vw;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.dialog-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding: 20px 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog-content {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

/* Current Value Section */
.current-value-section {
  text-align: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.current-value {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  margin-bottom: 12px;
}

.value-number {
  font-size: 3rem;
  font-weight: 900;
  text-shadow: 0 0 20px currentColor;
}

.value-unit {
  font-size: 1.2rem;
  color: #999;
}

.value-description {
  color: #cfcfcf;
  line-height: 1.5;
}

/* Trend Analysis */
.trend-analysis {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.analysis-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
}

.trend-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trend-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.trend-label {
  color: #999;
  font-weight: 500;
}

.trend-value {
  color: #ffffff;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

.trend-value.up,
.trend-value.positive {
  color: #4caf50;
}

.trend-value.down,
.trend-value.negative {
  color: #f44336;
}

/* Historical Chart */
.historical-data {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.historical-chart {
  margin-top: 16px;
}

.chart-bars {
  display: flex;
  align-items: end;
  justify-content: space-around;
  height: 120px;
  gap: 8px;
}

.chart-bar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 1;
  max-width: 60px;
}

.bar-fill {
  width: 24px;
  border-radius: 4px 4px 0 0;
  transition: all 0.3s ease;
  min-height: 20px;
}

.bar-fill:hover {
  transform: scaleY(1.1);
  filter: brightness(1.2);
}

.bar-label {
  font-size: 0.7rem;
  color: #999;
  text-align: center;
}

.bar-value {
  font-size: 0.7rem;
  color: #bdf000;
  font-weight: 600;
  text-align: center;
}

/* Insights */
.kpi-insights {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.insights-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.insight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.insight-item.positive {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.insight-item.warning {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.insight-item.info {
  background: rgba(33, 150, 243, 0.1);
  border: 1px solid rgba(33, 150, 243, 0.2);
}

.insight-item.success {
  background: rgba(76, 175, 80, 0.15);
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.insight-item:hover {
  transform: translateX(4px);
}

.insight-text {
  color: #ffffff;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .kpi-cards .row {
    margin: 0;
  }
}

@media (max-width: 768px) {
  .kpi-cards .col-lg-3 {
    margin-bottom: 16px;
  }
  
  .kpi-content {
    padding: 20px;
  }
  
  .kpi-value {
    font-size: 2rem;
  }
  
  .kpi-details-dialog {
    min-width: 90vw;
    margin: 16px;
  }
  
  .chart-bars {
    height: 100px;
    gap: 4px;
  }
  
  .chart-bar {
    max-width: 40px;
  }
  
  .current-value .value-number {
    font-size: 2.5rem;
  }
}

@media (max-width: 480px) {
  .kpi-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .kpi-value-container {
    justify-content: center;
  }
  
  .insights-list {
    gap: 8px;
  }
  
  .insight-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

/* Animation delays for staggered effect */
.kpi-card:nth-child(1) {
  animation-delay: 0.1s;
}

.kpi-card:nth-child(2) {
  animation-delay: 0.2s;
}

.kpi-card:nth-child(3) {
  animation-delay: 0.3s;
}

.kpi-card:nth-child(4) {
  animation-delay: 0.4s;
}

/* Enhanced focus states */
.kpi-card:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Performance optimizations */
.kpi-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}

/* Print styles */
@media print {
  .kpi-card {
    background: white !important;
    color: black !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
  }
  
  .kpi-overlay {
    display: none !important;
  }
}
</style>