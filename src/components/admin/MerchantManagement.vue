<template>
  <div class="merchant-management">
    <!-- Animated background elements -->
    <div class="animated-bg">
      <div v-for="i in 15" :key="i" class="floating-particle" :style="particleStyle(i)"></div>
    </div>

    <!-- Header with actions -->
    <div class="row items-center q-mb-lg">
      <div class="col">
        <div class="text-h6 text-lime animate-fade-in">Merchant Management</div>
        <div class="text-caption text-grey-6 animate-fade-in" style="animation-delay: 0.1s">Manage merchant registrations and approvals</div>
      </div>
      <div class="col-auto">
        <q-btn 
          color="lime" 
          icon="add" 
          label="Add Merchant" 
          @click="showAddDialog = true" 
          class="btn-animate enhanced-btn"
        >
          <div class="btn-hover-effect"></div>
        </q-btn>
      </div>
    </div>

    <!-- Quick Stats -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card lime-glow animate-fade-in continuous-pulse" style="animation-delay: 0.2s">
          <div class="stat-glow"></div>
          <q-card-section class="text-center">
            <div class="text-h4 text-lime count-up-animation">{{ stats.total }}</div>
            <div class="text-caption">Total Merchants</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card orange-glow animate-fade-in continuous-pulse" style="animation-delay: 0.3s">
          <div class="stat-glow orange"></div>
          <q-card-section class="text-center">
            <div class="text-h4 text-orange count-up-animation">{{ stats.pending }}</div>
            <div class="text-caption">Pending Approval</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card green-glow animate-fade-in continuous-pulse" style="animation-delay: 0.4s">
          <div class="stat-glow green"></div>
          <q-card-section class="text-center">
            <div class="text-h4 text-green count-up-animation">{{ stats.verified }}</div>
            <div class="text-caption">Verified</div>
          </q-card-section>
        </q-card>
      </div>
      <div class="col-12 col-sm-6 col-md-3">
        <q-card class="stat-card red-glow animate-fade-in continuous-pulse" style="animation-delay: 0.5s">
          <div class="stat-glow red"></div>
          <q-card-section class="text-center">
            <div class="text-h4 text-red count-up-animation">{{ stats.rejected }}</div>
            <div class="text-caption">Rejected</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <!-- Filters and Search -->
    <q-card class="q-mb-md lime-glow animate-fade-in continuous-glow" style="animation-delay: 0.6s">
      <q-card-section>
        <div class="row q-col-gutter-md items-center">
          <div class="col-12 col-md-4">
            <q-input
              v-model="filters.search"
              placeholder="Search merchants..."
              dense
              outlined
              clearable
              @update:model-value="onSearch"
              class="input-animate"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.status"
              :options="statusOptions"
              label="Status"
              dense
              outlined
              clearable
              @update:model-value="onFilter"
              class="input-animate"
              style="animation-delay: 0.1s"
            />
          </div>
          <div class="col-12 col-md-3">
            <q-select
              v-model="filters.sortBy"
              :options="sortOptions"
              label="Sort By"
              dense
              outlined
              @update:model-value="onSort"
              class="input-animate"
              style="animation-delay: 0.2s"
            />
          </div>
          <div class="col-12 col-md-2">
            <q-btn
              color="grey"
              icon="refresh"
              label="Refresh"
              @click="loadMerchants"
              :loading="loading"
              class="btn-animate enhanced-btn"
              style="animation-delay: 0.3s"
            >
              <div class="btn-hover-effect"></div>
            </q-btn>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Merchants Table -->
    <q-card class="lime-glow animate-fade-in continuous-glow" style="animation-delay: 0.7s">
      <q-card-section>
        <q-table
          :rows="merchants"
          :columns="columns"
          :loading="loading"
          :pagination="pagination"
          row-key="id"
          @request="onRequest"
          class="merchant-table"
          :grid="$q.screen.xs"
          flat
          bordered
        >
          <!-- Loading state -->
          <template v-slot:loading>
            <q-inner-loading showing color="lime" />
          </template>

          <!-- Status Column -->
          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip
                :color="getStatusColor(props.value)"
                :label="props.value"
                size="sm"
                class="status-chip chip-animate continuous-bounce"
              />
            </q-td>
          </template>

          <!-- Actions Column -->
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                round
                dense
                icon="more_vert"
                @click="openMenu($event, props.row)"
                class="action-btn btn-animate enhanced-btn"
              >
                <div class="btn-hover-effect"></div>
              </q-btn>
            </q-td>
          </template>

          <!-- Row animation -->
          <template v-slot:body="props">
            <q-tr 
              :props="props" 
              class="table-row-animate"
              @click="viewMerchant(props.row)"
            >
              <q-td key="business_name" :props="props">
                {{ props.row.business_name }}
              </q-td>
              <q-td key="email" :props="props">
                {{ props.row.email }}
              </q-td>
              <q-td key="phone" :props="props">
                {{ props.row.phone }}
              </q-td>
              <q-td key="status" :props="props">
                <q-chip
                  :color="getStatusColor(props.row.status)"
                  :label="props.row.status"
                  size="sm"
                  class="status-chip continuous-bounce"
                />
              </q-td>
              <q-td key="created_at" :props="props">
                {{ formatDate(props.row.created_at) }}
              </q-td>
              <q-td key="actions" :props="props">
                <q-btn
                  flat
                  round
                  dense
                  icon="more_vert"
                  @click.stop="openMenu($event, props.row)"
                  class="action-btn enhanced-btn"
                >
                  <div class="btn-hover-effect"></div>
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- Add Merchant Dialog -->
    <q-dialog v-model="showAddDialog" persistent transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 400px" class="dialog-animate lime-glow">
        <q-card-section class="row items-center">
          <div class="text-h6">Add New Merchant</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-form @submit="addMerchant" class="q-gutter-md">
            <q-input
              v-model="newMerchant.business_name"
              label="Business Name"
              outlined
              dense
              :rules="[val => !!val || 'Business name is required']"
              class="input-animate"
            />
            <q-input
              v-model="newMerchant.email"
              label="Email"
              type="email"
              outlined
              dense
              :rules="[
                val => !!val || 'Email is required',
                val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) || 'Invalid email format'
              ]"
              class="input-animate"
              style="animation-delay: 0.1s"
            />
            <q-input
              v-model="newMerchant.phone"
              label="Phone"
              outlined
              dense
              :rules="[val => !!val || 'Phone is required']"
              class="input-animate"
              style="animation-delay: 0.2s"
            />
            <q-input
              v-model="newMerchant.address"
              label="Address"
              outlined
              dense
              type="textarea"
              rows="2"
              class="input-animate"
              style="animation-delay: 0.3s"
            />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup class="btn-animate enhanced-btn" />
          <q-btn color="lime" label="Add Merchant" @click="addMerchant" class="btn-animate enhanced-btn" style="animation-delay: 0.1s" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Merchant Detail Dialog -->
    <q-dialog v-model="showDetailDialog" maximized transition-show="slide-up" transition-hide="slide-down">
      <q-card class="merchant-detail-dialog dialog-animate lime-glow">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Merchant Details</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-md smooth-scroll" style="max-height: 70vh; overflow-y: auto;">
          <div class="row q-col-gutter-lg">
            <!-- Basic Info -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="card-animate lime-glow">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Basic Information</div>
                  <div class="row q-col-gutter-sm">
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Business Name</div>
                      <div class="text-body1">{{ selectedMerchant?.business_name }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Email</div>
                      <div class="text-body1">{{ selectedMerchant?.email }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Phone</div>
                      <div class="text-body1">{{ selectedMerchant?.phone }}</div>
                    </div>
                    <div class="col-6">
                      <div class="text-caption text-grey-6">Status</div>
                      <q-chip
                        :color="getStatusColor(selectedMerchant?.status)"
                        :label="selectedMerchant?.status"
                        size="sm"
                        class="chip-animate continuous-bounce"
                      />
                    </div>
                    <div class="col-12" v-if="selectedMerchant?.address">
                      <div class="text-caption text-grey-6">Address</div>
                      <div class="text-body1">{{ selectedMerchant.address }}</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Documents -->
            <div class="col-12 col-md-6">
              <q-card flat bordered class="card-animate lime-glow" style="animation-delay: 0.1s">
                <q-card-section>
                  <div class="text-subtitle1 q-mb-md">Documents</div>
                  <div class="row q-col-gutter-md">
                    <div class="col-12 col-md-4" v-if="selectedMerchant?.business_license">
                      <q-card flat bordered class="document-card doc-animate lime-glow">
                        <q-card-section class="text-center">
                          <q-icon name="description" size="48px" color="lime" class="icon-animate continuous-float" />
                          <div class="text-subtitle2 q-mt-sm">Business License</div>
                          <q-btn flat color="lime" label="View" @click="viewDocument(selectedMerchant.business_license)" class="btn-animate enhanced-btn" />
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-12 col-md-4" v-if="selectedMerchant?.id_proof">
                      <q-card flat bordered class="document-card doc-animate lime-glow" style="animation-delay: 0.1s">
                        <q-card-section class="text-center">
                          <q-icon name="badge" size="48px" color="lime" class="icon-animate continuous-float" />
                          <div class="text-subtitle2 q-mt-sm">ID Proof</div>
                          <q-btn flat color="lime" label="View" @click="viewDocument(selectedMerchant.id_proof)" class="btn-animate enhanced-btn" />
                        </q-card-section>
                      </q-card>
                    </div>
                    <div class="col-12" v-if="!selectedMerchant?.business_license && !selectedMerchant?.id_proof">
                      <div class="text-caption text-grey-6 text-center q-py-md">No documents uploaded</div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-px-lg q-pb-lg">
          <q-btn flat label="Close" v-close-popup class="btn-animate enhanced-btn" />
          <q-btn
            v-if="selectedMerchant?.status === 'Pending'"
            color="green"
            label="Approve"
            @click="approveMerchant(selectedMerchant)"
            class="btn-animate enhanced-btn"
            style="animation-delay: 0.1s"
          />
          <q-btn
            v-if="selectedMerchant?.status === 'Pending'"
            color="red"
            label="Reject"
            @click="rejectMerchant(selectedMerchant)"
            class="btn-animate enhanced-btn"
            style="animation-delay: 0.2s"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Merchant Menu -->
    <q-menu ref="merchantMenu" transition-show="jump-down" transition-hide="jump-up">
      <q-list style="min-width: 150px" class="menu-animate lime-glow">
        <q-item clickable v-close-popup @click="viewMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="visibility" />
          </q-item-section>
          <q-item-section>View Details</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="editMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>Edit</q-item-section>
        </q-item>
        
        <q-item clickable v-close-popup @click="suspendMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="block" />
          </q-item-section>
          <q-item-section>Suspend</q-item-section>
        </q-item>
        
        <q-separator />
        
        <q-item clickable v-close-popup @click="deleteMerchant(menuMerchant)">
          <q-item-section avatar>
            <q-icon name="delete" color="red" />
          </q-item-section>
          <q-item-section class="text-red">Delete</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import api from '../../boot/axios'

const $q = useQuasar()

// Reactive data
const loading = ref(false)
const merchants = ref([])
const selectedMerchant = ref(null)
const menuMerchant = ref(null)
const showDetailDialog = ref(false)
const showAddDialog = ref(false)
const merchantMenu = ref(null)

// Filters and pagination
const filters = ref({
  search: '',
  status: null,
  sortBy: 'created_at'
})

const pagination = ref({
  sortBy: 'created_at',
  descending: false,
  page: 1,
  rowsPerPage: 10,
  rowsNumber: 0
})

// New merchant form
const newMerchant = ref({
  business_name: '',
  email: '',
  phone: '',
  address: ''
})

// Computed stats
const stats = computed(() => {
  const total = merchants.value.length
  const pending = merchants.value.filter(m => m.status === 'Pending').length
  const verified = merchants.value.filter(m => m.status === 'Verified').length
  const rejected = merchants.value.filter(m => m.status === 'Rejected').length
  
  return { total, pending, verified, rejected }
})

// Options for filters
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'Pending' },
  { label: 'Verified', value: 'Verified' },
  { label: 'Rejected', value: 'Rejected' }
]

const sortOptions = [
  { label: 'Date Created', value: 'created_at' },
  { label: 'Business Name', value: 'business_name' },
  { label: 'Status', value: 'status' }
]

// Table columns
const columns = [
  {
    name: 'business_name',
    label: 'Business Name',
    field: 'business_name',
    sortable: true,
    align: 'left'
  },
  {
    name: 'email',
    label: 'Email',
    field: 'email',
    sortable: true,
    align: 'left'
  },
  {
    name: 'phone',
    label: 'Phone',
    field: 'phone',
    sortable: false,
    align: 'left'
  },
  {
    name: 'status',
    label: 'Status',
    field: 'status',
    sortable: true,
    align: 'center'
  },
  {
    name: 'created_at',
    label: 'Created',
    field: 'created_at',
    sortable: true,
    align: 'center',
    format: val => formatDate(val)
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    sortable: false,
    align: 'center'
  }
]

// Methods
const loadMerchants = async () => {
  loading.value = true
  try {
    const response = await api.get('/api/admin/merchants')
    merchants.value = response.data.merchants || []
    
    // Animate counting up the stats
    animateStats()
  } catch (error) {
    console.error('Error loading merchants:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load merchants',
      position: 'bottom-right'
    })
    
    // Fallback data for demo
    merchants.value = [
      {
        id: 1,
        business_name: 'TechCorp Inc',
        email: 'admin@techcorp.com',
        phone: '+1 (555) 123-4567',
        status: 'Verified',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
        address: '123 Tech Street, San Francisco, CA',
        business_license: 'https://example.com/license.pdf',
        id_proof: 'https://example.com/id.pdf'
      },
      {
        id: 2,
        business_name: 'FoodExpress',
        email: 'contact@foodexpress.com',
        phone: '+1 (555) 987-6543',
        status: 'Pending',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
        address: '456 Food Avenue, New York, NY'
      },
      {
        id: 3,
        business_name: 'FashionHub',
        email: 'info@fashionhub.com',
        phone: '+1 (555) 456-7890',
        status: 'Rejected',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
        address: '789 Fashion Blvd, Los Angeles, CA'
      }
    ]
    
    animateStats()
  } finally {
    loading.value = false
  }
}

const animateStats = () => {
  // Animate counting up the stats
  const targetStats = {
    total: merchants.value.length,
    pending: merchants.value.filter(m => m.status === 'Pending').length,
    verified: merchants.value.filter(m => m.status === 'Verified').length,
    rejected: merchants.value.filter(m => m.status === 'Rejected').length
  }
  
  // Reset to 0 for animation
  const tempStats = { total: 0, pending: 0, verified: 0, rejected: 0 }
  
  // Animate each stat
  Object.keys(tempStats).forEach(stat => {
    animateValue(stat, 0, targetStats[stat], 1500)
  })
}

const animateValue = (statKey, start, end, duration) => {
  if (start === end) return
  
  const range = end - start
  const increment = end > start ? 1 : -1
  const stepTime = Math.abs(Math.floor(duration / range))
  const timer = setInterval(() => {
    start += increment
    // Create a temporary object to trigger reactivity
    const updatedStats = { ...stats.value }
    updatedStats[statKey] = start
    // We can't directly update computed props, so we'll need to handle this differently
    // For now, we'll just update the UI through DOM manipulation if needed
    if (start === end) clearInterval(timer)
  }, stepTime)
}

const onSearch = () => {
  // Implement search logic
  loadMerchants()
}

const onFilter = () => {
  // Implement filter logic
  loadMerchants()
}

const onSort = () => {
  // Implement sort logic
  loadMerchants()
}

const onRequest = (props) => {
  pagination.value = props.pagination
  loadMerchants()
}

const openMenu = (event, merchant) => {
  menuMerchant.value = merchant
  merchantMenu.value.show(event)
}

const viewMerchant = (merchant) => {
  selectedMerchant.value = merchant
  showDetailDialog.value = true
}

const editMerchant = () => {
  // Implement edit logic
  $q.notify({
    message: 'Edit functionality coming soon',
    color: 'blue',
    position: 'bottom-right'
  })
}

const suspendMerchant = (merchant) => {
  // Implement suspend logic
  $q.notify({
    message: `Suspending ${merchant.business_name}`,
    color: 'orange',
    position: 'bottom-right'
  })
}

const deleteMerchant = (merchant) => {
  $q.dialog({
    title: 'Confirm Delete',
    message: `Are you sure you want to delete ${merchant.business_name}?`,
    cancel: true,
    persistent: true
  }).onOk(async () => {
    try {
      await api.delete(`/api/admin/merchants/${merchant.id}`)
      await loadMerchants()
      $q.notify({
        type: 'positive',
        message: 'Merchant deleted successfully',
        position: 'bottom-right'
      })
    } catch (error) {
      console.error('Error deleting merchant:', error)
      $q.notify({
        type: 'negative',
        message: 'Failed to delete merchant',
        position: 'bottom-right'
      })
    }
  })
}

const approveMerchant = async (merchant) => {
  try {
    await api.patch(`/api/admin/merchants/${merchant.id}/approve`)
    await loadMerchants()
    showDetailDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Merchant approved successfully',
      position: 'bottom-right'
    })
  } catch (error) {
    console.error('Error approving merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to approve merchant',
      position: 'bottom-right'
    })
  }
}

const rejectMerchant = async (merchant) => {
  try {
    await api.patch(`/api/admin/merchants/${merchant.id}/reject`)
    await loadMerchants()
    showDetailDialog.value = false
    $q.notify({
      type: 'positive',
      message: 'Merchant rejected successfully',
      position: 'bottom-right'
    })
  } catch (error) {
    console.error('Error rejecting merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to reject merchant',
      position: 'bottom-right'
    })
  }
}

const addMerchant = async () => {
  try {
    await api.post('/api/admin/merchants', newMerchant.value)
    await loadMerchants()
    showAddDialog.value = false
    newMerchant.value = { business_name: '', email: '', phone: '', address: '' }
    $q.notify({
      type: 'positive',
      message: 'Merchant added successfully',
      position: 'bottom-right'
    })
  } catch (error) {
    console.error('Error adding merchant:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to add merchant',
      position: 'bottom-right'
    })
  }
}

const viewDocument = (documentUrl) => {
  window.open(documentUrl, '_blank')
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Pending': return 'orange'
    case 'Verified': return 'green'
    case 'Rejected': return 'red'
    default: return 'grey'
  }
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

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

// Enable smooth scrolling for the entire page
const enableSmoothScrolling = () => {
  document.documentElement.style.scrollBehavior = 'smooth'
}

// Lifecycle
onMounted(() => {
  enableSmoothScrolling()
  loadMerchants()
})
</script>

<style scoped>
.merchant-management {
  padding: 20px;
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

.stat-glow.green {
  background: radial-gradient(circle at center, rgba(76, 175, 80, 0.1) 0%, transparent 60%);
}

.stat-glow.red {
  background: radial-gradient(circle at center, rgba(244, 67, 54, 0.1) 0%, transparent 60%);
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

.green-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(76, 175, 80, 0.2), 0 0 20px rgba(76, 175, 80, 0.15);
}

.red-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(244, 67, 54, 0.2), 0 0 20px rgba(244, 67, 54, 0.15);
}

.lime-glow:hover, .orange-glow:hover, .green-glow:hover, .red-glow:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 30px rgba(189, 240, 0, 0.25);
  transform: translateY(-5px);
}

.orange-glow:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 152, 0, 0.3), 0 0 30px rgba(255, 152, 0, 0.25);
}

.green-glow:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(76, 175, 80, 0.3), 0 0 30px rgba(76, 175, 80, 0.25);
}

.red-glow:hover {
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(244, 67, 54, 0.3), 0 0 30px rgba(244, 67, 54, 0.25);
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

.merchant-table {
  background: transparent;
}

.status-chip {
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn {
  color: #666;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: #bdf000;
  transform: scale(1.1);
}

.merchant-detail-dialog {
  max-width: 800px;
}

.document-card {
  transition: all 0.3s ease;
  cursor: pointer;
}

.document-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 5px 15px rgba(189, 240, 0, 0.2);
}

/* Animation Classes */
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
  transition: all 0.5s ease-out;
}

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

.input-animate {
  transition: all 0.3s ease;
}

.input-animate:focus-within {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(189, 240, 0, 0.1);
}

.chip-animate {
  transition: all 0.3s ease;
}

.chip-animate:hover {
  transform: scale(1.05);
}

.icon-animate {
  transition: transform 0.3s ease;
}

.icon-animate:hover {
  transform: scale(1.1);
}

.table-row-animate {
  transition: all 0.3s ease;
  cursor: pointer;
}

.table-row-animate:hover {
  background-color: rgba(189, 240, 0, 0.05) !important;
  transform: translateX(5px);
}

.dialog-animate {
  animation: dialogEnter 0.4s ease-out;
}

@keyframes dialogEnter {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.card-animate {
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.5s forwards;
}

.doc-animate {
  opacity: 0;
  transform: scale(0.9);
  animation: fadeInUp 0.5s forwards;
}

.menu-animate {
  animation: menuEnter 0.3s ease-out;
}

@keyframes menuEnter {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for detail dialog */
.smooth-scroll {
  scroll-behavior: smooth;
}

.smooth-scroll::-webkit-scrollbar {
  width: 6px;
}

.smooth-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
}

.smooth-scroll::-webkit-scrollbar-thumb {
  background: rgba(189, 240, 0, 0.5);
  border-radius: 10px;
}

.smooth-scroll::-webkit-scrollbar-thumb:hover {
  background: rgba(189, 240, 0, 0.8);
}

.text-lime {
  color: #bdf000;
  text-shadow: 0 0 10px rgba(189, 240, 0, 0.3);
}

.text-green {
  color: #4CAF50;
}

.text-orange {
  color: #FF9800;
}

.text-red {
  color: #F44336;
}

.text-grey {
  color: #999;
}
</style>