<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Header -->
    <q-header elevated class="transactions-header text-white" reveal>
      <q-toolbar class="q-py-sm">
        <q-toolbar-title class="row items-center no-wrap">
          <q-icon name="receipt_long" class="q-mr-sm text-lime" />
          <span class="text-weight-bold text-lime">Transactions</span>
        </q-toolbar-title>
        
        <q-space />
        
        <!-- Quick Actions -->
        <q-btn flat round dense icon="add" color="lime" @click="showNewTransactionDialog = true">
          <q-tooltip>New Transaction</q-tooltip>
        </q-btn>
        
        <q-btn flat round dense icon="download" color="lime" @click="exportTransactions">
          <q-tooltip>Export Transactions</q-tooltip>
        </q-btn>
        
        <q-btn flat round dense icon="refresh" color="lime" @click="refreshTransactions">
          <q-tooltip>Refresh</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <!-- Page Content -->
    <q-page class="transactions-page">
      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <q-spinner-dots color="lime" size="60px" />
        <p class="loading-text">Loading transactions...</p>
      </div>

      <!-- Main Content -->
      <div class="transactions-content">
        <!-- Stats Cards -->
        <div class="stats-section q-mb-xl animate-fade-in" style="animation-delay: 0.1s">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="receipt_long" size="48px" color="lime" class="q-mb-md" />
                  <div class="text-h4 text-lime">{{ transactionStats.total }}</div>
                  <div class="text-caption">Total Transactions</div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="check_circle" size="48px" color="green" class="q-mb-md" />
                  <div class="text-h4 text-green">{{ transactionStats.completed }}</div>
                  <div class="text-caption">Completed</div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="pending" size="48px" color="orange" class="q-mb-md" />
                  <div class="text-h4 text-orange">{{ transactionStats.pending }}</div>
                  <div class="text-caption">Pending</div>
                </q-card-section>
              </q-card>
            </div>
            
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section class="text-center">
                  <q-icon name="error" size="48px" color="red" class="q-mb-md" />
                  <div class="text-h4 text-red">{{ transactionStats.failed }}</div>
                  <div class="text-caption">Failed</div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="filters-section q-mb-lg animate-fade-in" style="animation-delay: 0.2s">
          <q-card class="filter-card lime-glow">
            <q-card-section>
              <div class="row q-col-gutter-md items-end">
                <!-- Date Range Filter -->
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="filters.dateFrom"
                    type="date"
                    label="From Date"
                    outlined
                    dense
                    dark
                    color="lime"
                  />
                </div>
                
                <div class="col-12 col-sm-6 col-md-3">
                  <q-input
                    v-model="filters.dateTo"
                    type="date"
                    label="To Date"
                    outlined
                    dense
                    dark
                    color="lime"
                  />
                </div>
                
                <!-- Status Filter -->
                <div class="col-12 col-sm-6 col-md-2">
                  <q-select
                    v-model="filters.status"
                    :options="statusOptions"
                    label="Status"
                    outlined
                    dense
                    dark
                    color="lime"
                    emit-value
                    map-options
                  />
                </div>
                
                <!-- Amount Filter -->
                <div class="col-12 col-sm-6 col-md-2">
                  <q-input
                    v-model="filters.minAmount"
                    type="number"
                    label="Min Amount"
                    outlined
                    dense
                    dark
                    color="lime"
                    prefix="$"
                  />
                </div>
                
                <!-- Filter Actions -->
                <div class="col-12 col-md-2">
                  <div class="row q-gutter-sm">
                    <q-btn color="lime" icon="search" label="Filter" @click="applyFilters" />
                    <q-btn flat color="grey" icon="clear" @click="clearFilters" />
                  </div>
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- Transactions Table -->
        <div class="table-section animate-fade-in" style="animation-delay: 0.3s">
          <q-card class="transactions-table-card lime-glow">
            <q-card-section>
              <div class="table-header q-mb-md">
                <h3 class="table-title">Recent Transactions</h3>
                <div class="table-actions">
                  <q-btn-toggle
                    v-model="viewMode"
                    :options="viewModeOptions"
                    color="lime"
                    text-color="white"
                    size="sm"
                  />
                </div>
              </div>

              <!-- Table View -->
              <q-table
                v-if="viewMode === 'table'"
                :rows="filteredTransactions"
                :columns="tableColumns"
                row-key="id"
                :pagination="pagination"
                :loading="tableLoading"
                flat
                dark
                class="transactions-table"
                @request="onTableRequest"
              >
                <!-- Status Column -->
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip
                      :color="getStatusColor(props.value)"
                      text-color="white"
                      :icon="getStatusIcon(props.value)"
                      size="sm"
                    >
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>

                <!-- Amount Column -->
                <template v-slot:body-cell-amount="props">
                  <q-td :props="props">
                    <span class="amount-text">{{ formatCurrency(props.value) }}</span>
                  </q-td>
                </template>

                <!-- Actions Column -->
                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn flat round dense icon="visibility" color="lime" @click="viewTransaction(props.row)">
                      <q-tooltip>View Details</q-tooltip>
                    </q-btn>
                    <q-btn flat round dense icon="download" color="blue" @click="downloadReceipt(props.row)">
                      <q-tooltip>Download Receipt</q-tooltip>
                    </q-btn>
                  </q-td>
                </template>
              </q-table>

              <!-- Card View -->
              <div v-else class="transactions-cards">
                <div class="row q-col-gutter-md">
                  <div v-for="transaction in filteredTransactions" :key="transaction.id" class="col-12 col-sm-6 col-md-4">
                    <q-card class="transaction-card lime-glow">
                      <q-card-section>
                        <div class="transaction-header">
                          <div class="transaction-id">#{{ transaction.id }}</div>
                          <q-chip
                            :color="getStatusColor(transaction.status)"
                            text-color="white"
                            :icon="getStatusIcon(transaction.status)"
                            size="sm"
                          >
                            {{ transaction.status }}
                          </q-chip>
                        </div>
                        
                        <div class="transaction-details">
                          <div class="detail-row">
                            <span class="detail-label">Customer:</span>
                            <span class="detail-value">{{ transaction.customer_name || 'N/A' }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Amount:</span>
                            <span class="detail-value amount">{{ formatCurrency(transaction.amount) }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Date:</span>
                            <span class="detail-value">{{ formatDate(transaction.created_at) }}</span>
                          </div>
                          <div class="detail-row">
                            <span class="detail-label">Method:</span>
                            <span class="detail-value">{{ transaction.payment_method || 'Card' }}</span>
                          </div>
                        </div>
                        
                        <div class="transaction-actions q-mt-md">
                          <q-btn flat color="lime" icon="visibility" @click="viewTransaction(transaction)">
                            View
                          </q-btn>
                          <q-btn flat color="blue" icon="download" @click="downloadReceipt(transaction)">
                            Receipt
                          </q-btn>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>
              </div>

              <!-- No Data State -->
              <div v-if="!loading && filteredTransactions.length === 0" class="no-data-state">
                <q-icon name="receipt_long" size="80px" color="grey-5" />
                <h4>No Transactions Found</h4>
                <p>{{ filters.status ? 'No transactions match your current filters.' : 'You haven\'t made any transactions yet.' }}</p>
                <q-btn color="lime" icon="add" label="Create First Transaction" @click="showNewTransactionDialog = true" />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>

    <!-- Transaction Details Dialog -->
    <q-dialog v-model="showTransactionDialog" class="transaction-dialog">
      <q-card class="dialog-card" style="min-width: 500px">
        <q-card-section class="dialog-header">
          <div class="text-h6">Transaction Details</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedTransaction">
          <div class="transaction-details-full">
            <div class="detail-group">
              <h6>Basic Information</h6>
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">#{{ selectedTransaction.id }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <q-chip
                  :color="getStatusColor(selectedTransaction.status)"
                  text-color="white"
                  :icon="getStatusIcon(selectedTransaction.status)"
                  size="sm"
                >
                  {{ selectedTransaction.status }}
                </q-chip>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount:</span>
                <span class="detail-value amount">{{ formatCurrency(selectedTransaction.amount) }}</span>
              </div>
            </div>

            <div class="detail-group">
              <h6>Customer Information</h6>
              <div class="detail-row">
                <span class="detail-label">Name:</span>
                <span class="detail-value">{{ selectedTransaction.customer_name || 'N/A' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">{{ selectedTransaction.customer_email || 'N/A' }}</span>
              </div>
            </div>

            <div class="detail-group">
              <h6>Payment Information</h6>
              <div class="detail-row">
                <span class="detail-label">Method:</span>
                <span class="detail-value">{{ selectedTransaction.payment_method || 'Card' }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Currency:</span>
                <span class="detail-value">{{ selectedTransaction.currency || 'USD' }}</span>
              </div>
            </div>

            <div class="detail-group">
              <h6>Timestamps</h6>
              <div class="detail-row">
                <span class="detail-label">Created:</span>
                <span class="detail-value">{{ formatDateTime(selectedTransaction.created_at) }}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Updated:</span>
                <span class="detail-value">{{ formatDateTime(selectedTransaction.updated_at) }}</span>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="grey" label="Close" v-close-popup />
          <q-btn color="lime" icon="download" label="Download Receipt" @click="downloadReceipt(selectedTransaction)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- New Transaction Dialog -->
    <q-dialog v-model="showNewTransactionDialog" class="new-transaction-dialog">
      <q-card class="dialog-card" style="min-width: 400px">
        <q-card-section class="dialog-header">
          <div class="text-h6">Create New Transaction</div>
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="createNewTransaction" class="q-gutter-md">
            <q-input
              v-model="newTransaction.customer_name"
              label="Customer Name"
              outlined
              dense
              dark
              color="lime"
              :rules="[val => !!val || 'Customer name is required']"
            />
            
            <q-input
              v-model="newTransaction.customer_email"
              label="Customer Email"
              type="email"
              outlined
              dense
              dark
              color="lime"
              :rules="[val => !!val || 'Email is required']"
            />
            
            <q-input
              v-model="newTransaction.amount"
              label="Amount"
              type="number"
              prefix="$"
              outlined
              dense
              dark
              color="lime"
              :rules="[val => val > 0 || 'Amount must be greater than 0']"
            />
            
            <q-select
              v-model="newTransaction.payment_method"
              :options="paymentMethodOptions"
              label="Payment Method"
              outlined
              dense
              dark
              color="lime"
              emit-value
              map-options
            />
            
            <q-input
              v-model="newTransaction.description"
              label="Description (Optional)"
              outlined
              dense
              dark
              color="lime"
              type="textarea"
              rows="3"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat color="grey" label="Cancel" v-close-popup />
          <q-btn 
            color="lime" 
            icon="add" 
            label="Create Transaction" 
            @click="createNewTransaction"
            :loading="submittingTransaction"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
// import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../boot/axios'
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const tableLoading = ref(false)
const submittingTransaction = ref(false)
const transactions = ref([])
const selectedTransaction = ref(null)
const showTransactionDialog = ref(false)
const showNewTransactionDialog = ref(false)

// Filters
const filters = ref({
  dateFrom: '',
  dateTo: '',
  status: '',
  minAmount: '',
  maxAmount: ''
})

// View mode
const viewMode = ref('table')
const viewModeOptions = [
  { label: 'Table', value: 'table', icon: 'table_view' },
  { label: 'Cards', value: 'cards', icon: 'view_module' }
]

// New transaction form
const newTransaction = ref({
  customer_name: '',
  customer_email: '',
  amount: '',
  payment_method: 'card',
  description: ''
})

// Options
const statusOptions = [
  { label: 'All Status', value: '' },
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Processing', value: 'processing' }
]

const paymentMethodOptions = [
  { label: 'Credit Card', value: 'card' },
  { label: 'Bank Transfer', value: 'bank_transfer' },
  { label: 'Digital Wallet', value: 'wallet' },
  { label: 'Cash', value: 'cash' }
]

// Table configuration
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

const tableColumns = [
  {
    name: 'id',
    label: 'ID',
    field: 'id',
    sortable: true,
    align: 'left'
  },
  {
    name: 'customer_name',
    label: 'Customer',
    field: 'customer_name',
    sortable: true,
    align: 'left'
  },
  {
    name: 'amount',
    label: 'Amount',
    field: 'amount',
    sortable: true,
    align: 'right'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    align: 'center'
  },
  {
    name: 'payment_method',
    label: 'Method',
    field: 'payment_method',
    sortable: true,
    align: 'left'
  },
  {
    name: 'created_at',
    label: 'Date',
    field: 'created_at',
    sortable: true,
    align: 'left',
    format: (val) => formatDate(val)
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    sortable: false,
    align: 'center'
  }
]

// Computed properties
const transactionStats = computed(() => {
  const stats = {
    total: transactions.value.length,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0
  }

  transactions.value.forEach(transaction => {
    switch (transaction.status?.toLowerCase()) {
      case 'completed':
        stats.completed++
        stats.totalAmount += Number(transaction.amount) || 0
        break
      case 'pending':
      case 'processing':
        stats.pending++
        break
      case 'failed':
      case 'cancelled':
        stats.failed++
        break
    }
  })

  return stats
})

const filteredTransactions = computed(() => {
  let filtered = [...transactions.value]

  // Apply filters
  if (filters.value.status) {
    filtered = filtered.filter(t => t.status?.toLowerCase() === filters.value.status.toLowerCase())
  }

  if (filters.value.dateFrom) {
    filtered = filtered.filter(t => new Date(t.created_at) >= new Date(filters.value.dateFrom))
  }

  if (filters.value.dateTo) {
    filtered = filtered.filter(t => new Date(t.created_at) <= new Date(filters.value.dateTo))
  }

  if (filters.value.minAmount) {
    filtered = filtered.filter(t => Number(t.amount) >= Number(filters.value.minAmount) * 100)
  }

  if (filters.value.maxAmount) {
    filtered = filtered.filter(t => Number(t.amount) <= Number(filters.value.maxAmount) * 100)
  }

  return filtered
})

// Methods
const loadTransactions = async () => {
  try {
    loading.value = true
    console.log('🔄 Loading transactions...')

    // ✅ Use your actual API endpoint: GET /api/merchant/transactions
    const response = await api.get('/merchant/transactions')
    
    // Handle different response formats
    const data = response.data
    if (data.transactions) {
      transactions.value = data.transactions
    } else if (Array.isArray(data)) {
      transactions.value = data
    } else if (data.data) {
      transactions.value = data.data
    } else {
      transactions.value = []
    }

    console.log('✅ Transactions loaded:', transactions.value.length)
    
    // Update pagination
    pagination.value.rowsNumber = transactions.value.length

  } catch (error) {
    console.error('❌ Failed to load transactions:', error)
    transactions.value = []
  } finally {
    loading.value = false
  }
}

// Removed mock transaction generator to enforce real backend data only

const refreshTransactions = async () => {
  await loadTransactions()
  $q.notify({
    type: 'positive',
    message: 'Transactions refreshed',
    position: 'top'
  })
}

const applyFilters = () => {
  console.log('🔍 Applying filters:', filters.value)
  // The computed property will automatically update the filtered results
}

const clearFilters = () => {
  filters.value = {
    dateFrom: '',
    dateTo: '',
    status: '',
    minAmount: '',
    maxAmount: ''
  }
}

const exportTransactions = async () => {
  try {
    // Determine user role for correct export endpoint
    const storedUser = localStorage.getItem('user')
    const user = JSON.parse(storedUser || '{}')
    
    let exportUrl
    if (user.role === 'admin' || user.email === 'admin@example.com') {
      // ✅ Admin export endpoint from your API: GET /api/admin/transactions/export
      exportUrl = '/api/admin/transactions/export'
      if (filters.value.merchant_id) {
        exportUrl += `?merchant_id=${filters.value.merchant_id}`
      }
    } else {
      // ✅ Merchant export endpoint (not specified in your API, using fallback)
      exportUrl = '/api/merchant/transactions/export'
    }

    console.log('📥 Exporting transactions from:', exportUrl)
    
    const response = await api.get(exportUrl, {
      responseType: 'blob',
      params: {
        ...filters.value,
        format: 'csv'
      }
    })

    // Create download link
    const blob = new Blob([response.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)

    $q.notify({
      type: 'positive',
      message: 'Transactions exported successfully',
      position: 'top'
    })

  } catch (error) {
    console.error('❌ Export failed:', error)
    
    // ✅ Fallback: Generate CSV manually
    const csvData = generateCSV(filteredTransactions.value)
    downloadCSV(csvData, `transactions_${new Date().toISOString().split('T')[0]}.csv`)
    
    $q.notify({
      type: 'info',
      message: 'Exported using local data',
      position: 'top'
    })
  }
}

const generateCSV = (data) => {
  const headers = ['ID', 'Customer Name', 'Customer Email', 'Amount', 'Status', 'Payment Method', 'Created Date']
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.id,
      `"${row.customer_name || ''}"`,
      `"${row.customer_email || ''}"`,
      row.amount / 100,
      row.status,
      row.payment_method || 'card',
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

const viewTransaction = (transaction) => {
  selectedTransaction.value = transaction
  showTransactionDialog.value = true
}

const downloadReceipt = () => {
  // ✅ Receipt download functionality (not in your API endpoints)
  $q.notify({
    type: 'info',
    message: 'Receipt download functionality coming soon!',
    position: 'top'
  })
}

const createNewTransaction = async () => {
  try {
    submittingTransaction.value = true
    
    // ✅ Use your payment checkout endpoint: POST /api/payments/checkout
    const response = await api.post('/api/payments/checkout', {
      customer_name: newTransaction.value.customer_name,
      customer_email: newTransaction.value.customer_email,
      amount: Math.round(Number(newTransaction.value.amount) * 100), // Convert to cents
      payment_method: newTransaction.value.payment_method,
      description: newTransaction.value.description,
      currency: 'USD'
    })

    console.log('✅ Transaction created:', response.data)

    $q.notify({
      type: 'positive',
      message: 'Transaction created successfully',
      position: 'top'
    })

    // Reset form
    newTransaction.value = {
      customer_name: '',
      customer_email: '',
      amount: '',
      payment_method: 'card',
      description: ''
    }

    showNewTransactionDialog.value = false
    
    // Reload transactions
    await loadTransactions()

  } catch (error) {
    console.error('❌ Failed to create transaction:', error)
    
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Failed to create transaction',
      position: 'top'
    })
  } finally {
    submittingTransaction.value = false
  }
}

const onTableRequest = (props) => {
  const { page, rowsPerPage, sortBy, descending } = props.pagination

  // Update pagination
  pagination.value.page = page
  pagination.value.rowsPerPage = rowsPerPage
  pagination.value.sortBy = sortBy
  pagination.value.descending = descending

  // Apply sorting
  if (sortBy) {
    transactions.value.sort((a, b) => {
      const aVal = a[sortBy]
      const bVal = b[sortBy]
      
      if (descending) {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0
      }
    })
  }
}

// Utility methods
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'green'
    case 'pending': return 'orange'
    case 'processing': return 'blue'
    case 'failed': return 'red'
    case 'cancelled': return 'grey'
    default: return 'grey'
  }
}

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'completed': return 'check_circle'
    case 'pending': return 'pending'
    case 'processing': return 'sync'
    case 'failed': return 'error'
    case 'cancelled': return 'cancel'
    default: return 'help'
  }
}

const formatCurrency = (amount) => {
  if (!amount) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount / 100) // Convert from cents
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

// Lifecycle
onMounted(async () => {
  console.log('🚀 TransactionsPage mounted')
  await loadTransactions()
})
</script>

<style scoped>
.transactions-page {
  background: linear-gradient(135deg, #09050d 0%, #121018 100%);
  min-height: 100vh;
}

.transactions-header {
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
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

.transactions-content {
  padding: 24px;
}

/* Stats Cards */
.stats-section {
  margin-bottom: 32px;
}

.stat-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  border-color: rgba(189, 240, 0, 0.4);
}

/* Filters */
.filter-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

/* Table */
.transactions-table-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-title {
  color: #bdf000;
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.transactions-table {
  background: transparent;
}

.transactions-table .q-table__top {
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.transactions-table .q-table thead th {
  background: rgba(189, 240, 0, 0.1);
  color: #bdf000;
  font-weight: 600;
}

.transactions-table .q-table tbody tr:hover {
  background: rgba(189, 240, 0, 0.05);
}

.amount-text {
  color: #4caf50;
  font-weight: 600;
}

/* Transaction Cards */
.transactions-cards {
  min-height: 400px;
}

.transaction-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 12px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.3s ease;
}

.transaction-card:hover {
  transform: translateY(-2px);
  border-color: rgba(189, 240, 0, 0.4);
}

.transaction-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.transaction-id {
  font-weight: 600;
  color: #bdf000;
  font-size: 1.1rem;
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
  font-size: 0.9rem;
}

.detail-value {
  color: #ffffff;
  font-weight: 500;
}

.detail-value.amount {
  color: #4caf50;
  font-weight: 600;
}

.transaction-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
}

/* Dialog Styles */
.dialog-card {
  background: rgba(18, 18, 18, 0.98);
  border: 1px solid rgba(189, 240, 0, 0.3);
  border-radius: 16px;
}

.dialog-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-header .text-h6 {
  color: #bdf000;
  font-weight: 600;
}

.transaction-details-full {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.detail-group {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-group h6 {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 12px 0;
  font-size: 1rem;
}

/* No Data State */
.no-data-state {
  text-align: center;
  padding: 64px 24px;
  color: #999;
}

.no-data-state h4 {
  color: #ccc;
  margin: 16px 0 8px 0;
}

.no-data-state p {
  margin: 0 0 24px 0;
  line-height: 1.5;
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

/* Animations */
.animate-fade-in {
  animation: fadeInUp 0.6s ease-out forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive Design */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .transactions-content {
    padding: 16px;
  }
  
  .stats-section .row {
    gap: 16px;
  }
  
  .table-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .welcome-content {
    flex-direction: column;
    gap: 24px;
  }
  
  .welcome-actions {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .transactions-content {
    padding: 12px;
  }
  
  .stat-card {
    margin-bottom: 16px;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 12px;
  }
  
  .dialog-card {
    margin: 16px;
    min-width: auto !important;
    width: calc(100vw - 32px);
  }
}

/* Dark theme adjustments */
.q-table--dark .q-table__top {
  background: rgba(189, 240, 0, 0.05);
}

.q-table--dark .q-table thead th {
  background: rgba(189, 240, 0, 0.1);
  color: #bdf000;
}

.q-table--dark .q-table tbody td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

/* Form styling */
.q-field--outlined .q-field__control {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(189, 240, 0, 0.3);
}

.q-field--outlined.q-field--focused .q-field__control {
  border-color: #bdf000;
  box-shadow: 0 0 0 1px #bdf000;
}

/* Enhanced focus states for accessibility */
.q-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

.q-field:focus-within {
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.3);
}

/* Loading states */
.q-table--loading .q-table__bottom {
  background: rgba(189, 240, 0, 0.1);
}

/* Hover effects */
.stat-card:hover,
.filter-card:hover,
.transactions-table-card:hover,
.transaction-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.2);
}

/* Print styles */
@media print {
  .transactions-header,
  .welcome-actions,
  .filters-section,
  .loading-overlay {
    display: none !important;
  }
  
  .transactions-page {
    background: white !important;
  }
  
  .stat-card,
  .transactions-table-card {
    background: white !important;
    border: 1px solid #ccc !important;
    box-shadow: none !important;
  }
}
</style>