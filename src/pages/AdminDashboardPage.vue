<template>
  <q-page class="admin-dashboard-page">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="60px" />
      <p class="loading-text">Loading Admin Dashboard...</p>
    </div>

    <!-- Breadcrumb -->
    <div class="breadcrumb-section q-pa-md">
      <q-breadcrumbs class="text-grey-6">
        <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
        <q-breadcrumbs-el icon="dashboard" label="Dashboard" />
      </q-breadcrumbs>
    </div>

    <!-- Main Content -->
    <div class="admin-content">
      <!-- Welcome Section -->
      <div class="welcome-section q-mb-xl animate-fade-in">
        <div class="welcome-content">
          <div class="welcome-text">
            <h1 class="welcome-title">
              Welcome back, <span class="highlight">{{ user.name || 'Admin' }}</span>! 👑
            </h1>
            <p class="welcome-subtitle">Admin Dashboard - Manage your fintech platform</p>
            <div class="platform-status">
              <q-chip color="green" text-color="white" icon="verified" size="sm">
                Platform Status: Online
              </q-chip>
              <q-chip color="blue" text-color="white" icon="schedule" size="sm" class="q-ml-sm">
                Last Updated: {{ formatTime(new Date()) }}
              </q-chip>
            </div>
          </div>
          <div class="welcome-actions">
            <q-btn color="lime" icon="people" label="Manage Merchants" @click="navigateTo('/admin/merchants')"
              class="action-btn" />
            <q-btn color="blue" icon="refresh" label="Refresh Data" @click="loadDashboardData" :loading="loading"
              class="action-btn" />
            <q-btn flat color="red" icon="logout" label="Logout" @click="logout" class="action-btn" />
          </div>
        </div>
      </div>

      <!-- Real Data KPI Cards -->
      <div class="kpi-section q-mb-xl animate-fade-in" style="animation-delay: 0.1s">
        <div class="row q-gutter-lg">
          <div class="col-12 col-sm-6 col-lg-3">
            <q-card class="kpi-card lime-glow">
              <q-card-section>
                <div class="kpi-header">
                  <div class="kpi-icon">
                    <q-icon name="people" size="32px" color="lime" />
                  </div>
                  <div class="kpi-trend">
                    <q-icon name="trending_up" size="16px" color="green" />
                    <span class="trend-value">+{{ merchantStats.growth }}%</span>
                  </div>
                </div>
                <div class="kpi-value">{{ merchantStats.total }}</div>
                <div class="kpi-title">Total Merchants</div>
                <div class="kpi-subtitle">{{ merchantStats.newThisMonth }} new this month</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <q-card class="kpi-card lime-glow">
              <q-card-section>
                <div class="kpi-header">
                  <div class="kpi-icon">
                    <q-icon name="pending" size="32px" color="orange" />
                  </div>
                  <div class="kpi-trend">
                    <q-icon name="schedule" size="16px" color="orange" />
                    <span class="trend-value">{{ merchantStats.pending }}</span>
                  </div>
                </div>
                <div class="kpi-value">{{ merchantStats.pending }}</div>
                <div class="kpi-title">Pending Approval</div>
                <div class="kpi-subtitle">Awaiting review</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <q-card class="kpi-card lime-glow">
              <q-card-section>
                <div class="kpi-header">
                  <div class="kpi-icon">
                    <q-icon name="verified" size="32px" color="green" />
                  </div>
                  <div class="kpi-trend">
                    <q-icon name="check_circle" size="16px" color="green" />
                    <span class="trend-value">{{ Math.round((merchantStats.verified / merchantStats.total) * 100)
                      }}%</span>
                  </div>
                </div>
                <div class="kpi-value">{{ merchantStats.verified }}</div>
                <div class="kpi-title">Verified Merchants</div>
                <div class="kpi-subtitle">Active and approved</div>
              </q-card-section>
            </q-card>
          </div>

          <div class="col-12 col-sm-6 col-lg-3">
            <q-card class="kpi-card lime-glow">
              <q-card-section>
                <div class="kpi-header">
                  <div class="kpi-icon">
                    <q-icon name="today" size="32px" color="purple" />
                  </div>
                  <div class="kpi-trend">
                    <q-icon name="trending_up" size="16px" color="purple" />
                    <span class="trend-value">{{ merchantStats.activeToday }}</span>
                  </div>
                </div>
                <div class="kpi-value">{{ merchantStats.activeToday }}</div>
                <div class="kpi-title">Active Today</div>
                <div class="kpi-subtitle">Currently online</div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <!-- Enhanced Analytics Section with Charts -->
      <div class="analytics-section q-mb-xl animate-fade-in" style="animation-delay: 0.2s">
        <div class="section-header">
          <h3 class="section-title">
            <q-icon name="analytics" size="24px" color="lime" class="q-mr-sm" />
            Platform Analytics
          </h3>
          <div class="section-actions">
            <q-btn-toggle 
              v-model="timeframe" 
              :options="timeframeOptions" 
              color="lime" 
              text-color="white"
              size="sm" 
              @update:model-value="loadAnalyticsData" 
            />
            <q-btn 
              flat 
              round 
              dense 
              icon="refresh" 
              color="lime" 
              @click="loadAnalyticsData" 
              :loading="loadingAnalytics"
              class="hover-scale"
            />
          </div>
        </div>

        <div class="charts-grid">
          <!-- Platform Revenue Chart -->
          <div class="chart-card lime-glow hover-lift">
            <div class="chart-header">
              <h4 class="chart-title">
                <q-icon name="trending_up" size="20px" color="lime" class="q-mr-sm" />
                Platform Revenue
              </h4>
              <div class="chart-subtitle">Total revenue across all merchants</div>
            </div>
            <div class="chart-container">
              <div v-if="loadingAnalytics" class="chart-loading">
                <q-spinner-dots color="lime" size="40px" />
                <p>Loading analytics...</p>
              </div>
              <div v-else-if="revenueData.length > 0" class="chart-content">
                <div class="revenue-chart">
                  <div class="chart-stats">
                    <div class="stat-item">
                      <span class="stat-label">Total:</span>
                      <span class="stat-value">${{ formatNumber(getTotalRevenue()) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Average:</span>
                      <span class="stat-value">${{ formatNumber(getAverageRevenue()) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value" :class="getGrowthClass()">{{ getRevenueGrowth() }}%</span>
                      <span class="stat-label">Growth</span>
                    </div>
                  </div>
                  <div class="revenue-bars">
                    <div 
                      v-for="(item, index) in revenueData.slice(0, 12)" 
                      :key="index" 
                      class="revenue-bar hover-scale"
                      @click="showRevenueDetails(item, index)"
                    >
                      <div class="bar-value">${{ formatNumber(item.revenue || item.value || 0) }}</div>
                      <div 
                        class="bar-fill" 
                        :style="{
                          height: getBarHeight(item.revenue || item.value || 0, revenueData),
                          background: getRevenueBarGradient(index)
                        }"
                      ></div>
                      <div class="bar-label">{{ item.date || item.label || `M${index + 1}` }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="chart-empty">
                <q-icon name="analytics" size="48px" color="grey-5" />
                <p>No revenue data available</p>
              </div>
            </div>
          </div>

          <!-- Merchant Growth Chart -->
          <div class="chart-card lime-glow hover-lift">
            <div class="chart-header">
              <h4 class="chart-title">
                <q-icon name="people" size="20px" color="blue" class="q-mr-sm" />
                Merchant Growth
              </h4>
              <div class="chart-subtitle">New merchant registrations</div>
            </div>
            <div class="chart-container">
              <div v-if="loadingAnalytics" class="chart-loading">
                <q-spinner-dots color="blue" size="40px" />
                <p>Loading merchant data...</p>
              </div>
              <div v-else-if="merchantGrowthData.length > 0" class="chart-content">
                <div class="growth-chart">
                  <div class="chart-stats">
                    <div class="stat-item">
                      <span class="stat-label">Total:</span>
                      <span class="stat-value">{{ formatNumber(getTotalMerchants()) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">This Month:</span>
                      <span class="stat-value">{{ formatNumber(getThisMonthMerchants()) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-value" :class="getMerchantGrowthClass()">{{ getMerchantGrowth() }}%</span>
                      <span class="stat-label">Growth</span>
                    </div>
                  </div>
                  <div class="growth-line">
                    <svg class="growth-svg" viewBox="0 0 400 200">
                      <path 
                        :d="getGrowthPath(merchantGrowthData)" 
                        fill="none" 
                        stroke="url(#growthGradient)" 
                        stroke-width="3"
                        class="growth-path"
                      />
                      <defs>
                        <linearGradient id="growthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" style="stop-color:#4CAF50;stop-opacity:1" />
                          <stop offset="100%" style="stop-color:#2196F3;stop-opacity:1" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div class="growth-points">
                      <div 
                        v-for="(point, index) in merchantGrowthData" 
                        :key="index"
                        class="growth-point hover-scale"
                        :style="{ left: `${(index / (merchantGrowthData.length - 1)) * 100}%` }"
                        @click="showGrowthDetails(point, index)"
                      >
                        <div class="point-tooltip">{{ point.count }} merchants</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="chart-empty">
                <q-icon name="people" size="48px" color="grey-5" />
                <p>No merchant growth data available</p>
              </div>
            </div>
          </div>

          <!-- Transaction Volume Chart -->
          <div class="chart-card lime-glow hover-lift">
            <div class="chart-header">
              <h4 class="chart-title">
                <q-icon name="receipt" size="20px" color="teal" class="q-mr-sm" />
                Transaction Volume
              </h4>
              <div class="chart-subtitle">Platform transaction trends</div>
            </div>
            <div class="chart-container">
              <div v-if="loadingAnalytics" class="chart-loading">
                <q-spinner-dots color="teal" size="40px" />
                <p>Loading transactions...</p>
              </div>
              <div v-else-if="transactionData.length > 0" class="chart-content">
                <div class="transaction-chart">
                  <div class="chart-stats">
                    <div class="stat-item">
                      <span class="stat-label">Total:</span>
                      <span class="stat-value">{{ formatNumber(getTotalTransactions()) }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Success Rate:</span>
                      <span class="stat-value">{{ getSuccessRate() }}%</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Avg Amount:</span>
                      <span class="stat-value">${{ formatNumber(getAverageTransactionAmount()) }}</span>
                    </div>
                  </div>
                  <div class="transaction-bars">
                    <div 
                      v-for="(item, index) in transactionData.slice(0, 12)" 
                      :key="index" 
                      class="transaction-bar hover-scale"
                      @click="showTransactionDetails(item, index)"
                    >
                      <div class="bar-stack">
                        <div 
                          class="bar-success" 
                          :style="{ height: getTransactionBarHeight(item.success, transactionData) }"
                        ></div>
                        <div 
                          class="bar-failed" 
                          :style="{ height: getTransactionBarHeight(item.failed || 0, transactionData) }"
                        ></div>
                      </div>
                      <div class="bar-label">{{ item.date || item.label || `M${index + 1}` }}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="chart-empty">
                <q-icon name="receipt" size="48px" color="grey-5" />
                <p>No transaction data available</p>
              </div>
            </div>
          </div>

          <!-- Platform Performance Metrics -->
          <div class="chart-card lime-glow hover-lift">
            <div class="chart-header">
              <h4 class="chart-title">
                <q-icon name="speed" size="20px" color="purple" class="q-mr-sm" />
                Platform Performance
              </h4>
              <div class="chart-subtitle">Key platform indicators</div>
            </div>
            <div class="chart-container">
              <div v-if="loadingAnalytics" class="chart-loading">
                <q-spinner-dots color="purple" size="40px" />
                <p>Loading metrics...</p>
              </div>
              <div v-else class="chart-content">
                <div class="performance-metrics">
                  <div class="metrics-grid">
                    <div class="metric-item hover-scale">
                      <div class="metric-icon">
                        <q-icon name="schedule" size="24px" color="orange" />
                      </div>
                      <div class="metric-content">
                        <div class="metric-value">{{ avgResponseTime }}ms</div>
                        <div class="metric-label">Avg Response Time</div>
                      </div>
                    </div>
                    <div class="metric-item hover-scale">
                      <div class="metric-icon">
                        <q-icon name="check_circle" size="24px" color="green" />
                      </div>
                      <div class="metric-content">
                        <div class="metric-value">{{ uptimePercentage }}%</div>
                        <div class="metric-label">Platform Uptime</div>
                      </div>
                    </div>
                    <div class="metric-item hover-scale">
                      <div class="metric-icon">
                        <q-icon name="security" size="24px" color="blue" />
                      </div>
                      <div class="metric-content">
                        <div class="metric-value">{{ securityScore }}/100</div>
                        <div class="metric-label">Security Score</div>
                      </div>
                    </div>
                    <div class="metric-item hover-scale">
                      <div class="metric-icon">
                        <q-icon name="support_agent" size="24px" color="teal" />
                      </div>
                      <div class="metric-content">
                        <div class="metric-value">{{ supportTickets }}</div>
                        <div class="metric-label">Open Tickets</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Real Merchants Management Section -->
      <div class="merchants-section q-mb-xl animate-fade-in" style="animation-delay: 0.3s">
        <q-card class="merchants-card lime-glow">
          <q-card-section>
            <div class="card-header">
              <h3 class="card-title">Merchant Management</h3>
              <div class="header-actions">
                <q-btn color="lime" icon="add" label="Add Merchant" @click="showAddMerchantDialog = true" />
                <q-btn color="blue" icon="refresh" label="Refresh" @click="loadAllMerchants"
                  :loading="merchantsLoading" />
              </div>
            </div>

            <!-- Real Merchant Stats -->
            <div class="merchant-stats-enhanced q-mb-lg">
              <div class="stats-grid">
                <div class="stat-card-mini">
                  <div class="stat-icon-mini">
                    <q-icon name="store" color="blue" size="24px" />
                  </div>
                  <div class="stat-content-mini">
                    <div class="stat-value-mini">{{ merchantStats.total }}</div>
                    <div class="stat-label-mini">Total Merchants</div>
                  </div>
                </div>

                <div class="stat-card-mini">
                  <div class="stat-icon-mini">
                    <q-icon name="pending" color="orange" size="24px" />
                  </div>
                  <div class="stat-content-mini">
                    <div class="stat-value-mini">{{ merchantStats.pending }}</div>
                    <div class="stat-label-mini">Pending Approval</div>
                  </div>
                </div>

                <div class="stat-card-mini">
                  <div class="stat-icon-mini">
                    <q-icon name="verified" color="green" size="24px" />
                  </div>
                  <div class="stat-content-mini">
                    <div class="stat-value-mini">{{ merchantStats.verified }}</div>
                    <div class="stat-label-mini">Verified</div>
                  </div>
                </div>

                <div class="stat-card-mini">
                  <div class="stat-icon-mini">
                    <q-icon name="block" color="red" size="24px" />
                  </div>
                  <div class="stat-content-mini">
                    <div class="stat-value-mini">{{ merchantStats.suspended }}</div>
                    <div class="stat-label-mini">Suspended</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Merchant Status Filter -->
            <div class="merchant-filters q-mb-md">
              <div class="row q-gutter-md items-center">
                <div class="col-auto">
                  <q-btn-toggle v-model="merchantFilter" :options="merchantFilterOptions" color="lime"
                    text-color="white" size="sm" @update:model-value="filterMerchants" />
                </div>
                <div class="col-auto">
                  <q-input v-model="merchantSearch" placeholder="Search merchants..." outlined dense clearable
                    @input="filterMerchants" style="min-width: 250px">
                    <template v-slot:prepend>
                      <q-icon name="search" />
                    </template>
                  </q-input>
                </div>
                <q-space />
                <div class="col-auto">
                  <q-chip :color="getFilterChipColor(merchantFilter)" text-color="white" size="sm">
                    {{ filteredMerchants.length }} merchants
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Real Merchants Table -->
            <q-table :rows="paginatedMerchants" :columns="enhancedMerchantColumns" :pagination="merchantPagination"
              :loading="merchantsLoading" row-key="id" class="enhanced-merchant-table"
              @request="onMerchantTableRequest">
              <!-- Business Column -->
              <template v-slot:body-cell-business="props">
                <q-td :props="props">
                  <div class="business-cell">
                    <q-avatar size="32px" square class="business-avatar">
                      <img :src="props.row.logo_url || getDefaultLogo(props.row.business_name)" />
                    </q-avatar>
                    <div class="business-info">
                      <div class="business-name">{{ props.row.business_name || 'N/A' }}</div>
                      <div class="business-email">{{ props.row.email }}</div>
                    </div>
                  </div>
                </q-td>
              </template>

              <!-- Status Column -->
              <template v-slot:body-cell-status="props">
                <q-td :props="props">
                  <q-chip :color="getStatusColor(props.value)" text-color="white" :icon="getStatusIcon(props.value)"
                    size="sm" class="status-chip">
                    {{ props.value }}
                  </q-chip>
                </q-td>
              </template>

              <!-- Registration Date Column -->
              <template v-slot:body-cell-created_at="props">
                <q-td :props="props">
                  <div class="date-cell">
                    <div class="date-primary">{{ formatDate(props.value) }}</div>
                    <div class="date-secondary">{{ formatTimeAgo(props.value) }}</div>
                  </div>
                </q-td>
              </template>

              <!-- Bank Account Column -->
              <template v-slot:body-cell-bank_account="props">
                <q-td :props="props">
                  <div class="bank-info">
                    <div class="bank-name">{{ props.row.bank_account_name || 'N/A' }}</div>
                    <div class="bank-number">****{{ (props.row.bank_account_number || '').slice(-4) }}</div>
                  </div>
                </q-td>
              </template>

              <!-- Actions Column -->
              <template v-slot:body-cell-actions="props">
                <q-td :props="props">
                  <div class="action-buttons">
                    <q-btn flat round dense icon="visibility" color="blue" @click="viewMerchant(props.row)" size="sm">
                      <q-tooltip>View Details</q-tooltip>
                    </q-btn>

                    <q-btn v-if="props.row.status === 'pending'" flat round dense icon="check" color="green"
                      @click="approveMerchant(props.row)" size="sm" :loading="approvingMerchant === props.row.id">
                      <q-tooltip>Approve Merchant</q-tooltip>
                    </q-btn>

                    <q-btn v-if="props.row.status === 'pending'" flat round dense icon="close" color="red"
                      @click="rejectMerchant(props.row)" size="sm">
                      <q-tooltip>Reject Merchant</q-tooltip>
                    </q-btn>

                    <q-btn flat round dense icon="more_vert" color="grey" @click="showMerchantMenu(props.row)"
                      size="sm">
                      <q-tooltip>More Actions</q-tooltip>
                    </q-btn>
                  </div>
                </q-td>
              </template>

              <!-- No Data -->
              <template v-slot:no-data>
                <div class="full-width row flex-center text-grey-6 q-gutter-sm">
                  <q-icon size="2em" name="store" />
                  <span>No merchants found</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>

      <!-- Quick Actions Grid -->
      <div class="actions-section animate-fade-in" style="animation-delay: 0.4s">
        <h3 class="section-title">Quick Actions</h3>
        <div class="enhanced-actions-grid">
          <div class="action-card-enhanced" @click="navigateTo('/admin/merchants')">
            <div class="action-background">
              <div class="action-icon-enhanced">
                <q-icon name="store" size="40px" color="lime" />
              </div>
              <div class="action-content-enhanced">
                <h4>Merchant Management</h4>
                <p>Review, approve, and manage merchant accounts</p>
                <div class="action-stats">
                  <span class="stat-badge">{{ merchantStats.pending }} pending approval</span>
                </div>
              </div>
              <div class="action-arrow-enhanced">
                <q-icon name="arrow_forward" color="lime" size="24px" />
              </div>
            </div>
          </div>

          <div class="action-card-enhanced" @click="navigateTo('/transactions')">
            <div class="action-background">
              <div class="action-icon-enhanced">
                <q-icon name="receipt_long" size="40px" color="blue" />
              </div>
              <div class="action-content-enhanced">
                <h4>View Transactions</h4>
                <p>Monitor all platform transactions</p>
                <div class="action-stats">
                  <span class="stat-badge">Real-time monitoring</span>
                </div>
              </div>
              <div class="action-arrow-enhanced">
                <q-icon name="arrow_forward" color="blue" size="24px" />
              </div>
            </div>
          </div>

          <div class="action-card-enhanced" @click="navigateTo('/admin/support')">
            <div class="action-background">
              <div class="action-icon-enhanced">
                <q-icon name="support_agent" size="40px" color="purple" />
              </div>
              <div class="action-content-enhanced">
                <h4>Support Center</h4>
                <p>Manage customer support and help requests</p>
                <div class="action-stats">
                  <span class="stat-badge">Support management</span>
                </div>
              </div>
              <div class="action-arrow-enhanced">
                <q-icon name="arrow_forward" color="purple" size="24px" />
              </div>
            </div>
          </div>

          <div class="action-card-enhanced" @click="navigateTo('/admin/settings')">
            <div class="action-background">
              <div class="action-icon-enhanced">
                <q-icon name="settings" size="40px" color="orange" />
              </div>
              <div class="action-content-enhanced">
                <h4>Platform Settings</h4>
                <p>Configure system settings and preferences</p>
                <div class="action-stats">
                  <span class="stat-badge">System configuration</span>
                </div>
              </div>
              <div class="action-arrow-enhanced">
                <q-icon name="arrow_forward" color="orange" size="24px" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Merchant Dialog -->
    <q-dialog v-model="showAddMerchantDialog" persistent>
      <q-card class="add-merchant-dialog">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Add New Merchant</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="submitNewMerchant" class="q-gutter-md">
            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="newMerchant.business_name" label="Business Name *" outlined dense required
                  :rules="[val => !!val || 'Business name is required']" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="newMerchant.email" label="Email Address *" type="email" outlined dense required
                  :rules="[
                    val => !!val || 'Email is required',
                    val => /.+@.+\..+/.test(val) || 'Enter a valid email'
                  ]" />
              </div>
            </div>

            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="newMerchant.bank_account_name" label="Bank Account Name *" outlined dense required
                  :rules="[val => !!val || 'Bank account name is required']" />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="newMerchant.bank_account_number" label="Bank Account Number *" outlined dense required
                  :rules="[val => !!val || 'Bank account number is required']" />
              </div>
            </div>

            <div class="row q-gutter-md">
              <div class="col-12 col-md-6">
                <q-input v-model="newMerchant.phone" label="Phone Number" outlined dense />
              </div>
              <div class="col-12 col-md-6">
                <q-select v-model="newMerchant.category" :options="categoryOptions" label="Business Category" outlined
                  dense />
              </div>
            </div>

            <q-input v-model="newMerchant.description" label="Business Description" type="textarea" outlined rows="3" />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn color="lime" label="Add Merchant" @click="submitNewMerchant" :loading="submittingMerchant" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Merchant Details Dialog -->
    <q-dialog v-model="showMerchantDetails" maximized>
      <q-card class="merchant-details-dialog">
        <q-card-section class="dialog-header">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-lime">Merchant Details</div>
              <div class="text-caption text-grey-5">{{ selectedMerchant?.business_name }}</div>
            </div>
            <div class="col-auto">
              <q-btn icon="close" flat round dense v-close-popup color="grey" />
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="selectedMerchant" class="dialog-content">
          <div class="merchant-details-grid">
            <!-- Business Info -->
            <div class="detail-section">
              <h5 class="section-title">Business Information</h5>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Business Name:</span>
                  <span class="detail-value">{{ selectedMerchant.business_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Email:</span>
                  <span class="detail-value">{{ selectedMerchant.email }}</span>
                </div>
                <div class="detail-item" v-if="selectedMerchant.phone">
                  <span class="detail-label">Phone:</span>
                  <span class="detail-value">{{ selectedMerchant.phone }}</span>
                </div>
                <div class="detail-item" v-if="selectedMerchant.category">
                  <span class="detail-label">Category:</span>
                  <span class="detail-value">{{ selectedMerchant.category }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Status:</span>
                  <q-chip :color="getStatusColor(selectedMerchant.status)" text-color="white"
                    :icon="getStatusIcon(selectedMerchant.status)" size="sm">
                    {{ selectedMerchant.status }}
                  </q-chip>
                </div>
              </div>
            </div>

            <!-- Banking Info -->
            <div class="detail-section">
              <h5 class="section-title">Banking Information</h5>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Account Name:</span>
                  <span class="detail-value">{{ selectedMerchant.bank_account_name }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Account Number:</span>
                  <span class="detail-value">****{{ (selectedMerchant.bank_account_number || '').slice(-4) }}</span>
                </div>
                <div class="detail-item" v-if="selectedMerchant.bank_name">
                  <span class="detail-label">Bank Name:</span>
                  <span class="detail-value">{{ selectedMerchant.bank_name }}</span>
                </div>
              </div>
            </div>

            <!-- Registration Details -->
            <div class="detail-section full-width">
              <h5 class="section-title">Registration Details</h5>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">Registered:</span>
                  <span class="detail-value">{{ formatDateTime(selectedMerchant.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">Last Updated:</span>
                  <span class="detail-value">{{ formatDateTime(selectedMerchant.updated_at) }}</span>
                </div>
                <div class="detail-item" v-if="selectedMerchant.description">
                  <span class="detail-label">Description:</span>
                  <span class="detail-value">{{ selectedMerchant.description }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat label="Close" v-close-popup />
          <q-btn v-if="selectedMerchant?.status === 'pending'" color="green" icon="check" label="Approve"
            @click="approveMerchant(selectedMerchant)" :loading="approvingMerchant === selectedMerchant?.id" />
          <q-btn v-if="selectedMerchant?.status === 'pending'" color="red" icon="close" label="Reject"
            @click="rejectMerchant(selectedMerchant)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Merchant Context Menu -->
    <q-menu v-model="showMerchantContextMenu" context-menu>
      <q-list dense>
        <q-item clickable @click="viewMerchant(contextMenuMerchant)">
          <q-item-section avatar>
            <q-icon name="visibility" color="blue" />
          </q-item-section>
          <q-item-section>View Details</q-item-section>
        </q-item>

        <q-item v-if="contextMenuMerchant?.status === 'pending'" clickable
          @click="approveMerchant(contextMenuMerchant)">
          <q-item-section avatar>
            <q-icon name="check" color="green" />
          </q-item-section>
          <q-item-section>Approve Merchant</q-item-section>
        </q-item>

        <q-item v-if="contextMenuMerchant?.status === 'pending'" clickable @click="rejectMerchant(contextMenuMerchant)">
          <q-item-section avatar>
            <q-icon name="close" color="red" />
          </q-item-section>
          <q-item-section>Reject Merchant</q-item-section>
        </q-item>

        <q-separator />

        <q-item clickable @click="copyMerchantInfo(contextMenuMerchant)">
          <q-item-section avatar>
            <q-icon name="content_copy" color="grey" />
          </q-item-section>
          <q-item-section>Copy Merchant Info</q-item-section>
        </q-item>
      </q-list>
    </q-menu>

    <!-- Error State -->
    <div v-if="error" class="error-message q-mt-lg">
      <q-banner class="text-white bg-negative">
        {{ error }}
        <template v-slot:action>
          <q-btn flat color="white" label="Retry" @click="loadDashboardData" />
        </template>
      </q-banner>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const merchantsLoading = ref(false)
const error = ref('')
const submittingMerchant = ref(false)
const approvingMerchant = ref(null)

// Dialog states
const showAddMerchantDialog = ref(false)
const showMerchantDetails = ref(false)
const showMerchantContextMenu = ref(false)
const selectedMerchant = ref(null)
const contextMenuMerchant = ref(null)

// Real merchant data
const allMerchants = ref([])
const merchantStats = ref({
  total: 0,
  pending: 0,
  verified: 0,
  approved: 0,
  suspended: 0,
  newThisMonth: 0,
  activeToday: 0,
  growth: 0
})

// Merchant filtering
const merchantFilter = ref('all')
const merchantSearch = ref('')

// Pagination
const merchantPagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// New merchant form
const newMerchant = ref({
  business_name: '',
  email: '',
  bank_account_name: '',
  bank_account_number: '',
  phone: '',
  category: null,
  description: ''
})

// Analytics State
const timeframe = ref('monthly')
const loadingAnalytics = ref(false)
const revenueData = ref([])
const merchantGrowthData = ref([])
const transactionData = ref([])
const avgResponseTime = ref(45)
const uptimePercentage = ref(99.9)
const securityScore = ref(95)
const supportTickets = ref(12)

const timeframeOptions = [
  { label: '7D', value: 'weekly' },
  { label: '30D', value: 'monthly' },
  { label: '90D', value: 'quarterly' },
  { label: '1Y', value: 'yearly' }
]

// Options
const merchantFilterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Verified', value: 'verified' },
  { label: 'Approved', value: 'approved' },
  { label: 'Suspended', value: 'suspended' }
]

const categoryOptions = [
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Food & Beverage', value: 'food' },
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Finance', value: 'finance' },
  { label: 'Other', value: 'other' }
]

// Table columns
const enhancedMerchantColumns = [
  { name: 'business', label: 'Business', field: 'business_name', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'bank_account', label: 'Bank Account', field: 'bank_account_name', align: 'left', sortable: true },
  { name: 'created_at', label: 'Registered', field: 'created_at', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Computed properties
const user = computed(() => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : { name: 'Admin', email: 'admin@example.com', role: 'admin' }
  } catch {
    return { name: 'Admin', email: 'admin@example.com', role: 'admin' }
  }
})

const filteredMerchants = computed(() => {
  let filtered = [...allMerchants.value]

  // Apply status filter
  if (merchantFilter.value !== 'all') {
    filtered = filtered.filter(merchant => merchant.status === merchantFilter.value)
  }

  // Apply search filter
  if (merchantSearch.value) {
    const search = merchantSearch.value.toLowerCase()
    filtered = filtered.filter(merchant => 
      merchant.business_name?.toLowerCase().includes(search) ||
      merchant.email?.toLowerCase().includes(search) ||
      String(merchant.tempId || merchant.id || '').includes(search)
    )
  }

  return filtered
})

const paginatedMerchants = computed(() => {
  const start = (merchantPagination.value.page - 1) * merchantPagination.value.rowsPerPage
  const end = start + merchantPagination.value.rowsPerPage
  return filteredMerchants.value.slice(start, end)
})

// Watch for pagination updates
watch(filteredMerchants, (newFiltered) => {
  merchantPagination.value.rowsNumber = newFiltered.length
}, { immediate: true })

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''

    console.log('🔄 Loading admin dashboard data...')

    // Load merchants data
    await loadAllMerchants()
    
    // Load analytics data
    await loadAnalyticsData()

    console.log('✅ Admin dashboard loaded successfully')

  } catch (err) {
    console.error('❌ Dashboard load error:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

// Analytics Methods
const loadAnalyticsData = async () => {
  try {
    loadingAnalytics.value = true
    
    // Load revenue data
    await loadRevenueData()
    
    // Load merchant growth data
    await loadMerchantGrowthData()
    
    // Load transaction data
    await loadTransactionData()
    
    // Load performance metrics
    await loadPerformanceMetrics()
    
  } catch (error) {
    console.error('Error loading analytics:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load analytics data',
      position: 'top'
    })
  } finally {
    loadingAnalytics.value = false
  }
}

const loadRevenueData = async () => {
  try {
    // Try to get real data from API
    const response = await api.get('/api/admin/transactions', {
      params: { timeframe: timeframe.value }
    })
    
    if (response.data?.transactions) {
      revenueData.value = calculateRevenueFromTransactions(response.data.transactions)
    } else {
      // Fallback to sample data
      loadSampleRevenue()
    }
  } catch (error) {
    console.warn('Using fallback revenue data:', error)
    loadSampleRevenue()
  }
}

const loadMerchantGrowthData = async () => {
  try {
    // Try to get real data from API
    const response = await api.get('/api/admin/merchants', {
      params: { timeframe: timeframe.value }
    })
    
    if (response.data?.merchants) {
      merchantGrowthData.value = calculateMerchantGrowth(response.data.merchants)
    } else {
      // Fallback to sample data
      loadSampleMerchantGrowth()
    }
  } catch (error) {
    console.warn('Using fallback merchant growth data:', error)
    loadSampleMerchantGrowth()
  }
}

const loadTransactionData = async () => {
  try {
    // Try to get real data from API
    const response = await api.get('/api/admin/transactions', {
      params: { timeframe: timeframe.value }
    })
    
    if (response.data?.transactions) {
      transactionData.value = calculateTransactionTrends(response.data.transactions)
    } else {
      // Fallback to sample data
      loadSampleTransactionData()
    }
  } catch (error) {
    console.warn('Using fallback transaction data:', error)
    loadSampleTransactionData()
  }
}

const loadPerformanceMetrics = async () => {
  try {
    // Try to get real data from API
    const response = await api.get('/api/admin/metrics')
    
    if (response.data) {
      avgResponseTime.value = response.data.avg_response_time || 45
      uptimePercentage.value = response.data.uptime_percentage || 99.9
      securityScore.value = response.data.security_score || 95
      supportTickets.value = response.data.support_tickets || 12
    }
  } catch (error) {
    console.warn('Using fallback performance metrics:', error)
    // Keep default values
  }
}

const loadSampleRevenue = () => {
  revenueData.value = [
    { date: 'Jan', revenue: 125000 },
    { date: 'Feb', revenue: 138000 },
    { date: 'Mar', revenue: 156000 },
    { date: 'Apr', revenue: 142000 },
    { date: 'May', revenue: 168000 },
    { date: 'Jun', revenue: 184000 }
  ]
}

const loadSampleMerchantGrowth = () => {
  merchantGrowthData.value = [
    { date: 'Jan', count: 45 },
    { date: 'Feb', count: 52 },
    { date: 'Mar', count: 58 },
    { date: 'Apr', count: 65 },
    { date: 'May', count: 72 },
    { date: 'Jun', count: 78 }
  ]
}

const loadSampleTransactionData = () => {
  transactionData.value = [
    { date: 'Jan', count: 450, success: 445, failed: 5 },
    { date: 'Feb', count: 520, success: 515, failed: 5 },
    { date: 'Mar', count: 580, success: 575, failed: 5 }
  ]
}

const calculateRevenueFromTransactions = (transactions) => {
  const monthlyRevenue = {}
  
  transactions.forEach(transaction => {
    if (transaction.status === 'completed') {
      const date = new Date(transaction.created_at)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
      
      if (!monthlyRevenue[monthKey]) {
        monthlyRevenue[monthKey] = 0
      }
      monthlyRevenue[monthKey] += transaction.amount || 0
    }
  })
  
  return Object.entries(monthlyRevenue).map(([date, revenue]) => ({
    date,
    revenue
  }))
}

const calculateMerchantGrowth = (merchants) => {
  const monthlyGrowth = {}
  
  merchants.forEach(merchant => {
    const date = new Date(merchant.created_at)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
    
    if (!monthlyGrowth[monthKey]) {
      monthlyGrowth[monthKey] = 0
    }
    monthlyGrowth[monthKey]++
  })
  
  return Object.entries(monthlyGrowth).map(([date, count]) => ({
    date,
    count
  }))
}

const calculateTransactionTrends = (transactions) => {
  const monthlyData = {}
  
  transactions.forEach(transaction => {
    const date = new Date(transaction.created_at)
    const monthKey = date.toLocaleDateString('en-US', { month: 'short' })
    
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { count: 0, success: 0, failed: 0 }
    }
    
    monthlyData[monthKey].count++
    if (transaction.status === 'completed') {
      monthlyData[monthKey].success++
    } else if (transaction.status === 'failed') {
      monthlyData[monthKey].failed++
    }
  })
  
  return Object.entries(monthlyData).map(([date, data]) => ({
    date,
    ...data
  }))
}

const getTotalRevenue = () => {
  return revenueData.value.reduce((sum, item) => sum + (item.revenue || item.value || 0), 0)
}

const getAverageRevenue = () => {
  if (revenueData.value.length === 0) return 0
  return Math.round(getTotalRevenue() / revenueData.value.length)
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
  return growth >= 0 ? 'text-positive' : 'text-negative'
}

const getTotalMerchants = () => {
  return merchantGrowthData.value.reduce((sum, item) => sum + (item.count || 0), 0)
}

const getThisMonthMerchants = () => {
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' })
  const thisMonth = merchantGrowthData.value.find(item => item.date === currentMonth)
  return thisMonth ? thisMonth.count : 0
}

const getMerchantGrowth = () => {
  if (merchantGrowthData.value.length < 2) return 0
  const current = merchantGrowthData.value[merchantGrowthData.value.length - 1]?.count || 0
  const previous = merchantGrowthData.value[merchantGrowthData.value.length - 2]?.count || 0
  if (previous === 0) return 0
  return Math.round(((current - previous) / previous) * 100)
}

const getMerchantGrowthClass = () => {
  const growth = getMerchantGrowth()
  return growth >= 0 ? 'text-positive' : 'text-negative'
}

const getTotalTransactions = () => {
  return transactionData.value.reduce((sum, item) => sum + (item.count || 0), 0)
}

const getSuccessRate = () => {
  const total = getTotalTransactions()
  if (total === 0) return 0
  const success = transactionData.value.reduce((sum, item) => sum + (item.success || 0), 0)
  return Math.round((success / total) * 100)
}

const getAverageTransactionAmount = () => {
  // This would need to be calculated from actual transaction data
  return 1250
}

const getBarHeight = (value, data) => {
  const maxValue = Math.max(...data.map(item => item.revenue || item.value || 0))
  if (maxValue === 0) return '0%'
  return `${(value / maxValue) * 100}%`
}

const getTransactionBarHeight = (value, data) => {
  const maxValue = Math.max(...data.map(item => item.count || 0))
  if (maxValue === 0) return '0%'
  return `${(value / maxValue) * 100}%`
}

const getRevenueBarGradient = (index) => {
  const gradients = [
    'linear-gradient(135deg, #4CAF50, #45a049)',
    'linear-gradient(135deg, #2196F3, #1976D2)',
    'linear-gradient(135deg, #FF9800, #F57C00)',
    'linear-gradient(135deg, #9C27B0, #7B1FA2)',
    'linear-gradient(135deg, #E91E63, #C2185B)',
    'linear-gradient(135deg, #00BCD4, #0097A7)'
  ]
  return gradients[index % gradients.length]
}

const getGrowthPath = (data) => {
  if (data.length === 0) return ''
  
  const width = 400
  const height = 200
  const padding = 40
  
  const xStep = (width - 2 * padding) / (data.length - 1)
  const maxCount = Math.max(...data.map(item => item.count))
  
  let path = `M ${padding} ${height - padding - ((data[0]?.count || 0) / maxCount) * (height - 2 * padding)}`
  
  for (let i = 1; i < data.length; i++) {
    const x = padding + i * xStep
    const y = height - padding - ((data[i]?.count || 0) / maxCount) * (height - 2 * padding)
    path += ` L ${x} ${y}`
  }
  
  return path
}

const formatNumber = (num) => {
  if (!num) return '0'
  return new Intl.NumberFormat('en-US').format(num)
}

const showRevenueDetails = (item) => {
  $q.notify({
    type: 'info',
    message: `${item.date}: $${formatNumber(item.revenue || item.value || 0)}`,
    position: 'top'
  })
}

const showGrowthDetails = (point) => {
  $q.notify({
    type: 'info',
    message: `${point.date}: ${point.count} new merchants`,
    position: 'top'
  })
}

const showTransactionDetails = (item) => {
  $q.notify({
    type: 'info',
    message: `${item.date}: ${item.count} transactions (${item.success} successful)`,
    position: 'top'
  })
}

const loadAllMerchants = async () => {
  try {
    merchantsLoading.value = true
    console.log('🔄 Loading all merchants from API...')

    // ✅ Use your actual API endpoint: GET /api/admin/merchants
    const response = await api.get('/api/admin/merchants')
    
    console.log('📋 Raw merchant API response:', response.data)
    
    // ✅ Enhanced data processing to handle missing IDs
    let merchantData = []
    
    if (response && response.data) {
      if (Array.isArray(response.data)) {
        merchantData = response.data
      } else if (response.data.merchants && Array.isArray(response.data.merchants)) {
        merchantData = response.data.merchants
      } else if (response.data.data && Array.isArray(response.data.data)) {
        merchantData = response.data.data
      } else if (typeof response.data === 'object') {
        merchantData = [response.data]
      }
    }
    
    // ✅ Process and normalize merchant data with guaranteed IDs
    allMerchants.value = merchantData.map((merchant, index) => {
      // Create a unique identifier for each merchant
      let merchantId = merchant.id || merchant.merchant_id || merchant.user_id
      
      // If no ID exists, create one based on email or business name
      if (!merchantId) {
        const emailHash = merchant.email ? merchant.email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : ''
        const businessHash = merchant.business_name ? merchant.business_name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : ''
        merchantId = `temp_${emailHash || businessHash || index}_${Date.now()}`
        
        console.warn('⚠️ Generated ID for merchant:', {
          generated_id: merchantId,
          business_name: merchant.business_name,
          email: merchant.email
        })
      }
      
      return {
        // ✅ Guaranteed unique ID
        id: merchantId,
        tempId: merchantId, // Backup ID field
        
        // ✅ Normalized data with fallbacks
        business_name: merchant.business_name || merchant.name || 'Unknown Business',
        email: merchant.email || 'No email',
        phone: merchant.phone || '',
        category: merchant.category || 'other',
        status: merchant.status || 'pending',
        bank_account_name: merchant.bank_account_name || '',
        bank_account_number: merchant.bank_account_number || '',
        bank_name: merchant.bank_name || '',
        description: merchant.description || '',
        created_at: merchant.created_at || new Date().toISOString(),
        updated_at: merchant.updated_at || new Date().toISOString(),
        logo_url: merchant.logo_url || null,
        
        // ✅ Keep original data for debugging
        _original: merchant,
        _hasOriginalId: !!(merchant.id || merchant.merchant_id || merchant.user_id)
      }
    })

    console.log('✅ Merchants processed with IDs:', allMerchants.value.length)
    console.log('📋 Sample processed merchant:', allMerchants.value[0])
    
    // Calculate statistics
    calculateMerchantStats()
    
  } catch (error) {
    console.error('❌ Failed to load merchants from API:', error)
    
    // Set empty state
    allMerchants.value = []
    merchantStats.value = {
      total: 0,
      pending: 0,
      verified: 0,
      approved: 0,
      suspended: 0,
      newThisMonth: 0,
      activeToday: 0,
      growth: 0
    }
    
    // Enhanced error messages
    let errorMessage = 'Failed to load merchants'
    
    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      errorMessage = 'Cannot connect to backend server at http://192.168.12.35:8000. Please ensure your Laravel server is running.'
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again as admin.'
    } else if (error.response?.status === 403) {
      errorMessage = 'Access forbidden. You need admin privileges to view merchants.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Merchants API endpoint not found on your backend server.'
    }
    
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 6000,
      actions: [
        { 
          label: 'Retry', 
          color: 'white', 
          handler: () => loadAllMerchants()
        }
      ]
    })
  } finally {
    merchantsLoading.value = false
  }
}

const calculateMerchantStats = () => {
  try {
    const today = new Date().toDateString()
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    const stats = {
      total: allMerchants.value.length,
      pending: 0,
      verified: 0,
      approved: 0,
      suspended: 0,
      newThisMonth: 0,
      activeToday: 0,
      growth: 0
    }

    let lastMonthCount = 0

    allMerchants.value.forEach(merchant => {
      // Count by status
      switch (merchant.status) {
        case 'pending':
          stats.pending++
          break
        case 'verified':
          stats.verified++
          break
        case 'approved':
          stats.approved++
          stats.verified++ // Approved counts as verified too
          break
        case 'suspended':
          stats.suspended++
          break
      }

      // Count new this month
      try {
        const merchantDate = new Date(merchant.created_at)
        if (merchantDate.getMonth() === thisMonth && merchantDate.getFullYear() === thisYear) {
          stats.newThisMonth++
        }
        
        // Count last month for growth
        const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
        const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear
        if (merchantDate.getMonth() === lastMonth && merchantDate.getFullYear() === lastMonthYear) {
          lastMonthCount++
        }
      } catch {
        // Invalid date, skip
      }

      // Count active today
      try {
        const updateDate = new Date(merchant.updated_at || merchant.created_at)
        if (updateDate.toDateString() === today) {
          stats.activeToday++
        }
      } catch {
        // Invalid date, skip
      }
    })

    // Calculate growth
    if (lastMonthCount > 0) {
      stats.growth = Math.round(((stats.newThisMonth - lastMonthCount) / lastMonthCount) * 100)
    } else if (stats.newThisMonth > 0) {
      stats.growth = 100
    }

    merchantStats.value = stats
    
    console.log('📊 Merchant statistics:', stats)
  } catch (error) {
    console.error('❌ Error calculating merchant stats:', error)
  }
}

const filterMerchants = () => {
  merchantPagination.value.page = 1
}

const onMerchantTableRequest = (props) => {
  merchantPagination.value.page = props.pagination.page
  merchantPagination.value.rowsPerPage = props.pagination.rowsPerPage
  merchantPagination.value.sortBy = props.pagination.sortBy
  merchantPagination.value.descending = props.pagination.descending
}

const approveMerchant = async (merchant) => {
  try {
    // ✅ Enhanced merchant validation and ID handling
    console.log('🔍 Attempting to approve merchant:', {
      merchant: merchant,
      business_name: merchant?.business_name,
      id: merchant?.id,
      tempId: merchant?.tempId,
      email: merchant?.email,
      hasOriginalId: merchant?._hasOriginalId
    })
    
    if (!merchant) {
      throw new Error('Merchant object is null or undefined')
    }
    
    // ✅ Try multiple ID sources
    let merchantId = merchant.id || merchant.tempId || merchant.merchant_id || merchant.user_id
    
    // ✅ If still no ID, try to use email as identifier
    if (!merchantId && merchant.email) {
      merchantId = merchant.email
      console.log('🔄 Using email as merchant identifier:', merchantId)
    }
    
    if (!merchantId) {
      throw new Error('Cannot identify merchant - no ID or email available')
    }
    
    approvingMerchant.value = merchantId
    
    console.log('🔄 Approving merchant:', merchant.business_name, 'with ID:', merchantId)
    
    // ✅ Use your actual API endpoint
    await api.post(`/api/admin/approve-merchant/${merchantId}`)

    // ✅ Update local data
    const index = allMerchants.value.findIndex(m => 
      m.id === merchantId || 
      m.tempId === merchantId || 
      m.email === merchant.email ||
      m.business_name === merchant.business_name
    )
    
    if (index !== -1) {
      allMerchants.value[index] = {
        ...allMerchants.value[index],
        status: 'approved',
        updated_at: new Date().toISOString()
      }
      console.log('✅ Local merchant data updated')
    }

    // Recalculate stats
    calculateMerchantStats()

    $q.notify({
      type: 'positive',
      message: `${merchant.business_name} approved successfully!`,
      position: 'top',
      icon: 'check_circle',
      timeout: 3000
    })

    // Close details dialog if open
    if (showMerchantDetails.value) {
      showMerchantDetails.value = false
    }

  } catch (err) {
    console.error('❌ Approve merchant error:', err)
    
    let errorMessage = 'Failed to approve merchant'
    
    if (err.message.includes('Cannot identify merchant')) {
      errorMessage = `Cannot approve "${merchant?.business_name || 'merchant'}" - missing identification data from backend`
    } else if (err.code === 'ERR_NETWORK') {
      errorMessage = 'Cannot connect to backend server. Please check if your Laravel server is running.'
    } else if (err.response?.status === 404) {
      errorMessage = 'Approval endpoint not found. Please check your backend API routes.'
    } else if (err.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again as admin.'
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    }
    
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000,
      actions: [
        { 
          label: 'Debug Info', 
          color: 'white', 
          handler: () => {
            console.log('🔍 Debug - Merchant data:', merchant)
            console.log('🔍 Debug - All merchants:', allMerchants.value)
          }
        }
      ]
    })
  } finally {
    approvingMerchant.value = null
  }
}

const rejectMerchant = async (merchant) => {
  try {
    const reason = await $q.dialog({
      title: 'Reject Merchant',
      message: `Are you sure you want to reject "${merchant.business_name}"?`,
      prompt: {
        model: '',
        type: 'text',
        label: 'Rejection Reason (optional)'
      },
      cancel: true,
      persistent: true
    })
    
    // ✅ Update local data for rejection
    const index = allMerchants.value.findIndex(m => 
      m.id === merchant.id || 
      m.tempId === merchant.tempId ||
      m.email === merchant.email ||
      m.business_name === merchant.business_name
    )
    
    if (index !== -1) {
      allMerchants.value[index] = {
        ...allMerchants.value[index],
        status: 'rejected',
        updated_at: new Date().toISOString(),
        rejection_reason: reason || 'No reason provided'
      }
    }
    
    calculateMerchantStats()
    
    $q.notify({
      type: 'warning',
      message: `${merchant.business_name} rejected`,
      position: 'top'
    })
    
    if (showMerchantDetails.value) {
      showMerchantDetails.value = false
    }
    
  } catch (error) {
    if (error && error !== '') {
      console.error('❌ Failed to reject merchant:', error)
    }
  }
}

const submitNewMerchant = async () => {
  try {
    submittingMerchant.value = true
    
    // Validate required fields
    if (!newMerchant.value.business_name || !newMerchant.value.email || 
        !newMerchant.value.bank_account_name || !newMerchant.value.bank_account_number) {
      throw new Error('Please fill in all required fields')
    }

    console.log('🔄 Adding new merchant...')

    // ✅ Use your business registration endpoint: POST /api/merchant/register
    const response = await api.post('/api/merchant/register', {
      business_name: newMerchant.value.business_name,
      email: newMerchant.value.email,
      bank_account_name: newMerchant.value.bank_account_name,
      bank_account_number: newMerchant.value.bank_account_number,
      phone: newMerchant.value.phone,
      category: newMerchant.value.category,
      description: newMerchant.value.description
    })

    console.log('✅ New merchant registered:', response.data)

    // ✅ Add to local data with guaranteed ID
    const newMerchantData = {
      id: response.data?.id || `new_${Date.now()}`,
      tempId: `new_${Date.now()}`,
      ...newMerchant.value,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      _hasOriginalId: !!(response.data?.id),
      ...response.data
    }
    
    allMerchants.value.unshift(newMerchantData)
    calculateMerchantStats()

    // Reset form
    newMerchant.value = {
      business_name: '',
      email: '',
      bank_account_name: '',
      bank_account_number: '',
      phone: '',
      category: null,
      description: ''
    }

    showAddMerchantDialog.value = false

    $q.notify({
      type: 'positive',
      message: 'Merchant added successfully!',
      position: 'top'
    })

  } catch (err) {
    console.error('❌ Add merchant error:', err)
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to add merchant',
      position: 'top'
    })
  } finally {
    submittingMerchant.value = false
  }
}

const viewMerchant = (merchant) => {
  console.log('👁️ Viewing merchant details:', merchant)
  selectedMerchant.value = merchant
  showMerchantDetails.value = true
}

const showMerchantMenu = (merchant) => {
  contextMenuMerchant.value = merchant
  showMerchantContextMenu.value = true
}









// Utility methods
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    verified: 'green',
    approved: 'green',
    rejected: 'red',
    suspended: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'pending',
    verified: 'verified',
    approved: 'check_circle',
    rejected: 'cancel',
    suspended: 'block'
  }
  return icons[status] || 'help'
}

const getFilterChipColor = (filter) => {
  const colors = {
    all: 'blue',
    pending: 'orange',
    verified: 'green',
    approved: 'green',
    suspended: 'grey'
  }
  return colors[filter] || 'blue'
}

const getDefaultLogo = (businessName) => {
  const initial = (businessName || 'M').charAt(0).toUpperCase()
  return `https://placehold.co/100x100/121018/bdf000?text=${initial}`
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatTimeAgo = (dateString) => {
  if (!dateString) return ''
  try {
    const now = new Date()
    const date = new Date(dateString)
    const diff = now - date
    
    if (diff < 60000) return 'Just now'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`
    return formatDate(dateString)
  } catch {
    return ''
  }
}



const navigateTo = (path) => {
  router.push(path)
}

const logout = async () => {
  try {
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

// ✅ Debug helper for development
const debugMerchantData = () => {
  console.log('🔍 Debug - All merchants:', allMerchants.value)
  console.log('🔍 Debug - Merchant IDs:', allMerchants.value.map(m => ({
    business_name: m.business_name,
    id: m.id,
    tempId: m.tempId,
    hasOriginalId: m._hasOriginalId,
    email: m.email
  })))
  console.log('🔍 Debug - Stats:', merchantStats.value)
}

// Lifecycle
onMounted(async () => {
  await loadDashboardData()
  
  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(debugMerchantData, 2000)
  }
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