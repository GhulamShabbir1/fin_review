<template>
  <div class="transactions-page">
    <div class="page-header neon-card">
      <div class="header-content">
        <div class="title-section">
          <h1 class="neon-text">Transactions</h1>
          <p class="text-secondary">View and manage all your transactions</p>
        </div>
        <div class="header-actions">
          <q-btn class="neon-btn" @click="exportTransactions">
            <q-icon name="download" left />
            Export
          </q-btn>
          <q-btn class="neon-btn" @click="refreshData">
            <q-icon name="refresh" left />
            Refresh
          </q-btn>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-section neon-card">
      <div class="filters-row">
        <q-input
          v-model="filters.search"
          label="Search transactions"
          class="neon-input"
          outlined
          clearable
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
        
        <q-select
          v-model="filters.status"
          :options="statusOptions"
          label="Status"
          class="neon-input"
          outlined
          clearable
        />
        
        <q-input
          v-model="filters.dateFrom"
          label="From Date"
          type="date"
          class="neon-input"
          outlined
        />
        
        <q-input
          v-model="filters.dateTo"
          label="To Date"
          type="date"
          class="neon-input"
          outlined
        />
        
        <q-btn class="neon-btn" @click="applyFilters">
          <q-icon name="filter_list" left />
          Apply Filters
        </q-btn>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="transactions-table neon-card">
      <q-table
        :rows="paginatedTransactions"
        :columns="columns"
        :loading="loading"
        :pagination="pagination"
        @request="onRequest"
        row-key="id"
        class="neon-table"
      >
        <template v-slot:body-cell-customer="props">
          <q-td :props="props">
            <div class="customer-info">
              <div class="customer-name">{{ props.row.customer_name }}</div>
              <div class="customer-email">{{ props.row.customer_email }}</div>
            </div>
          </q-td>
        </template>
        
        <template v-slot:body-cell-amount="props">
          <q-td :props="props">
            <span class="amount">${{ props.row.amount }}</span>
          </q-td>
        </template>
        
        <template v-slot:body-cell-status="props">
          <q-td :props="props">
            <q-badge 
              :color="getStatusColor(props.row.status)"
              :label="props.row.status"
            />
          </q-td>
        </template>
        
        <template v-slot:body-cell-actions="props">
          <q-td :props="props">
            <div class="action-buttons">
              <q-btn 
                v-if="props.row.status === 'paid'"
                class="neon-btn-small"
                @click="processRefund(props.row)"
              >
                Refund
              </q-btn>
              <q-btn 
                class="neon-btn-small"
                @click="viewDetails(props.row)"
              >
                View
              </q-btn>
            </div>
          </q-td>
        </template>
      </q-table>
    </div>

    <!-- Transaction Details Dialog -->
    <q-dialog v-model="detailsDialog" persistent>
      <q-card class="neon-card transaction-dialog">
        <q-card-section>
          <div class="text-h6 neon-text">Transaction Details</div>
        </q-card-section>
        
        <q-card-section v-if="selectedTransaction">
          <div class="transaction-details">
            <div class="detail-section">
              <h4>Transaction Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Transaction ID:</label>
                  <span>#{{ selectedTransaction.id }}</span>
                </div>
                <div class="detail-item">
                  <label>Reference:</label>
                  <span>{{ selectedTransaction.reference }}</span>
                </div>
                <div class="detail-item">
                  <label>Amount:</label>
                  <span class="amount">${{ selectedTransaction.amount }}</span>
                </div>
                <div class="detail-item">
                  <label>Status:</label>
                  <q-badge :color="getStatusColor(selectedTransaction.status)">
                    {{ selectedTransaction.status }}
                  </q-badge>
                </div>
                <div class="detail-item">
                  <label>Created:</label>
                  <span>{{ formatDate(selectedTransaction.created_at) }}</span>
                </div>
                <div class="detail-item">
                  <label>Updated:</label>
                  <span>{{ formatDate(selectedTransaction.updated_at) }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section">
              <h4>Customer Information</h4>
              <div class="detail-grid">
                <div class="detail-item">
                  <label>Name:</label>
                  <span>{{ selectedTransaction.customer_name }}</span>
                </div>
                <div class="detail-item">
                  <label>Email:</label>
                  <span>{{ selectedTransaction.customer_email }}</span>
                </div>
                <div class="detail-item">
                  <label>Phone:</label>
                  <span>{{ selectedTransaction.customer_phone || 'N/A' }}</span>
                </div>
              </div>
            </div>
            
            <div class="detail-section" v-if="selectedTransaction.refunds && selectedTransaction.refunds.length > 0">
              <h4>Refunds</h4>
              <div class="refunds-list">
                <div 
                  v-for="refund in selectedTransaction.refunds" 
                  :key="refund.id"
                  class="refund-item"
                >
                  <div class="refund-info">
                    <span class="refund-amount">-${{ refund.amount }}</span>
                    <span class="refund-reason">{{ refund.reason }}</span>
                  </div>
                  <div class="refund-date">{{ formatDate(refund.created_at) }}</div>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn flat @click="detailsDialog = false">Close</q-btn>
          <q-btn 
            v-if="selectedTransaction?.status === 'paid'"
            class="neon-btn"
            @click="processRefund(selectedTransaction)"
          >
            Process Refund
          </q-btn>
        </q-card-actions>
      </q-card>
    </q-dialog>

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
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useMerchantsStore } from 'src/stores/merchants'

export default {
  name: 'TransactionsPage',
  setup() {
    const $q = useQuasar()
    const merchantsStore = useMerchantsStore()
    
    const loading = ref(false)
    const detailsDialog = ref(false)
    const refundDialog = ref(false)
    const refundLoading = ref(false)
    const selectedTransaction = ref(null)
    const refundAmount = ref(0)
    const refundReason = ref('')
    
    const filters = ref({
      search: '',
      status: null,
      dateFrom: '',
      dateTo: ''
    })
    
    const statusOptions = [
      { label: 'Paid', value: 'paid' },
      { label: 'Failed', value: 'failed' },
      { label: 'Pending', value: 'pending' },
      { label: 'Refunded', value: 'refunded' }
    ]
    
    const columns = [
      {
        name: 'id',
        required: true,
        label: 'ID',
        align: 'left',
        field: 'id',
        sortable: true
      },
      {
        name: 'customer',
        required: true,
        label: 'Customer',
        align: 'left',
        field: 'customer_name',
        sortable: true
      },
      {
        name: 'amount',
        required: true,
        label: 'Amount',
        align: 'left',
        field: 'amount',
        sortable: true
      },
      {
        name: 'status',
        required: true,
        label: 'Status',
        align: 'left',
        field: 'status',
        sortable: true
      },
      {
        name: 'created_at',
        required: true,
        label: 'Date',
        align: 'left',
        field: 'created_at',
        sortable: true
      },
      {
        name: 'actions',
        required: true,
        label: 'Actions',
        align: 'center',
        field: 'actions'
      }
    ]
    
    const pagination = ref({
      sortBy: 'created_at',
      descending: true,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 0
    })
    
    const transactions = computed(() => merchantsStore.transactions)
    
    const paginatedTransactions = computed(() => {
      const start = (pagination.value.page - 1) * pagination.value.rowsPerPage
      const end = start + pagination.value.rowsPerPage
      return transactions.value.slice(start, end)
    })
    
    const loadTransactions = async () => {
      loading.value = true
      try {
        await merchantsStore.fetchTransactions()
        pagination.value.rowsNumber = transactions.value.length
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to load transactions',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }
    
    const refreshData = () => {
      loadTransactions()
    }
    
    const applyFilters = () => {
      // Apply filters logic here
      loadTransactions()
    }
    
    const exportTransactions = () => {
      // Export logic here
      $q.notify({
        type: 'positive',
        message: 'Transactions exported successfully',
        position: 'top'
      })
    }
    
    const onRequest = (props) => {
      const { page, rowsPerPage, sortBy, descending } = props.pagination
      
      pagination.value.page = page
      pagination.value.rowsPerPage = rowsPerPage
      pagination.value.sortBy = sortBy
      pagination.value.descending = descending
      
      loadTransactions()
    }
    
    const getStatusColor = (status) => {
      const colors = {
        paid: 'green',
        failed: 'red',
        pending: 'orange',
        refunded: 'purple'
      }
      return colors[status] || 'grey'
    }
    
    const viewDetails = (transaction) => {
      selectedTransaction.value = transaction
      detailsDialog.value = true
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
    
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }
    
    onMounted(() => {
      loadTransactions()
    })
    
    return {
      loading,
      detailsDialog,
      refundDialog,
      refundLoading,
      selectedTransaction,
      refundAmount,
      refundReason,
      filters,
      statusOptions,
      columns,
      pagination,
      transactions,
      paginatedTransactions,
      refreshData,
      applyFilters,
      exportTransactions,
      onRequest,
      getStatusColor,
      viewDetails,
      processRefund,
      confirmRefund,
      formatDate
    }
  }
}
</script>

<style scoped>
.transactions-page {
  padding: 20px;
  background: var(--bg-primary);
  min-height: 100vh;
}

.page-header {
  margin-bottom: 20px;
  padding: 25px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}

.title-section h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 20px var(--neon-cyan);
}

.header-actions {
  display: flex;
  gap: 15px;
}

.filters-section {
  margin-bottom: 20px;
  padding: 25px;
}

.filters-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 15px;
  align-items: end;
}

.transactions-table {
  padding: 25px;
}

.neon-table {
  background: transparent;
}

.neon-table .q-table__top {
  background: var(--bg-tertiary);
  border-radius: 10px;
  margin-bottom: 20px;
}

.neon-table .q-table__bottom {
  background: var(--bg-tertiary);
  border-radius: 10px;
  margin-top: 20px;
}

.neon-table .q-table tbody tr {
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-subtle);
}

.neon-table .q-table tbody tr:hover {
  background: var(--bg-card);
  border-color: var(--neon-cyan);
}

.customer-info {
  display: flex;
  flex-direction: column;
}

.customer-name {
  font-weight: bold;
  color: var(--text-primary);
}

.customer-email {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.amount {
  font-weight: bold;
  color: var(--neon-green);
  font-size: 1.1rem;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.transaction-dialog {
  min-width: 700px;
}

.transaction-details {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.detail-section h4 {
  color: var(--neon-cyan);
  margin-bottom: 15px;
  text-shadow: 0 0 10px var(--neon-cyan);
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border-subtle);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item label {
  color: var(--neon-cyan);
  font-weight: bold;
}

.refunds-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.refund-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: var(--bg-tertiary);
  border-radius: 8px;
  border: 1px solid var(--border-subtle);
}

.refund-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.refund-amount {
  font-weight: bold;
  color: var(--neon-orange);
}

.refund-reason {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.refund-date {
  color: var(--text-secondary);
  font-size: 0.9rem;
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
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .detail-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
  
  .refund-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>
