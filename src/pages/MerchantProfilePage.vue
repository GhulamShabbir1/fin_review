<template>
  <q-layout view="lHh Lpr lFf">
    <MerchantHeader />
    <q-page-container>
      <q-page class="merchant-profile-page grid-background">
        <!-- Loading State -->
        <div v-if="loading" class="loading-overlay">
          <q-spinner-dots color="lime" size="50px" />
          <p class="loading-text">Loading your profile...</p>
        </div>

        <!-- Breadcrumb -->
        <div class="breadcrumb-section q-pa-md">
          <q-breadcrumbs class="text-grey-6">
            <q-breadcrumbs-el icon="dashboard" label="Dashboard" @click="navigateTo('/dashboard')" class="cursor-pointer" />
            <q-breadcrumbs-el icon="person" label="Profile" />
          </q-breadcrumbs>
        </div>

        <!-- Main Content -->
        <div class="profile-content q-pa-lg">
          <!-- Profile Header -->
          <div class="profile-header q-mb-xl animate-fade-in">
            <div class="profile-avatar-section">
              <q-avatar size="120px" class="profile-avatar">
                <img :src="user.avatar || defaultAvatar" @error="onAvatarError" />
                <q-icon name="camera_alt" size="24px" class="avatar-edit-icon" @click="editAvatar" />
              </q-avatar>
              <div class="avatar-actions">
                <q-btn color="lime" icon="edit" label="Change Photo" @click="editAvatar" size="sm" />
                <q-btn flat color="grey" icon="delete" label="Remove" @click="removeAvatar" size="sm" />
              </div>
            </div>
            <div class="profile-info">
              <h1 class="profile-name">{{ user.name || 'Merchant' }}</h1>
              <p class="profile-email">{{ user.email }}</p>
              <div class="profile-status">
                <q-chip :color="getStatusColor(user.status)" text-color="white" :icon="getStatusIcon(user.status)" size="sm">
                  {{ getStatusLabel(user.status) }}
                </q-chip>
                <q-chip color="blue" text-color="white" icon="verified" size="sm" class="q-ml-sm">
                  {{ user.role || 'merchant' }}
                </q-chip>
              </div>
              <div class="profile-actions">
                <q-btn color="lime" icon="edit" label="Edit Profile" @click="editProfile" />
                <q-btn flat color="blue" icon="settings" label="Settings" @click="navigateTo('/settings')" />
                <q-btn flat color="orange" icon="security" label="Security" @click="navigateTo('/security')" />
              </div>
            </div>
          </div>

          <!-- Profile Sections -->
          <div class="profile-sections">
            <!-- Personal Information -->
            <div class="profile-section q-mb-xl animate-fade-in" style="animation-delay: 0.1s">
              <q-card class="profile-card lime-glow">
                <q-card-section class="section-header">
                  <h3 class="section-title">
                    <q-icon name="person" size="24px" color="lime" class="q-mr-sm" />
                    Personal Information
                  </h3>
                  <q-btn flat color="lime" icon="edit" label="Edit" @click="editPersonalInfo" />
                </q-card-section>
                <q-card-section class="section-content">
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">Full Name</span>
                      <span class="info-value">{{ user.name || 'Not provided' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Email</span>
                      <span class="info-value">{{ user.email }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Phone</span>
                      <span class="info-value">{{ user.phone || 'Not provided' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Date of Birth</span>
                      <span class="info-value">{{ formatDate(user.date_of_birth) || 'Not provided' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Address</span>
                      <span class="info-value">{{ user.address || 'Not provided' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">City</span>
                      <span class="info-value">{{ user.city || 'Not provided' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Country</span>
                      <span class="info-value">{{ user.country || 'Not provided' }}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">Joined</span>
                      <span class="info-value">{{ formatDate(user.created_at) }}</span>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Business Information -->
            <div class="profile-section q-mb-xl animate-fade-in" style="animation-delay: 0.2s">
              <q-card class="profile-card lime-glow">
                <q-card-section class="section-header">
                  <h3 class="section-title">
                    <q-icon name="business" size="24px" color="blue" class="q-mr-sm" />
                    Business Information
                  </h3>
                  <q-btn flat color="blue" icon="edit" label="Edit" @click="editBusinessInfo" />
                </q-card-section>
                <q-card-section class="section-content">
                  <div v-if="businesses.length === 0" class="no-businesses">
                    <q-icon name="store" size="64px" color="grey-5" />
                    <h4>No Businesses Registered</h4>
                    <p>You haven't registered any businesses yet.</p>
                    <q-btn color="lime" label="Register Business" @click="navigateTo('/dashboard')" />
                  </div>
                  <div v-else class="businesses-list">
                    <div v-for="business in businesses" :key="business.id" class="business-item">
                      <div class="business-header">
                        <div class="business-avatar">
                          <q-avatar size="48px" square>
                            <img :src="business.logo_path || defaultBusinessLogo" @error="onBusinessLogoError" />
                          </q-avatar>
                        </div>
                        <div class="business-details">
                          <h4 class="business-name">{{ business.business_name }}</h4>
                          <p class="business-type">{{ business.business_type || 'Business' }}</p>
                          <div class="business-status">
                            <q-chip :color="getStatusColor(business.status)" text-color="white" :icon="getStatusIcon(business.status)" size="sm">
                              {{ getStatusLabel(business.status) }}
                            </q-chip>
                          </div>
                        </div>
                        <div class="business-actions">
                          <q-btn flat round dense icon="visibility" color="blue" @click="viewBusiness(business)" />
                          <q-btn flat round dense icon="edit" color="orange" @click="editBusiness(business)" />
                        </div>
                      </div>
                      <div class="business-info">
                        <div class="info-row">
                          <span class="info-label">Business Address:</span>
                          <span class="info-value">{{ business.business_address || 'Not provided' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Phone:</span>
                          <span class="info-value">{{ business.business_phone || 'Not provided' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Website:</span>
                          <span class="info-value">
                            <a v-if="business.business_website" :href="business.business_website" target="_blank" class="website-link">
                              {{ business.business_website }}
                            </a>
                            <span v-else>Not provided</span>
                          </span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Registered:</span>
                          <span class="info-value">{{ formatDate(business.created_at) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Banking Information -->
            <div class="profile-section q-mb-xl animate-fade-in" style="animation-delay: 0.3s">
              <q-card class="profile-card lime-glow">
                <q-card-section class="section-header">
                  <h3 class="section-title">
                    <q-icon name="account_balance" size="24px" color="green" class="q-mr-sm" />
                    Banking Information
                  </h3>
                  <q-btn flat color="green" icon="edit" label="Edit" @click="editBankingInfo" />
                </q-card-section>
                <q-card-section class="section-content">
                  <div v-if="businesses.length === 0" class="no-banking">
                    <q-icon name="account_balance" size="64px" color="grey-5" />
                    <h4>No Banking Information</h4>
                    <p>Banking information will be available after registering a business.</p>
                  </div>
                  <div v-else class="banking-list">
                    <div v-for="business in businesses" :key="business.id" class="banking-item">
                      <h4 class="banking-title">{{ business.business_name }}</h4>
                      <div class="banking-details">
                        <div class="info-row">
                          <span class="info-label">Account Name:</span>
                          <span class="info-value">{{ business.bank_account_name || 'Not provided' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Account Number:</span>
                          <span class="info-value">{{ maskAccountNumber(business.bank_account_number) }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Bank Name:</span>
                          <span class="info-value">{{ business.bank_name || 'Not provided' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">IFSC/SWIFT:</span>
                          <span class="info-value">{{ business.bank_ifsc_swift || 'Not provided' }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Branch:</span>
                          <span class="info-value">{{ business.bank_branch || 'Not provided' }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Security & Preferences -->
            <div class="profile-section q-mb-xl animate-fade-in" style="animation-delay: 0.4s">
              <q-card class="profile-card lime-glow">
                <q-card-section class="section-header">
                  <h3 class="section-title">
                    <q-icon name="security" size="24px" color="purple" class="q-mr-sm" />
                    Security & Preferences
                  </h3>
                  <q-btn flat color="purple" icon="edit" label="Edit" @click="editSecurityInfo" />
                </q-card-section>
                <q-card-section class="section-content">
                  <div class="security-grid">
                    <div class="security-item">
                      <div class="security-icon">
                        <q-icon name="lock" size="24px" color="green" />
                      </div>
                      <div class="security-content">
                        <h4>Two-Factor Authentication</h4>
                        <p>Add an extra layer of security to your account</p>
                        <q-btn color="green" label="Enable 2FA" size="sm" @click="enable2FA" />
                      </div>
                    </div>
                    <div class="security-item">
                      <div class="security-icon">
                        <q-icon name="notifications" size="24px" color="blue" />
                      </div>
                      <div class="security-content">
                        <h4>Notification Preferences</h4>
                        <p>Manage how you receive notifications</p>
                        <q-btn color="blue" label="Configure" size="sm" @click="configureNotifications" />
                      </div>
                    </div>
                    <div class="security-item">
                      <div class="security-icon">
                        <q-icon name="language" size="24px" color="orange" />
                      </div>
                      <div class="security-content">
                        <h4>Language & Region</h4>
                        <p>Set your preferred language and timezone</p>
                        <q-btn color="orange" label="Configure" size="sm" @click="configureLanguage" />
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>

        <!-- Edit Profile Dialog -->
        <q-dialog v-model="showEditDialog" persistent>
          <q-card class="edit-profile-dialog">
            <q-card-section class="dialog-header">
              <h3 class="dialog-title">{{ editDialogTitle }}</h3>
              <q-btn flat round dense icon="close" @click="closeEditDialog" />
            </q-card-section>
            <q-card-section class="dialog-content">
              <div v-if="editMode === 'personal'" class="edit-form">
                <q-input v-model="editForm.name" label="Full Name" outlined />
                <q-input v-model="editForm.phone" label="Phone" outlined />
                <q-input v-model="editForm.address" label="Address" outlined />
                <q-input v-model="editForm.city" label="City" outlined />
                <q-input v-model="editForm.country" label="Country" outlined />
                <q-input v-model="editForm.date_of_birth" label="Date of Birth" type="date" outlined />
              </div>
              <div v-else-if="editMode === 'business'" class="edit-form">
                <q-input v-model="editForm.business_name" label="Business Name" outlined />
                <q-input v-model="editForm.business_type" label="Business Type" outlined />
                <q-input v-model="editForm.business_address" label="Business Address" outlined />
                <q-input v-model="editForm.business_phone" label="Business Phone" outlined />
                <q-input v-model="editForm.business_website" label="Business Website" outlined />
              </div>
              <div v-else-if="editMode === 'banking'" class="edit-form">
                <q-input v-model="editForm.bank_account_name" label="Account Name" outlined />
                <q-input v-model="editForm.bank_account_number" label="Account Number" outlined />
                <q-input v-model="editForm.bank_name" label="Bank Name" outlined />
                <q-input v-model="editForm.bank_ifsc_swift" label="IFSC/SWIFT" outlined />
                <q-input v-model="editForm.bank_branch" label="Branch" outlined />
              </div>
            </q-card-section>
            <q-card-section class="dialog-actions">
              <q-btn flat label="Cancel" @click="closeEditDialog" />
              <q-btn color="lime" label="Save Changes" @click="saveChanges" :loading="saving" />
            </q-card-section>
          </q-card>
        </q-dialog>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from '../store/auth'
import { api } from '../boot/axios'
import MerchantHeader from '../components/navigation/MerchantHeader.vue'

const router = useRouter()
const $q = useQuasar()
const authStore = useAuthStore()

// Reactive data
const loading = ref(false)
const saving = ref(false)
const showEditDialog = ref(false)
const editMode = ref('personal')
const editDialogTitle = ref('Edit Profile')
const editForm = ref({})

// Default images
const defaultAvatar = '/img/default-avatar.png'
const defaultBusinessLogo = '/img/default-business.png'

// Computed properties
const user = computed(() => authStore.user || {})
const businesses = computed(() => authStore.businesses || [])

// Methods
const navigateTo = (route) => {
  router.push(route)
}

const loadProfileData = async () => {
  try {
    loading.value = true
    
    // Load user profile data
    await authStore.getProfile()
    
    // Load business data if not already loaded
    if (businesses.value.length === 0) {
      // This would typically be loaded from a business store
      console.log('No businesses loaded')
    }
    
  } catch (error) {
    console.error('Error loading profile:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to load profile data',
      position: 'top'
    })
  } finally {
    loading.value = false
  }
}

const editProfile = () => {
  editMode.value = 'personal'
  editDialogTitle.value = 'Edit Personal Information'
  editForm.value = {
    name: user.value.name || '',
    phone: user.value.phone || '',
    address: user.value.address || '',
    city: user.value.city || '',
    country: user.value.country || '',
    date_of_birth: user.value.date_of_birth || ''
  }
  showEditDialog.value = true
}

const editBusinessInfo = () => {
  if (businesses.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No businesses to edit',
      position: 'top'
    })
    return
  }
  
  editMode.value = 'business'
  editDialogTitle.value = 'Edit Business Information'
  const business = businesses.value[0]
  editForm.value = {
    business_name: business.business_name || '',
    business_type: business.business_type || '',
    business_address: business.business_address || '',
    business_phone: business.business_phone || '',
    business_website: business.business_website || ''
  }
  showEditDialog.value = true
}

const editBankingInfo = () => {
  if (businesses.value.length === 0) {
    $q.notify({
      type: 'info',
      message: 'No businesses to edit',
      position: 'top'
    })
    return
  }
  
  editMode.value = 'banking'
  editDialogTitle.value = 'Edit Banking Information'
  const business = businesses.value[0]
  editForm.value = {
    bank_account_name: business.bank_account_name || '',
    bank_account_number: business.bank_account_number || '',
    bank_name: business.bank_name || '',
    bank_ifsc_swift: business.bank_ifsc_swift || '',
    bank_branch: business.bank_branch || ''
  }
  showEditDialog.value = true
}

const editSecurityInfo = () => {
  $q.notify({
    type: 'info',
    message: 'Security settings will be implemented soon',
    position: 'top'
  })
}

const editAvatar = () => {
  $q.notify({
    type: 'info',
    message: 'Avatar editing will be implemented soon',
    position: 'top'
  })
}

const removeAvatar = () => {
  $q.notify({
    type: 'info',
    message: 'Avatar removal will be implemented soon',
    position: 'top'
  })
}

const viewBusiness = (business) => {
  // Navigate to business details or show dialog
  $q.notify({
    type: 'info',
    message: `Viewing ${business.business_name}`,
    position: 'top'
  })
}

const editBusiness = (business) => {
  // Navigate to business edit or show dialog
  $q.notify({
    type: 'info',
    message: `Editing ${business.business_name}`,
    position: 'top'
  })
}

const enable2FA = () => {
  $q.notify({
    type: 'info',
    message: '2FA setup will be implemented soon',
    position: 'top'
  })
}

const configureNotifications = () => {
  $q.notify({
    type: 'info',
    message: 'Notification settings will be implemented soon',
    position: 'top'
  })
}

const configureLanguage = () => {
  $q.notify({
    type: 'info',
    message: 'Language settings will be implemented soon',
    position: 'top'
  })
}

const saveChanges = async () => {
  try {
    saving.value = true
    
    // Save changes based on edit mode
    if (editMode.value === 'personal') {
      // Update personal information
      await api.put('/api/profile', editForm.value)
      $q.notify({
        type: 'positive',
        message: 'Personal information updated successfully',
        position: 'top'
      })
    } else if (editMode.value === 'business') {
      // Update business information
      await api.put('/api/merchant/business', editForm.value)
      $q.notify({
        type: 'positive',
        message: 'Business information updated successfully',
        position: 'top'
      })
    } else if (editMode.value === 'banking') {
      // Update banking information
      await api.put('/api/merchant/banking', editForm.value)
      $q.notify({
        type: 'positive',
        message: 'Banking information updated successfully',
        position: 'top'
      })
    }
    
    closeEditDialog()
    loadProfileData() // Reload data
    
  } catch (error) {
    console.error('Error saving changes:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to save changes',
      position: 'top'
    })
  } finally {
    saving.value = false
  }
}

const closeEditDialog = () => {
  showEditDialog.value = false
  editForm.value = {}
}

const onAvatarError = () => {
  // Handle avatar loading error
}

const onBusinessLogoError = () => {
  // Handle business logo loading error
}

const getStatusColor = (status) => {
  const colors = {
    active: 'green',
    pending: 'orange',
    suspended: 'red',
    verified: 'green',
    approved: 'green',
    rejected: 'red'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    active: 'check_circle',
    pending: 'pending',
    suspended: 'block',
    verified: 'verified',
    approved: 'check_circle',
    rejected: 'cancel'
  }
  return icons[status] || 'help'
}

const getStatusLabel = (status) => {
  const labels = {
    active: 'Active',
    pending: 'Pending',
    suspended: 'Suspended',
    verified: 'Verified',
    approved: 'Approved',
    rejected: 'Rejected'
  }
  return labels[status] || 'Unknown'
}

const formatDate = (dateString) => {
  if (!dateString) return 'Not provided'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const maskAccountNumber = (accountNumber) => {
  if (!accountNumber) return 'Not provided'
  const str = String(accountNumber)
  if (str.length <= 4) return str
  return '*'.repeat(str.length - 4) + str.slice(-4)
}

// Lifecycle
onMounted(() => {
  loadProfileData()
})
</script>

<style scoped>
.merchant-profile-page {
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

.breadcrumb-section {
  background: rgba(255, 255, 255, 0.02);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.breadcrumb-section .cursor-pointer:hover {
  color: #bdf000;
}

.profile-content {
  max-width: 1200px;
  margin: 0 auto;
}

/* Profile Header */
.profile-header {
  display: flex;
  gap: 32px;
  align-items: flex-start;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.profile-avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.profile-avatar {
  position: relative;
  border: 4px solid rgba(189, 240, 0.3);
}

.avatar-edit-icon {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.8);
  border-radius: 50%;
  padding: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-edit-icon:hover {
  background: rgba(189, 240, 0.8);
  color: #000;
}

.avatar-actions {
  display: flex;
  gap: 8px;
}

.profile-info {
  flex: 1;
}

.profile-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.profile-email {
  font-size: 1.1rem;
  color: #ccc;
  margin: 0 0 16px 0;
}

.profile-status {
  margin-bottom: 24px;
}

.profile-actions {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

/* Profile Sections */
.profile-section {
  animation: fadeInUp 0.6s ease-out;
}

.profile-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 16px;
}

.section-title {
  color: #ffffff;
  margin: 0;
  display: flex;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 600;
}

.section-content {
  padding-top: 24px;
}

/* Information Grid */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-label {
  font-size: 0.9rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.info-value {
  font-size: 1rem;
  color: #ffffff;
  font-weight: 500;
}

/* Business List */
.no-businesses,
.no-banking {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.no-businesses h4,
.no-banking h4 {
  color: #bdf000;
  margin: 16px 0 8px 0;
}

.no-businesses p,
.no-banking p {
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.businesses-list,
.banking-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.business-item,
.banking-item {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.business-header {
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 16px;
}

.business-avatar img {
  border-radius: 8px;
  border: 2px solid rgba(189, 240, 0.3);
}

.business-details {
  flex: 1;
}

.business-name,
.banking-title {
  color: #ffffff;
  margin: 0 0 4px 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.business-type {
  color: #ccc;
  margin: 0 0 8px 0;
  font-size: 0.9rem;
}

.business-status {
  display: flex;
  gap: 8px;
}

.business-actions {
  display: flex;
  gap: 8px;
}

.business-info,
.banking-details {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.website-link {
  color: #bdf000;
  text-decoration: none;
}

.website-link:hover {
  text-decoration: underline;
}

/* Security Grid */
.security-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.security-item {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.security-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
}

.security-content {
  flex: 1;
}

.security-content h4 {
  color: #ffffff;
  margin: 0 0 8px 0;
  font-size: 1rem;
  font-weight: 600;
}

.security-content p {
  color: #ccc;
  margin: 0 0 16px 0;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Edit Dialog */
.edit-profile-dialog {
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
  min-width: 500px;
  max-width: 80vw;
}

.dialog-header {
  background: rgba(189, 240, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-title {
  color: #ffffff;
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.dialog-content {
  padding: 24px;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;
}

/* Animations */
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

.animate-fade-in {
  animation: fadeInUp 0.6s ease-out;
}

/* Responsive Design */
@media (max-width: 768px) {
  .profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .profile-actions {
    justify-content: center;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .security-grid {
    grid-template-columns: 1fr;
  }
  
  .edit-profile-dialog {
    min-width: 90vw;
  }
}
</style>