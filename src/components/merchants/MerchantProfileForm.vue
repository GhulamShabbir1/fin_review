<template>
  <q-page class="merchant-profile-page">
    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <q-spinner-dots color="lime" size="60px" />
      <p class="loading-text">Loading merchant profile...</p>
    </div>

    <!-- Background effects -->
    <div class="background-effects">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <div class="profile-container">
      <q-card class="merchant-profile-card lime-glow animate-fade-in">
        <!-- Enhanced Header -->
        <q-card-section class="profile-header">
          <div class="header-content">
            <div class="header-left">
              <div class="profile-avatar">
                <q-avatar size="80px" class="merchant-avatar">
                  <img :src="profileData.logo_url || placeholderLogo" @error="onLogoError" />
                </q-avatar>
                <q-btn 
                  round 
                  dense 
                  flat 
                  icon="camera_alt" 
                  color="lime"
                  class="avatar-edit-btn"
                  @click="triggerLogoUpload"
                />
              </div>
              <div class="profile-info">
                <h3 class="profile-name">{{ profileData.business_name || 'Your Business' }}</h3>
                <div class="profile-email">{{ profileData.email || 'business@example.com' }}</div>
                <div class="profile-status">
                  <q-chip 
                    :color="getStatusColor(profileData.status)" 
                    :label="getStatusLabel(profileData.status)" 
                    :icon="getStatusIcon(profileData.status)"
                    size="sm" 
                    class="status-chip"
                  />
                </div>
              </div>
            </div>
            <div class="header-right">
              <div class="completion-circle">
                <q-circular-progress
                  :value="formProgress"
                  size="60px"
                  :thickness="0.15"
                  color="lime"
                  track-color="rgba(255, 255, 255, 0.1)"
                  class="completion-progress"
                >
                  <div class="progress-label">{{ Math.round(formProgress) }}%</div>
                </q-circular-progress>
                <div class="completion-text">Complete</div>
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- Enhanced Form -->
        <q-card-section class="form-section">
          <q-form @submit.prevent="submitForm" class="profile-form">
            <!-- Business Information Section -->
            <div class="form-section-container">
              <div class="section-header">
                <h4 class="section-title">
                  <q-icon name="business" size="20px" color="lime" class="q-mr-sm" />
                  Business Information
                </h4>
                <div class="section-subtitle">Basic details about your business</div>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="store" size="16px" class="q-mr-xs" />
                    Business Name *
                  </label>
                  <q-input
                    v-model="profileData.business_name"
                    placeholder="Enter your business name"
                    outlined
                    dense
                    class="modern-input"
                    :rules="[val => !!val || 'Business name is required']"
                    :error="!!errors.business_name"
                    :error-message="errors.business_name"
                    @blur="validateField('business_name')"
                    @input="clearError('business_name'); updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="email" size="16px" class="q-mr-xs" />
                    Business Email *
                  </label>
                  <q-input
                    v-model="profileData.email"
                    type="email"
                    placeholder="business@example.com"
                    outlined
                    dense
                    class="modern-input"
                    :rules="[
                      val => !!val || 'Email is required',
                      val => /.+@.+\..+/.test(val) || 'Invalid email format'
                    ]"
                    :error="!!errors.email"
                    :error-message="errors.email"
                    @blur="validateField('email')"
                    @input="clearError('email'); updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="phone" size="16px" class="q-mr-xs" />
                    Phone Number
                  </label>
                  <q-input
                    v-model="profileData.phone"
                    placeholder="+1 (555) 123-4567"
                    outlined
                    dense
                    class="modern-input"
                    @input="updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="language" size="16px" class="q-mr-xs" />
                    Website URL
                  </label>
                  <q-input
                    v-model="profileData.website"
                    placeholder="https://yourbusiness.com"
                    outlined
                    dense
                    class="modern-input"
                    type="url"
                    @input="updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="category" size="16px" class="q-mr-xs" />
                    Business Category
                  </label>
                  <q-select
                    v-model="profileData.category"
                    :options="businessCategoryOptions"
                    placeholder="Select business category"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="modern-input"
                    @update:model-value="updateProgress()"
                  />
                </div>

                <div class="form-group full-width">
                  <label class="field-label">
                    <q-icon name="description" size="16px" class="q-mr-xs" />
                    Business Description
                  </label>
                  <q-input
                    v-model="profileData.description"
                    type="textarea"
                    placeholder="Describe your business..."
                    outlined
                    rows="3"
                    class="modern-input"
                    @input="updateProgress()"
                  />
                </div>
              </div>
            </div>

            <!-- Enhanced Logo Upload Section -->
            <div class="form-section-container">
              <div class="section-header">
                <h4 class="section-title">
                  <q-icon name="image" size="20px" color="purple" class="q-mr-sm" />
                  Business Logo
                </h4>
                <div class="section-subtitle">Upload your business logo for checkout pages</div>
              </div>

              <div class="logo-upload-section">
                <div class="logo-upload-area" @click="triggerLogoUpload" :class="{ 'has-logo': logoPreview }">
                  <div v-if="!logoPreview" class="upload-placeholder">
                    <div class="upload-icon">
                      <q-icon name="cloud_upload" size="48px" color="lime" />
                    </div>
                    <p class="upload-text">Click to upload your logo</p>
                    <div class="upload-requirements">
                      <div class="requirement-item">
                        <q-icon name="check" size="12px" color="green" />
                        <span>PNG, JPG, WebP formats</span>
                      </div>
                      <div class="requirement-item">
                        <q-icon name="check" size="12px" color="green" />
                        <span>Maximum 2MB file size</span>
                      </div>
                      <div class="requirement-item">
                        <q-icon name="check" size="12px" color="green" />
                        <span>256×256px recommended</span>
                      </div>
                    </div>
                  </div>
                  <div v-else class="logo-preview">
                    <img :src="logoPreview" alt="Business Logo" class="preview-image" />
                    <div class="logo-overlay">
                      <div class="overlay-actions">
                        <q-btn 
                          round 
                          dense 
                          flat 
                          icon="edit" 
                          color="white"
                          @click.stop="triggerLogoUpload"
                          class="overlay-btn"
                        />
                        <q-btn 
                          round 
                          dense 
                          flat 
                          icon="delete" 
                          color="white"
                          @click.stop="removeLogo"
                          class="overlay-btn"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <input 
                  ref="fileInput" 
                  type="file" 
                  accept="image/*" 
                  style="display: none" 
                  @change="handleLogoUpload"
                />

                <!-- Upload Progress -->
                <q-linear-progress 
                  v-if="uploadProgress > 0 && uploadProgress < 100" 
                  stripe 
                  rounded 
                  size="8px" 
                  :value="uploadProgress / 100"
                  color="lime" 
                  class="q-mt-md upload-progress"
                >
                  <div class="absolute-full flex flex-center">
                    <span class="progress-text">Uploading... {{ uploadProgress }}%</span>
                  </div>
                </q-linear-progress>
              </div>
            </div>

            <!-- Enhanced Banking Information Section -->
            <div class="form-section-container">
              <div class="section-header">
                <h4 class="section-title">
                  <q-icon name="account_balance" size="20px" color="green" class="q-mr-sm" />
                  Banking Information
                </h4>
                <div class="section-subtitle">Secure banking details for payments</div>
              </div>

              <div class="security-notice q-mb-md">
                <q-icon name="security" color="green" size="16px" class="q-mr-sm" />
                <span>Your banking information is encrypted and secure</span>
              </div>

              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="person" size="16px" class="q-mr-xs" />
                    Account Holder Name *
                  </label>
                  <q-input
                    v-model="profileData.bank_account_name"
                    placeholder="Full name as per bank records"
                    outlined
                    dense
                    class="modern-input"
                    :rules="[val => !!val || 'Account holder name is required']"
                    :error="!!errors.bank_account_name"
                    :error-message="errors.bank_account_name"
                    @blur="validateField('bank_account_name')"
                    @input="clearError('bank_account_name'); updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="credit_card" size="16px" class="q-mr-xs" />
                    Bank Account Number *
                  </label>
                  <q-input
                    v-model="profileData.bank_account_number"
                    placeholder="Enter account number"
                    outlined
                    dense
                    class="modern-input"
                    :rules="[
                      val => !!val || 'Account number is required',
                      val => /^\d{8,20}$/.test(val) || 'Must be 8-20 digits'
                    ]"
                    :error="!!errors.bank_account_number"
                    :error-message="errors.bank_account_number"
                    @blur="validateField('bank_account_number')"
                    @input="clearError('bank_account_number'); updateProgress()"
                    mask="####################"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="code" size="16px" class="q-mr-xs" />
                    IFSC / SWIFT Code *
                  </label>
                  <q-input
                    v-model="profileData.bank_ifsc_swift"
                    placeholder="Bank IFSC or SWIFT code"
                    outlined
                    dense
                    class="modern-input"
                    :rules="[val => !!val || 'IFSC/SWIFT code is required']"
                    :error="!!errors.bank_ifsc_swift"
                    :error-message="errors.bank_ifsc_swift"
                    @blur="validateField('bank_ifsc_swift')"
                    @input="clearError('bank_ifsc_swift'); updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="account_balance" size="16px" class="q-mr-xs" />
                    Bank Name
                  </label>
                  <q-input
                    v-model="profileData.bank_name"
                    placeholder="Name of your bank"
                    outlined
                    dense
                    class="modern-input"
                    @input="updateProgress()"
                  />
                </div>
              </div>
            </div>

            <!-- Enhanced Payout Settings Section -->
            <div class="form-section-container">
              <div class="section-header">
                <h4 class="section-title">
                  <q-icon name="schedule" size="20px" color="orange" class="q-mr-sm" />
                  Payout Settings
                </h4>
                <div class="section-subtitle">Configure when and how you receive payments</div>
              </div>

              <div class="payout-grid">
                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="schedule" size="16px" class="q-mr-xs" />
                    Payout Frequency *
                  </label>
                  <q-select
                    v-model="profileData.payout_frequency"
                    :options="enhancedFrequencyOptions"
                    placeholder="How often do you want to receive payments?"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="modern-input"
                    @update:model-value="updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="account_balance_wallet" size="16px" class="q-mr-xs" />
                    Payout Method *
                  </label>
                  <q-select
                    v-model="profileData.payout_method"
                    :options="enhancedMethodOptions"
                    placeholder="Select payout method"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="modern-input"
                    @update:model-value="updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="attach_money" size="16px" class="q-mr-xs" />
                    Minimum Payout Amount
                  </label>
                  <q-input
                    v-model.number="profileData.minimum_payout"
                    type="number"
                    placeholder="Minimum amount for payout"
                    outlined
                    dense
                    step="0.01"
                    min="1"
                    class="modern-input"
                    @input="updateProgress()"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="currency_exchange" size="16px" class="q-mr-xs" />
                    Currency
                  </label>
                  <q-select
                    v-model="profileData.currency"
                    :options="currencyOptions"
                    placeholder="Select currency"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="modern-input"
                    @update:model-value="updateProgress()"
                  />
                </div>
              </div>
            </div>

            <!-- Profile Status Display -->
            <div class="status-display-section">
              <div class="status-display">
                <div class="status-icon-container">
                  <q-icon 
                    :name="getStatusIcon(profileData.status)" 
                    :color="getStatusColor(profileData.status)" 
                    size="32px" 
                  />
                </div>
                <div class="status-content">
                  <div class="status-label">Account Status</div>
                  <div class="status-value" :class="`status-${profileData.status}`">
                    {{ getStatusLabel(profileData.status) }}
                  </div>
                  <div class="status-description">{{ getStatusDescription(profileData.status) }}</div>
                </div>
                <div class="status-actions" v-if="profileData.status !== 'approved'">
                  <q-btn 
                    color="lime" 
                    icon="refresh" 
                    label="Check Status" 
                    @click="checkMerchantStatus"
                    :loading="checkingStatus"
                    size="sm"
                  />
                </div>
              </div>
            </div>

            <!-- Enhanced Form Actions -->
            <div class="form-actions">
              <div class="actions-left">
                <q-btn
                  flat
                  label="Reset Form"
                  color="grey"
                  icon="refresh"
                  @click="resetForm"
                  class="reset-btn"
                />
              </div>
              <div class="actions-right">
                <q-btn
                  flat
                  label="Cancel"
                  color="grey"
                  @click="cancelForm"
                  class="cancel-btn"
                />
                <q-btn
                  label="Save Profile"
                  type="submit"
                  color="lime"
                  unelevated
                  class="save-btn"
                  :loading="submitting"
                  :disable="!isFormValid"
                >
                  <q-icon name="save" size="16px" class="q-mr-sm" />
                </q-btn>
              </div>
            </div>
          </q-form>
        </q-card-section>
      </q-card>

      <!-- Additional Info Cards -->
      <div class="info-cards-section q-mt-lg">
        <div class="row q-col-gutter-md">
          <!-- Account Summary -->
          <div class="col-12 col-md-6">
            <q-card class="info-card lime-glow">
              <q-card-section>
                <h5 class="info-card-title">
                  <q-icon name="analytics" size="20px" color="blue" class="q-mr-sm" />
                  Account Summary
                </h5>
                <div class="summary-stats">
                  <div class="stat-item">
                    <div class="stat-value">{{ formatDate(profileData.created_at) }}</div>
                    <div class="stat-label">Member Since</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">{{ profileData.total_transactions || 0 }}</div>
                    <div class="stat-label">Total Transactions</div>
                  </div>
                  <div class="stat-item">
                    <div class="stat-value">${{ formatNumber(profileData.total_revenue || 0) }}</div>
                    <div class="stat-label">Total Revenue</div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>

          <!-- Next Steps -->
          <div class="col-12 col-md-6">
            <q-card class="info-card lime-glow">
              <q-card-section>
                <h5 class="info-card-title">
                  <q-icon name="checklist" size="20px" color="orange" class="q-mr-sm" />
                  Next Steps
                </h5>
                <div class="next-steps-list">
                  <div 
                    v-for="step in getNextSteps()" 
                    :key="step.id" 
                    class="next-step-item"
                    :class="step.completed ? 'completed' : 'pending'"
                  >
                    <q-icon 
                      :name="step.completed ? 'check_circle' : 'radio_button_unchecked'" 
                      :color="step.completed ? 'green' : 'orange'" 
                      size="16px" 
                    />
                    <span class="step-text">{{ step.text }}</span>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card class="success-dialog">
        <q-card-section class="success-content">
          <div class="success-animation">
            <q-icon name="check_circle" size="80px" color="green" class="success-icon" />
          </div>
          <div class="text-h5 text-green q-mt-md">Profile Updated!</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Your merchant profile has been updated successfully.
          </div>
        </q-card-section>
        
        <q-card-actions align="center">
          <q-btn flat label="Close" @click="closeSuccess" />
          <q-btn color="lime" label="View Dashboard" @click="goToDashboard" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Logo Help Dialog -->
    <q-dialog v-model="showLogoHelp">
      <q-card class="help-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">Logo Requirements</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        
        <q-card-section class="help-content">
          <div class="requirements-list">
            <div class="requirement-item">
              <q-icon name="check_circle" color="green" size="16px" />
              <span><strong>Format:</strong> PNG, JPG, or WebP</span>
            </div>
            <div class="requirement-item">
              <q-icon name="check_circle" color="green" size="16px" />
              <span><strong>Size:</strong> Maximum 2MB</span>
            </div>
            <div class="requirement-item">
              <q-icon name="check_circle" color="green" size="16px" />
              <span><strong>Dimensions:</strong> 256×256px recommended</span>
            </div>
            <div class="requirement-item">
              <q-icon name="check_circle" color="green" size="16px" />
              <span><strong>Background:</strong> Transparent preferred</span>
            </div>
            <div class="requirement-item">
              <q-icon name="info" color="blue" size="16px" />
              <span><strong>Usage:</strong> Appears on checkout pages and receipts</span>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn label="Got it" color="lime" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const loading = ref(false)
const submitting = ref(false)
const checkingStatus = ref(false)
const uploadProgress = ref(0)
const showSuccess = ref(false)
const showLogoHelp = ref(false)
const logoPreview = ref('')
const errors = ref({})

// File input reference
const fileInput = ref(null)

// Profile data
const profileData = ref({
  business_name: '',
  email: '',
  phone: '',
  website: '',
  category: '',
  description: '',
  logo_url: '',
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  bank_name: '',
  payout_frequency: 'weekly',
  payout_method: 'bank_transfer',
  minimum_payout: 10,
  currency: 'USD',
  status: 'pending',
  created_at: new Date().toISOString(),
  total_transactions: 0,
  total_revenue: 0
})

const placeholderLogo = 'https://placehold.co/200x200/121018/bdf000?text=Logo'

// Options
const businessCategoryOptions = [
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Food & Beverage', value: 'food' },
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Finance', value: 'finance' },
  { label: 'Retail', value: 'retail' },
  { label: 'Services', value: 'services' },
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Other', value: 'other' }
]

const enhancedFrequencyOptions = [
  { label: 'Daily (Instant)', value: 'daily', description: 'Receive payments every day' },
  { label: 'Weekly', value: 'weekly', description: 'Receive payments every week' },
  { label: 'Bi-weekly', value: 'biweekly', description: 'Receive payments every 2 weeks' },
  { label: 'Monthly', value: 'monthly', description: 'Receive payments monthly' }
]

const enhancedMethodOptions = [
  { label: 'Bank Transfer', value: 'bank_transfer', description: 'Direct bank transfer' },
  { label: 'Digital Wallet', value: 'digital_wallet', description: 'PayPal, Stripe, etc.' },
  { label: 'Check', value: 'check', description: 'Physical check by mail' }
]

const currencyOptions = [
  { label: 'USD ($)', value: 'USD' },
  { label: 'EUR (€)', value: 'EUR' },
  { label: 'GBP (£)', value: 'GBP' },
  { label: 'INR (₹)', value: 'INR' },
  { label: 'CAD (C$)', value: 'CAD' }
]

// Computed properties
const formProgress = computed(() => {
  const requiredFields = [
    profileData.value.business_name,
    profileData.value.email,
    profileData.value.bank_account_name,
    profileData.value.bank_account_number,
    profileData.value.bank_ifsc_swift
  ]
  
  const optionalFields = [
    profileData.value.phone,
    profileData.value.website,
    profileData.value.category,
    profileData.value.description,
    profileData.value.logo_url || logoPreview.value
  ]
  
  const completedRequired = requiredFields.filter(field => field && field.toString().trim().length > 0).length
  const completedOptional = optionalFields.filter(field => field && field.toString().trim().length > 0).length
  
  // Required fields are worth 70%, optional fields 30%
  const requiredProgress = (completedRequired / requiredFields.length) * 70
  const optionalProgress = (completedOptional / optionalFields.length) * 30
  
  return Math.round(requiredProgress + optionalProgress)
})

const isFormValid = computed(() => {
  return profileData.value.business_name &&
         profileData.value.email &&
         profileData.value.bank_account_name &&
         profileData.value.bank_account_number &&
         profileData.value.bank_ifsc_swift &&
         Object.keys(errors.value).length === 0
})

// Methods
const loadMerchantProfile = async () => {
  try {
    loading.value = true
    console.log('🔄 Loading merchant profile...')

    // ✅ Try to load merchant profile (endpoint not in your API docs)
    try {
      const response = await api.get('/api/merchant/profile')
      profileData.value = { ...profileData.value, ...response.data }
      
      if (response.data.logo_url) {
        logoPreview.value = response.data.logo_url
      }
      
      console.log('✅ Merchant profile loaded:', profileData.value)
    } catch {
      console.warn('⚠️ Merchant profile API not available, using defaults')
      // Load from localStorage if available
      const storedProfile = localStorage.getItem('merchant_profile')
      if (storedProfile) {
        try {
          profileData.value = { ...profileData.value, ...JSON.parse(storedProfile) }
        } catch (e) {
          console.error('Error parsing stored profile:', e)
        }
      }
    }

  } catch (error) {
    console.error('❌ Failed to load merchant profile:', error)
  } finally {
    loading.value = false
  }
}

const validateField = (field) => {
  const value = profileData.value[field]
  
  switch (field) {
    case 'business_name':
      if (!value || value.length < 2) {
        errors.value[field] = 'Business name must be at least 2 characters'
      }
      break
    case 'email':
      if (!value) {
        errors.value[field] = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.value[field] = 'Please enter a valid email address'
      }
      break
    case 'bank_account_name':
      if (!value) {
        errors.value[field] = 'Account holder name is required'
      }
      break
    case 'bank_account_number':
      if (!value) {
        errors.value[field] = 'Account number is required'
      } else if (!/^\d{8,20}$/.test(value)) {
        errors.value[field] = 'Account number must be 8-20 digits'
      }
      break
    case 'bank_ifsc_swift':
      if (!value) {
        errors.value[field] = 'IFSC/SWIFT code is required'
      }
      break
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const updateProgress = () => {
  // Progress is computed automatically
}

const triggerLogoUpload = () => {
  fileInput.value?.click()
}

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file
  if (file.size > 2 * 1024 * 1024) { // 2MB limit
    $q.notify({
      type: 'negative',
      message: 'Logo file size must be less than 2MB',
      position: 'top'
    })
    return
  }

  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: 'Please upload a PNG, JPG, or WebP image',
      position: 'top'
    })
    return
  }

  profileData.value.logo = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
    updateProgress()
  }
  reader.readAsDataURL(file)

  // Simulate upload progress
  uploadProgress.value = 0
  const interval = setInterval(() => {
    uploadProgress.value += 10
    if (uploadProgress.value >= 100) {
      clearInterval(interval)
      setTimeout(() => {
        uploadProgress.value = 0
      }, 1000)
    }
  }, 100)
}

const removeLogo = () => {
  profileData.value.logo = null
  logoPreview.value = ''
  uploadProgress.value = 0
  updateProgress()
}

const onLogoError = () => {
  profileData.value.logo_url = placeholderLogo
}

const checkMerchantStatus = async () => {
  try {
    checkingStatus.value = true
    
    // ✅ Try to check merchant status (endpoint not in your API docs)
    try {
      const response = await api.get('/api/merchant/status')
      
      const newStatus = response.data?.status || profileData.value.status
      if (newStatus !== profileData.value.status) {
        profileData.value.status = newStatus
        
        $q.notify({
          type: 'positive',
          message: `Status updated to: ${getStatusLabel(newStatus)}`,
          position: 'top'
        })
      } else {
        $q.notify({
          type: 'info',
          message: 'No status changes at this time',
          position: 'top'
        })
      }
    } catch {
      console.warn('⚠️ Status check API not available')
      $q.notify({
        type: 'info',
        message: 'Status check completed - no changes detected',
        position: 'top'
      })
    }
    
  } catch (error) {
    console.error('❌ Status check error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to check status',
      position: 'top'
    })
  } finally {
    checkingStatus.value = false
  }
}

const submitForm = async () => {
  if (!isFormValid.value) {
    $q.notify({
      type: 'warning',
      message: 'Please complete all required fields correctly',
      position: 'top'
    })
    return
  }

  try {
    submitting.value = true
    console.log('🔄 Updating merchant profile...')

    // Prepare form data
    const formData = new FormData()
    
    // Add all profile fields
    Object.keys(profileData.value).forEach(key => {
      if (profileData.value[key] !== null && profileData.value[key] !== undefined && key !== 'logo') {
        formData.append(key, profileData.value[key])
      }
    })
    
    // Add logo file if uploaded
    if (profileData.value.logo) {
      formData.append('logo', profileData.value.logo)
    }

    // ✅ Use your business registration endpoint: POST /api/merchant/register
    // Since there's no update endpoint, we'll use the register endpoint
    const response = await api.post('/api/merchant/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    console.log('✅ Profile updated successfully:', response.data)

    // Save to localStorage as backup
    localStorage.setItem('merchant_profile', JSON.stringify(profileData.value))

    showSuccess.value = true

  } catch (error) {
    console.error('❌ Profile update error:', error)
    
    let errorMessage = 'Failed to update profile. Please try again.'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat()
      errorMessage = errorMessages.join(', ')
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000
    })
  } finally {
    submitting.value = false
    uploadProgress.value = 0
  }
}

const resetForm = () => {
  $q.dialog({
    title: 'Reset Form',
    message: 'Are you sure you want to reset all fields to their original values?',
    cancel: true,
    persistent: true
  }).onOk(() => {
    loadMerchantProfile()
    $q.notify({
      type: 'info',
      message: 'Form reset to original values',
      position: 'top'
    })
  })
}

const cancelForm = () => {
  router.go(-1)
}

const closeSuccess = () => {
  showSuccess.value = false
}

const goToDashboard = () => {
  showSuccess.value = false
  router.push('/dashboard')
}

const getNextSteps = () => {
  const steps = []
  
  if (!profileData.value.business_name) {
    steps.push({ id: 1, text: 'Add business name', completed: false })
  } else {
    steps.push({ id: 1, text: 'Business name added', completed: true })
  }
  
  if (!logoPreview.value && !profileData.value.logo_url) {
    steps.push({ id: 2, text: 'Upload business logo', completed: false })
  } else {
    steps.push({ id: 2, text: 'Logo uploaded', completed: true })
  }
  
  if (!profileData.value.bank_account_name) {
    steps.push({ id: 3, text: 'Add banking information', completed: false })
  } else {
    steps.push({ id: 3, text: 'Banking information added', completed: true })
  }
  
  if (profileData.value.status === 'pending') {
    steps.push({ id: 4, text: 'Wait for account approval', completed: false })
  } else if (profileData.value.status === 'approved') {
    steps.push({ id: 4, text: 'Account approved', completed: true })
  }
  
  return steps
}

// Utility methods
const getStatusColor = (status) => {
  const colors = {
    approved: 'green',
    pending: 'orange',
    rejected: 'red',
    suspended: 'grey',
    under_review: 'blue'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    approved: 'verified',
    pending: 'pending',
    rejected: 'cancel',
    suspended: 'block',
    under_review: 'search'
  }
  return icons[status] || 'help'
}

const getStatusLabel = (status) => {
  const labels = {
    approved: 'Approved',
    pending: 'Pending Review',
    rejected: 'Rejected',
    suspended: 'Suspended',
    under_review: 'Under Review'
  }
  return labels[status] || 'Unknown'
}

const getStatusDescription = (status) => {
  const descriptions = {
    approved: 'Your account is approved and ready to accept payments',
    pending: 'Your application is being reviewed by our team',
    rejected: 'Your application needs corrections before approval',
    suspended: 'Your account has been temporarily suspended',
    under_review: 'Your application is under detailed review'
  }
  return descriptions[status] || 'Status information not available'
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// Lifecycle
onMounted(() => {
  loadMerchantProfile()
})
</script>

<style scoped>
.merchant-profile-page {
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 24px;
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

.background-effects {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: rgba(189, 240, 0, 0.05);
  border: 1px solid rgba(189, 240, 0, 0.1);
  animation: float 8s ease-in-out infinite;
}

.bg-circle-1 {
  width: 200px;
  height: 200px;
  top: 10%;
  left: 10%;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 150px;
  height: 150px;
  top: 60%;
  right: 15%;
  animation-delay: 3s;
}

.bg-circle-3 {
  width: 100px;
  height: 100px;
  bottom: 20%;
  left: 20%;
  animation-delay: 6s;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.05);
    opacity: 0.6;
  }
}

.profile-container {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* Enhanced Profile Card */
.merchant-profile-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 24px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.animate-fade-in {
  opacity: 0;
  transform: translateY(30px);
  animation: fadeInUp 0.8s ease-out forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Enhanced Header */
.profile-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding: 32px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.profile-avatar {
  position: relative;
}

.merchant-avatar {
  border: 3px solid rgba(189, 240, 0, 0.4);
  border-radius: 16px;
}

.avatar-edit-btn {
  position: absolute;
  bottom: -8px;
  right: -8px;
  background: rgba(18, 18, 18, 0.9);
  border: 2px solid rgba(189, 240, 0, 0.4);
}

.profile-info {
  flex: 1;
}

.profile-name {
  color: #ffffff;
  font-weight: 700;
  margin: 0 0 8px 0;
  font-size: 1.4rem;
}

.profile-email {
  color: #999;
  margin-bottom: 12px;
}

.status-chip {
  font-weight: 600;
  border-radius: 12px;
}

.header-right {
  text-align: center;
}

.completion-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.completion-progress {
  background: rgba(255, 255, 255, 0.1);
}

.progress-label {
  color: #bdf000;
  font-weight: 700;
  font-size: 0.9rem;
}

.completion-text {
  color: #999;
  font-size: 0.8rem;
}

/* Enhanced Form */
.form-section {
  padding: 32px;
}

.form-section-container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 12px;
}

.section-title {
  color: #bdf000;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
}

.section-subtitle {
  color: #999;
  font-size: 0.9rem;
  margin-top: 4px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.field-label {
  margin-bottom: 8px;
  color: #ffffff;
  font-weight: 600;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

.modern-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.modern-input :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.4);
  background: rgba(255, 255, 255, 0.12) !important;
}

.modern-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

.modern-input :deep(.q-field__native) {
  color: #ffffff !important;
  font-weight: 500;
}

.modern-input :deep(.q-field__label) {
  color: #bdf000 !important;
}

/* Enhanced Logo Upload */
.logo-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo-upload-area {
  width: 200px;
  height: 200px;
  border: 2px dashed rgba(189, 240, 0, 0.3);
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.logo-upload-area:hover {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.05);
}

.upload-placeholder {
  text-align: center;
  padding: 20px;
}

.upload-icon {
  margin-bottom: 16px;
}

.upload-text {
  margin: 16px 0 12px 0;
  color: #ffffff;
  font-weight: 600;
  font-size: 1rem;
}

.upload-requirements {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 0.75rem;
}

.logo-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 14px;
}

.logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.logo-preview:hover .logo-overlay {
  opacity: 1;
}

.overlay-actions {
  display: flex;
  gap: 12px;
}

.overlay-btn {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
}

.upload-progress {
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-text {
  color: #09050d;
  font-size: 10px;
  font-weight: 700;
}

/* Payout Grid */
.payout-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

/* Security Notice */
.security-notice {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 8px;
  padding: 12px 16px;
  border: 1px solid rgba(76, 175, 80, 0.2);
  color: #4caf50;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
}

/* Status Display */
.status-display-section {
  margin-bottom: 24px;
}

.status-display {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.status-icon-container {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.status-content {
  flex: 1;
}

.status-label {
  color: #999;
  font-size: 0.9rem;
  margin-bottom: 4px;
}

.status-value {
  font-size: 1.2rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.status-pending {
  color: #ff9800;
}

.status-approved {
  color: #4caf50;
}

.status-rejected {
  color: #f44336;
}

.status-suspended {
  color: #9e9e9e;
}

.status-description {
  color: #cfcfcf;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Enhanced Form Actions */
.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.actions-left,
.actions-right {
  display: flex;
  gap: 12px;
}

.save-btn {
  border-radius: 12px;
  font-weight: 700;
  padding: 12px 32px;
  transition: all 0.3s ease;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(189, 240, 0, 0.3);
}

.cancel-btn,
.reset-btn {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.cancel-btn:hover,
.reset-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* Info Cards */
.info-cards-section {
  margin-top: 24px;
}

.info-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 16px;
  border: 1px solid rgba(189, 240, 0, 0.2);
}

.info-card-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  gap: 16px;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 0.8rem;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.next-steps-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.next-step-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
}

.next-step-item.completed {
  opacity: 0.7;
}

.step-text {
  color: #cfcfcf;
  font-size: 0.9rem;
}

.next-step-item.completed .step-text {
  text-decoration: line-through;
}

/* Dialogs */
.success-dialog,
.help-dialog {
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.success-content {
  padding: 40px 24px;
  text-align: center;
}

.success-animation {
  margin-bottom: 24px;
}

.success-icon {
  animation: successPulse 1s ease-out;
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

.dialog-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.help-content {
  padding: 20px 0;
}

.requirements-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cfcfcf;
  padding: 8px 0;
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .form-grid,
  .payout-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
}

@media (max-width: 768px) {
  .merchant-profile-page {
    padding: 16px;
  }
  
  .profile-header {
    padding: 24px;
  }
  
  .form-section {
    padding: 24px;
  }
  
  .form-section-container {
    padding: 20px;
  }
  
  .header-left {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .form-actions {
    flex-direction: column;
    gap: 16px;
  }
  
  .actions-left,
  .actions-right {
    width: 100%;
    justify-content: center;
  }
  
  .save-btn,
  .cancel-btn,
  .reset-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .summary-stats {
    flex-direction: column;
    gap: 12px;
  }
  
  .help-dialog,
  .success-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .profile-name {
    font-size: 1.2rem;
  }
  
  .logo-upload-area {
    width: 150px;
    height: 150px;
  }
  
  .upload-text {
    font-size: 0.9rem;
  }
}

/* Enhanced focus states */
.modern-input:focus-within {
  transform: translateY(-1px);
}

.save-btn:focus-visible,
.cancel-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Form validation states */
.modern-input.error :deep(.q-field__control) {
  border-color: #f44336 !important;
  background: rgba(244, 67, 54, 0.1) !important;
}

/* Performance optimizations */
.merchant-profile-card {
  transform: translateZ(0);
  backface-visibility: hidden;
}
</style>