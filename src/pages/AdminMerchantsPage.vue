<template>
  <q-layout view="lHh Lpr lFf">
    <!-- Admin Header -->
    <AdminHeader />

    <!-- Page Content -->
    <q-page-container>
      <q-page class="admin-merchants-page">
        <!-- Loading Overlay -->
        <div v-if="loading" class="loading-overlay">
          <q-spinner-dots color="lime" size="60px" />
          <p class="loading-text">Loading merchants...</p>
        </div>

        <!-- Breadcrumb -->
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="admin_panel_settings" label="Admin" />
            <q-breadcrumbs-el icon="store" label="Merchants" />
          </q-breadcrumbs>
        </div>

        <!-- Merchant Statistics -->
        <div class="stats-section q-pa-md">
          <div class="row q-col-gutter-lg">
            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section>
                  <div class="stat-content">
                    <div class="stat-icon">
                      <q-icon name="store" size="32px" color="blue" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value text-blue">{{ merchantStats.total }}</div>
                      <div class="stat-label">Total Merchants</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section>
                  <div class="stat-content">
                    <div class="stat-icon">
                      <q-icon name="pending" size="32px" color="orange" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value text-orange">{{ merchantStats.pending }}</div>
                      <div class="stat-label">Pending Approval</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section>
                  <div class="stat-content">
                    <div class="stat-icon">
                      <q-icon name="check_circle" size="32px" color="green" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value text-green">{{ merchantStats.approved }}</div>
                      <div class="stat-label">Approved</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <div class="col-12 col-sm-6 col-md-3">
              <q-card class="stat-card lime-glow">
                <q-card-section>
                  <div class="stat-content">
                    <div class="stat-icon">
                      <q-icon name="trending_up" size="32px" color="lime" />
                    </div>
                    <div class="stat-info">
                      <div class="stat-value text-lime">{{ merchantStats.activeToday }}</div>
                      <div class="stat-label">Active Today</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Main Merchant Management Content -->
        <div class="merchant-content q-pa-md">
          <q-card class="lime-glow">
            <q-card-section>
              <div class="row items-center q-mb-md">
                <div class="text-h6 text-lime">Merchant Management</div>
                <q-space />
                <q-btn color="lime" icon="add" label="Add Merchant" @click="showAddMerchantDialog = true" />
              </div>

              <!-- Filters and Search -->
              <div class="filters-section q-mb-lg">
                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-4">
                    <q-input v-model="filters.search" placeholder="Search merchants..." outlined dense clearable
                      @input="applyFilters">
                      <template v-slot:prepend>
                        <q-icon name="search" />
                      </template>
                    </q-input>
                  </div>

                  <div class="col-12 col-md-2">
                    <q-select v-model="filters.status" :options="statusOptions" label="Status" outlined dense clearable
                      @update:model-value="applyFilters" />
                  </div>

                  <div class="col-12 col-md-2">
                    <q-select v-model="filters.category" :options="categoryOptions" label="Category" outlined dense
                      clearable @update:model-value="applyFilters" />
                  </div>

                  <div class="col-12 col-md-2">
                    <q-input v-model="filters.dateFrom" type="date" label="From Date" outlined dense
                      @input="applyFilters" />
                  </div>

                  <div class="col-12 col-md-2">
                    <q-btn color="lime" icon="refresh" @click="loadMerchants" class="full-width" />
                  </div>
                </div>
              </div>

              <!-- Merchants Table -->
              <q-table :rows="filteredMerchants" :columns="merchantColumns" :pagination="pagination"
                :loading="tableLoading" row-key="id" class="merchants-table" @request="onTableRequest">
                <!-- Status Column -->
                <template v-slot:body-cell-status="props">
                  <q-td :props="props">
                    <q-chip :color="getStatusColor(props.value)" text-color="white" :icon="getStatusIcon(props.value)"
                      size="sm">
                      {{ props.value }}
                    </q-chip>
                  </q-td>
                </template>

                <!-- Business Info Column -->
                <template v-slot:body-cell-business="props">
                  <q-td :props="props">
                    <div class="business-info">
                      <div class="business-name">{{ props.row.business_name || 'N/A' }}</div>
                      <div class="business-email">{{ props.row.email }}</div>
                    </div>
                  </q-td>
                </template>

                <!-- Registration Date Column -->
                <template v-slot:body-cell-created_at="props">
                  <q-td :props="props">
                    {{ formatDate(props.value) }}
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
                        @click="approveMerchant(props.row)" size="sm">
                        <q-tooltip>Approve Merchant</q-tooltip>
                      </q-btn>

                      <q-btn v-if="props.row.status === 'pending'" flat round dense icon="close" color="red"
                        @click="rejectMerchant(props.row)" size="sm">
                        <q-tooltip>Reject Merchant</q-tooltip>
                      </q-btn>

                      <q-btn flat round dense icon="edit" color="orange" @click="editMerchant(props.row)" size="sm">
                        <q-tooltip>Edit Merchant</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </template>
              </q-table>

              <!-- No Data State -->
              <div v-if="!loading && filteredMerchants.length === 0" class="text-center q-pa-xl">
                <q-icon name="store" size="64px" color="grey-5" />
                <div class="text-h6 text-grey-5 q-mt-md">No Merchants Found</div>
                <div class="text-caption text-grey-6">
                  {{ merchants.length === 0 ? 'No merchants have registered yet' : 'No merchants match your current filters' }}
                </div>
                <q-btn v-if="hasActiveFilters" flat color="lime" label="Clear Filters" @click="clearFilters"
                  class="q-mt-md" />
              </div>
            </q-card-section>
          </q-card>
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
              <q-form @submit="addMerchant" class="q-gutter-md">
                <div class="row q-col-gutter-md">
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

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input v-model="newMerchant.bank_account_name" label="Bank Account Name *" outlined dense required
                      :rules="[val => !!val || 'Bank account name is required']" />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-input v-model="newMerchant.bank_account_number" label="Bank Account Number *" outlined dense
                      required :rules="[val => !!val || 'Bank account number is required']" />
                  </div>
                </div>

                <div class="row q-col-gutter-md">
                  <div class="col-12 col-md-6">
                    <q-input v-model="newMerchant.phone" label="Phone Number" outlined dense />
                  </div>

                  <div class="col-12 col-md-6">
                    <q-select v-model="newMerchant.category" :options="categoryOptions" label="Business Category"
                      outlined dense />
                  </div>
                </div>

                <q-input v-model="newMerchant.description" label="Business Description" type="textarea" outlined
                  rows="3" />
              </q-form>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat label="Cancel" v-close-popup />
              <q-btn color="lime" label="Add Merchant" @click="addMerchant" :loading="addingMerchant" />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- Merchant Details Dialog -->
        <q-dialog v-model="showMerchantDetails" maximized>
          <q-card class="merchant-details-dialog">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">Merchant Details</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section v-if="selectedMerchant" class="q-pa-lg">
              <div class="merchant-details">
                <!-- Merchant Header -->
                <div class="merchant-header q-mb-lg">
                  <div class="row items-center">
                    <div class="col">
                      <h3 class="merchant-name">{{ selectedMerchant.business_name || 'N/A' }}</h3>
                      <p class="merchant-email">{{ selectedMerchant.email }}</p>
                    </div>
                    <div class="col-auto">
                      <q-chip :color="getStatusColor(selectedMerchant.status)" text-color="white"
                        :icon="getStatusIcon(selectedMerchant.status)" size="lg">
                        {{ selectedMerchant.status }}
                      </q-chip>
                    </div>
                  </div>
                </div>

                <!-- Merchant Info Grid -->
                <div class="row q-col-gutter-lg">
                  <div class="col-12 col-md-6">
                    <q-card class="info-card">
                      <q-card-section>
                        <h4 class="card-title">Business Information</h4>
                        <div class="info-item">
                          <span class="label">Business Name:</span>
                          <span class="value">{{ selectedMerchant.business_name || 'N/A' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">Email:</span>
                          <span class="value">{{ selectedMerchant.email }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">Phone:</span>
                          <span class="value">{{ selectedMerchant.phone || 'N/A' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">Category:</span>
                          <span class="value">{{ selectedMerchant.category || 'N/A' }}</span>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>

                  <div class="col-12 col-md-6">
                    <q-card class="info-card">
                      <q-card-section>
                        <h4 class="card-title">Banking Details</h4>
                        <div class="info-item">
                          <span class="label">Account Name:</span>
                          <span class="value">{{ selectedMerchant.bank_account_name || 'N/A' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">Account Number:</span>
                          <span class="value">{{ selectedMerchant.bank_account_number || 'N/A' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">Bank Name:</span>
                          <span class="value">{{ selectedMerchant.bank_name || 'N/A' }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">IFSC Code:</span>
                          <span class="value">{{ selectedMerchant.ifsc_code || 'N/A' }}</span>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Additional Details -->
                <div class="row q-col-gutter-lg q-mt-lg">
                  <div class="col-12">
                    <q-card class="info-card">
                      <q-card-section>
                        <h4 class="card-title">Registration Details</h4>
                        <div class="info-item">
                          <span class="label">Registration Date:</span>
                          <span class="value">{{ formatDateTime(selectedMerchant.created_at) }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">Last Updated:</span>
                          <span class="value">{{ formatDateTime(selectedMerchant.updated_at) }}</span>
                        </div>
                        <div class="info-item">
                          <span class="label">Description:</span>
                          <span class="value">{{ selectedMerchant.description || 'No description provided' }}</span>
                        </div>
                      </q-card-section>
                    </q-card>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="merchant-actions q-mt-lg text-center">
                  <q-btn v-if="selectedMerchant.status === 'pending'" color="green" icon="check"
                    label="Approve Merchant" @click="approveMerchant(selectedMerchant)" class="q-mr-sm"
                    :loading="processingAction" />
                  <q-btn v-if="selectedMerchant.status === 'pending'" color="red" icon="close" label="Reject Merchant"
                    @click="rejectMerchant(selectedMerchant)" class="q-mr-sm" :loading="processingAction" />
                  <q-btn color="orange" icon="edit" label="Edit Details" @click="editMerchant(selectedMerchant)"
                    class="q-mr-sm" />
                </div>
              </div>
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import AdminHeader from '../components/navigation/AdminHeader.vue'
import { api } from '../boot/axios'

const $q = useQuasar()

// Reactive data
const loading = ref(false)
const tableLoading = ref(false)
const addingMerchant = ref(false)
const approvingMerchant = ref(null)
const processingAction = ref(false) // ✅ Added missing variable

const showAddMerchantDialog = ref(false)
const showMerchantDetails = ref(false)
const selectedMerchant = ref(null)

// ✅ Initialize as empty array
const merchants = ref([])
const merchantStats = ref({
  total: 0,
  pending: 0,
  approved: 0,
  verified: 0,
  rejected: 0,
  suspended: 0,
  activeToday: 0,
  newThisMonth: 0
})

// Filters
const filters = ref({
  search: '',
  status: null,
  category: null,
  dateFrom: ''
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

// Pagination
const pagination = ref({
  sortBy: 'created_at',
  descending: true,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// Options
const statusOptions = [
  { label: 'All Status', value: null },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Verified', value: 'verified' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Suspended', value: 'suspended' }
]

const categoryOptions = [
  { label: 'All Categories', value: null },
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Food & Beverage', value: 'food' },
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Finance', value: 'finance' },
  { label: 'Other', value: 'other' }
]

// Table columns
const merchantColumns = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'business', label: 'Business', field: 'business_name', align: 'left', sortable: true },
  { name: 'status', label: 'Status', field: 'status', align: 'center', sortable: true },
  { name: 'created_at', label: 'Registered', field: 'created_at', align: 'center', sortable: true },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center', sortable: false }
]

// Computed properties
const filteredMerchants = computed(() => {
  const merchantsList = Array.isArray(merchants.value) ? merchants.value : []

  let filtered = [...merchantsList]

  // Apply search filter
  if (filters.value.search) {
    const search = filters.value.search.toLowerCase()
    filtered = filtered.filter(merchant =>
      merchant.business_name?.toLowerCase().includes(search) ||
      merchant.email?.toLowerCase().includes(search) ||
      String(merchant.id || '').includes(search)
    )
  }

  // Apply status filter
  if (filters.value.status) {
    filtered = filtered.filter(merchant => merchant.status === filters.value.status)
  }

  // Apply category filter
  if (filters.value.category) {
    filtered = filtered.filter(merchant => merchant.category === filters.value.category)
  }

  // Apply date filter
  if (filters.value.dateFrom) {
    filtered = filtered.filter(merchant => {
      if (!merchant.created_at) return false
      try {
        return new Date(merchant.created_at) >= new Date(filters.value.dateFrom)
      } catch {
        return false
      }
    })
  }

  return filtered
})

const hasActiveFilters = computed(() => {
  return filters.value.search ||
    filters.value.status ||
    filters.value.category ||
    filters.value.dateFrom
})

// ✅ Watcher for pagination
watch(filteredMerchants, (newFiltered) => {
  pagination.value.rowsNumber = newFiltered.length
}, { immediate: true })

// Methods
const loadMerchants = async () => {
  try {
    loading.value = true
    console.log('🔄 Loading merchants...')

    // ✅ Use your actual API endpoint: GET /api/admin/merchants
    const response = await api.get('/api/admin/merchants')

    console.log('📋 Raw API response:', response.data)

    // ✅ Enhanced data handling - check what we actually get from API
    let merchantData = []

    if (response && response.data) {
      // Log the structure to understand what we're getting
      console.log('📋 API Response structure:', {
        isArray: Array.isArray(response.data),
        hasKeys: Object.keys(response.data || {}),
        type: typeof response.data
      })

      if (Array.isArray(response.data)) {
        merchantData = response.data
      } else if (response.data.merchants && Array.isArray(response.data.merchants)) {
        merchantData = response.data.merchants
      } else if (response.data.data && Array.isArray(response.data.data)) {
        merchantData = response.data.data
      } else if (typeof response.data === 'object') {
        // Check if it's a single merchant or has merchant properties
        if (response.data.business_name || response.data.email) {
          merchantData = [response.data]
        } else {
          console.warn('⚠️ Unexpected API response format:', response.data)
          merchantData = []
        }
      }
    }

    // ✅ Enhanced merchant data processing with guaranteed IDs
    merchants.value = merchantData.map((merchant, index) => {
      // Create a unique ID if none exists
      let merchantId = merchant.id || merchant.merchant_id || merchant.user_id

      if (!merchantId) {
        merchantId = `merchant_${Date.now()}_${index}`
        console.warn('⚠️ Merchant missing ID, generated:', merchantId, 'for:', merchant.business_name || merchant.email)
      }

      return {
        id: merchantId,
        business_name: merchant.business_name || merchant.name || 'Unknown Business',
        email: merchant.email || 'No email provided',
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
        // Keep original data for debugging
        _original: merchant
      }
    })

    console.log('✅ Merchants processed:', merchants.value.length)
    console.log('📋 Sample processed merchant:', merchants.value[0])

    // Calculate stats
    calculateStats()

  } catch (error) {
    console.error('❌ Failed to load merchants:', error)

    // Set empty state
    merchants.value = []
    merchantStats.value = {
      total: 0,
      pending: 0,
      approved: 0,
      verified: 0,
      rejected: 0,
      suspended: 0,
      activeToday: 0,
      newThisMonth: 0
    }

    // Enhanced error handling
    let errorMessage = 'Failed to load merchants'

    if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
      errorMessage = 'Backend server is not reachable. Please check if your Laravel server is running on http://192.168.12.35:8000'
    } else if (error.response?.status === 401) {
      errorMessage = 'Authentication failed. Please login again as admin.'
    } else if (error.response?.status === 403) {
      errorMessage = 'Access denied. You need admin privileges to view merchants.'
    } else if (error.response?.status === 404) {
      errorMessage = 'Merchants API endpoint not found on your backend server.'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
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
          handler: () => loadMerchants()
        }
      ]
    })
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  try {
    const merchantsList = Array.isArray(merchants.value) ? merchants.value : []

    const stats = {
      total: merchantsList.length,
      pending: 0,
      approved: 0,
      verified: 0,
      rejected: 0,
      suspended: 0,
      activeToday: 0,
      newThisMonth: 0
    }

    if (merchantsList.length === 0) {
      merchantStats.value = stats
      return
    }

    const today = new Date().toDateString()
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()

    merchantsList.forEach(merchant => {
      try {
        // Count by status
        const status = merchant.status || 'unknown'
        switch (status) {
          case 'pending':
            stats.pending++
            break
          case 'approved':
            stats.approved++
            break
          case 'verified':
            stats.verified++
            break
          case 'rejected':
            stats.rejected++
            break
          case 'suspended':
            stats.suspended++
            break
        }

        // Count new this month
        if (merchant.created_at) {
          try {
            const merchantDate = new Date(merchant.created_at)
            if (!isNaN(merchantDate.getTime()) &&
              merchantDate.getMonth() === thisMonth &&
              merchantDate.getFullYear() === thisYear) {
              stats.newThisMonth++
            }
          } catch {
            // Invalid date, skip
          }
        }

        // Count active today
        if (merchant.updated_at || merchant.created_at) {
          try {
            const updateDate = new Date(merchant.updated_at || merchant.created_at)
            if (!isNaN(updateDate.getTime()) && updateDate.toDateString() === today) {
              stats.activeToday++
            }
          } catch {
            // Invalid date, skip
          }
        }
      } catch {
        // Skip problematic merchant
      }
    })

    merchantStats.value = stats
    console.log('📊 Statistics calculated:', stats)

  } catch (error) {
    console.error('❌ Error calculating stats:', error)
    merchantStats.value = {
      total: 0,
      pending: 0,
      approved: 0,
      verified: 0,
      rejected: 0,
      suspended: 0,
      activeToday: 0,
      newThisMonth: 0
    }
  }
}

const applyFilters = () => {
  pagination.value.page = 1
}

const clearFilters = () => {
  filters.value = {
    search: '',
    status: null,
    category: null,
    dateFrom: ''
  }
}

const onTableRequest = (props) => {
  pagination.value.page = props.pagination.page
  pagination.value.rowsPerPage = props.pagination.rowsPerPage
  pagination.value.sortBy = props.pagination.sortBy
  pagination.value.descending = props.pagination.descending
}

const viewMerchant = (merchant) => {
  console.log('👁️ Viewing merchant:', merchant)
  selectedMerchant.value = merchant
  showMerchantDetails.value = true
}

const approveMerchant = async (merchant) => {
  try {
    // ✅ Log full merchant object for debugging
    console.log("🧩 Merchant object before approval:", JSON.stringify(merchant, null, 2))

    if (!merchant) {
      console.error("❌ Merchant object is null/undefined")
      $q.notify({
        type: "negative",
        message: "Invalid merchant data - merchant object is missing",
        position: "top",
      })
      return
    }

    // ✅ Extract ID from possible fields
    const merchantId =
      merchant.id ||
      merchant._id ||
      merchant.merchant_id ||
      merchant.user_id ||
      merchant.pk

    console.log("🔍 Merchant ID check:", {
      id: merchant.id,
      _id: merchant._id,
      merchant_id: merchant.merchant_id,
      user_id: merchant.user_id,
      pk: merchant.pk,
      finalId: merchantId,
    })

    if (!merchantId) {
      console.error("❌ No valid ID found for merchant:", merchant)
      $q.notify({
        type: "negative",
        message: `Cannot approve "${merchant.business_name}" - merchant ID is missing from backend data`,
        position: "top",
        timeout: 5000,
      })
      return
    }

    processingAction.value = true
    approvingMerchant.value = merchantId

    console.log("🔄 Approving merchant:", {
      id: merchantId,
      business_name: merchant.business_name,
      email: merchant.email,
    })

    // ⚡ Decide based on backend route
    const usePathParam = true // ⬅️ change to false if backend expects JSON body

    if (usePathParam) {
      await api.post(`/api/admin/approve-merchant/${merchantId}`)
    } else {
      await api.post("/api/admin/approve-merchant", { merchantId })
    }

    // ✅ Update local merchants array
    const index = merchants.value.findIndex(
      (m) =>
        (m.id && m.id === merchantId) ||
        (m._id && m._id === merchantId) ||
        (m.merchant_id && m.merchant_id === merchantId) ||
        (m.email && m.email === merchant.email)
    )

    if (index !== -1) {
      merchants.value[index] = {
        ...merchants.value[index],
        status: "approved",
        updated_at: new Date().toISOString(),
      }
      console.log("✅ Local merchant data updated")
    } else {
      console.warn("⚠️ Could not find merchant in local data to update")
    }

    // Recalculate stats
    calculateStats()

    $q.notify({
      type: "positive",
      message: `${merchant.business_name} approved successfully!`,
      position: "top",
      icon: "check_circle",
      timeout: 3000,
    })

    // Close details dialog if open
    if (showMerchantDetails.value) {
      showMerchantDetails.value = false
    }

    console.log("✅ Merchant approval completed")
  } catch (error) {
    console.error("❌ Failed to approve merchant:", error)

    let errorMessage = "Failed to approve merchant"

    if (error.code === "ERR_NETWORK" || error.message === "Network Error") {
      errorMessage =
        "Cannot connect to backend server. Please ensure your Laravel server is running on http://192.168.12.35:8000"
    } else if (error.response?.status === 401) {
      errorMessage = "Authentication failed. Please login again as admin."
    } else if (error.response?.status === 403) {
      errorMessage = "Access denied. Admin privileges required."
    } else if (error.response?.status === 404) {
      errorMessage =
        "Approval endpoint not found. Please check your backend API routes."
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }

    $q.notify({
      type: "negative",
      message: errorMessage,
      position: "top",
      timeout: 5000,
      actions: [
        {
          label: "Debug Info",
          color: "white",
          handler: () =>
            console.log("🔍 Debug - Merchant data:", merchant),
        },
      ],
    })
  } finally {
    processingAction.value = false
    approvingMerchant.value = null
  }
}


const rejectMerchant = async (merchant) => {
  try {
    // ✅ Validate merchant data
    const merchantId = merchant.id || merchant.merchant_id || merchant.user_id

    if (!merchantId) {
      $q.notify({
        type: 'negative',
        message: 'Cannot reject merchant - ID is missing',
        position: 'top'
      })
      return
    }

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

    processingAction.value = true

    console.log('🔄 Rejecting merchant:', {
      id: merchantId,
      business_name: merchant.business_name,
      reason: reason
    })

    // ✅ Update local data (rejection endpoint not in your API docs)
    const index = merchants.value.findIndex(m =>
      (m.id && m.id === merchantId) ||
      (m.merchant_id && m.merchant_id === merchantId) ||
      (m.email && m.email === merchant.email)
    )

    if (index !== -1) {
      merchants.value[index] = {
        ...merchants.value[index],
        status: 'rejected',
        updated_at: new Date().toISOString(),
        rejection_reason: reason || 'No reason provided'
      }
    }

    calculateStats()

    $q.notify({
      type: 'warning',
      message: `${merchant.business_name} has been rejected`,
      position: 'top',
      timeout: 3000
    })

    if (showMerchantDetails.value) {
      showMerchantDetails.value = false
    }

    console.log('✅ Merchant rejected')

  } catch (error) {
    if (error && typeof error === 'object' && error.message) {
      console.error('❌ Failed to reject merchant:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to reject merchant',
        position: 'top'
      })
    }
  } finally {
    processingAction.value = false
  }
}

const editMerchant = () => {
  $q.notify({
    type: 'info',
    message: 'Edit merchant functionality will be available in a future update',
    position: 'top'
  })
}

const addMerchant = async () => {
  try {
    addingMerchant.value = true

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
      phone: newMerchant.value.phone || '',
      category: newMerchant.value.category || 'other',
      description: newMerchant.value.description || ''
    })

    console.log('✅ New merchant registered:', response.data)

    // ✅ Create merchant with guaranteed ID
    const newMerchantData = {
      id: response.data?.id || response.data?.merchant_id || `new_${Date.now()}`,
      business_name: newMerchant.value.business_name,
      email: newMerchant.value.email,
      phone: newMerchant.value.phone || '',
      category: newMerchant.value.category || 'other',
      status: 'pending',
      bank_account_name: newMerchant.value.bank_account_name,
      bank_account_number: newMerchant.value.bank_account_number,
      description: newMerchant.value.description || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...response.data
    }

    if (!Array.isArray(merchants.value)) {
      merchants.value = []
    }

    merchants.value.unshift(newMerchantData)
    calculateStats()

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
      message: 'Merchant added successfully and is pending approval',
      position: 'top',
      icon: 'check_circle',
      timeout: 3000
    })

  } catch (error) {
    console.error('❌ Failed to add merchant:', error)

    let errorMessage = 'Failed to add merchant'

    if (error.code === 'ERR_NETWORK') {
      errorMessage = 'Cannot connect to backend server.'
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      const errorList = Object.values(error.response.data.errors).flat()
      errorMessage = errorList.join(', ')
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 4000
    })
  } finally {
    addingMerchant.value = false
  }
}

// ✅ Debug helper
const debugMerchantStructure = () => {
  if (merchants.value.length > 0) {
    console.log('🔍 First merchant structure:', merchants.value[0])
    console.log('🔍 All merchant IDs:', merchants.value.map(m => ({
      business_name: m.business_name,
      id: m.id,
      hasId: !!m.id
    })))
  }
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'green',
    verified: 'green',
    rejected: 'red',
    suspended: 'grey'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'pending',
    approved: 'check_circle',
    verified: 'verified',
    rejected: 'cancel',
    suspended: 'block'
  }
  return icons[status] || 'help'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'N/A'
  }
}

const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid Date'

    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'N/A'
  }
}

// Lifecycle
onMounted(async () => {
  await loadMerchants()

  // Debug in development
  if (process.env.NODE_ENV === 'development') {
    setTimeout(debugMerchantStructure, 1000)
  }
})
</script>
<style scoped>
.admin-merchants-page {
  background: #0a0a0a;
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

.text-grey-6 {
  color: #999;
}

.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
  background: #121212;
  border-radius: 12px;
}

/* Stats Section */
.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 25px rgba(189, 240, 0, 0.2);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 50%;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Table Styles */
.merchants-table {
  background: transparent;
}

.merchants-table .q-table__thead th {
  background: rgba(189, 240, 0, 0.1);
  color: #ffffff;
  font-weight: 600;
  border-bottom: 2px solid rgba(189, 240, 0, 0.2);
}

.merchants-table .q-table__tbody tr:hover {
  background: rgba(189, 240, 0, 0.05);
}

.merchants-table .q-table__tbody td {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.business-info {
  display: flex;
  flex-direction: column;
}

.business-name {
  font-weight: 600;
  color: #ffffff;
}

.business-email {
  font-size: 0.8rem;
  color: #999;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

/* Dialog Styles */
.add-merchant-dialog,
.merchant-details-dialog {
  background: #121212;
  color: #ffffff;
}

.add-merchant-dialog {
  min-width: 600px;
  max-width: 80vw;
}

.merchant-details-dialog .merchant-header {
  border-bottom: 2px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 16px;
}

.merchant-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.merchant-email {
  color: #999;
  margin: 0;
  font-size: 0.9rem;
}

.info-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  height: 100%;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #bdf000;
  margin: 0 0 16px 0;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 8px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.info-item:last-child {
  border-bottom: none;
}

.info-item .label {
  font-weight: 600;
  color: #999;
  text-transform: capitalize;
}

.info-item .value {
  color: #ffffff;
  font-weight: 500;
  text-align: right;
  word-break: break-word;
}

.merchant-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.text-lime {
  color: #bdf000;
}

.text-blue {
  color: #2196f3;
}

.text-orange {
  color: #ff9800;
}

.text-green {
  color: #4caf50;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .merchant-details-dialog .merchant-header .row {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .stats-section {
    padding: 16px;
  }

  .merchant-content {
    padding: 16px;
  }

  .add-merchant-dialog {
    min-width: 90vw;
    margin: 16px;
  }

  .filters-section .row {
    flex-direction: column;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
}
</style>