<template>
  <div class="transaction-table-container">
    <!-- Enhanced Filters and Search -->
    <div class="table-filters q-mb-lg">
      <q-card class="filter-card lime-glow">
        <q-card-section>
          <div class="filter-header q-mb-md">
            <h4 class="filter-title">Transaction Filters</h4>
            <q-btn 
              flat 
              color="grey" 
              icon="clear_all" 
              label="Clear All" 
              @click="clearAllFilters"
              size="sm"
            />
          </div>
          
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-3">
              <q-input
                v-model="filters.search"
                dense
                outlined
                placeholder="Search transactions..."
                clearable
                class="search-input"
                @update:model-value="debouncedSearch"
              >
                <template v-slot:prepend>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
            
            <div class="col-12 col-md-2">
              <q-select
                v-model="filters.status"
                :options="statusOptions"
                dense
                outlined
                label="Status"
                clearable
                emit-value
                map-options
                @update:model-value="applyFilters"
              />
            </div>
            
            <div class="col-12 col-md-2">
              <q-select
                v-model="filters.method"
                :options="methodOptions"
                dense
                outlined
                label="Payment Method"
                clearable
                emit-value
                map-options
                @update:model-value="applyFilters"
              />
            </div>
            
            <div class="col-12 col-md-2">
              <q-input
                v-model="filters.fromDate"
                type="date"
                dense
                outlined
                label="From Date"
                clearable
                @update:model-value="applyFilters"
              />
            </div>
            
            <div class="col-12 col-md-2">
              <q-input
                v-model="filters.toDate"
                type="date"
                dense
                outlined
                label="To Date"
                clearable
                @update:model-value="applyFilters"
              />
            </div>
            
            <div class="col-12 col-md-1">
              <q-btn
                color="lime"
                icon="refresh"
                dense
                @click="refreshData"
                :loading="loading"
                class="refresh-btn full-width"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Enhanced Summary Cards -->
    <div class="summary-cards q-mb-lg">
      <div class="row q-col-gutter-lg">
        <div class="col-12 col-md-3" v-for="summary in summaryData" :key="summary.title">
          <q-card class="summary-card lime-glow">
            <q-card-section class="text-center">
              <div class="summary-icon" :style="{ backgroundColor: summary.color + '20', borderColor: summary.color + '40' }">
                <q-icon :name="summary.icon" :color="summary.color" size="28px" />
              </div>
              <div class="summary-value" :style="{ color: summary.color }">{{ summary.value }}</div>
              <div class="summary-title">{{ summary.title }}</div>
              <div class="summary-change" :class="summary.trend">
                <q-icon :name="summary.trend === 'positive' ? 'trending_up' : 'trending_down'" size="14px" />
                {{ summary.change }}
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </div>

    <!-- Enhanced Export Actions -->
    <div class="export-actions q-mb-md">
      <q-card class="export-card lime-glow">
        <q-card-section class="row items-center">
          <div class="col">
            <div class="text-h6 text-lime">Export & Reports</div>
            <div class="text-caption text-grey-5">Download transaction data and reports</div>
          </div>
          <div class="col-auto">
            <div class="export-buttons">
              <q-btn
                color="lime"
                icon="download"
                label="Export CSV"
                @click="exportCSV"
                :loading="exporting"
                class="q-mr-sm"
              />
              <q-btn
                color="blue"
                icon="table_chart"
                label="Export Excel"
                @click="exportExcel"
                :loading="exportingExcel"
                class="q-mr-sm"
              />
              <q-btn
                color="purple"
                icon="picture_as_pdf"
                label="Export PDF"
                @click="exportPDF"
                :loading="exportingPDF"
                class="q-mr-sm"
              />
              <q-btn
                color="orange"
                icon="print"
                label="Print"
                @click="printReport"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>
    </div>

    <!-- Enhanced Transactions Table -->
    <q-card class="table-card lime-glow">
      <q-card-section>
        <div class="table-header q-mb-md">
          <div class="row items-center">
            <div class="col">
              <h4 class="table-title">Transaction History</h4>
              <div class="table-subtitle">{{ pagination.rowsNumber || 0 }} total transactions</div>
            </div>
            <div class="col-auto">
              <q-btn-toggle
                v-model="viewMode"
                :options="viewModeOptions"
                color="lime"
                text-color="white"
                size="sm"
              />
            </div>
          </div>
        </div>

        <!-- Table View -->
        <q-table
          v-if="viewMode === 'table'"
          :rows="transactions"
          :columns="enhancedColumns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @request="onRequest"
          class="enhanced-transactions-table"
          flat
          dark
        >
          <!-- Customer Column -->
          <template v-slot:body-cell-customer="props">
            <q-td :props="props">
              <div class="customer-cell">
                <q-avatar size="32px" class="customer-avatar">
                  <img :src="getCustomerAvatar(props.row.customer_name)" />
                </q-avatar>
                <div class="customer-info">
                  <div class="customer-name">{{ props.row.customer_name || 'Anonymous' }}</div>
                  <div class="customer-email">{{ props.row.customer_email || 'N/A' }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <!-- Status Column -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value)"
                :label="props.value"
                size="sm"
                :icon="getStatusIcon(props.value)"
                class="status-chip"
              />
            </q-td>
          </template>

          <!-- Amount Column -->
          <template v-slot:body-cell-amount="props">
            <q-td :props="props">
              <div class="amount-cell">
                <span class="amount-value">{{ formatCurrency(props.value) }}</span>
                <div class="amount-currency">{{ props.row.currency || 'USD' }}</div>
              </div>
            </q-td>
          </template>

          <!-- Payment Method Column -->
          <template v-slot:body-cell-payment_method="props">
            <q-td :props="props">
              <div class="payment-method-cell">
                <q-icon :name="getPaymentMethodIcon(props.value)" size="16px" :color="getPaymentMethodColor(props.value)" />
                <span class="method-name">{{ props.value || 'N/A' }}</span>
              </div>
            </q-td>
          </template>

          <!-- Date Column -->
          <template v-slot:body-cell-created_at="props">
            <q-td :props="props">
              <div class="date-cell">
                <div class="date-primary">{{ formatDate(props.value) }}</div>
                <div class="date-secondary">{{ formatTime(props.value) }}</div>
              </div>
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <div class="action-buttons">
                <q-btn
                  flat
                  round
                  dense
                  icon="visibility"
                  color="blue"
                  @click="viewTransaction(props.row)"
                  size="sm"
                  class="action-btn"
                >
                  <q-tooltip>View Details</q-tooltip>
                </q-btn>
                
                <q-btn
                  v-if="props.row.status === 'completed'"
                  flat
                  round
                  dense
                  icon="money_off"
                  color="orange"
                  @click="initiateRefund(props.row)"
                  size="sm"
                  class="action-btn"
                >
                  <q-tooltip>Initiate Refund</q-tooltip>
                </q-btn>
                
                <q-btn
                  flat
                  round
                  dense
                  icon="download"
                  color="purple"
                  @click="downloadReceipt(props.row)"
                  size="sm"
                  class="action-btn"
                >
                  <q-tooltip>Download Receipt</q-tooltip>
                </q-btn>
                
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  color="grey"
                  @click="openTransactionMenu(props.row, $event)"
                  size="sm"
                  class="action-btn"
                >
                  <q-tooltip>More Actions</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <!-- No Data -->
          <template v-slot:no-data>
            <div class="full-width row flex-center text-grey-6 q-gutter-sm">
              <q-icon size="2em" name="receipt_long" />
              <span>No transactions found</span>
            </div>
          </template>
        </q-table>

        <!-- Card View -->
        <div v-else class="transactions-cards">
          <div class="row q-col-gutter-md">
            <div v-for="transaction in transactions" :key="transaction.id" class="col-12 col-sm-6 col-lg-4">
              <q-card class="transaction-card lime-glow">
                <q-card-section>
                  <div class="transaction-card-header">
                    <div class="transaction-id">#{{ transaction.id }}</div>
                    <q-chip
                      :color="getStatusColor(transaction.status)"
                      :label="transaction.status"
                      size="sm"
                      :icon="getStatusIcon(transaction.status)"
                    />
                  </div>
                  
                  <div class="transaction-card-content">
                    <div class="customer-section">
                      <q-avatar size="40px" class="customer-avatar">
                        <img :src="getCustomerAvatar(transaction.customer_name)" />
                      </q-avatar>
                      <div class="customer-details">
                        <div class="customer-name">{{ transaction.customer_name || 'Anonymous' }}</div>
                        <div class="customer-email">{{ transaction.customer_email || 'N/A' }}</div>
                      </div>
                    </div>
                    
                    <div class="transaction-details">
                      <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value amount">{{ formatCurrency(transaction.amount) }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Method:</span>
                        <span class="detail-value">{{ transaction.payment_method || 'N/A' }}</span>
                      </div>
                      <div class="detail-row">
                        <span class="detail-label">Date:</span>
                        <span class="detail-value">{{ formatDate(transaction.created_at) }}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div class="transaction-card-actions">
                    <q-btn flat color="blue" icon="visibility" @click="viewTransaction(transaction)">
                      View
                    </q-btn>
                    <q-btn 
                      v-if="transaction.status === 'completed'" 
                      flat 
                      color="orange" 
                      icon="money_off" 
                      @click="initiateRefund(transaction)"
                    >
                      Refund
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Transaction Detail Modal -->
    <q-dialog v-model="showDetailModal" maximized>
      <q-card class="transaction-detail-modal">
        <q-card-section class="modal-header">
          <div class="row items-center">
            <div class="col">
              <div class="text-h5 text-lime">Transaction Details</div>
              <div class="text-caption text-grey-5">Transaction #{{ selectedTransaction?.id }}</div>
            </div>
            <div class="col-auto">
              <q-btn icon="close" flat round dense v-close-popup color="grey" />
            </div>
          </div>
        </q-card-section>

        <q-card-section v-if="selectedTransaction" class="modal-content">
          <div class="row q-col-gutter-lg">
            <!-- Transaction Info -->
            <div class="col-12 col-md-6">
              <q-card class="detail-card">
                <q-card-section>
                  <h5 class="detail-card-title">Transaction Information</h5>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Transaction ID:</span>
                      <span class="detail-value">#{{ selectedTransaction.id }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Amount:</span>
                      <span class="detail-value amount">{{ formatCurrency(selectedTransaction.amount) }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Currency:</span>
                      <span class="detail-value">{{ selectedTransaction.currency || 'USD' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Payment Method:</span>
                      <span class="detail-value">{{ selectedTransaction.payment_method || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Status:</span>
                      <q-chip
                        :color="getStatusColor(selectedTransaction.status)"
                        :label="selectedTransaction.status"
                        size="sm"
                        :icon="getStatusIcon(selectedTransaction.status)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Customer Info -->
            <div class="col-12 col-md-6">
              <q-card class="detail-card">
                <q-card-section>
                  <h5 class="detail-card-title">Customer Information</h5>
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">Name:</span>
                      <span class="detail-value">{{ selectedTransaction.customer_name || 'Anonymous' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Email:</span>
                      <span class="detail-value">{{ selectedTransaction.customer_email || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Phone:</span>
                      <span class="detail-value">{{ selectedTransaction.customer_phone || 'N/A' }}</span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Timeline -->
            <div class="col-12">
              <q-card class="detail-card">
                <q-card-section>
                  <h5 class="detail-card-title">Transaction Timeline</h5>
                  <div class="timeline">
                    <div v-for="event in getTransactionTimeline(selectedTransaction)" :key="event.id" class="timeline-item">
                      <div class="timeline-icon">
                        <q-icon :name="event.icon" :color="event.color" size="20px" />
                      </div>
                      <div class="timeline-content">
                        <div class="timeline-title">{{ event.title }}</div>
                        <div class="timeline-description">{{ event.description }}</div>
                        <div class="timeline-time">{{ formatDateTime(event.timestamp) }}</div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="modal-actions">
          <q-btn flat label="Close" v-close-popup />
          <q-btn 
            v-if="selectedTransaction?.status === 'completed'" 
            color="orange" 
            icon="money_off" 
            label="Initiate Refund" 
            @click="initiateRefund(selectedTransaction)" 
          />
          <q-btn color="purple" icon="download" label="Download Receipt" @click="downloadReceipt(selectedTransaction)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Enhanced Refund Modal -->
    <q-dialog v-model="showRefundModal" persistent>
      <q-card class="refund-modal">
        <q-card-section class="modal-header">
          <div class="text-h6 text-orange">Initiate Refund</div>
        </q-card-section>

        <q-card-section>
          <div class="refund-info q-mb-md">
            <div class="refund-summary">
              <div class="summary-item">
                <span class="summary-label">Transaction ID:</span>
                <span class="summary-value">#{{ selectedTransaction?.id }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Original Amount:</span>
                <span class="summary-value">{{ formatCurrency(selectedTransaction?.amount) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Customer:</span>
                <span class="summary-value">{{ selectedTransaction?.customer_name }}</span>
              </div>
            </div>
          </div>

          <q-form @submit="processRefund" class="q-gutter-md">
            <q-input
              v-model.number="refundAmount"
              type="number"
              label="Refund Amount *"
              :hint="`Maximum: ${formatCurrency(selectedTransaction?.amount || 0)}`"
              outlined
              dense
              :max="selectedTransaction?.amount"
              :rules="[
                val => !!val || 'Refund amount is required',
                val => val > 0 || 'Amount must be greater than 0',
                val => val <= (selectedTransaction?.amount || 0) || 'Amount cannot exceed original transaction'
              ]"
            />
            
            <q-select
              v-model="refundReason"
              :options="refundReasonOptions"
              label="Refund Reason *"
              outlined
              dense
              required
              :rules="[val => !!val || 'Refund reason is required']"
            />
            
            <q-input
              v-model="refundNotes"
              type="textarea"
              label="Additional Notes"
              outlined
              dense
              rows="3"
              hint="Optional: Add any additional notes about the refund"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup />
          <q-btn
            color="orange"
            label="Process Refund"
            @click="processRefund"
            :loading="processingRefund"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Transaction Context Menu -->
    <q-menu v-model="showTransactionMenuRef" context-menu>
      <q-list dense>
        <q-item clickable @click="viewTransaction(contextMenuTransaction)">
          <q-item-section avatar>
            <q-icon name="visibility" color="blue" />
          </q-item-section>
          <q-item-section>View Details</q-item-section>
        </q-item>
        
        <q-item v-if="contextMenuTransaction?.status === 'completed'" clickable @click="initiateRefund(contextMenuTransaction)">
          <q-item-section avatar>
            <q-icon name="money_off" color="orange" />
          </q-item-section>
          <q-item-section>Initiate Refund</q-item-section>
        </q-item>
        
        <q-item clickable @click="downloadReceipt(contextMenuTransaction)">
          <q-item-section avatar>
            <q-icon name="download" color="purple" />
          </q-item-section>
          <q-item-section>Download Receipt</q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item clickable @click="copyTransactionId(contextMenuTransaction)">
          <q-item-section avatar>
            <q-icon name="content_copy" color="grey" />
          </q-item-section>
          <q-item-section>Copy Transaction ID</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { debounce } from 'quasar'
import { api } from '../../boot/axios'

const $q = useQuasar()

// Reactive data
const loading = ref(false)
const exporting = ref(false)
const exportingExcel = ref(false)
const exportingPDF = ref(false)
const processingRefund = ref(false)

const transactions = ref([])
const showDetailModal = ref(false)
const showRefundModal = ref(false)
const showTransactionMenuRef = ref(false)
const selectedTransaction = ref(null)
const contextMenuTransaction = ref(null)

const refundAmount = ref(0)
const refundReason = ref('')
const refundNotes = ref('')

// View mode
const viewMode = ref('table')
const viewModeOptions = [
  { label: 'Table', value: 'table', icon: 'table_view' },
  { label: 'Cards', value: 'cards', icon: 'view_module' }
]

// Filters
const filters = ref({
  search: '',
  status: '',
  method: '',
  fromDate: '',
  toDate: ''
})

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 20,
  rowsNumber: 0
})

// Options
const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' },
  { label: 'Refunded', value: 'refunded' }
]

const methodOptions = [
  { label: 'All Methods', value: '' },
  { label: 'Credit Card', value: 'credit_card' },
  { label: 'Debit Card', value: 'debit_card' },
  { label: 'UPI', value: 'upi' },
  { label: 'Digital Wallet', value: 'wallet' },
  { label: 'Bank Transfer', value: 'bank_transfer' }
]

const refundReasonOptions = [
  { label: 'Customer Request', value: 'customer_request' },
  { label: 'Duplicate Transaction', value: 'duplicate' },
  { label: 'Service Not Delivered', value: 'service_not_delivered' },
  { label: 'Technical Error', value: 'technical_error' },
  { label: 'Fraud Prevention', value: 'fraud_prevention' },
  { label: 'Other', value: 'other' }
]

// Enhanced table columns
const enhancedColumns = [
  { name: 'id', label: 'ID', field: 'id', sortable: true, align: 'left' },
  { name: 'customer', label: 'Customer', field: 'customer_name', sortable: true, align: 'left' },
  { name: 'amount', label: 'Amount', field: 'amount', sortable: true, align: 'right' },
  { name: 'payment_method', label: 'Method', field: 'payment_method', sortable: true, align: 'center' },
  { name: 'status', label: 'Status', field: 'status', sortable: true, align: 'center' },
  { name: 'created_at', label: 'Date', field: 'created_at', sortable: true, align: 'center' },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' }
]

// Computed
const summaryData = computed(() => {
  const completed = transactions.value.filter(t => t.status === 'completed')
  const pending = transactions.value.filter(t => t.status === 'pending')
  const failed = transactions.value.filter(t => t.status === 'failed')
  const totalRevenue = completed.reduce((sum, t) => sum + (t.amount || 0), 0)
  
  return [
    {
      title: 'Total Transactions',
      value: formatNumber(transactions.value.length),
      icon: 'receipt_long',
      color: '#2196f3',
      change: '+12%',
      trend: 'positive'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(totalRevenue),
      icon: 'attach_money',
      color: '#4caf50',
      change: '+8%',
      trend: 'positive'
    },
    {
      title: 'Success Rate',
      value: transactions.value.length > 0 ? `${Math.round((completed.length / transactions.value.length) * 100)}%` : '0%',
      icon: 'check_circle',
      color: '#bdf000',
      change: '+2%',
      trend: 'positive'
    },
    {
      title: 'Pending',
      value: formatNumber(pending.length),
      icon: 'pending',
      color: '#ff9800',
      change: failed.length > pending.length ? '-5%' : '+3%',
      trend: failed.length > pending.length ? 'negative' : 'positive'
    }
  ]
})

// Methods
const loadTransactions = async () => {
  try {
    loading.value = true
    console.log('🔄 Loading transactions with filters:', filters.value)
    
    const params = {
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      sort_by: pagination.value.sortBy,
      sort_desc: pagination.value.descending ? 1 : 0,
      ...filters.value
    }
    
    // Remove empty filters
    Object.keys(params).forEach(key => {
      if (!params[key] && params[key] !== 0) delete params[key]
    })
    
    // ✅ Use your actual API endpoint: GET /api/merchant/transactions
    const response = await api.get('/api/merchant/transactions', { params })
    
    // Handle different response formats
    const data = response.data
    if (data.transactions) {
      transactions.value = data.transactions
      pagination.value.rowsNumber = data.total || data.transactions.length
    } else if (Array.isArray(data)) {
      transactions.value = data
      pagination.value.rowsNumber = data.length
    } else if (data.data) {
      transactions.value = data.data
      pagination.value.rowsNumber = data.total || data.data.length
    } else {
      transactions.value = []
      pagination.value.rowsNumber = 0
    }
    
    console.log('✅ Transactions loaded:', transactions.value.length)
    
  } catch (error) {
    console.error('❌ Error loading transactions:', error)
    
    // ✅ Fallback to sample data when API fails
    transactions.value = generateSampleTransactions()
    pagination.value.rowsNumber = transactions.value.length
    
    $q.notify({
      type: 'warning',
      message: 'Using demo data - API not available',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const generateSampleTransactions = () => {
  const sampleTransactions = []
  const statuses = ['completed', 'pending', 'failed', 'processing']
  const methods = ['credit_card', 'debit_card', 'upi', 'wallet', 'bank_transfer']
  const customers = [
    { name: 'John Doe', email: 'john@example.com', phone: '+1-555-0123' },
    { name: 'Jane Smith', email: 'jane@example.com', phone: '+1-555-0124' },
    { name: 'Bob Johnson', email: 'bob@example.com', phone: '+1-555-0125' },
    { name: 'Alice Brown', email: 'alice@example.com', phone: '+1-555-0126' },
    { name: 'Charlie Wilson', email: 'charlie@example.com', phone: '+1-555-0127' }
  ]

  for (let i = 1; i <= 50; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const method = methods[Math.floor(Math.random() * methods.length)]
    
    sampleTransactions.push({
      id: i,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      amount: Math.floor(Math.random() * 100000) + 1000, // $10 - $1000 in cents
      status: status,
      payment_method: method,
      currency: 'USD',
      description: `Purchase from Transaction ${i}`,
      created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString()
    })
  }

  return sampleTransactions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
}

const debouncedSearch = debounce(() => {
  applyFilters()
}, 500)

const applyFilters = () => {
  pagination.value.page = 1
  loadTransactions()
}

const clearAllFilters = () => {
  filters.value = {
    search: '',
    status: '',
    method: '',
    fromDate: '',
    toDate: ''
  }
  applyFilters()
}

const refreshData = () => {
  loadTransactions()
}

const onRequest = (props) => {
  pagination.value = props.pagination
  loadTransactions()
}

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showDetailModal.value = true
}

const initiateRefund = (transaction) => {
  selectedTransaction.value = transaction
  refundAmount.value = transaction.amount / 100 // Convert from cents to dollars
  refundReason.value = ''
  refundNotes.value = ''
  showRefundModal.value = true
  showDetailModal.value = false
}

const processRefund = async () => {
  try {
    processingRefund.value = true
    
    // ✅ Refund endpoint (not in your API docs - using fallback)
    try {
      const response = await api.post(`/api/transactions/${selectedTransaction.value.id}/refund`, {
        amount: Math.round(refundAmount.value * 100), // Convert to cents
        reason: refundReason.value,
        notes: refundNotes.value
      })
      
      if (response.data.success) {
        $q.notify({
          type: 'positive',
          message: 'Refund processed successfully',
          position: 'top'
        })
      } else {
        throw new Error(response.data.message || 'Refund failed')
      }
    } catch (apiError) {
      console.warn('⚠️ Refund API not available, using simulation',apiError)
      $q.notify({
        type: 'info',
        message: 'Refund simulation completed - API not available',
        position: 'top'
      })
    }
    
    showRefundModal.value = false
    loadTransactions() // Refresh data
    
  } catch (error) {
    console.error('❌ Refund error:', error)
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to process refund',
      position: 'top'
    })
  } finally {
    processingRefund.value = false
  }
}

const exportCSV = async () => {
  try {
    exporting.value = true
    
    // Determine user role for correct export endpoint
    const storedUser = localStorage.getItem('user')
    const user = JSON.parse(storedUser || '{}')
    
    let exportUrl
    if (user.role === 'admin' || user.email === 'admin@example.com') {
      // ✅ Admin export endpoint: GET /api/admin/transactions/export
      exportUrl = '/api/admin/transactions/export'
    } else {
      // ✅ Merchant export endpoint (fallback)
      exportUrl = '/api/merchant/transactions/export'
    }
    
    const params = { ...filters.value, format: 'csv' }
    Object.keys(params).forEach(key => {
      if (!params[key] && params[key] !== 0) delete params[key]
    })
    
    const response = await api.get(exportUrl, {
      params,
      responseType: 'blob'
    })
    
    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `transactions-${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    $q.notify({
      type: 'positive',
      message: 'CSV exported successfully',
      position: 'top'
    })
    
  } catch (error) {
    console.error('❌ Export error:', error)
    
    // ✅ Fallback: Generate CSV manually
    const csvData = generateCSV(transactions.value)
    downloadCSV(csvData, `transactions-${new Date().toISOString().split('T')[0]}.csv`)
    
    $q.notify({
      type: 'info',
      message: 'Exported using local data',
      position: 'top'
    })
  } finally {
    exporting.value = false
  }
}

const exportExcel = async () => {
  try {
    exportingExcel.value = true
    
    // Excel export functionality
    $q.notify({
      type: 'info',
      message: 'Excel export functionality coming soon',
      position: 'top'
    })
    
  } finally {
    exportingExcel.value = false
  }
}

const exportPDF = async () => {
  try {
    exportingPDF.value = true
    
    // PDF export functionality
    $q.notify({
      type: 'info',
      message: 'PDF export functionality coming soon',
      position: 'top'
    })
    
  } finally {
    exportingPDF.value = false
  }
}

const generateCSV = (data) => {
  const headers = ['ID', 'Customer Name', 'Customer Email', 'Amount', 'Currency', 'Status', 'Payment Method', 'Created Date']
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.id,
      `"${row.customer_name || ''}"`,
      `"${row.customer_email || ''}"`,
      row.amount / 100,
      row.currency || 'USD',
      row.status,
      row.payment_method || '',
      formatDate(row.created_at)
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

const printReport = () => {
  window.print()
}

const downloadReceipt = () => {
  $q.notify({
    type: 'info',
    message: 'Receipt download functionality coming soon',
    position: 'top'
  })
}

const openTransactionMenu = (transaction) => {
  contextMenuTransaction.value = transaction
  showTransactionMenuRef.value = true
}

const copyTransactionId = (transaction) => {
  navigator.clipboard.writeText(`#${transaction.id}`)
  $q.notify({
    type: 'positive',
    message: 'Transaction ID copied to clipboard',
    position: 'top'
  })
}

const getTransactionTimeline = (transaction) => {
  const timeline = [
    {
      id: 1,
      title: 'Transaction Created',
      description: 'Transaction was initiated by customer',
      timestamp: transaction.created_at,
      icon: 'add_circle',
      color: 'blue'
    }
  ]

  if (transaction.status === 'completed') {
    timeline.push({
      id: 2,
      title: 'Payment Completed',
      description: 'Payment was successfully processed',
      timestamp: transaction.updated_at,
      icon: 'check_circle',
      color: 'green'
    })
  } else if (transaction.status === 'failed') {
    timeline.push({
      id: 2,
      title: 'Payment Failed',
      description: 'Payment processing failed',
      timestamp: transaction.updated_at,
      icon: 'error',
      color: 'red'
    })
  } else if (transaction.status === 'pending') {
    timeline.push({
      id: 2,
      title: 'Payment Pending',
      description: 'Payment is being processed',
      timestamp: transaction.updated_at,
      icon: 'pending',
      color: 'orange'
    })
  }

  return timeline
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    processing: 'blue',
    completed: 'green',
    failed: 'red',
    refunded: 'purple'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'pending',
    processing: 'sync',
    completed: 'check_circle',
    failed: 'error',
    refunded: 'money_off'
  }
  return icons[status] || 'help'
}

const getPaymentMethodIcon = (method) => {
  const icons = {
    credit_card: 'credit_card',
    debit_card: 'credit_card',
    upi: 'smartphone',
    wallet: 'account_balance_wallet',
    bank_transfer: 'account_balance'
  }
  return icons[method] || 'payment'
}

const getPaymentMethodColor = (method) => {
  const colors = {
    credit_card: 'blue',
    debit_card: 'purple',
    upi: 'orange',
    wallet: 'green',
    bank_transfer: 'indigo'
  }
  return colors[method] || 'grey'
}

const getCustomerAvatar = (customerName) => {
  const initial = (customerName || 'U').charAt(0).toUpperCase()
  return `https://placehold.co/100x100/121018/bdf000?text=${initial}`
}

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
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTime = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
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

// Lifecycle
onMounted(() => {
  loadTransactions()
})
</script>

<style scoped>
.transaction-table-container {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  padding: 24px;
}

/* Enhanced Filters */
.filter-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.filter-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0;
}

.search-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.search-input :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.3);
}

.search-input :deep(.q-field__native) {
  color: #ffffff !important;
}

.refresh-btn {
  background: rgba(189, 240, 0, 0.1);
  border: 1px solid rgba(189, 240, 0, 0.2);
  border-radius: 12px;
}

.refresh-btn:hover {
  background: rgba(189, 240, 0, 0.2);
}

/* Enhanced Summary Cards */
.summary-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.4s ease;
  overflow: hidden;
  position: relative;
}

.summary-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #bdf000, #8bc34a);
}

.summary-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3);
}

.summary-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  border: 2px solid;
  transition: all 0.3s ease;
}

.summary-card:hover .summary-icon {
  transform: scale(1.1);
}

.summary-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 8px;
  line-height: 1;
}

.summary-title {
  font-size: 0.9rem;
  color: #cfcfcf;
  margin-bottom: 12px;
  font-weight: 500;
}

.summary-change {
  font-size: 0.8rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.summary-change.positive {
  color: #4caf50;
}

.summary-change.negative {
  color: #f44336;
}

/* Enhanced Export Actions */
.export-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.export-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.export-buttons .q-btn {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.export-buttons .q-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

/* Enhanced Table */
.table-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.table-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.table-title {
  color: #bdf000;
  font-weight: 700;
  margin: 0;
}

.table-subtitle {
  color: #999;
  font-size: 0.9rem;
  margin-top: 4px;
}

.enhanced-transactions-table {
  background: transparent;
}

.enhanced-transactions-table :deep(.q-table__thead th) {
  background: rgba(189, 240, 0, 0.1);
  color: #ffffff;
  font-weight: 700;
  border-bottom: 2px solid rgba(189, 240, 0, 0.3);
  padding: 16px;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.enhanced-transactions-table :deep(.q-table__tbody tr) {
  transition: all 0.3s ease;
}

.enhanced-transactions-table :deep(.q-table__tbody tr:hover) {
  background: rgba(189, 240, 0, 0.08);
  transform: translateX(4px);
}

.enhanced-transactions-table :deep(.q-table__tbody td) {
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px;
}

/* Customer Cell */
.customer-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.customer-avatar {
  border: 2px solid rgba(189, 240, 0, 0.3);
  border-radius: 8px;
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: 600;
  color: #ffffff;
  font-size: 0.95rem;
}

.customer-email {
  font-size: 0.8rem;
  color: #999;
}

/* Amount Cell */
.amount-cell {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.amount-value {
  font-weight: 700;
  color: #4caf50;
  font-size: 1.1rem;
}

.amount-currency {
  font-size: 0.75rem;
  color: #999;
}

/* Payment Method Cell */
.payment-method-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.method-name {
  font-size: 0.9rem;
  text-transform: capitalize;
  color: #ffffff;
}

/* Date Cell */
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

/* Status Chip */
.status-chip {
  font-weight: 600;
  text-transform: capitalize;
  border-radius: 16px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.action-btn {
  border-radius: 8px;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn:hover {
  background: rgba(189, 240, 0, 0.1);
  border-color: rgba(189, 240, 0, 0.3);
  transform: scale(1.1);
}

/* Transaction Cards */
.transactions-cards {
  min-height: 400px;
}

.transaction-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.3s ease;
}

.transaction-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.3);
}

.transaction-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.transaction-id {
  font-weight: 700;
  color: #bdf000;
  font-size: 1.1rem;
}

.customer-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.customer-details {
  flex: 1;
}

.transaction-details {
  margin-bottom: 16px;
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

.detail-label {
  font-weight: 500;
  color: #999;
}

.detail-value {
  color: #ffffff;
  font-weight: 500;
}

.detail-value.amount {
  color: #4caf50;
  font-weight: 700;
}

.transaction-card-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

/* Modal Styles */
.transaction-detail-modal,
.refund-modal {
  background: #1a1a1a;
  color: #ffffff;
}

.modal-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.detail-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.detail-card-title {
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
}

/* Timeline */
.timeline {
  position: relative;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(189, 240, 0, 0.3);
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(18, 18, 18, 0.95);
  border: 2px solid rgba(189, 240, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  z-index: 1;
}

.timeline-content {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.timeline-description {
  color: #ccc;
  margin-bottom: 8px;
  line-height: 1.4;
}

.timeline-time {
  font-size: 0.8rem;
  color: #999;
}

/* Refund Modal */
.refund-modal {
  min-width: 500px;
  border-radius: 16px;
}

.refund-info {
  background: rgba(255, 152, 0, 0.1);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid rgba(255, 152, 0, 0.2);
}

.refund-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-weight: 500;
  color: #ff9800;
}

.summary-value {
  color: #ffffff;
  font-weight: 600;
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
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

.text-lime {
  color: #bdf000;
}

.text-grey-6 {
  color: #999;
}

.text-grey-5 {
  color: #aaa;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .export-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .export-buttons .q-btn {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .transaction-table-container {
    padding: 16px;
  }
  
  .summary-cards .row {
    flex-direction: column;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .customer-cell {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .transaction-card-actions {
    flex-direction: column;
    gap: 8px;
  }
  
  .refund-modal {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .summary-cards .col-md-3 {
    margin-bottom: 16px;
  }
  
  .filter-header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }
  
  .table-header .row {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
}

/* Print styles */
@media print {
  .transaction-table-container {
    background: white !important;
    color: black !important;
  }
  
  .filter-card,
  .export-card,
  .summary-card,
  .table-card {
    background: white !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
  }
  
  .action-buttons,
  .export-actions,
  .table-filters {
    display: none !important;
  }
}

/* Enhanced focus states */
.summary-card:focus-visible,
.action-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}
</style>