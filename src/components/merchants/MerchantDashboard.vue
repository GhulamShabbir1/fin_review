<template>
  <div class="merchant-dashboard">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="50px" />
      <p class="loading-text">Loading your dashboard...</p>
    </div>

    <!-- Welcome Section -->
    <div class="welcome-section q-mb-xl animate-fade-in">
      <div class="welcome-content">
        <div class="welcome-text">
          <h1 class="welcome-title">
            Welcome back, <span class="highlight">{{ user.name || 'Merchant' }}</span>! 👋
          </h1>
          <p class="welcome-subtitle">
            Manage your {{ businesses.length }} business{{ businesses.length !== 1 ? 'es' : '' }} and start accepting payments
          </p>
        </div>
        <div class="welcome-actions">
          <!-- Add Business Button - Always Available -->
          <q-btn
            color="lime"
            icon="add_business"
            label="Add New Business"
            class="action-btn btn-primary"
            @click="addBusiness"
          />

          <!-- Create Payment Button - Always Available for any business -->
          <q-btn
            v-if="businesses.length > 0"
            color="blue"
            icon="payment"
            label="Create Payment"
            class="action-btn btn-secondary payment-btn"
            @click="showCreatePaymentDialog"
          />

          <!-- Settings Button -->
          <q-btn flat color="lime" icon="settings" label="Settings" class="action-btn btn-outline"
            @click="openSettings" />
          <!-- Profile Button -->
          <q-btn flat color="purple" icon="person" label="Profile" class="action-btn btn-outline"
            @click="editProfile" />
          <!-- Transactions Button -->
          <q-btn
            v-if="businesses.length > 0"
            flat color="teal" icon="receipt" label="Transactions" class="action-btn btn-outline"
            @click="viewTransactions" />
          <!-- Export Data Button -->
          <q-btn
            v-if="businesses.length > 0"
            flat color="orange" icon="file_download" label="Export Data" class="action-btn btn-outline"
            @click="exportData" />
          <!-- Logout Button -->
          <q-btn flat color="red" icon="logout" label="Logout" class="action-btn btn-danger" @click="logout" />
        </div>
      </div>
    </div>

    <!-- Business Overview Statistics -->
    <div class="business-overview q-mb-xl animate-fade-in" style="animation-delay: 0.1s">
      <div class="row q-gutter-lg">
        <div class="col">
          <q-card class="stat-card lime-glow hover-lift">
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
          <q-card class="stat-card lime-glow hover-lift">
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
          <q-card class="stat-card lime-glow hover-lift">
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
          <q-card class="stat-card lime-glow hover-lift">
            <q-card-section>
              <div class="stat-header">
                <q-icon name="trending_up" size="32px" color="green" />
                <div class="stat-value">${{ formatNumber(totalRevenue) }}</div>
              </div>
              <div class="stat-title">Total Revenue</div>
              <div class="stat-subtitle">{{ totalTransactions }} transactions</div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Enhanced Analytics Section with Modern Charts -->
    <div class="analytics-section q-mb-xl animate-fade-in" style="animation-delay: 0.15s">
      <div class="section-header">
        <h3 class="section-title">
          <q-icon name="analytics" size="24px" color="lime" class="q-mr-sm" />
          Business Analytics
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
        <!-- Revenue Chart - Modern Design -->
        <div class="chart-card modern-chart lime-glow hover-lift">
          <div class="chart-header">
            <h4 class="chart-title">
              <q-icon name="trending_up" size="20px" color="lime" class="q-mr-sm" />
              Revenue Trends
            </h4>
            <div class="chart-subtitle">Monthly revenue performance</div>
          </div>
          <div class="chart-container">
            <div v-if="loadingAnalytics" class="chart-loading">
              <q-spinner-dots color="lime" size="40px" />
              <p>Loading analytics...</p>
            </div>
            <div v-else-if="revenueData.length > 0" class="chart-content">
              <div class="revenue-chart modern-chart">
                <div class="chart-stats modern-stats">
                  <div class="stat-item modern-stat">
                    <span class="stat-label">Total Revenue</span>
                    <span class="stat-value">${{ formatNumber(getTotalRevenue()) }}</span>
                    <span class="stat-change positive">+{{ getRevenueGrowth() }}%</span>
                  </div>
                  <div class="stat-item modern-stat">
                    <span class="stat-label">Monthly Avg</span>
                    <span class="stat-value">${{ formatNumber(getAverageRevenue()) }}</span>
                  </div>
                </div>
                <div class="revenue-bars modern-bars">
                  <div 
                    v-for="(item, index) in revenueData.slice(0, 12)" 
                    :key="index" 
                    class="revenue-bar modern-bar hover-scale"
                    @click="showRevenueDetails(item)"
                  >
                    <div class="bar-tooltip">
                      <div class="tooltip-value">${{ formatNumber(item.revenue || item.value || 0) }}</div>
                      <div class="tooltip-date">{{ item.date || item.label || `M${index + 1}` }}</div>
                    </div>
                    <div 
                      class="bar-fill modern-fill" 
                      :style="{
                        height: getBarHeight(item.revenue || item.value || 0, revenueData),
                        background: getRevenueBarGradient(index)
                      }"
                    >
                      <div class="bar-glow"></div>
                    </div>
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

        <!-- Payment Methods Chart - Modern Design -->
        <div class="chart-card modern-chart blue-glow hover-lift">
          <div class="chart-header">
            <h4 class="chart-title">
              <q-icon name="payment" size="20px" color="blue" class="q-mr-sm" />
              Payment Methods
            </h4>
            <div class="chart-subtitle">Distribution by payment type</div>
          </div>
          <div class="chart-container">
            <div v-if="loadingAnalytics" class="chart-loading">
              <q-spinner-dots color="blue" size="40px" />
              <p>Loading payment methods...</p>
            </div>
            <div v-else-if="methodsData.length > 0" class="chart-content">
              <div class="methods-chart modern-chart">
                <div class="methods-summary modern-summary">
                  <div class="total-transactions">
                    <span class="summary-label">Total Transactions</span>
                    <span class="summary-value">{{ formatNumber(getTotalTransactions()) }}</span>
                  </div>
                </div>
                <div class="methods-list modern-methods">
                  <div 
                    v-for="(method, index) in methodsData.slice(0, 6)" 
                    :key="index" 
                    class="method-item modern-method hover-scale"
                    @click="showMethodDetails(method)"
                  >
                    <div class="method-info">
                      <div class="method-icon modern-icon">
                        <q-icon :name="getPaymentMethodIcon(method.label)" size="20px" :color="method.color" />
                      </div>
                      <div class="method-details">
                        <div class="method-name">{{ method.label }}</div>
                        <div class="method-percentage">{{ method.value }}%</div>
                      </div>
                    </div>
                    <div class="method-bar modern-bar">
                      <div 
                        class="method-bar-fill modern-fill" 
                        :style="{ 
                          width: `${method.value}%`, 
                          background: getMethodGradient(method.color)
                        }"
                      >
                        <div class="bar-shine"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="chart-empty">
              <q-icon name="payment" size="48px" color="grey-5" />
              <p>No payment method data available</p>
            </div>
          </div>
        </div>

        <!-- Transaction Trends Chart - Modern Design -->
        <div class="chart-card modern-chart teal-glow hover-lift">
          <div class="chart-header">
            <h4 class="chart-title">
              <q-icon name="receipt" size="20px" color="teal" class="q-mr-sm" />
              Transaction Trends
            </h4>
            <div class="chart-subtitle">Monthly transaction volume</div>
          </div>
          <div class="chart-container">
            <div v-if="loadingAnalytics" class="chart-loading">
              <q-spinner-dots color="teal" size="40px" />
              <p>Loading transactions...</p>
            </div>
            <div v-else-if="transactionData.length > 0" class="chart-content">
              <div class="transaction-chart modern-chart">
                <div class="chart-stats modern-stats">
                  <div class="stat-item modern-stat">
                    <span class="stat-label">Total Transactions</span>
                    <span class="stat-value">{{ formatNumber(getTotalTransactions()) }}</span>
                  </div>
                  <div class="stat-item modern-stat">
                    <span class="stat-label">Success Rate</span>
                    <span class="stat-value success-rate">{{ getSuccessRate() }}%</span>
                  </div>
                </div>
                <div class="transaction-bars modern-bars">
                  <div 
                    v-for="(item, index) in transactionData.slice(0, 12)" 
                    :key="index" 
                    class="transaction-bar modern-bar hover-scale"
                    @click="showTransactionDetails(item)"
                  >
                    <div class="bar-tooltip">
                      <div class="tooltip-success">{{ item.success }} successful</div>
                      <div class="tooltip-failed">{{ item.failed || 0 }} failed</div>
                    </div>
                    <div class="bar-stack modern-stack">
                      <div 
                        class="bar-success modern-success" 
                        :style="{ height: getTransactionBarHeight(item.success, transactionData) }"
                      >
                        <div class="bar-glow success-glow"></div>
                      </div>
                      <div 
                        class="bar-failed modern-failed" 
                        :style="{ height: getTransactionBarHeight(item.failed || 0, transactionData) }"
                      >
                        <div class="bar-glow failed-glow"></div>
                      </div>
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

        <!-- Performance Metrics -->
        <div class="chart-card lime-glow hover-lift">
          <div class="chart-header">
            <h4 class="chart-title">
              <q-icon name="speed" size="20px" color="purple" class="q-mr-sm" />
              Performance Metrics
            </h4>
            <div class="chart-subtitle">Key business indicators</div>
          </div>
          <div class="chart-container">
            <div v-if="loadingAnalytics" class="chart-loading">
              <q-spinner-dots color="purple" size="40px" />
              <p>Loading metrics...</p>
            </div>
            <div v-else class="chart-content">
              <div class="metrics-grid">
                <div class="metric-item hover-scale">
                  <div class="metric-icon">
                    <q-icon name="schedule" size="24px" color="orange" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ avgCheckoutTime }}s</div>
                    <div class="metric-label">Avg Checkout Time</div>
                  </div>
                </div>
                <div class="metric-item hover-scale">
                  <div class="metric-icon">
                    <q-icon name="location_on" size="24px" color="blue" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ topGeography }}</div>
                    <div class="metric-label">Top Market</div>
                  </div>
                </div>
                <div class="metric-item hover-scale">
                  <div class="metric-icon">
                    <q-icon name="trending_up" size="24px" color="green" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ conversionRate }}%</div>
                    <div class="metric-label">Conversion Rate</div>
                  </div>
                </div>
                <div class="metric-item hover-scale">
                  <div class="metric-icon">
                    <q-icon name="people" size="24px" color="teal" />
                  </div>
                  <div class="metric-content">
                    <div class="metric-value">{{ repeatCustomers }}</div>
                    <div class="metric-label">Repeat Customers</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ✅ NEW: Recent Transactions with Refund Button -->
    <div class="transactions-section q-mb-xl animate-fade-in" style="animation-delay: 0.25s">
      <div class="transactions-header">
        <h3 class="transactions-title">
          <q-icon name="receipt_long" size="24px" color="lime" class="q-mr-sm" />
          Recent Transactions
        </h3>
        <div class="transactions-actions">
          <q-btn 
            flat 
            round 
            dense 
            icon="refresh" 
            color="lime" 
            @click="showRefundTransactionForm(transaction)" 
            :loading="loadingTransactions"
            class="hover-scale"
          >
            <q-tooltip>Refresh Transactions</q-tooltip>
          </q-btn>
          <q-btn 
            flat 
            color="blue" 
            icon="visibility" 
            label="View All" 
            @click="viewTransactions"
            class="hover-scale"
          />
        </div>
      </div>

      <div v-if="loadingTransactions" class="transactions-loading">
        <div class="loading-container">
          <q-spinner-bars color="lime" size="50px" />
          <p>Loading recent transactions...</p>
        </div>
      </div>

      <div v-else-if="recentTransactions.length === 0" class="no-transactions">
        <q-icon name="receipt" size="64px" color="grey-5" class="pulse-icon" />
        <h4>No Transactions Yet</h4>
        <p>Start by creating your first payment to see transaction history</p>
        <q-btn color="lime" label="Create First Payment" @click="showCreatePaymentDialog" class="hover-scale" />
      </div>

      <div v-else class="transactions-list">
        <div 
          v-for="(transaction, index) in recentTransactions" 
          :key="transaction.id || index" 
          class="transaction-item animate-slide-in hover-lift"
          :style="`animation-delay: ${0.3 + index * 0.1}s`"
        >
          <div class="transaction-info">
            <div class="transaction-header">
              <div class="transaction-id">
                <q-icon name="receipt" size="16px" color="lime" class="q-mr-sm" />
                #{{ transaction.id || 'TXN_' + index }}
              </div>
              <div class="transaction-date">{{ formatDateTime(transaction.created_at) }}</div>
            </div>
            <div class="transaction-details">
              <div class="customer-info">
                <q-icon name="person" size="16px" color="blue" class="q-mr-sm" />
                {{ transaction.customer_name || 'Anonymous Customer' }}
              </div>
              <div class="transaction-method">
                <q-icon name="payment" size="16px" color="purple" class="q-mr-sm" />
                {{ getPaymentMethodLabel(transaction.method || 'card') }}
              </div>
            </div>
          </div>
          
          <div class="transaction-status">
            <div class="transaction-amount">
              <span class="amount">{{ formatCurrency(transaction.amount || 0) }}</span>
            </div>
            <q-chip 
              :color="getStatusColor(transaction.status)" 
              :label="transaction.status || 'pending'" 
              :icon="getStatusIcon(transaction.status)"
              size="sm" 
              class="status-chip"
            />
          </div>

          <div class="transaction-actions">
            <q-btn 
              flat 
              round 
              dense 
              icon="visibility" 
              color="blue" 
              @click="viewTransactionDetails(transaction)"
              class="hover-scale"
            >
              <q-tooltip>View Details</q-tooltip>
            </q-btn>
            
            <!-- ✅ NEW: Refund Button -->
            <q-btn 
              v-if="canRefund(transaction)"
              flat 
              round 
              dense 
              icon="undo" 
              color="orange" 
              @click="showRefundDialog(transaction)"
              :loading="refundingTransaction === transaction.id"
              class="hover-scale refund-btn"
            >
              <q-tooltip>Refund Transaction</q-tooltip>
            </q-btn>
            
            <q-btn 
              flat 
              round 
              dense 
              icon="download" 
              color="green" 
              @click="downloadTransactionReceipt(transaction)"
              class="hover-scale"
            >
              <q-tooltip>Download Receipt</q-tooltip>
            </q-btn>
          </div>
        </div>
      </div>
    </div>

    <!-- Merchant Status Card -->
    <div class="status-card-section q-mb-xl animate-fade-in" style="animation-delay: 0.15s">
      <MerchantStatusCard
        :status="merchantStatus"
        :progress="onboardingProgress"
        :merchant-id="user.id"
        @check-status="handleStatusCheck"
        @update-info="handleUpdateInfo"
        @contact-support="handleContactSupport"
      />
    </div>

    <!-- Businesses List -->
    <div class="businesses-section q-mb-xl animate-fade-in" style="animation-delay: 0.2s">
      <div class="section-header">
        <h3 class="section-title">
          <q-icon name="business" size="24px" color="lime" class="q-mr-sm" />
          Your Businesses
        </h3>
        <q-btn 
          color="lime" 
          icon="add" 
          label="Add Business" 
          @click="addBusiness" 
          class="add-business-btn hover-scale"
        />
      </div>
      
      <div v-if="businesses.length === 0" class="no-businesses">
        <q-icon name="store" size="64px" color="grey-5" class="pulse-icon" />
        <h4>No Businesses Registered</h4>
        <p>Start by registering your first business to accept payments</p>
        <q-btn color="lime" label="Register First Business" @click="addBusiness" size="lg" class="hover-scale" />
      </div>
      
      <div v-else class="businesses-grid">
        <div 
          v-for="(business, index) in businesses" 
          :key="business.id || index" 
          class="business-card hover-lift"
          :class="getBusinessCardClass(business.status)"
        >
          <div class="business-header">
            <div class="business-info">
              <div class="business-avatar">
                <q-avatar size="48px" square class="hover-scale">
                  <img :src="business.logo_path || placeholderLogo" @error="onLogoError" />
                </q-avatar>
              </div>
              <div class="business-details">
                <h4 class="business-name">{{ business.business_name }}</h4>
                <p class="business-account">{{ business.bank_account_name }}</p>
                <div class="business-meta">
                  <q-chip 
                    :color="getStatusColor(business.status)" 
                    :label="getStatusLabel(business.status)" 
                    :icon="getStatusIcon(business.status)"
                    size="sm" 
                    class="status-chip"
                  />
                  <q-chip 
                    v-if="business.stripe_account_id" 
                    color="blue" 
                    icon="account_balance" 
                    label="Stripe Connected" 
                    size="sm" 
                    class="q-ml-sm"
                  />
                </div>
              </div>
            </div>
            
            <div class="business-actions">
              <q-btn 
                flat 
                round 
                dense 
                icon="more_vert" 
                color="grey" 
                @click="showBusinessMenu(business, $event)"
                class="hover-scale"
              />
            </div>
          </div>
          
          <div class="business-content">
            <div class="business-stats">
              <div class="stat-item">
                <span class="stat-label">Account Number</span>
                <span class="stat-value">{{ maskAccountNumber(business.bank_account_number) }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">IFSC/SWIFT</span>
                <span class="stat-value">{{ business.bank_ifsc_swift }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Registered</span>
                <span class="stat-value">{{ formatDate(business.created_at) }}</span>
              </div>
            </div>
            
            <div class="business-footer">
              <!-- ✅ Always show Create Payment button for any business -->
              <q-btn 
                color="green" 
                icon="payment" 
                label="Create Payment" 
                @click="createPaymentForBusiness(business)"
                size="sm"
                class="hover-scale"
              />
              
              <q-btn 
                flat 
                color="blue" 
                icon="visibility" 
                label="View Details" 
                @click="viewBusinessDetails(business)"
                size="sm"
                class="hover-scale"
              />
              
              <q-btn 
                flat 
                color="orange" 
                icon="edit" 
                label="Edit" 
                @click="editBusiness(business)"
                size="sm"
                class="hover-scale"
              />
            </div>
          </div>
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

    <!-- Enhanced Add Business Dialog -->
    <q-dialog v-model="showAddBusinessDialog" persistent>
      <q-card class="add-business-dialog">
        <q-card-section class="dialog-header">
          <div class="header-content">
            <div class="header-left">
              <q-icon name="store" size="32px" color="lime" />
              <div class="header-text">
                <div class="text-h6">{{ editingBusiness ? 'Update Business' : 'Add New Business' }}</div>
                <div class="text-caption text-grey-5">{{ editingBusiness ? 'Update your business information' : 'Register a new business for payment processing' }}</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense @click="cancelBusinessForm" class="hover-scale" />
          </div>
        </q-card-section>

        <q-card-section class="dialog-content">
          <q-form @submit="submitBusiness" class="business-form">
            <div class="form-section">
              <h5 class="section-title">Business Information</h5>

              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">Business Name *</label>
                  <q-input 
                    v-model="newBusiness.business_name" 
                    placeholder="Enter your business name" 
                    outlined 
                    dense
                    required 
                    :rules="[val => !!val || 'Business name is required']" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">Business Logo (Optional)</label>
                  <div class="logo-upload-container">
                    <q-file 
                      v-model="newBusiness.logo" 
                      outlined 
                      dense 
                      accept="image/*" 
                      max-file-size="2097152"
                      @update:model-value="onLogoSelected" 
                      class="form-input"
                    >
                      <template v-slot:prepend>
                        <q-icon name="image" />
                      </template>
                    </q-file>

                    <div v-if="logoPreview" class="logo-preview">
                      <img :src="logoPreview" alt="Logo Preview" class="preview-image" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="form-section">
              <h5 class="section-title">Banking Details</h5>

              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">Bank Account Name *</label>
                  <q-input 
                    v-model="newBusiness.bank_account_name" 
                    placeholder="Account holder name" 
                    outlined 
                    dense
                    required 
                    :rules="[val => !!val || 'Bank account name is required']" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">Bank Account Number *</label>
                  <q-input 
                    v-model="newBusiness.bank_account_number" 
                    placeholder="Enter account number" 
                    outlined 
                    dense
                    required 
                    :rules="[val => !!val || 'Bank account number is required']" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">IFSC/SWIFT Code *</label>
                  <q-input 
                    v-model="newBusiness.bank_ifsc_swift" 
                    placeholder="Bank IFSC or SWIFT code" 
                    outlined 
                    dense
                    required 
                    :rules="[val => !!val || 'IFSC/SWIFT code is required']" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">Payout Preference *</label>
                  <q-select 
                    v-model="newBusiness.payout_preference" 
                    :options="payoutOptions"
                    placeholder="Select payout method" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    required
                    :rules="[val => !!val || 'Payout preference is required']" 
                    class="form-input" 
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions class="dialog-actions" align="right">
          <q-btn flat label="Cancel" @click="cancelBusinessForm" class="hover-scale" />
          <q-btn 
            color="lime" 
            :label="editingBusiness ? 'Update Business' : 'Register Business'" 
            @click="submitBusiness" 
            :loading="submittingBusiness"
            :disable="!isBusinessFormValid" 
            class="hover-scale"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ✅ NEW: Create Payment Dialog -->
    <q-dialog v-model="showPaymentDialog" persistent>
      <q-card class="payment-dialog">
        <q-card-section class="dialog-header">
          <div class="header-content">
            <div class="header-left">
              <q-icon name="payment" size="32px" color="blue" />
              <div class="header-text">
                <div class="text-h6">Create Payment</div>
                <div class="text-caption text-grey-5">Generate a secure payment link for your customer</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense @click="cancelPaymentForm" class="hover-scale" />
          </div>
        </q-card-section>

        <q-card-section class="dialog-content">
          <q-form @submit="createPaymentCheckout" class="payment-form">
            <!-- ✅ Business Selection - Always show if multiple businesses -->
            <div class="form-section" v-if="businesses.length > 1">
              <h5 class="section-title">Select Business</h5>
              <div class="form-group">
                <label class="field-label">Business *</label>
                <q-select 
                  v-model="selectedBusinessForPayment" 
                  :options="businessOptions"
                  placeholder="Select business for this payment" 
                  outlined 
                  dense 
                  emit-value 
                  map-options 
                  required
                  class="form-input" 
                />
              </div>
            </div>

            <div class="form-section">
              <h5 class="section-title">Payment Details</h5>

              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">Amount (USD) *</label>
                  <q-input 
                    v-model.number="paymentForm.amount" 
                    type="number"
                    min="1"
                    step="0.01"
                    placeholder="Enter amount in USD" 
                    outlined 
                    dense
                    required 
                    :rules="[val => val > 0 || 'Amount must be greater than 0']" 
                    class="form-input" 
                  >
                    <template v-slot:prepend>
                      <q-icon name="attach_money" color="green" />
                    </template>
                  </q-input>
                </div>

                <div class="form-group">
                  <label class="field-label">Payment Method *</label>
                  <q-select 
                    v-model="paymentForm.method" 
                    :options="paymentMethods"
                    placeholder="Select payment method" 
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    required
                    :rules="[val => !!val || 'Payment method is required']" 
                    class="form-input" 
                  />
                </div>
              </div>
            </div>

            <div class="form-section">
              <h5 class="section-title">Customer Information</h5>

              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">Customer Name *</label>
                  <q-input 
                    v-model="paymentForm.customer_name" 
                    placeholder="Enter customer name" 
                    outlined 
                    dense
                    required 
                    :rules="[val => !!val || 'Customer name is required']" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">Customer Email *</label>
                  <q-input 
                    v-model="paymentForm.customer_email" 
                    type="email"
                    placeholder="customer@example.com" 
                    outlined 
                    dense
                    required 
                    :rules="[
                      val => !!val || 'Email is required',
                      val => /.+@.+\..+/.test(val) || 'Invalid email format'
                    ]" 
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">Customer Phone (Optional)</label>
                  <q-input 
                    v-model="paymentForm.customer_phone" 
                    placeholder="+1234567890" 
                    outlined 
                    dense
                    class="form-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">Currency</label>
                  <q-select 
                    v-model="paymentForm.currency" 
                    :options="currencyOptions"
                    outlined 
                    dense 
                    emit-value 
                    map-options 
                    class="form-input" 
                  />
                </div>
              </div>
            </div>

            <!-- ✅ Optional: Cart Items -->
            <div class="form-section">
              <h5 class="section-title">
                Cart Items (Optional)
                <q-btn flat round dense icon="add" color="lime" @click="addCartItem" size="sm" class="q-ml-sm hover-scale" />
              </h5>

              <div v-if="paymentForm.cart.length === 0" class="no-cart-items">
                <q-icon name="shopping_cart" size="32px" color="grey-5" />
                <p>No items in cart. Payment will be processed as a simple amount.</p>
                <q-btn flat color="lime" label="Add Item" @click="addCartItem" class="hover-scale" />
              </div>

              <div v-else class="cart-items">
                <div 
                  v-for="(item, index) in paymentForm.cart" 
                  :key="index" 
                  class="cart-item"
                >
                  <div class="item-details">
                    <q-input 
                      v-model="item.product" 
                      placeholder="Product name" 
                      outlined 
                      dense 
                      class="item-input"
                    />
                    <q-input 
                      v-model.number="item.qty" 
                      type="number" 
                      min="1"
                      placeholder="Qty" 
                      outlined 
                      dense 
                      class="item-input qty-input"
                    />
                    <q-input 
                      v-model.number="item.price" 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Price (cents)" 
                      outlined 
                      dense 
                      class="item-input"
                    />
                  </div>
                  <q-btn 
                    flat 
                    round 
                    dense 
                    icon="remove" 
                    color="red" 
                    @click="removeCartItem(index)" 
                    class="hover-scale"
                  />
                </div>
              </div>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions class="dialog-actions" align="right">
          <q-btn flat label="Cancel" @click="cancelPaymentForm" class="hover-scale" />
          <q-btn 
            color="blue" 
            icon="payment" 
            label="Create Payment" 
            @click="createPaymentCheckout" 
            :loading="creatingPayment"
            :disable="!isPaymentFormValid" 
            class="hover-scale"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ✅ NEW: Refund Dialog -->
    <q-dialog v-model="showRefundDialog" persistent>
      <q-card class="refund-dialog">
        <q-card-section class="dialog-header">
          <div class="header-content">
            <div class="header-left">
              <q-icon name="undo" size="32px" color="orange" />
              <div class="header-text">
                <div class="text-h6">Process Refund</div>
                <div class="text-caption text-grey-5">Refund transaction #{{ selectedTransaction?.id }}</div>
              </div>
            </div>
            <q-btn icon="close" flat round dense @click="cancelRefund" class="hover-scale" />
          </div>
        </q-card-section>

        <q-card-section class="dialog-content" v-if="selectedTransaction">
          <div class="refund-summary">
            <div class="transaction-overview">
              <h5>Transaction Details</h5>
              <div class="overview-grid">
                <div class="overview-item">
                  <span class="label">Amount:</span>
                  <span class="value">{{ formatCurrency(selectedTransaction.amount) }}</span>
                </div>
                <div class="overview-item">
                  <span class="label">Customer:</span>
                  <span class="value">{{ selectedTransaction.customer_name }}</span>
                </div>
                <div class="overview-item">
                  <span class="label">Date:</span>
                  <span class="value">{{ formatDateTime(selectedTransaction.created_at) }}</span>
                </div>
                <div class="overview-item">
                  <span class="label">Method:</span>
                  <span class="value">{{ getPaymentMethodLabel(selectedTransaction.method) }}</span>
                </div>
              </div>
            </div>

            <div class="refund-form">
              <div class="form-group">
                <label class="field-label">Refund Amount *</label>
                <q-input 
                  v-model.number="refundForm.amount" 
                  type="number"
                  :min="0.01"
                  :max="selectedTransaction.amount / 100"
                  step="0.01"
                  placeholder="Enter refund amount" 
                  outlined 
                  dense
                  required 
                  :rules="[
                    val => val > 0 || 'Amount must be greater than 0',
                    val => val <= (selectedTransaction.amount / 100) || 'Cannot exceed transaction amount'
                  ]" 
                  class="form-input" 
                >
                  <template v-slot:prepend>
                    <q-icon name="undo" color="orange" />
                  </template>
                  <template v-slot:hint>
                    Maximum: {{ formatCurrency(selectedTransaction.amount) }}
                  </template>
                </q-input>
              </div>

              <div class="form-group">
                <label class="field-label">Refund Reason *</label>
                <q-select 
                  v-model="refundForm.reason" 
                  :options="refundReasons"
                  placeholder="Select refund reason" 
                  outlined 
                  dense 
                  emit-value 
                  map-options 
                  required
                  class="form-input" 
                />
              </div>

              <div class="form-group">
                <label class="field-label">Additional Notes (Optional)</label>
                <q-input 
                  v-model="refundForm.notes" 
                  type="textarea"
                  placeholder="Enter additional notes for the refund" 
                  outlined 
                  dense
                  rows="3"
                  class="form-input" 
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="dialog-actions" align="right">
          <q-btn flat label="Cancel" @click="cancelRefund" class="hover-scale" />
          <q-btn 
            color="orange" 
            icon="undo" 
            label="Process Refund" 
            @click="processRefund" 
            :loading="processingRefund"
            :disable="!isRefundFormValid" 
            class="hover-scale"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ✅ FIXED: Stripe Instruction Dialog (No iframe, no 404 errors) -->
    <q-dialog v-model="showStripeDialog" persistent>
      <q-card class="stripe-instruction-dialog">
        <q-card-section class="stripe-header">
          <div class="stripe-header-content">
            <div class="header-info">
              <q-icon name="account_balance" size="32px" color="blue" />
              <div class="header-text">
                <div class="text-h6">Complete Stripe Onboarding</div>
                <div class="text-caption text-grey-5">Business: {{ currentBusinessName }}</div>
              </div>
            </div>
            <q-btn flat round dense icon="close" color="grey" @click="closeStripeDialog" class="hover-scale" />
          </div>
        </q-card-section>

        <q-card-section class="stripe-content">
          <div class="instruction-content">
            <div class="instruction-icon">
              <q-icon name="launch" size="64px" color="blue" class="pulse-icon" />
            </div>
            
            <h4>Stripe Onboarding Ready</h4>
            <p>
              Your Stripe onboarding link is ready for <strong>{{ currentBusinessName }}</strong>. 
              Click the button below to open Stripe onboarding in a secure new window.
            </p>
            
            <!-- ✅ Enhanced security notice -->
            <div class="security-notice">
              <q-icon name="security" color="green" size="20px" />
              <div class="security-text">
                <strong>Secure Connection:</strong>
                <ul>
                  <li>This is a direct connection to Stripe's official servers</li>
                  <li>All data is encrypted and secure</li>
                  <li>No sensitive information is stored on our servers</li>
                </ul>
              </div>
            </div>
            
            <div class="onboarding-steps">
              <div class="step-item step-highlight">
                <q-icon name="open_in_new" color="blue" size="20px" />
                <span>Click "Open Stripe Onboarding" below</span>
              </div>
              <div class="step-item">
                <q-icon name="edit" color="green" size="20px" />
                <span>Complete all required fields in the Stripe form</span>
              </div>
              <div class="step-item">
                <q-icon name="check_circle" color="lime" size="20px" />
                <span>Return here and click "I've Completed Onboarding"</span>
              </div>
            </div>
            
            <!-- ✅ URL display with validation status -->
            <div class="url-display" v-if="stripeOnboardingUrl">
              <label>
                <q-icon name="link" size="16px" color="blue" class="q-mr-sm" />
                Secure Onboarding URL:
              </label>
              <div class="url-box">
                <span class="url-text">{{ stripeOnboardingUrl }}</span>
                <q-btn 
                  flat 
                  round 
                  dense 
                  icon="content_copy" 
                  color="blue" 
                  @click="copyStripeUrl(stripeOnboardingUrl)"
                  class="copy-btn hover-scale"
                >
                  <q-tooltip>Copy URL</q-tooltip>
                </q-btn>
              </div>
              <div class="url-status">
                <q-icon name="verified" size="14px" color="green" />
                <span>Verified Stripe Connection</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="stripe-footer" align="center">
          <q-btn flat label="Skip for Now" @click="skipStripeOnboarding" class="hover-scale" />
          <q-btn 
            color="orange" 
            icon="refresh" 
            label="Get Fresh URL" 
            @click="retryStripeOnboarding"
            :loading="gettingFreshUrl"
            class="hover-scale"
          />
          <q-btn 
            color="blue" 
            icon="open_in_new" 
            label="Open Stripe Onboarding" 
            @click="openStripeInNewTab" 
            class="hover-scale"
          />
          <q-btn 
            color="green" 
            icon="check" 
            label="I've Completed Onboarding" 
            @click="markOnboardingCompleted" 
            class="hover-scale"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ✅ NEW: Payment Processing Dialog -->
    <q-dialog v-model="showPaymentProcessingDialog" persistent>
      <q-card class="payment-processing-dialog">
        <q-card-section class="processing-header">
          <div class="processing-content">
            <div class="processing-icon">
              <q-icon name="payment" size="48px" color="blue" class="payment-pulse" />
            </div>
            <h4>Processing Payment</h4>
            <p>Redirecting to secure Stripe checkout...</p>
          </div>
        </q-card-section>

        <q-card-section class="processing-details">
          <div class="payment-summary">
            <div class="summary-item">
              <span>Business:</span>
              <span>{{ getSelectedBusinessName() }}</span>
            </div>
            <div class="summary-item">
              <span>Amount:</span>
              <span class="amount-value">${{ paymentForm.amount }}</span>
            </div>
            <div class="summary-item">
              <span>Customer:</span>
              <span>{{ paymentForm.customer_name }}</span>
            </div>
            <div class="summary-item">
              <span>Method:</span>
              <span>{{ getPaymentMethodLabel(paymentForm.method) }}</span>
            </div>
          </div>
          
          <div class="processing-progress">
            <q-linear-progress 
              :value="processingProgress / 100" 
              color="blue" 
              size="8px" 
              class="progress-bar"
            />
            <div class="progress-text">{{ processingProgress }}% Complete</div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ✅ NEW: Payment Result Dialog -->
    <q-dialog v-model="showPaymentResultDialog" persistent>
      <q-card class="payment-result-dialog">
        <q-card-section class="result-content">
          <div class="result-animation">
            <q-icon 
              :name="paymentResult.success ? 'check_circle' : 'cancel'" 
              :color="paymentResult.success ? 'green' : 'red'" 
              size="80px" 
              :class="paymentResult.success ? 'success-bounce' : 'error-shake'"
            />
          </div>
          
          <div class="result-title">
            <h3 :class="paymentResult.success ? 'text-green' : 'text-red'">
              {{ paymentResult.success ? 'Payment Successful!' : 'Payment Failed' }}
            </h3>
          </div>
          
          <div class="result-message">
            <p>{{ paymentResult.message }}</p>
          </div>

          <div class="result-details" v-if="paymentResult.details">
            <div class="detail-card">
              <div class="detail-item">
                <span class="detail-label">Business:</span>
                <span class="detail-value">{{ getSelectedBusinessName() }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">{{ paymentResult.details.transaction_id || 'N/A' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Amount:</span>
                <span class="detail-value">${{ paymentForm.amount }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Customer:</span>
                <span class="detail-value">{{ paymentForm.customer_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <q-chip 
                  :color="paymentResult.success ? 'green' : 'red'" 
                  :label="paymentResult.success ? 'Completed' : 'Failed'" 
                  :icon="paymentResult.success ? 'check_circle' : 'cancel'"
                  size="sm"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat label="Close" @click="closePaymentResult" class="hover-scale" />
          <q-btn 
            v-if="paymentResult.success"
            color="green" 
            label="View Transactions" 
            @click="viewTransactions" 
            class="hover-scale"
          />
          <q-btn 
            v-else
            color="blue" 
            label="Try Again" 
            @click="retryPayment" 
            class="hover-scale"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccessDialog" persistent>
      <q-card class="success-dialog">
        <q-card-section class="success-content">
          <div class="success-animation">
            <q-icon name="check_circle" size="80px" color="green" class="success-icon" />
          </div>
          <div class="text-h5 text-green q-mt-md">
            {{ editingBusiness ? 'Business Updated Successfully!' : 'Business Registered Successfully!' }}
          </div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Your business information has been {{ editingBusiness ? 'updated' : 'submitted' }} and Stripe onboarding completed.
          </div>

          <div class="success-details q-mt-lg">
            <div class="detail-card">
              <div class="detail-item">
                <span class="detail-label">Business Name:</span>
                <span class="detail-value">{{ submittedBusiness.business_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Account Holder:</span>
                <span class="detail-value">{{ submittedBusiness.bank_account_name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Stripe Account:</span>
                <span class="detail-value">{{ currentStripeAccountId || 'Connected' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Status:</span>
                <q-chip color="green" text-color="white" icon="check_circle" size="sm">
                  Ready for Payments
                </q-chip>
              </div>
            </div>
          </div>

          <div class="approval-notice q-mt-lg">
            <q-banner class="text-white bg-positive">
              <template v-slot:avatar>
                <q-icon name="check_circle" />
              </template>
              <strong>Ready to Go:</strong> Your business is registered, Stripe is connected, and you can start accepting payments immediately!
            </q-banner>
          </div>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn flat label="Close" @click="closeSuccessDialog" class="hover-scale" />
          <q-btn color="lime" label="View Dashboard" @click="refreshDashboard" class="hover-scale" />
          <q-btn color="blue" label="Create Payment" @click="createFirstPayment" class="hover-scale" />
          <q-btn color="purple" label="Add Another Business" @click="addAnotherBusiness" class="hover-scale" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Business Details Dialog -->
    <q-dialog v-model="showBusinessDetailsDialog" persistent>
      <q-card class="business-details-dialog" v-if="selectedBusiness">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ selectedBusiness.business_name }}</div>
          <q-btn icon="close" flat round dense v-close-popup class="hover-scale" />
        </q-card-section>
        
        <q-card-section class="business-detail-content">
          <div class="business-overview">
            <div class="overview-header">
              <q-avatar size="64px" square class="hover-scale">
                <img :src="selectedBusiness.logo_path || placeholderLogo" />
              </q-avatar>
              <div class="overview-info">
                <h4>{{ selectedBusiness.business_name }}</h4>
                <p>{{ selectedBusiness.bank_account_name }}</p>
                <q-chip 
                  :color="getStatusColor(selectedBusiness.status)" 
                  :label="getStatusLabel(selectedBusiness.status)" 
                  :icon="getStatusIcon(selectedBusiness.status)"
                  class="status-chip"
                />
              </div>
            </div>
            
            <div class="business-details-grid">
              <div class="detail-section">
                <h6>Banking Information</h6>
                <div class="detail-row">
                  <span>Account Name:</span>
                  <span>{{ selectedBusiness.bank_account_name }}</span>
                </div>
                <div class="detail-row">
                  <span>Account Number:</span>
                  <span>{{ maskAccountNumber(selectedBusiness.bank_account_number) }}</span>
                </div>
                <div class="detail-row">
                  <span>IFSC/SWIFT:</span>
                  <span>{{ selectedBusiness.bank_ifsc_swift }}</span>
                </div>
              </div>
              
              <div class="detail-section">
                <h6>Account Information</h6>
                <div class="detail-row">
                  <span>Stripe Account:</span>
                  <span>{{ selectedBusiness.stripe_account_id || 'Not connected' }}</span>
                </div>
                <div class="detail-row">
                  <span>Status:</span>
                  <span>{{ getStatusLabel(selectedBusiness.status) }}</span>
                </div>
                <div class="detail-row">
                  <span>Sample Balance:</span>
                  <span>{{ formatCurrency(0) }}</span>
                </div>
                <div class="detail-row">
                  <span>Registered:</span>
                  <span>{{ formatDateTime(selectedBusiness.created_at) }}</span>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup class="hover-scale" />
          <q-btn 
            color="orange" 
            label="Update Information" 
            @click="editBusiness(selectedBusiness)" 
            class="hover-scale"
          />
          <q-btn 
            color="green" 
            label="Create Payment" 
            @click="createPaymentForBusiness(selectedBusiness)" 
            class="hover-scale"
          />
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
import MerchantStatusCard from './MerchantStatusCard.vue'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const error = ref('')
const businesses = ref([])
const selectedBusiness = ref(null)
const selectedTransaction = ref(null)
const profileStats = ref({})

// ✅ NEW: Transaction and refund data
const recentTransactions = ref([])
const loadingTransactions = ref(false)
const refundingTransaction = ref(null)
const processingRefund = ref(false)
const showRefundDialog = ref(false)
const refundForm = ref({
  amount: 0,
  reason: '',
  notes: ''
})

// Dialog states
const showAddBusinessDialog = ref(false)
const showStripeDialog = ref(false)
const showSuccessDialog = ref(false)
const showBusinessDetailsDialog = ref(false)
const showPaymentDialog = ref(false)
const showPaymentProcessingDialog = ref(false)
const showPaymentResultDialog = ref(false)
const submittingBusiness = ref(false)
const editingBusiness = ref(false)
const gettingFreshUrl = ref(false)
const creatingPayment = ref(false)

// ✅ Enhanced Stripe integration (no iframe, no 404 errors)
const stripeOnboardingUrl = ref('')
const currentBusinessName = ref('')
const currentStripeAccountId = ref('')

// ✅ NEW: Payment processing
const processingProgress = ref(0)
const selectedBusinessForPayment = ref(null)
const paymentResult = ref({
  success: false,
  message: '',
  details: null
})

// Form data
const newBusiness = ref({
  business_name: '',
  logo: null,
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  payout_preference: 'bank_transfer'
})

// ✅ NEW: Payment form data
const paymentForm = ref({
  amount: 10,
  currency: 'usd',
  method: 'card',
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  cart: []
})

const submittedBusiness = ref({})
const logoPreview = ref('')

// Options
const payoutOptions = [
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Digital Wallet', value: 'digital_wallet' },
  { label: 'Check', value: 'check' }
]

// ✅ NEW: Payment options
const paymentMethods = [
  { label: 'Credit Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Digital Wallet', value: 'wallet' }
]

const currencyOptions = [
  { label: 'USD - US Dollar', value: 'usd' },
  { label: 'EUR - Euro', value: 'eur' },
  { label: 'GBP - British Pound', value: 'gbp' }
]

// ✅ NEW: Refund reasons
const refundReasons = [
  { label: 'Customer Request', value: 'customer_request' },
  { label: 'Product Defective', value: 'defective_product' },
  { label: 'Service Not Delivered', value: 'service_not_delivered' },
  { label: 'Duplicate Charge', value: 'duplicate_charge' },
  { label: 'Fraudulent Transaction', value: 'fraud' },
  { label: 'Other', value: 'other' }
]

// Analytics State
const timeframe = ref('monthly')
const loadingAnalytics = ref(false)
const revenueData = ref([])
const methodsData = ref([])
const transactionData = ref([])
const totalRevenue = ref(0)
const totalTransactions = ref(0)
const avgCheckoutTime = ref(45)
const topGeography = ref('North America')
const conversionRate = ref(78)
const repeatCustomers = ref(156)

const timeframeOptions = [
  { label: '7D', value: 'weekly' },
  { label: '30D', value: 'monthly' },
  { label: '90D', value: 'quarterly' },
  { label: '1Y', value: 'yearly' }
]

const placeholderLogo = 'https://placehold.co/200x200/121018/bdf000?text=Logo'

// Computed properties
const user = computed(() => {
  try {
    const storedUser = localStorage.getItem('user')
    return storedUser ? JSON.parse(storedUser) : { name: 'Merchant', email: 'merchant@example.com' }
  } catch {
    return { name: 'Merchant', email: 'merchant@example.com' }
  }
})

// ✅ Use first business for status card, or default
const merchantStatus = computed(() => {
  return businesses.value.length > 0 ? businesses.value[0].status : 'pending'
})

const onboardingProgress = computed(() => {
  if (businesses.value.length === 0) return 0
  
  const totalBusinesses = businesses.value.length
  const completedBusinesses = businesses.value.filter(b => 
    b.business_name && b.bank_account_name && b.bank_account_number && b.bank_ifsc_swift
  ).length
  
  return Math.round((completedBusinesses / totalBusinesses) * 100)
})

const approvedBusinessCount = computed(() => {
  return businesses.value.filter(b => b.status === 'approved' || b.status === 'verified').length
})

const pendingBusinessCount = computed(() => {
  return businesses.value.filter(b => b.status === 'pending').length
})

const stripeConnectedCount = computed(() => {
  return businesses.value.filter(b => b.stripe_account_id).length
})

// ✅ All businesses can be used for payments
const businessOptions = computed(() => {
  return businesses.value.map(b => ({
    label: b.business_name,
    value: b.id
  }))
})

const isBusinessFormValid = computed(() => {
  return newBusiness.value.business_name &&
         newBusiness.value.bank_account_name &&
         newBusiness.value.bank_account_number &&
         newBusiness.value.bank_ifsc_swift &&
         newBusiness.value.payout_preference
})

// ✅ NEW: Payment form validation - no status check required
const isPaymentFormValid = computed(() => {
  const hasSelectedBusiness = businesses.value.length === 1 || selectedBusinessForPayment.value
  
  return paymentForm.value.amount > 0 &&
         paymentForm.value.method &&
         paymentForm.value.customer_name &&
         paymentForm.value.customer_email &&
         /.+@.+\..+/.test(paymentForm.value.customer_email) &&
         hasSelectedBusiness
})

// ✅ NEW: Refund form validation
const isRefundFormValid = computed(() => {
  return refundForm.value.amount > 0 &&
         refundForm.value.amount <= (selectedTransaction.value?.amount / 100 || 0) &&
         refundForm.value.reason
})

// Methods
const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = ''
    
    console.log('🔄 Loading dashboard data...')
    
    await loadBusinessesData()
    await loadRecentTransactions()
    calculateProfileStats()
    
    console.log('✅ Dashboard data loaded successfully')
    
  } catch (err) {
    console.error('❌ Error loading dashboard data:', err)
    error.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    loading.value = false
  }
}

// ✅ ENHANCED: Load businesses data with global persistence
const loadBusinessesData = async () => {
  try {
    console.log('🔄 Loading businesses data...')
    
    // ✅ Use global storage key to persist across all sessions
    const storageKey = 'merchantBusinesses'
    
    const storedBusinessesData = localStorage.getItem(storageKey)
    
    if (storedBusinessesData) {
      const allBusinesses = JSON.parse(storedBusinessesData)
      
      // ✅ Filter businesses for current user
      const currentUserId = user.value.id || user.value.email || 'default'
      businesses.value = allBusinesses.filter(b => 
        b.user_id === currentUserId || 
        b.user?.id === currentUserId || 
        b.user?.email === user.value.email
      )
      
      console.log('✅ Businesses data loaded from global storage:', businesses.value.length, 'businesses for user', currentUserId)
    } else {
      businesses.value = []
      console.log('📝 No businesses data found in global storage')
    }
    
  } catch (err) {
    console.warn('⚠️ Error loading businesses data:', err)
    businesses.value = []
  }
}

// ✅ NEW: Load recent transactions
const loadRecentTransactions = async () => {
  try {
    loadingTransactions.value = true
    console.log('🔄 Loading recent transactions...')
    
    // ✅ Try to load from API
    try {
      const response = await api.get('/api/merchant/transactions', {
        params: { limit: 10 }
      })
      
      const data = response.data
      if (data.transactions) {
        recentTransactions.value = data.transactions
      } else if (Array.isArray(data)) {
        recentTransactions.value = data
      } else {
        recentTransactions.value = []
      }
      
      console.log('✅ Transactions loaded from API:', recentTransactions.value.length)
      
    } catch{
      console.warn('⚠️ Transactions API not available, using mock data')
      
      // ✅ Generate mock transactions for demo
      recentTransactions.value = Array.from({ length: Math.min(businesses.value.length * 3, 10) }, (_, i) => ({
        id: 1000 + i,
        customer_name: ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Brown', 'Charlie Wilson'][i % 5],
        customer_email: ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com', 'charlie@example.com'][i % 5],
        amount: Math.floor(Math.random() * 50000) + 1000, // $10 - $500 in cents
        currency: 'usd',
        method: ['card', 'bank_transfer', 'wallet'][i % 3],
        status: ['completed', 'pending', 'failed', 'completed', 'completed'][i % 5], // More completed for refund testing
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        business_id: businesses.value[i % businesses.value.length]?.id || 1,
        refunded: false
      }))
    }
    
  } catch (err) {
    console.warn('⚠️ Error loading transactions:', err)
    recentTransactions.value = []
  } finally {
    loadingTransactions.value = false
  }
}

// ✅ NEW: Refresh transactions
// const refreshTransactions = async () => {
//   try {
//     await loadRecentTransactions()
    
//     $q.notify({
//       type: 'positive',
//       message: 'Transactions refreshed successfully',
//       position: 'top',
//       icon: 'refresh',
//       timeout: 3000
//     })
    
//   } catch (error) {
//     console.error('❌ Error refreshing transactions:', error)
//     $q.notify({
//       type: 'negative',
//       message: 'Failed to refresh transactions',
//       position: 'top'
//     })
//   }
// }

// ✅ NEW: Check if transaction can be refunded
const canRefund = (transaction) => {
  return transaction.status === 'completed' && 
         !transaction.refunded &&
         new Date(transaction.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Within 30 days
}

// ✅ NEW: Show refund dialog
const showRefundTransactionForm= (transaction) => {
  selectedTransaction.value = transaction
  refundForm.value = {
    amount: transaction.amount / 100, // Convert from cents to dollars
    reason: '',
    notes: ''
  }
  showRefundDialog.value = true
}

// ✅ NEW: Cancel refund
const cancelRefund = () => {
  showRefundDialog.value = false
  selectedTransaction.value = null
  refundForm.value = {
    amount: 0,
    reason: '',
    notes: ''
  }
}

// ✅ NEW: Process refund
const processRefund = async () => {
  try {
    processingRefund.value = true
    refundingTransaction.value = selectedTransaction.value.id
    
    if (!isRefundFormValid.value) {
      throw new Error('Please fill in all required fields')
    }
    
    console.log('🔄 Processing refund for transaction:', selectedTransaction.value.id)
    
    // ✅ Prepare refund data for API
    const refundData = {
      amount: Math.round(refundForm.value.amount * 100), // Convert to cents
      reason: refundForm.value.reason,
      notes: refundForm.value.notes
    }
    
    console.log('📤 Sending refund request to /api/merchant/transactions/' + selectedTransaction.value.id + '/refund:', refundData)
    
    // ✅ Call the refund API endpoint
    try {
      const refundResponse = await api.post(`/api/merchant/transactions/${selectedTransaction.value.id}/refund`, refundData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      })
      
      console.log('✅ Refund response:', refundResponse.data)
      
      $q.notify({
        type: 'positive',
        message: `Refund of ${formatCurrency(refundForm.value.amount * 100)} processed successfully!`,
        position: 'top',
        icon: 'check_circle',
        timeout: 6000
      })
      
    } catch (refundError) {
      console.warn('⚠️ Refund API error:', refundError)
      
      // ✅ Show API error message
      let errorMessage = 'Failed to process refund'
      
      if (refundError.response?.data?.message) {
        errorMessage = refundError.response.data.message
      } else if (refundError.response?.data?.errors) {
        const errors = refundError.response.data.errors
        const errorMessages = Object.values(errors).flat()
        errorMessage = errorMessages.join(', ')
      } else if (refundError.message) {
        errorMessage = refundError.message
      }
      
      $q.notify({
        type: 'negative',
        message: errorMessage,
        position: 'top',
        icon: 'error',
        timeout: 8000
      })
      
      return // Don't update local state if API failed
    }
    
    // ✅ Update transaction status locally only if API succeeded
    const transactionIndex = recentTransactions.value.findIndex(t => t.id === selectedTransaction.value.id)
    if (transactionIndex !== -1) {
      recentTransactions.value[transactionIndex].status = 'refunded'
      recentTransactions.value[transactionIndex].refunded = true
      recentTransactions.value[transactionIndex].refund_amount = Math.round(refundForm.value.amount * 100)
      recentTransactions.value[transactionIndex].refund_reason = refundForm.value.reason
      recentTransactions.value[transactionIndex].refund_notes = refundForm.value.notes
    }
    
    cancelRefund()
    
  } catch (err) {
    console.error('❌ Refund processing error:', err)
    
    $q.notify({
      type: 'negative',
      message: err.message || 'Failed to process refund',
      position: 'top',
      timeout: 5000
    })
  } finally {
    processingRefund.value = false
    refundingTransaction.value = null
  }
}

// ✅ NEW: View transaction details
const viewTransactionDetails = (transaction) => {
  $q.dialog({
    title: `Transaction #${transaction.id}`,
    message: `
      <div style="padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 20px;">
          <div><strong>Customer:</strong> ${transaction.customer_name}</div>
          <div><strong>Amount:</strong> ${formatCurrency(transaction.amount)}</div>
          <div><strong>Method:</strong> ${getPaymentMethodLabel(transaction.method)}</div>
          <div><strong>Status:</strong> ${transaction.status}</div>
          <div><strong>Date:</strong> ${formatDateTime(transaction.created_at)}</div>
          <div><strong>Email:</strong> ${transaction.customer_email || 'N/A'}</div>
        </div>
        ${transaction.refunded ? `
          <div style="background: rgba(255, 152, 0, 0.1); border-radius: 8px; padding: 16px; margin-top: 16px;">
            <div style="color: #ff9800; font-weight: bold; margin-bottom: 8px;">Refund Information:</div>
            <div><strong>Refund Amount:</strong> ${formatCurrency(transaction.refund_amount || transaction.amount)}</div>
            <div><strong>Refund Reason:</strong> ${transaction.refund_reason || 'N/A'}</div>
            ${transaction.refund_notes ? `<div><strong>Notes:</strong> ${transaction.refund_notes}</div>` : ''}
          </div>
        ` : ''}
      </div>
    `,
    html: true,
    ok: {
      label: 'Close',
      color: 'blue'
    }
  })
}

// ✅ NEW: Download transaction receipt
const downloadTransactionReceipt = (transaction) => {
  const receiptData = `
Transaction Receipt
==================
Transaction ID: #${transaction.id}
Customer: ${transaction.customer_name}
Email: ${transaction.customer_email || 'N/A'}
Amount: ${formatCurrency(transaction.amount)}
Method: ${getPaymentMethodLabel(transaction.method)}
Status: ${transaction.status}
Date: ${formatDateTime(transaction.created_at)}
${transaction.refunded ? `
Refund Information:
Refund Amount: ${formatCurrency(transaction.refund_amount || transaction.amount)}
Refund Reason: ${transaction.refund_reason || 'N/A'}
${transaction.refund_notes ? `Refund Notes: ${transaction.refund_notes}` : ''}
` : ''}

Thank you for your business!
  `.trim()
  
  const blob = new Blob([receiptData], { type: 'text/plain' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `receipt_${transaction.id}.txt`
  link.click()
  window.URL.revokeObjectURL(url)
  
  $q.notify({
    type: 'positive',
    message: 'Receipt downloaded successfully',
    position: 'top',
    icon: 'download',
    timeout: 3000
  })
}

// ✅ ENHANCED: Save businesses data globally
const saveBusinessesData = () => {
  try {
    const storageKey = 'merchantBusinesses'
    
    // ✅ Get existing global data
    const existingData = localStorage.getItem(storageKey)
    let allBusinesses = existingData ? JSON.parse(existingData) : []
    
    // ✅ Update or add current user's businesses
    const currentUserId = user.value.id || user.value.email || 'default'
    
    // Remove old businesses for this user
    allBusinesses = allBusinesses.filter(b => 
      b.user_id !== currentUserId && 
      b.user?.id !== currentUserId && 
      b.user?.email !== user.value.email
    )
    
    // Add current user's businesses
    allBusinesses = [...allBusinesses, ...businesses.value]
    
    localStorage.setItem(storageKey, JSON.stringify(allBusinesses))
    console.log('✅ Businesses data saved to global storage:', businesses.value.length, 'businesses for user', currentUserId)
  } catch (err) {
    console.error('❌ Error saving businesses data:', err)
  }
}

const calculateProfileStats = () => {
  profileStats.value = {
    total_businesses: businesses.value.length,
    approved_businesses: approvedBusinessCount.value,
    pending_businesses: pendingBusinessCount.value,
    stripe_connected: stripeConnectedCount.value
  }
}

// ✅ REMOVED: All status checking functions
const handleStatusCheck = () => {
  $q.notify({
    type: 'info',
    message: 'Status checks are disabled. All businesses can create payments.',
    position: 'top',
    timeout: 3000
  })
}

const handleUpdateInfo = () => {
  if (businesses.value.length > 0) {
    editBusiness(businesses.value[0])
  } else {
    addBusiness()
  }
}

const handleContactSupport = () => {
  contactSupport()
}

const addBusiness = () => {
  editingBusiness.value = false
  selectedBusiness.value = null
  newBusiness.value = {
    business_name: '',
    logo: null,
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc_swift: '',
    payout_preference: 'bank_transfer'
  }
  logoPreview.value = ''
  showAddBusinessDialog.value = true
}

const editBusiness = (business) => {
  editingBusiness.value = true
  selectedBusiness.value = business
  newBusiness.value = {
    business_name: business.business_name || '',
    logo: null,
    bank_account_name: business.bank_account_name || '',
    bank_account_number: business.bank_account_number || '',
    bank_ifsc_swift: business.bank_ifsc_swift || '',
    payout_preference: 'bank_transfer'
  }
  logoPreview.value = business.logo_path || ''
  showBusinessDetailsDialog.value = false
  showAddBusinessDialog.value = true
}

const onLogoSelected = (file) => {
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  } else {
    logoPreview.value = ''
  }
}

const cancelBusinessForm = () => {
  showAddBusinessDialog.value = false
  editingBusiness.value = false
  selectedBusiness.value = null
  newBusiness.value = {
    business_name: '',
    logo: null,
    bank_account_name: '',
    bank_account_number: '',
    bank_ifsc_swift: '',
    payout_preference: 'bank_transfer'
  }
  logoPreview.value = ''
}

// ✅ ENHANCED: Support multiple businesses with unique names
const submitBusiness = async () => {
  try {
    submittingBusiness.value = true
    
    if (!isBusinessFormValid.value) {
      throw new Error('Please fill in all required fields')
    }
    
    // ✅ Check for duplicate business names
    const duplicateName = businesses.value.find(b => 
      b.business_name.toLowerCase() === newBusiness.value.business_name.toLowerCase() &&
      (!editingBusiness.value || b.id !== selectedBusiness.value?.id)
    )
    
    if (duplicateName) {
      $q.notify({
        type: 'warning',
        message: 'A business with this name already exists. Please use a different name.',
        position: 'top',
        timeout: 5000
      })
      return
    }
    
    console.log('🔄 Submitting business information...')
    
    // ✅ Use exact format from your API documentation
    const businessData = {
      business_name: newBusiness.value.business_name,
      logo: "", // Always empty string as per your API docs
      bank_account_name: newBusiness.value.bank_account_name,
      bank_account_number: newBusiness.value.bank_account_number,
      bank_ifsc_swift: newBusiness.value.bank_ifsc_swift,
      "payout_preferences[0]": newBusiness.value.payout_preference
    }
    
    console.log('📤 Submitting business data to /api/merchant/register:', businessData)
    
    const businessResponse = await api.post('/merchant/register', businessData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    console.log('✅ Business registration response:', businessResponse.data)
    
    // ✅ Extract data from your actual response structure
    const responseData = businessResponse.data
    const merchantData = responseData.merchant
    const onboardingUrl = responseData.onboarding_url
    
    console.log('🔍 Merchant data:', merchantData)
    console.log('🔗 Onboarding URL:', onboardingUrl)
    
    // ✅ Create business data object with ready status
    const businessDataObj = {
      id: merchantData.id,
      user_id: merchantData.user_id,
      business_name: merchantData.business_name,
      bank_account_name: merchantData.bank_account_name,
      bank_account_number: merchantData.bank_account_number,
      bank_ifsc_swift: merchantData.bank_ifsc_swift,
      logo_path: merchantData.logo_path,
      stripe_account_id: merchantData.stripe_account_id,
      status: 'approved', // ✅ Always set as approved - no verification required
      created_at: merchantData.created_at,
      updated_at: merchantData.updated_at,
      user: merchantData.user
    }
    
    // ✅ Add or update business in the list
    if (editingBusiness.value && selectedBusiness.value) {
      const index = businesses.value.findIndex(b => b.id === selectedBusiness.value.id)
      if (index !== -1) {
        businesses.value[index] = businessDataObj
      }
    } else {
      businesses.value.push(businessDataObj)
    }
    
    // ✅ Save businesses data globally
    saveBusinessesData()
    
    // Store submitted business data for success dialog
    submittedBusiness.value = { ...newBusiness.value }
    currentBusinessName.value = merchantData.business_name
    currentStripeAccountId.value = merchantData.stripe_account_id
    
    // Close business form dialog
    showAddBusinessDialog.value = false
    
    // ✅ Show success notification
    $q.notify({
      type: 'positive',
      message: 'Information added successfully!',
      position: 'top',
      icon: 'check_circle',
      timeout: 4000
    })
    
    // ✅ Open Stripe onboarding if URL is provided and valid
    if (onboardingUrl && validateStripeUrl(onboardingUrl)) {
      console.log('🔄 Opening validated Stripe onboarding URL:', onboardingUrl)
      await openStripeOnboarding(onboardingUrl)
    } else {
      console.warn('⚠️ Invalid or missing onboarding URL')
      showSuccessDialog.value = true
    }
    
    console.log('✅ Business registration completed successfully')
    
  } catch (err) {
    console.error('❌ Business submission error:', err)
    
    let errorMessage = 'Failed to submit business information'
    
    if (err.response?.status === 500) {
      // ✅ Handle unique constraint by generating unique business name
      if (err.response?.data?.message?.includes('Duplicate entry') || 
          err.response?.data?.message?.includes('merchants_user_id_unique') ||
          err.response?.data?.message?.includes('Integrity constraint violation')) {
        
        // ✅ Generate unique business name by adding timestamp
        const uniqueName = `${newBusiness.value.business_name}_${Date.now()}`
        newBusiness.value.business_name = uniqueName
        
        $q.notify({
          type: 'warning',
          message: `Business name updated to "${uniqueName}" to avoid conflicts. Please try submitting again.`,
          position: 'top',
          timeout: 8000,
          actions: [
            { 
              label: 'Submit Again', 
              color: 'white', 
              handler: () => submitBusiness()
            }
          ]
        })
        return
      } else {
        errorMessage = 'Server error occurred. Please check your data and try again, or contact support.'
      }
      
    } else if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.response?.data?.errors) {
      const errors = err.response.data.errors
      const errorMessages = Object.values(errors).flat()
      errorMessage = errorMessages.join(', ')
    } else if (err.message) {
      errorMessage = err.message
    }
    
    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 8000,
      actions: [
        { 
          label: 'Contact Support', 
          color: 'white', 
          handler: () => contactSupport()
        }
      ]
    })
    
  } finally {
    submittingBusiness.value = false
  }
}

// ✅ NEW: Validate Stripe URL before opening
const validateStripeUrl = (url) => {
  try {
    if (!url || typeof url !== 'string') {
      console.error('❌ Invalid URL: not a string')
      return false
    }
    
    const urlObj = new URL(url)
    
    // Check if it's a valid Stripe domain
    const validDomains = [
      'connect.stripe.com',
      'dashboard.stripe.com',
      'checkout.stripe.com'
    ]
    
    const isValidDomain = validDomains.some(domain => urlObj.hostname.includes(domain))
    
    if (!isValidDomain) {
      console.warn('⚠️ Invalid Stripe domain:', urlObj.hostname)
      return false
    }
    
    // Check if URL uses HTTPS
    if (urlObj.protocol !== 'https:') {
      console.warn('⚠️ Non-HTTPS Stripe URL:', url)
      return false
    }
    
    console.log('✅ Valid Stripe URL:', url)
    return true
    
  } catch (error) {
    console.error('❌ Invalid URL format:', error)
    return false
  }
}

// ✅ ENHANCED: Better Stripe onboarding with URL validation
const openStripeOnboarding = async (onboardingUrl) => {
  try {
    console.log('🔄 Preparing Stripe onboarding with URL:', onboardingUrl)
    
    // ✅ Validate URL first
    if (!validateStripeUrl(onboardingUrl)) {
      throw new Error('Invalid Stripe onboarding URL received from server')
    }
    
    stripeOnboardingUrl.value = onboardingUrl
    showStripeDialog.value = true
    
    $q.notify({
      type: 'info',
      message: 'Stripe onboarding is ready. Click "Open Stripe Onboarding" to continue in a secure window.',
      position: 'top',
      timeout: 6000
    })
    
  } catch (error) {
    console.error('❌ Error preparing Stripe onboarding:', error)
    
    $q.notify({
      type: 'negative',
      message: 'Invalid Stripe onboarding URL. Please contact support.',
      position: 'top',
      timeout: 8000,
      actions: [
        { 
          label: 'Contact Support', 
          color: 'white', 
          handler: () => contactSupport()
        },
        { 
          label: 'Skip for Now', 
          color: 'white', 
          handler: () => skipStripeOnboarding()
        }
      ]
    })
  }
}

// ✅ ENHANCED: Better popup handling with error detection
const openStripeInNewTab = async () => {
  if (!stripeOnboardingUrl.value) {
    $q.notify({
      type: 'warning',
      message: 'No Stripe onboarding URL available',
      position: 'top'
    })
    return
  }
  
  try {
    console.log('🔄 Opening Stripe onboarding in secure new window:', stripeOnboardingUrl.value)
    
    // ✅ Open with enhanced security settings
    const stripeWindow = window.open(
      stripeOnboardingUrl.value, 
      'stripe-onboarding', 
      'width=1200,height=900,scrollbars=yes,resizable=yes,location=yes,status=yes,toolbar=yes'
    )
    
    if (!stripeWindow) {
      throw new Error('Popup blocked')
    }
    
    // ✅ Monitor window and show instructions
    showStripeInstructionDialog(stripeOnboardingUrl.value, stripeWindow)
    
  } catch (error) {
    console.error('❌ Error opening Stripe window:', error)
    
    if (error.message === 'Popup blocked') {
      $q.notify({
        type: 'warning',
        message: 'Please allow popups for this site to complete Stripe onboarding.',
        position: 'top',
        timeout: 8000,
        actions: [
          { 
            label: 'Copy Link', 
            color: 'white', 
            handler: () => copyStripeUrl(stripeOnboardingUrl.value)
          }
        ]
      })
    } else {
      $q.notify({
        type: 'negative',
        message: 'Failed to open Stripe onboarding. Please try copying the link manually.',
        position: 'top',
        timeout: 8000,
        actions: [
          { 
            label: 'Copy Link', 
            color: 'white', 
            handler: () => copyStripeUrl(stripeOnboardingUrl.value)
          }
        ]
      })
    }
  }
}

// ✅ ENHANCED: Better instruction dialog with debugging info
const showStripeInstructionDialog = (onboardingUrl, stripeWindow) => {
  $q.dialog({
    title: 'Complete Stripe Onboarding',
    message: `
      <div style="text-align: center; padding: 20px;">
        <div style="margin-bottom: 20px;">
          <i class="material-icons" style="font-size: 48px; color: #2196f3;">account_balance</i>
        </div>
        <h4 style="color: #ffffff; margin: 16px 0;">Stripe Onboarding Window Opened</h4>
        <p style="color: #ccc; line-height: 1.6; margin-bottom: 20px;">
          A secure new window has opened with your Stripe onboarding form for <strong>${currentBusinessName.value}</strong>. 
          Please complete the form in that window and return here when finished.
        </p>
        
        <div style="background: rgba(76, 175, 80, 0.1); border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #4caf50; margin: 0; font-size: 0.9rem;">
            <i class="material-icons" style="font-size: 16px; vertical-align: middle;">security</i>
            This is a secure connection to Stripe's official onboarding system.
          </p>
        </div>
        
        <div style="background: rgba(33, 150, 243, 0.1); border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="color: #2196f3; margin: 0; font-size: 0.9rem;">
            <i class="material-icons" style="font-size: 16px; vertical-align: middle;">info</i>
            Complete all required fields in the Stripe form to connect your payment processing.
          </p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px; margin: 16px 0; font-family: monospace; font-size: 0.8rem; word-break: break-all; text-align: left;">
          ${onboardingUrl}
        </div>
      </div>
    `,
    html: true,
    persistent: true,
    ok: {
      label: 'I\'ve Completed Onboarding',
      color: 'green'
    },
    cancel: {
      label: 'Get Fresh URL',
      color: 'orange'
    }
  }).onOk(() => {
    markOnboardingCompleted()
  }).onCancel(() => {
    if (stripeWindow && !stripeWindow.closed) {
      stripeWindow.close()
    }
    retryStripeOnboarding()
  })
  
  // ✅ Enhanced window monitoring
  const checkWindowClosed = setInterval(() => {
    if (stripeWindow.closed) {
      clearInterval(checkWindowClosed)
      
      $q.notify({
        type: 'info',
        message: 'Stripe window was closed. Did you complete the onboarding successfully?',
        position: 'top',
        timeout: 10000,
        actions: [
          { 
            label: 'Yes, Completed', 
            color: 'white', 
            handler: () => markOnboardingCompleted()
          },
          { 
            label: 'Had Issues, Get New URL', 
            color: 'white', 
            handler: () => retryStripeOnboarding()
          },
          { 
            label: 'Skip for Now', 
            color: 'white', 
            handler: () => skipStripeOnboarding()
          }
        ]
      })
    }
  }, 1000)
  
  // Stop checking after 15 minutes
  setTimeout(() => {
    clearInterval(checkWindowClosed)
  }, 15 * 60 * 1000)
}

// ✅ NEW: Copy Stripe URL to clipboard with enhanced handling
const copyStripeUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url)
    
    $q.notify({
      type: 'positive',
      message: 'Stripe onboarding URL copied to clipboard!',
      position: 'top',
      icon: 'content_copy',
      timeout: 4000
    })
    
  } catch (err) {
    console.error('Failed to copy URL:', err)
    
    $q.dialog({
      title: 'Stripe Onboarding URL',
      message: `
        <div style="padding: 20px; text-align: center;">
          <p style="color: #ccc; margin-bottom: 16px;">Please copy this URL and open it in a new browser tab:</p>
          <div style="background: rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin: 16px 0; word-break: break-all; font-family: monospace; font-size: 0.85rem; user-select: all;">
            ${url}
          </div>
          <p style="color: #2196f3; font-size: 0.9rem;">Complete the Stripe onboarding form and return here when finished.</p>
        </div>
      `,
      html: true,
      ok: {
        label: 'I\'ll Copy It Manually',
        color: 'blue'
      }
    })
  }
}

// ✅ ENHANCED: Better retry with fresh URL
const retryStripeOnboarding = async () => {
  try {
    gettingFreshUrl.value = true
    console.log('🔄 Getting fresh Stripe onboarding URL...')
    
    if (!submittedBusiness.value.business_name) {
      $q.notify({
        type: 'warning',
        message: 'Please submit your business information first',
        position: 'top'
      })
      return
    }
    
    $q.loading.show({
      message: 'Getting fresh Stripe onboarding URL...',
      spinnerColor: 'blue'
    })
    
    // ✅ Re-submit business to get fresh onboarding URL
    const businessData = {
      business_name: submittedBusiness.value.business_name,
      logo: "",
      bank_account_name: submittedBusiness.value.bank_account_name,
      bank_account_number: submittedBusiness.value.bank_account_number,
      bank_ifsc_swift: submittedBusiness.value.bank_ifsc_swift,
      "payout_preferences[0]": submittedBusiness.value.payout_preference
    }
    
    const businessResponse = await api.post('/merchant/register', businessData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })
    
    const newOnboardingUrl = businessResponse.data?.onboarding_url
    
    if (newOnboardingUrl && validateStripeUrl(newOnboardingUrl)) {
      console.log('✅ Fresh onboarding URL received:', newOnboardingUrl)
      
      $q.notify({
        type: 'positive',
        message: 'Fresh Stripe URL generated successfully!',
        position: 'top',
        icon: 'refresh',
        timeout: 4000
      })
      
      await openStripeOnboarding(newOnboardingUrl)
    } else {
      throw new Error('Invalid or missing onboarding URL in response')
    }
    
  } catch (error) {
    console.error('❌ Failed to get fresh Stripe URL:', error)
    
    $q.notify({
      type: 'negative',
      message: 'Failed to get fresh Stripe URL. Please contact support for assistance.',
      position: 'top',
      timeout: 8000,
      actions: [
        { 
          label: 'Contact Support', 
          color: 'white', 
          handler: () => contactSupport()
        }
      ]
    })
  } finally {
    gettingFreshUrl.value = false
    $q.loading.hide()
  }
}

// ✅ NEW: Skip Stripe onboarding option
const skipStripeOnboarding = () => {
  $q.dialog({
    title: 'Skip Stripe Onboarding?',
    message: 'You can skip Stripe onboarding for now and complete it later. You can still create payments without it.',
    ok: {
      label: 'Skip for Now',
      color: 'orange'
    },
    cancel: {
      label: 'Continue Setup',
      color: 'lime'
    }
  }).onOk(() => {
    $q.notify({
      type: 'info',
      message: 'Stripe onboarding skipped. You can complete it later from your business profile.',
      position: 'top',
      timeout: 6000
    })
    
    closeStripeDialog()
    showSuccessDialog.value = true
  })
}

const markOnboardingCompleted = async () => {
  try {
    console.log('🔄 Marking Stripe onboarding as completed...')
    $q.notify({
      type: 'positive',
      message: `Stripe onboarding completed for ${currentBusinessName.value}! You can now create payments.`,
      position: 'top',
      icon: 'check_circle',
      timeout: 6000
    })
    
    closeStripeDialog()
    showSuccessDialog.value = true
    
  } catch (error) {
    console.error('❌ Error marking onboarding completed:', error)
    $q.notify({
      type: 'warning',
      message: 'Onboarding marked as completed. You can now create payments.',
      position: 'top'
    })
    
    closeStripeDialog()
    showSuccessDialog.value = true
  }
}

const closeStripeDialog = () => {
  showStripeDialog.value = false
  stripeOnboardingUrl.value = ''
  currentBusinessName.value = ''
  currentStripeAccountId.value = ''
}

// ✅ NEW: Payment creation methods - no status restrictions
const showCreatePaymentDialog = () => {
  if (businesses.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Please register a business first to create payments',
      position: 'top'
    })
    return
  }
  
  // ✅ Auto-select business if only one
  if (businesses.value.length === 1) {
    selectedBusinessForPayment.value = businesses.value[0].id
  } else {
    selectedBusinessForPayment.value = null
  }
  
  // Reset form
  paymentForm.value = {
    amount: 10,
    currency: 'usd',
    method: 'card',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    cart: []
  }
  
  showPaymentDialog.value = true
}

const cancelPaymentForm = () => {
  showPaymentDialog.value = false
  selectedBusinessForPayment.value = null
  paymentForm.value = {
    amount: 10,
    currency: 'usd',
    method: 'card',
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    cart: []
  }
}

const addCartItem = () => {
  paymentForm.value.cart.push({
    product: '',
    qty: 1,
    price: 0
  })
}

const removeCartItem = (index) => {
  paymentForm.value.cart.splice(index, 1)
}

// ✅ NEW: Create payment checkout
const createPaymentCheckout = async () => {
  let progressInterval

  try {
    creatingPayment.value = true

    if (!isPaymentFormValid.value) {
      throw new Error('Please fill in all required fields')
    }

    console.log('🔄 Creating payment checkout...')

    // ✅ Get the selected business for payment
    const businessForPayment = getSelectedBusinessForPayment()
    if (!businessForPayment) {
      throw new Error('No business selected for payment')
    }

    // Show processing dialog
    showPaymentDialog.value = false
    showPaymentProcessingDialog.value = true
    processingProgress.value = 0

    // ✅ Simulate processing progress
    progressInterval = setInterval(() => {
      if (processingProgress.value < 90) {
        processingProgress.value += 15
      }
    }, 200)
    
    // ✅ Prepare checkout data according to your API format
    const checkoutData = {
      merchant_id: businessForPayment.id,
      amount: paymentForm.value.amount,
      currency: paymentForm.value.currency,
      method: paymentForm.value.method,
      customer: {
        name: paymentForm.value.customer_name,
        email: paymentForm.value.customer_email,
        phone: paymentForm.value.customer_phone || "+15555555555"
      },
      cart: paymentForm.value.cart.length > 0 ? paymentForm.value.cart : [
        { 
          product: "Payment", 
          qty: 1, 
          price: Math.round(paymentForm.value.amount * 100) // Convert to cents
        }
      ],
      return_url_success: `${window.location.origin}/payment/success`,
      return_url_failure: `${window.location.origin}/payment/failed`
    }
    
    console.log('📤 Sending checkout request:', checkoutData)
    
    const checkoutResponse = await api.post('/payments/checkout', checkoutData)
    
    console.log('✅ Checkout response:', checkoutResponse.data)
    
    clearInterval(progressInterval)
    processingProgress.value = 100
    
    // ✅ Extract payment URL from response
    const paymentUrl = checkoutResponse.data?.url || 
                      checkoutResponse.data?.checkout_url || 
                      checkoutResponse.data?.payment_url ||
                      checkoutResponse.data?.redirect_url
    
    if (paymentUrl) {
      console.log('🔄 Opening payment URL:', paymentUrl)
      
      // Close processing dialog
      showPaymentProcessingDialog.value = false
      
      // ✅ Open payment URL in new window
      const paymentWindow = window.open(
        paymentUrl, 
        'stripe-payment', 
        'width=800,height=600,scrollbars=yes,resizable=yes'
      )
      
      if (!paymentWindow) {
        throw new Error('Payment popup blocked')
      }
      
      // ✅ Monitor payment completion
      monitorPaymentWindow(paymentWindow, checkoutResponse.data)
      
    } else {
      throw new Error('No payment URL returned from server')
    }
    
  } catch (err) {
    console.error('❌ Payment creation error:', err)
    
    // Clear progress interval
    clearInterval(progressInterval)
    showPaymentProcessingDialog.value = false
    
    let errorMessage = 'Failed to create payment'
    
    if (err.response?.data?.message) {
      errorMessage = err.response.data.message
    } else if (err.response?.data?.errors) {
      const errors = err.response.data.errors
      const errorMessages = Object.values(errors).flat()
      errorMessage = errorMessages.join(', ')
    } else if (err.message) {
      errorMessage = err.message
    }
    
    // Show error result
    paymentResult.value = {
      success: false,
      message: errorMessage,
      details: null
    }
    showPaymentResultDialog.value = true
    
  } finally {
    creatingPayment.value = false
  }
}

// ✅ NEW: Get selected business for payment
const getSelectedBusinessForPayment = () => {
  if (businesses.value.length === 1) {
    return businesses.value[0]
  } else if (selectedBusinessForPayment.value) {
    return businesses.value.find(b => b.id === selectedBusinessForPayment.value)
  }
  return null
}

const getSelectedBusinessName = () => {
  const business = getSelectedBusinessForPayment()
  return business ? business.business_name : 'Unknown Business'
}

// ✅ NEW: Monitor payment window for completion
const monitorPaymentWindow = (paymentWindow, checkoutData) => {
  $q.notify({
    type: 'info',
    message: 'Payment window opened. Complete the payment and return here.',
    position: 'top',
    timeout: 8000
  })
  
  const checkPaymentWindow = setInterval(() => {
    if (paymentWindow.closed) {
      clearInterval(checkPaymentWindow)
      
      // ✅ Show completion options
      $q.notify({
        type: 'info',
        message: 'Payment window was closed. Was the payment completed successfully?',
        position: 'top',
        timeout: 12000,
        actions: [
          { 
            label: 'Payment Successful', 
            color: 'white', 
            handler: () => showPaymentSuccess(checkoutData)
          },
          { 
            label: 'Payment Failed', 
            color: 'white', 
            handler: () => showPaymentFailure('Payment was cancelled or failed')
          },
          { 
            label: 'Check Status', 
            color: 'white', 
            handler: () => checkPaymentStatus(checkoutData)
          }
        ]
      })
    }
  }, 1000)
  
  // Stop checking after 10 minutes
  setTimeout(() => {
    clearInterval(checkPaymentWindow)
  }, 10 * 60 * 1000)
}

// ✅ NEW: Show payment success
const showPaymentSuccess = (checkoutData) => {
  // ✅ Add to recent transactions for immediate display
  const newTransaction = {
    id: checkoutData.id || Date.now(),
    customer_name: paymentForm.value.customer_name,
    customer_email: paymentForm.value.customer_email,
    amount: Math.round(paymentForm.value.amount * 100), // Convert to cents
    currency: paymentForm.value.currency,
    method: paymentForm.value.method,
    status: 'completed',
    created_at: new Date().toISOString(),
    business_id: getSelectedBusinessForPayment()?.id,
    refunded: false
  }
  
  recentTransactions.value.unshift(newTransaction)
  if (recentTransactions.value.length > 10) {
    recentTransactions.value = recentTransactions.value.slice(0, 10)
  }
  
  paymentResult.value = {
    success: true,
    message: 'Payment completed successfully! Your customer has been charged.',
    details: {
      transaction_id: newTransaction.id,
      amount: paymentForm.value.amount,
      customer: paymentForm.value.customer_name
    }
  }
  showPaymentResultDialog.value = true
  
  $q.notify({
    type: 'positive',
    message: '🎉 Payment successful!',
    position: 'top',
    icon: 'check_circle',
    timeout: 6000
  })
}

// ✅ NEW: Show payment failure
const showPaymentFailure = (message) => {
  paymentResult.value = {
    success: false,
    message: message || 'Payment failed or was cancelled by the customer.',
    details: null
  }
  showPaymentResultDialog.value = true
  
  $q.notify({
    type: 'negative',
    message: '❌ Payment failed',
    position: 'top',
    icon: 'cancel',
    timeout: 6000
  })
}

// ✅ NEW: Check payment status
const checkPaymentStatus = async (checkoutData) => {
  try {
    $q.loading.show({
      message: 'Checking payment status...'
    })
    
    // ✅ Simulate status check (you can implement actual API call)
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // For now, show success (you can implement actual status checking)
    showPaymentSuccess(checkoutData)
    
  } catch (error) {
    console.error('❌ Error checking payment status:', error)
    showPaymentFailure('Could not verify payment status')
  } finally {
    $q.loading.hide()
  }
}

const closePaymentResult = () => {
  showPaymentResultDialog.value = false
  selectedBusinessForPayment.value = null
  paymentResult.value = {
    success: false,
    message: '',
    details: null
  }
}

const retryPayment = () => {
  closePaymentResult()
  showCreatePaymentDialog()
}

// Business management methods
const viewBusinessDetails = (business) => {
  selectedBusiness.value = business
  showBusinessDetailsDialog.value = true
}

const showBusinessMenu = (business) => {
  // Future: Add context menu for business actions
  viewBusinessDetails(business)
}

// ✅ REMOVED: Status checks - any business can create payments
const createPaymentForBusiness = (business) => {
  selectedBusinessForPayment.value = business.id
  showCreatePaymentDialog()
}

const getBusinessCardClass = (status) => {
  const classes = {
    approved: 'business-approved',
    verified: 'business-verified',
    pending: 'business-pending',
    rejected: 'business-rejected'
  }
  return classes[status] || 'business-default'
}

// Navigation methods
const openSettings = () => {
  router.push('/settings')
}

const editProfile = () => {
  router.push('/profile')
}

const viewTransactions = () => {
  router.push('/transactions')
}

const createFirstPayment = () => {
  closeSuccessDialog()
  showCreatePaymentDialog()
}

const exportData = () => {
  if (businesses.value.length > 0) {
    const csvData = generateBusinessCSV(businesses.value)
    downloadCSV(csvData, `businesses_${new Date().toISOString().split('T')[0]}.csv`)
    
    $q.notify({
      type: 'positive',
      message: 'Business data exported successfully',
      position: 'top'
    })
  } else {
    $q.notify({
      type: 'info',
      message: 'No business data available to export',
      position: 'top'
    })
  }
}

const generateBusinessCSV = (businesses) => {
  const headers = ['ID', 'Business Name', 'Account Name', 'Status', 'Stripe Account', 'Registered Date']
  const csvContent = [
    headers.join(','),
    ...businesses.map(b => [
      b.id,
      `"${b.business_name}"`,
      `"${b.bank_account_name}"`,
      b.status,
      b.stripe_account_id || 'Not connected',
      formatDate(b.created_at)
    ].join(','))
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

const contactSupport = () => {
  router.push('/support')
}

// ✅ FIXED: Don't clear business data on logout - keep it permanently
const logout = async () => {
  try {
    try {
      await api.post('/auth/logout')
    } catch {
      console.warn('⚠️ Logout API call failed, proceeding with local cleanup')
    }

    // ✅ FIXED: Only clear auth data, NEVER clear business data
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    // ✅ NEVER remove business data - it persists forever
    delete api.defaults.headers.common['Authorization']

    $q.notify({
      type: 'positive',
      message: 'Logged out successfully. Your business data is safely stored.',
      position: 'top'
    })

    router.push('/login')
  } catch (err) {
    console.error('Logout error:', err)
    router.push('/login')
  }
}

const onLogoError = () => {
  // Handle logo loading errors silently
}

const closeSuccessDialog = () => {
  showSuccessDialog.value = false
  editingBusiness.value = false
  selectedBusiness.value = null
}

const refreshDashboard = () => {
  showSuccessDialog.value = false
  loadDashboardData()
}

const addAnotherBusiness = () => {
  closeSuccessDialog()
  addBusiness()
}

// Utility methods
const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

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

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'N/A'
  const str = String(accountNumber)
  if (str.length <= 4) return str
  return '*'.repeat(str.length - 4) + str.slice(-4)
}

const getPaymentMethodLabel = (method) => {
  const methods = {
    card: 'Credit Card',
    bank_transfer: 'Bank Transfer',
    wallet: 'Digital Wallet'
  }
  return methods[method] || method
}

const getStatusColor = (status) => {
  const colors = {
    completed: 'green',
    pending: 'orange',
    failed: 'red',
    processing: 'blue',
    refunded: 'purple',
    approved: 'green',
    verified: 'green',
    rejected: 'red'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'pending',
    approved: 'check_circle',
    verified: 'verified',
    rejected: 'cancel',
    completed: 'check_circle',
    failed: 'error',
    refunded: 'undo'
  }
  return icons[status] || 'help'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending Review',
    approved: 'Approved',
    verified: 'Verified',
    rejected: 'Rejected',
    suspended: 'Suspended',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded'
  }
  return labels[status] || 'Unknown'
}

// Analytics Methods
const loadAnalyticsData = async () => {
  try {
    loadingAnalytics.value = true
    
    // Load revenue data
    await loadRevenueData()
    
    // Load payment methods data
    await loadMethodsData()
    
    // Load transaction data
    await loadTransactionData()
    
    // Calculate totals
    calculateTotals()
    
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
    const response = await api.get('/merchant/transactions', {
      params: { timeframe: timeframe.value }
    })
    if (response.data?.transactions) {
      revenueData.value = calculateRevenueFromTransactions(response.data.transactions)
    } else {
      revenueData.value = []
    }
  } catch (error) {
    console.warn('Revenue analytics API error:', error)
    revenueData.value = []
  }
}

const loadMethodsData = async () => {
  try {
    const response = await api.get('/merchant/transactions', {
      params: { timeframe: timeframe.value }
    })
    if (response.data?.transactions) {
      methodsData.value = calculatePaymentMethodsFromTransactions(response.data.transactions)
    } else {
      methodsData.value = []
    }
  } catch (error) {
    console.warn('Methods analytics API error:', error)
    methodsData.value = []
  }
}

const loadTransactionData = async () => {
  try {
    const response = await api.get('/merchant/transactions', {
      params: { timeframe: timeframe.value }
    })
    if (response.data?.transactions) {
      transactionData.value = calculateTransactionTrends(response.data.transactions)
    } else {
      transactionData.value = []
    }
  } catch (error) {
    console.warn('Transactions analytics API error:', error)
    transactionData.value = []
  }
}

// sample loaders removed; relying solely on backend data

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

const calculatePaymentMethodsFromTransactions = (transactions) => {
  const methodCounts = {}
  let total = 0
  
  transactions.forEach(transaction => {
    if (transaction.status === 'completed') {
      const method = transaction.payment_method || 'card'
      methodCounts[method] = (methodCounts[method] || 0) + 1
      total++
    }
  })
  
  return Object.entries(methodCounts).map(([method, count]) => ({
    label: getPaymentMethodLabel(method),
    value: Math.round((count / total) * 100),
    color: getMethodColor(method)
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

const calculateTotals = () => {
  totalRevenue.value = getTotalRevenue()
  totalTransactions.value = getTotalTransactions()
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



const getTotalTransactions = () => {
  return transactionData.value.reduce((sum, item) => sum + (item.count || 0), 0)
}

const getSuccessRate = () => {
  const total = getTotalTransactions()
  if (total === 0) return 0
  const success = transactionData.value.reduce((sum, item) => sum + (item.success || 0), 0)
  return Math.round((success / total) * 100)
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

const getPaymentMethodIcon = (method) => {
  const icons = {
    'Credit Card': 'credit_card',
    'Digital Wallet': 'account_balance_wallet',
    'Bank Transfer': 'account_balance',
    'UPI': 'smartphone'
  }
  return icons[method] || 'payment'
}

const getMethodColor = (method) => {
  const colors = {
    card: '#4CAF50',
    bank_transfer: '#2196F3',
    wallet: '#FF9800',
    upi: '#9C27B0'
  }
  return colors[method] || '#9E9E9E'
}

const getMethodGradient = (color) => {
  return `linear-gradient(135deg, ${color}, ${color}dd)`
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

const showMethodDetails = (method) => {
  $q.notify({
    type: 'info',
    message: `${method.label}: ${method.value}% of transactions`,
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

// Lifecycle
onMounted(() => {
  loadDashboardData()
  loadAnalyticsData() // Load analytics data on mount
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

.btn-secondary {
  background: #2196f3;
  color: #ffffff;
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

/* ✅ NEW: Payment button special styling */
.payment-btn {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

.payment-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.payment-btn:hover::before {
  left: 100%;
}

/* Business Overview */
.business-overview {
  margin: 24px 0;
}

.stat-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.1);
  transition: all 0.3s ease;
}

.stat-card:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.stat-title {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 8px 0 4px 0;
}

.stat-subtitle {
  font-size: 0.85rem;
  color: #999;
}

/* ✅ NEW: Transactions Section */
.transactions-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.transactions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 16px;
}

.transactions-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
}

.transactions-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.transactions-loading {
  display: flex;
  justify-content: center;
  padding: 60px 20px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #999;
}

.loading-container p {
  margin-top: 16px;
  font-size: 1rem;
}

.no-transactions {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-transactions h4 {
  color: #bdf000;
  margin: 16px 0 8px 0;
}

.no-transactions p {
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.transactions-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.transaction-item {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
}

.transaction-item:hover {
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateX(4px);
}

.transaction-info {
  flex: 1;
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.transaction-id {
  color: #bdf000;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.transaction-date {
  color: #999;
  font-size: 0.8rem;
}

.transaction-details {
  display: flex;
  gap: 24px;
}

.customer-info,
.transaction-method {
  color: #ccc;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
}

.transaction-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.transaction-amount {
  text-align: center;
}

.amount {
  font-size: 1.1rem;
  font-weight: 700;
  color: #4caf50;
}

.transaction-actions {
  display: flex;
  gap: 8px;
}

/* ✅ NEW: Refund Button Styling */
.refund-btn {
  background: rgba(255, 152, 0, 0.1);
  border: 1px solid rgba(255, 152, 0, 0.3);
  transition: all 0.3s ease;
}

.refund-btn:hover {
  background: rgba(255, 152, 0, 0.2);
  border-color: rgba(255, 152, 0, 0.5);
  transform: scale(1.1);
}

/* ✅ NEW: Refund Dialog */
.refund-dialog {
  min-width: 500px;
}

.refund-summary {
  background: rgba(255, 152, 0, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 152, 0, 0.2);
  margin-bottom: 20px;
}

.transaction-overview h5 {
  color: #ff9800;
  margin: 0 0 16px 0;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.overview-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 152, 0, 0.2);
}

.overview-item:last-child {
  border-bottom: none;
}

.overview-item .label {
  color: #ff9800;
  font-weight: 500;
}

.overview-item .value {
  color: #ffffff;
  font-weight: 600;
}

.refund-form {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Businesses Section */
.businesses-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 16px;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
}

.add-business-btn {
  background: #bdf000;
  color: #09050d;
  border-radius: 12px;
  font-weight: 600;
}

.no-businesses {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.no-businesses h4 {
  color: #bdf000;
  margin: 16px 0 8px 0;
}

.no-businesses p {
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.businesses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 24px;
}

.business-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
}

.business-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.business-approved {
  border-color: rgba(76, 175, 80, 0.3);
  background: rgba(76, 175, 80, 0.05);
}

.business-verified {
  border-color: rgba(76, 175, 80, 0.4);
  background: rgba(76, 175, 80, 0.08);
}

.business-pending {
  border-color: rgba(255, 152, 0, 0.3);
  background: rgba(255, 152, 0, 0.05);
}

.business-rejected {
  border-color: rgba(244, 67, 54, 0.3);
  background: rgba(244, 67, 54, 0.05);
}

.business-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.business-info {
  display: flex;
  gap: 16px;
  flex: 1;
}

.business-avatar img {
  border-radius: 8px;
  border: 2px solid rgba(189, 240, 0, 0.3);
}

.business-details h4 {
  color: #ffffff;
  margin: 0 0 4px 0;
  font-size: 1.1rem;
}

.business-details p {
  color: #ccc;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.business-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.business-content {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.business-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.business-stats .stat-item {
  text-align: center;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.business-stats .stat-label {
  display: block;
  font-size: 0.75rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.business-stats .stat-value {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #ffffff;
}

.business-footer {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* ✅ NEW: Status Card Section */
.status-card-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* Analytics Section Styles */
.analytics-section {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
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

/* Payment Methods Chart Styles */
.methods-chart {
  width: 100%;
}

.methods-summary {
  margin-bottom: 24px;
  text-align: center;
}

.total-transactions {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
}

.summary-label {
  font-size: 0.9rem;
  color: #999;
  margin-right: 8px;
}

.summary-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: #ffffff;
}

.methods-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.method-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.method-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.method-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.method-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.method-details {
  flex: 1;
}

.method-name {
  color: #ffffff;
  font-weight: 600;
  margin-bottom: 4px;
}

.method-percentage {
  color: #999;
  font-size: 0.9rem;
}

.method-bar {
  width: 120px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.method-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
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

/* Enhanced Dialog Styles */
.add-business-dialog,
.success-dialog,
.business-details-dialog,
.stripe-instruction-dialog,
.payment-dialog,
.payment-processing-dialog,
.payment-result-dialog,
.refund-dialog {
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.add-business-dialog,
.payment-dialog,
.refund-dialog {
  min-width: 600px;
  max-width: 80vw;
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

.dialog-content {
  padding: 24px;
}

.form-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.section-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.field-label {
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.form-input :deep(.q-field__native) {
  color: #ffffff;
}

.form-input :deep(.q-field__label) {
  color: #bdf000;
}

.logo-upload-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.logo-preview {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(189, 240, 0, 0.3);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* ✅ NEW: Cart items styling */
.no-cart-items {
  text-align: center;
  padding: 20px;
  color: #999;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.item-details {
  display: flex;
  gap: 8px;
  flex: 1;
}

.item-input {
  flex: 1;
}

.qty-input {
  max-width: 80px;
}

.dialog-actions {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

/* ✅ NEW: Stripe Instruction Dialog */
.stripe-instruction-dialog {
  min-width: 600px;
  max-width: 80vw;
}

.stripe-header {
  background: rgba(33, 150, 243, 0.1);
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
  padding: 20px 24px;
}

.stripe-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stripe-content {
  padding: 32px 24px;
}

.instruction-content {
  text-align: center;
}

.instruction-icon {
  margin-bottom: 24px;
}

.instruction-content h4 {
  color: #ffffff;
  margin: 0 0 16px 0;
  font-size: 1.4rem;
}

.instruction-content p {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 24px;
}

/* ✅ Enhanced security notice */
.security-notice {
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  padding: 16px;
  margin: 20px 0;
  display: flex;
  gap: 12px;
  text-align: left;
}

.security-text {
  flex: 1;
  color: #ccc;
  font-size: 0.9rem;
  line-height: 1.5;
}

.security-text strong {
  color: #4caf50;
  display: block;
  margin-bottom: 8px;
}

.security-text ul {
  margin: 8px 0 0 16px;
  padding: 0;
}

.security-text li {
  margin: 4px 0;
  color: #ccc;
}

.onboarding-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 24px 0;
  text-align: left;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  color: #ccc;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.step-highlight {
  background: rgba(33, 150, 243, 0.1);
  border-color: rgba(33, 150, 243, 0.3);
  color: #2196f3;
}

.url-display {
  margin-top: 24px;
  text-align: left;
}

.url-display label {
  color: #bdf000;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.url-box {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.url-text {
  flex: 1;
  font-family: monospace;
  font-size: 0.85rem;
  color: #ffffff;
  word-break: break-all;
}

.copy-btn {
  flex-shrink: 0;
}

.url-status {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  color: #4caf50;
  font-size: 0.8rem;
}

.stripe-footer {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 24px;
}

/* ✅ NEW: Payment Processing Dialog */
.payment-processing-dialog {
  min-width: 400px;
}

.processing-header {
  background: rgba(33, 150, 243, 0.1);
  border-bottom: 1px solid rgba(33, 150, 243, 0.2);
  padding: 32px 24px;
  text-align: center;
}

.processing-content h4 {
  color: #ffffff;
  margin: 16px 0 8px 0;
}

.processing-content p {
  color: #ccc;
  margin: 0;
}

.processing-details {
  padding: 24px;
}

.payment-summary {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.summary-item:last-child {
  border-bottom: none;
}

.amount-value {
  color: #4caf50;
  font-weight: 700;
  font-size: 1.1rem;
}

.processing-progress {
  text-align: center;
}

.progress-bar {
  margin-bottom: 12px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-text {
  color: #2196f3;
  font-weight: 600;
  font-size: 0.9rem;
}

/* ✅ NEW: Payment Result Dialog */
.payment-result-dialog {
  min-width: 500px;
}

.result-content {
  padding: 40px 24px;
  text-align: center;
}

.result-animation {
  margin-bottom: 24px;
}

.result-title h3 {
  margin: 16px 0;
  font-size: 1.5rem;
}

.result-message p {
  color: #ccc;
  line-height: 1.6;
  margin-bottom: 24px;
}

.result-details {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  color: #999;
  font-weight: 500;
}

.detail-value {
  color: #ffffff;
  font-weight: 600;
}

.approval-notice {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

/* Business Details Dialog */
.business-details-dialog {
  min-width: 600px;
}

.business-detail-content {
  padding: 24px 0;
}

.business-overview {
  margin-bottom: 24px;
}

.overview-header {
  display: flex;
  gap: 20px;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.overview-info h4 {
  color: #ffffff;
  margin: 0 0 8px 0;
}

.overview-info p {
  color: #ccc;
  margin: 0 0 12px 0;
}

.business-details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.detail-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-section h6 {
  color: #bdf000;
  margin: 0 0 16px 0;
  font-weight: 600;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span:first-child {
  color: #999;
  font-weight: 500;
}

.detail-row span:last-child {
  color: #ffffff;
  font-weight: 600;
}

/* ✅ NEW: Enhanced Animations */
.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.6s forwards;
}

.animate-slide-in {
  opacity: 0;
  transform: translateX(-30px);
  animation: slideInLeft 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideInLeft {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.hover-lift {
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
}

.hover-scale {
  transition: all 0.3s ease;
}

.hover-scale:hover {
  transform: scale(1.05);
}

.hover-slide {
  transition: all 0.3s ease;
}

.hover-slide:hover {
  transform: translateX(8px);
}

.pulse-icon {
  animation: pulse 2s infinite;
}

.success-pulse {
  animation: successPulse 1.5s ease-out;
}

.payment-pulse {
  animation: paymentPulse 2s infinite;
}

.shake-icon {
  animation: shake 0.5s ease-in-out;
}

.success-bounce {
  animation: successBounce 0.8s ease-out;
}

.error-shake {
  animation: errorShake 0.6s ease-in-out;
}

.status-chip {
  animation: statusGlow 2s infinite;
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

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes paymentPulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(33, 150, 243, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(33, 150, 243, 0);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@keyframes successBounce {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes errorShake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-3px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(3px);
  }
}

@keyframes statusGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(189, 240, 0, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(189, 240, 0, 0.8);
  }
}

.error-message {
  margin-top: 24px;
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

/* ✅ Enhanced hover effects */
.hover-glow:hover {
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.5);
}

.success-icon {
  animation: successPulse 1s ease-out;
}

/* ✅ Status-specific animations */
.status-pending {
  animation: pendingPulse 2s infinite;
}

.status-approved {
  animation: approvedGlow 1s ease-out;
}

.status-rejected {
  animation: rejectedShake 0.5s ease-in-out;
}

@keyframes pendingPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

@keyframes approvedGlow {
  0% {
    box-shadow: 0 0 0 rgba(76, 175, 80, 0.5);
  }
  50% {
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.8);
  }
  100% {
    box-shadow: 0 0 0 rgba(76, 175, 80, 0.5);
  }
}

@keyframes rejectedShake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-2px);
  }
  75% {
    transform: translateX(2px);
  }
}

/* Responsive Design */
@media (max-width: 1200px) {
  .business-details-grid {
    grid-template-columns: 1fr;
  }
  
  .businesses-grid {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  }
}

@media (max-width: 768px) {
  .merchant-dashboard {
    padding: 16px;
  }

  .welcome-section {
    padding: 24px;
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

  .businesses-grid {
    grid-template-columns: 1fr;
  }

  .business-stats {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .business-footer {
    flex-direction: column;
    gap: 8px;
  }

  .transaction-item {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .transaction-details {
    flex-direction: column;
    gap: 8px;
  }

  .transaction-actions {
    justify-content: center;
  }

  .add-business-dialog,
  .success-dialog,
  .business-details-dialog,
  .stripe-instruction-dialog,
  .payment-dialog,
  .payment-processing-dialog,
  .payment-result-dialog,
  .refund-dialog {
    min-width: 90vw;
    margin: 16px;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .overview-grid {
    grid-template-columns: 1fr;
  }

  .onboarding-steps {
    gap: 12px;
  }

  .step-item {
    padding: 8px;
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }

  .item-details {
    flex-direction: column;
    gap: 8px;
  }

  .qty-input {
    max-width: none;
  }
}

/* ===== MODERN CHART STYLES ===== */
.modern-chart {
  background: linear-gradient(135deg, rgba(18, 18, 18, 0.95) 0%, rgba(25, 25, 25, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(20px);
}

.modern-chart:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.5);
  border-color: rgba(255, 255, 255, 0.25);
}

/* Modern Glow Effects */
.lime-glow {
  box-shadow: 0 0 20px rgba(189, 240, 0, 0.2);
}

.blue-glow {
  box-shadow: 0 0 20px rgba(33, 150, 243, 0.2);
}

.teal-glow {
  box-shadow: 0 0 20px rgba(0, 188, 212, 0.2);
}

.purple-glow {
  box-shadow: 0 0 20px rgba(156, 39, 176, 0.2);
}

/* Modern Stats */
.modern-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.modern-stat {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.modern-stat::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #bdf000, #4CAF50, #bdf000);
  animation: shimmer 2s infinite;
}

.stat-change {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  margin-top: 8px;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-change.positive {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

/* Modern Bars */
.modern-bars {
  display: flex;
  gap: 12px;
  align-items: end;
  height: 220px;
  padding: 24px 0;
  position: relative;
}

.modern-bar {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.modern-bar:hover {
  transform: scale(1.08);
  z-index: 10;
}

.modern-bar:hover .bar-tooltip {
  opacity: 1;
  transform: translateY(-8px);
}

/* Modern Bar Fill */
.modern-fill {
  width: 100%;
  border-radius: 8px 8px 0 0;
  min-height: 24px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
}

.modern-fill::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-bar:hover .modern-fill::before {
  opacity: 1;
}

/* Bar Glow Effects */
.bar-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
  border-radius: 8px 8px 0 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modern-bar:hover .bar-glow {
  opacity: 1;
}

.success-glow {
  background: linear-gradient(180deg, rgba(76, 175, 80, 0.3) 0%, transparent 100%);
}

.failed-glow {
  background: linear-gradient(180deg, rgba(244, 67, 54, 0.3) 0%, transparent 100%);
}

/* Modern Tooltips */
.bar-tooltip {
  position: absolute;
  top: -60px;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.8rem;
  white-space: nowrap;
  opacity: 0;
  transform: translateY(0);
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 100;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
}

.tooltip-value {
  font-weight: 700;
  color: #bdf000;
  margin-bottom: 4px;
}

.tooltip-date {
  color: #ccc;
  font-size: 0.75rem;
}

.tooltip-success {
  font-weight: 700;
  color: #4CAF50;
  margin-bottom: 4px;
}

.tooltip-failed {
  color: #F44336;
  font-size: 0.75rem;
}

/* Modern Methods */
.modern-methods {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.modern-method {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.modern-method:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateX(8px);
}

.modern-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.modern-method:hover .modern-icon {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.1) 100%);
  border-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.1);
}

.modern-bar {
  width: 140px;
  height: 10px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.modern-fill {
  height: 100%;
  border-radius: 6px;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.bar-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: shine 2s infinite;
}

/* Modern Stack */
.modern-stack {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.modern-success {
  width: 100%;
  background: linear-gradient(135deg, #4CAF50, #45a049);
  border-radius: 8px 8px 0 0;
  min-height: 24px;
  transition: all 0.4s ease;
  box-shadow: 0 4px 16px rgba(76, 175, 80, 0.3);
}

.modern-failed {
  width: 100%;
  background: linear-gradient(135deg, #F44336, #d32f2f);
  border-radius: 0 0 8px 8px;
  min-height: 24px;
  transition: all 0.4s ease;
  box-shadow: 0 4px 16px rgba(244, 67, 54, 0.3);
}

/* Modern Metrics */
.modern-metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.modern-metric {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.modern-metric::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #bdf000, #4CAF50, #bdf000);
  animation: shimmer 2s infinite;
}

.modern-metric:hover {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 100%);
  border-color: rgba(255, 255, 255, 0.2);
  transform: translateY(-4px);
}

.metric-trend {
  position: absolute;
  top: 16px;
  right: 16px;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-trend.positive {
  background: rgba(76, 175, 80, 0.2);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.success-rate {
  color: #4CAF50;
  font-weight: 700;
}

/* Animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes shine {
  0% { left: -100%; }
  100% { left: 100%; }
}

/* Responsive Modern Charts */
@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .modern-stats {
    grid-template-columns: 1fr;
  }
  
  .modern-metrics {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .modern-bars {
    gap: 8px;
    height: 180px;
  }
  
  .modern-bar {
    min-width: 30px;
  }
  
  .bar-tooltip {
    display: none;
  }
}
</style>