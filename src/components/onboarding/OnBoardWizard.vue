<template>
  <div class="onboarding-wizard">
    <!-- Loading Overlay -->
    <div v-if="globalLoading" class="loading-overlay">
      <q-spinner-dots color="lime" size="60px" />
      <p class="loading-text">Setting up your account...</p>
    </div>

    <!-- Enhanced Stepper -->
    <q-stepper 
      v-model="currentStep" 
      header-nav 
      color="lime" 
      animated 
      flat 
      class="custom-stepper"
      keep-alive
    >
      <!-- Step 1: Enhanced Account Setup -->
      <q-step :name="1" title="Account" icon="person_add" :done="currentStep > 1" class="step-panel">
        <div class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <q-icon name="person_add" size="48px" color="lime" />
            </div>
            <h3 class="step-title">Create Your Account</h3>
            <p class="step-description">Let's start with your basic information to get you set up</p>
          </div>

          <div class="form-container">
            <q-form @submit="validateStep1" class="account-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="person" size="16px" class="q-mr-xs" />
                    Full Name *
                  </label>
                  <q-input 
                    v-model="account.name" 
                    placeholder="Enter your full name" 
                    outlined 
                    dense 
                    :error="!!errors.name"
                    :error-message="errors.name" 
                    @blur="validateField('name', account.name)" 
                    @input="clearError('name')"
                    class="custom-input"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="email" size="16px" class="q-mr-xs" />
                    Email Address *
                  </label>
                  <q-input 
                    v-model="account.email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    outlined 
                    dense
                    :error="!!errors.email" 
                    :error-message="errors.email" 
                    @blur="validateField('email', account.email)"
                    @input="clearError('email')"
                    class="custom-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="lock" size="16px" class="q-mr-xs" />
                    Password *
                  </label>
                  <q-input 
                    v-model="account.password" 
                    :type="showPassword ? 'text' : 'password'" 
                    placeholder="Create a strong password" 
                    outlined 
                    dense
                    :error="!!errors.password" 
                    :error-message="errors.password"
                    @blur="validateField('password', account.password)" 
                    @input="clearError('password')"
                    class="custom-input"
                  >
                    <template v-slot:append>
                      <q-icon 
                        :name="showPassword ? 'visibility_off' : 'visibility'" 
                        @click="showPassword = !showPassword"
                        class="cursor-pointer password-toggle" 
                      />
                    </template>
                  </q-input>
                  <div class="password-strength">
                    <div class="strength-bar">
                      <div 
                        class="strength-fill" 
                        :style="{ width: passwordStrength + '%', backgroundColor: getPasswordStrengthColor() }"
                      ></div>
                    </div>
                    <span class="strength-text">{{ getPasswordStrengthText() }}</span>
                  </div>
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="lock_outline" size="16px" class="q-mr-xs" />
                    Confirm Password *
                  </label>
                  <q-input 
                    v-model="account.confirmPassword" 
                    type="password" 
                    placeholder="Confirm your password" 
                    outlined
                    dense 
                    :error="!!errors.confirmPassword" 
                    :error-message="errors.confirmPassword"
                    @blur="validateField('confirmPassword', account.confirmPassword)" 
                    @input="clearError('confirmPassword')"
                    class="custom-input" 
                  />
                </div>

                <div class="form-group full-width">
                  <label class="field-label">
                    <q-icon name="badge" size="16px" class="q-mr-xs" />
                    Account Type *
                  </label>
                  <q-select 
                    v-model="account.role" 
                    :options="enhancedRoleOptions" 
                    placeholder="Select your account type" 
                    outlined 
                    dense
                    emit-value 
                    map-options 
                    :error="!!errors.role" 
                    :error-message="errors.role"
                    @blur="validateField('role', account.role)" 
                    @update:model-value="clearError('role')"
                    class="custom-input" 
                  />
                </div>
              </div>

              <!-- Terms Agreement -->
              <div class="terms-section">
                <q-checkbox
                  v-model="agreeToTerms"
                  color="lime"
                  class="terms-checkbox"
                >
                  <span class="terms-text">
                    I agree to the 
                    <a href="#" class="terms-link" @click.prevent="showTerms">Terms of Service</a> 
                    and 
                    <a href="#" class="terms-link" @click.prevent="showPrivacy">Privacy Policy</a>
                  </span>
                </q-checkbox>
              </div>
            </q-form>
          </div>

          <div class="step-actions">
            <q-btn 
              label="Continue" 
              color="lime" 
              @click="nextStep" 
              :disabled="!isStep1Valid" 
              :loading="loading"
              size="lg"
              class="continue-btn"
            >
              <q-icon name="arrow_forward" size="16px" class="q-ml-sm" />
            </q-btn>
          </div>
        </div>
      </q-step>

      <!-- Step 2: Enhanced Business Information -->
      <q-step :name="2" title="Business" icon="store" :done="currentStep > 2" class="step-panel">
        <div class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <q-icon name="store" size="48px" color="blue" />
            </div>
            <h3 class="step-title">Business Information</h3>
            <p class="step-description">Tell us about your business to complete the setup</p>
          </div>

          <div class="form-container">
            <q-form @submit="validateStep2" class="business-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="business" size="16px" class="q-mr-xs" />
                    Business Name *
                  </label>
                  <q-input 
                    v-model="business.business_name" 
                    placeholder="Enter your business name" 
                    outlined 
                    dense
                    :error="!!errors.business_name" 
                    :error-message="errors.business_name"
                    @blur="validateField('business_name', business.business_name)" 
                    @input="clearError('business_name')"
                    class="custom-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="category" size="16px" class="q-mr-xs" />
                    Business Category
                  </label>
                  <q-select
                    v-model="business.category"
                    :options="businessCategoryOptions"
                    placeholder="Select business category"
                    outlined
                    dense
                    emit-value
                    map-options
                    class="custom-input"
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="account_balance" size="16px" class="q-mr-xs" />
                    Bank Account Name *
                  </label>
                  <q-input 
                    v-model="business.bank_account_name" 
                    placeholder="Account holder name" 
                    outlined 
                    dense
                    :error="!!errors.bank_account_name" 
                    :error-message="errors.bank_account_name"
                    @blur="validateField('bank_account_name', business.bank_account_name)" 
                    @input="clearError('bank_account_name')"
                    class="custom-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="credit_card" size="16px" class="q-mr-xs" />
                    Bank Account Number *
                  </label>
                  <q-input 
                    v-model="business.bank_account_number" 
                    placeholder="Account number" 
                    outlined 
                    dense
                    :error="!!errors.bank_account_number" 
                    :error-message="errors.bank_account_number"
                    @blur="validateField('bank_account_number', business.bank_account_number)" 
                    @input="clearError('bank_account_number')"
                    class="custom-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="code" size="16px" class="q-mr-xs" />
                    IFSC/SWIFT Code *
                  </label>
                  <q-input 
                    v-model="business.bank_ifsc_swift" 
                    placeholder="IFSC or SWIFT code" 
                    outlined 
                    dense
                    :error="!!errors.bank_ifsc_swift" 
                    :error-message="errors.bank_ifsc_swift"
                    @blur="validateField('bank_ifsc_swift', business.bank_ifsc_swift)" 
                    @input="clearError('bank_ifsc_swift')"
                    class="custom-input" 
                  />
                </div>

                <div class="form-group">
                  <label class="field-label">
                    <q-icon name="phone" size="16px" class="q-mr-xs" />
                    Phone Number
                  </label>
                  <q-input 
                    v-model="business.phone" 
                    placeholder="+1 (555) 123-4567" 
                    outlined 
                    dense
                    class="custom-input" 
                  />
                </div>

                <div class="form-group full-width">
                  <label class="field-label">
                    <q-icon name="image" size="16px" class="q-mr-xs" />
                    Business Logo
                  </label>
                  <div class="logo-upload-section">
                    <div class="upload-area" @click="triggerFileUpload">
                      <div v-if="!logoPreview" class="upload-placeholder">
                        <q-icon name="cloud_upload" size="32px" color="lime" />
                        <p>Upload Business Logo</p>
                        <span class="upload-hint">PNG, JPG up to 5MB</span>
                      </div>
                      <div v-else class="logo-preview">
                        <img :src="logoPreview" alt="Business Logo" />
                        <div class="logo-overlay">
                          <q-icon name="edit" size="24px" color="white" />
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
                  </div>
                </div>

                <div class="form-group full-width">
                  <label class="field-label">
                    <q-icon name="description" size="16px" class="q-mr-xs" />
                    Business Description
                  </label>
                  <q-input 
                    v-model="business.description" 
                    type="textarea" 
                    placeholder="Describe your business..." 
                    outlined 
                    rows="3"
                    class="custom-input" 
                  />
                </div>
              </div>
            </q-form>
          </div>

          <div class="step-actions">
            <q-btn 
              label="Previous" 
              flat 
              @click="previousStep" 
              class="q-mr-md previous-btn" 
            />
            <q-btn 
              label="Continue" 
              color="lime" 
              @click="nextStep" 
              :disabled="!isStep2Valid" 
              :loading="loading"
              size="lg"
              class="continue-btn"
            >
              <q-icon name="arrow_forward" size="16px" class="q-ml-sm" />
            </q-btn>
          </div>
        </div>
      </q-step>

      <!-- Step 3: Enhanced Review & Submit -->
      <q-step :name="3" title="Review" icon="fact_check" :done="currentStep > 3" class="step-panel">
        <div class="step-content">
          <div class="step-header">
            <div class="step-icon">
              <q-icon name="fact_check" size="48px" color="purple" />
            </div>
            <h3 class="step-title">Review & Submit</h3>
            <p class="step-description">Please review your information before submitting your application</p>
          </div>

          <div class="review-container">
            <div class="review-sections">
              <!-- Account Review -->
              <div class="review-section">
                <div class="review-header">
                  <h4 class="review-title">
                    <q-icon name="person" size="20px" color="lime" class="q-mr-sm" />
                    Account Information
                  </h4>
                  <q-btn 
                    flat 
                    color="lime" 
                    icon="edit" 
                    @click="editStep(1)" 
                    size="sm"
                  >
                    Edit
                  </q-btn>
                </div>
                <div class="review-content">
                  <div class="review-item">
                    <span class="review-label">Full Name:</span>
                    <span class="review-value">{{ account.name }}</span>
                  </div>
                  <div class="review-item">
                    <span class="review-label">Email:</span>
                    <span class="review-value">{{ account.email }}</span>
                  </div>
                  <div class="review-item">
                    <span class="review-label">Account Type:</span>
                    <span class="review-value">{{ getRoleDisplayName(account.role) }}</span>
                  </div>
                </div>
              </div>

              <!-- Business Review -->
              <div class="review-section">
                <div class="review-header">
                  <h4 class="review-title">
                    <q-icon name="store" size="20px" color="blue" class="q-mr-sm" />
                    Business Information
                  </h4>
                  <q-btn 
                    flat 
                    color="lime" 
                    icon="edit" 
                    @click="editStep(2)" 
                    size="sm"
                  >
                    Edit
                  </q-btn>
                </div>
                <div class="review-content">
                  <div class="review-item">
                    <span class="review-label">Business Name:</span>
                    <span class="review-value">{{ business.business_name }}</span>
                  </div>
                  <div class="review-item" v-if="business.category">
                    <span class="review-label">Category:</span>
                    <span class="review-value">{{ business.category }}</span>
                  </div>
                  <div class="review-item">
                    <span class="review-label">Bank Account:</span>
                    <span class="review-value">{{ business.bank_account_name }}</span>
                  </div>
                  <div class="review-item">
                    <span class="review-label">Account Number:</span>
                    <span class="review-value">****{{ business.bank_account_number.slice(-4) }}</span>
                  </div>
                  <div class="review-item">
                    <span class="review-label">IFSC/SWIFT:</span>
                    <span class="review-value">{{ business.bank_ifsc_swift }}</span>
                  </div>
                  <div class="review-item" v-if="business.phone">
                    <span class="review-label">Phone:</span>
                    <span class="review-value">{{ business.phone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Final Terms -->
            <div class="final-terms">
              <q-checkbox
                v-model="finalAgreement"
                color="lime"
                class="final-terms-checkbox"
              >
                <span class="final-terms-text">
                  I confirm that all information provided is accurate and I agree to the platform's terms and conditions.
                </span>
              </q-checkbox>
            </div>
          </div>

          <div class="step-actions">
            <q-btn 
              label="Previous" 
              flat 
              @click="previousStep" 
              class="q-mr-md previous-btn" 
            />
            <q-btn 
              label="Submit Application" 
              color="lime" 
              @click="submitApplication" 
              :disabled="!isStep3Valid"
              :loading="submitting"
              size="lg"
              class="submit-btn"
            >
              <q-icon name="send" size="16px" class="q-ml-sm" />
            </q-btn>
          </div>
        </div>
      </q-step>

      <!-- Step 4: Enhanced Success -->
      <q-step :name="4" title="Complete" icon="check_circle" class="step-panel">
        <div class="step-content">
          <div class="success-content">
            <div class="success-animation">
              <q-icon name="check_circle" size="120px" color="green" class="success-icon" />
            </div>

            <h3 class="success-title">Application Submitted Successfully!</h3>
            <p class="success-description">
              Thank you for joining FinteckX! Your application has been submitted and is now under review.
            </p>

            <div class="application-summary">
              <div class="summary-card">
                <div class="summary-header">
                  <q-icon name="assignment" size="24px" color="lime" />
                  <span>Application Summary</span>
                </div>
                <div class="summary-content">
                  <div class="summary-item">
                    <span class="summary-label">Application ID:</span>
                    <span class="summary-value">#{{ applicationId }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Submitted:</span>
                    <span class="summary-value">{{ formatDateTime(new Date()) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Status:</span>
                    <q-chip color="orange" text-color="white" icon="pending" size="sm">
                      Under Review
                    </q-chip>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Expected Response:</span>
                    <span class="summary-value">24-48 hours</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="next-steps">
              <h4 class="next-steps-title">What happens next?</h4>
              <div class="steps-list">
                <div class="next-step-item">
                  <div class="step-number">1</div>
                  <div class="step-info">
                    <div class="step-name">Document Review</div>
                    <div class="step-desc">Our team will review your application and documents</div>
                  </div>
                </div>
                <div class="next-step-item">
                  <div class="step-number">2</div>
                  <div class="step-info">
                    <div class="step-name">Account Verification</div>
                    <div class="step-desc">We'll verify your business and banking information</div>
                  </div>
                </div>
                <div class="next-step-item">
                  <div class="step-number">3</div>
                  <div class="step-info">
                    <div class="step-name">Account Activation</div>
                    <div class="step-desc">Your account will be activated and you'll receive access</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="success-actions">
              <q-btn 
                label="Go to Dashboard" 
                color="lime" 
                @click="goToDashboard" 
                size="lg"
                class="q-mr-md dashboard-btn"
              >
                <q-icon name="dashboard" size="16px" class="q-mr-sm" />
              </q-btn>
              <q-btn 
                label="Track Application" 
                outline 
                color="lime" 
                @click="trackApplication"
                size="lg"
                class="track-btn"
              >
                <q-icon name="track_changes" size="16px" class="q-mr-sm" />
              </q-btn>
            </div>
          </div>
        </div>
      </q-step>
    </q-stepper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const currentStep = ref(1)
const loading = ref(false)
const submitting = ref(false)
const globalLoading = ref(false)
const errors = ref({})
const showPassword = ref(false)
const agreeToTerms = ref(false)
const finalAgreement = ref(false)
const applicationId = ref('')

// Logo upload
const logoPreview = ref('')
const fileInput = ref(null)

// Account data
const account = ref({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'merchant'
})

// Business data
const business = ref({
  business_name: '',
  category: '',
  logo: null,
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  phone: '',
  description: ''
})

// Options
const enhancedRoleOptions = [
  { 
    label: 'Merchant', 
    value: 'merchant',
    description: 'Business owner accepting payments',
    icon: 'store'
  },
  { 
    label: 'Admin', 
    value: 'admin',
    description: 'Platform administrator',
    icon: 'admin_panel_settings'
  }
]

const businessCategoryOptions = [
  { label: 'E-commerce', value: 'ecommerce' },
  { label: 'Food & Beverage', value: 'food' },
  { label: 'Technology', value: 'technology' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Education', value: 'education' },
  { label: 'Finance', value: 'finance' },
  { label: 'Retail', value: 'retail' },
  { label: 'Services', value: 'services' },
  { label: 'Other', value: 'other' }
]

// Computed properties
const passwordStrength = computed(() => {
  const password = account.value.password
  if (!password) return 0
  
  let strength = 0
  if (password.length >= 8) strength += 25
  if (/[a-z]/.test(password)) strength += 25
  if (/[A-Z]/.test(password)) strength += 25
  if (/[0-9]/.test(password)) strength += 25
  
  return strength
})

const isStep1Valid = computed(() => {
  return account.value.name &&
         account.value.email &&
         account.value.password &&
         account.value.confirmPassword &&
         account.value.role &&
         account.value.password === account.value.confirmPassword &&
         agreeToTerms.value &&
         Object.keys(errors.value).length === 0
})

const isStep2Valid = computed(() => {
  return business.value.business_name &&
         business.value.bank_account_name &&
         business.value.bank_account_number &&
         business.value.bank_ifsc_swift &&
         Object.keys(errors.value).length === 0
})

const isStep3Valid = computed(() => {
  return finalAgreement.value
})

// Methods
const validateField = (field, value) => {
  switch (field) {
    case 'name':
      if (!value || value.length < 2) {
        errors.value[field] = 'Please enter your full name (minimum 2 characters)'
      }
      break
    case 'email':
      if (!value) {
        errors.value[field] = 'Email is required'
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors.value[field] = 'Please enter a valid email address'
      }
      break
    case 'password':
      if (!value) {
        errors.value[field] = 'Password is required'
      } else if (value.length < 8) {
        errors.value[field] = 'Password must be at least 8 characters long'
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
        errors.value[field] = 'Password must contain uppercase, lowercase, and number'
      }
      break
    case 'confirmPassword':
      if (!value) {
        errors.value[field] = 'Please confirm your password'
      } else if (value !== account.value.password) {
        errors.value[field] = 'Passwords do not match'
      }
      break
    case 'role':
      if (!value) {
        errors.value[field] = 'Please select an account type'
      }
      break
    case 'business_name':
      if (!value || value.length < 2) {
        errors.value[field] = 'Business name is required (minimum 2 characters)'
      }
      break
    case 'bank_account_name':
      if (!value) {
        errors.value[field] = 'Bank account name is required'
      }
      break
    case 'bank_account_number':
      if (!value) {
        errors.value[field] = 'Bank account number is required'
      } else if (value.length < 8) {
        errors.value[field] = 'Please enter a valid account number'
      }
      break
    case 'bank_ifsc_swift':
      if (!value) {
        errors.value[field] = 'IFSC/SWIFT code is required'
      } else if (value.length < 4) {
        errors.value[field] = 'Please enter a valid IFSC/SWIFT code'
      }
      break
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const validateStep1 = () => {
  // Validate all step 1 fields
  validateField('name', account.value.name)
  validateField('email', account.value.email)
  validateField('password', account.value.password)
  validateField('confirmPassword', account.value.confirmPassword)
  validateField('role', account.value.role)
  
  return isStep1Valid.value
}

const validateStep2 = () => {
  // Validate all step 2 fields
  validateField('business_name', business.value.business_name)
  validateField('bank_account_name', business.value.bank_account_name)
  validateField('bank_account_number', business.value.bank_account_number)
  validateField('bank_ifsc_swift', business.value.bank_ifsc_swift)
  
  return isStep2Valid.value
}

const nextStep = () => {
  let canProceed = false
  
  if (currentStep.value === 1) {
    canProceed = validateStep1()
  } else if (currentStep.value === 2) {
    canProceed = validateStep2()
  } else {
    canProceed = true
  }
  
  if (canProceed && currentStep.value < 4) {
    currentStep.value++
    saveProgress()
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const editStep = (step) => {
  currentStep.value = step
}

const triggerFileUpload = () => {
  fileInput.value?.click()
}

const handleLogoUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      $q.notify({
        type: 'negative',
        message: 'Logo file size must be less than 5MB',
        position: 'top'
      })
      return
    }
    
    business.value.logo = file
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      logoPreview.value = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const submitApplication = async () => {
  try {
    submitting.value = true
    globalLoading.value = true
    
    console.log('🔄 Submitting application...')

    // Step 1: Register user account
    const registerData = {
      name: account.value.name,
      email: account.value.email,
      password: account.value.password,
      password_confirmation: account.value.confirmPassword,
      role: account.value.role
    }

    console.log('🔄 Registering user account...')
    const registerResponse = await api.post('/api/auth/register', registerData)
    
    if (!registerResponse.data) {
      throw new Error('Registration failed - no response data')
    }

    console.log('✅ User registered successfully')

    // Step 2: Register business information
    const businessData = new FormData()
    businessData.append('business_name', business.value.business_name)
    businessData.append('bank_account_name', business.value.bank_account_name)
    businessData.append('bank_account_number', business.value.bank_account_number)
    businessData.append('bank_ifsc_swift', business.value.bank_ifsc_swift)
    
    if (business.value.category) {
      businessData.append('category', business.value.category)
    }
    if (business.value.phone) {
      businessData.append('phone', business.value.phone)
    }
    if (business.value.description) {
      businessData.append('description', business.value.description)
    }
    if (business.value.logo) {
      businessData.append('logo', business.value.logo)
    }

    console.log('🔄 Registering business...')
    
    // ✅ Use your business registration endpoint: POST /api/merchant/register
    const businessResponse = await api.post('/api/merchant/register', businessData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    console.log('✅ Business registered successfully:', businessResponse.data)

    // Generate application ID
    applicationId.value = `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Move to success step
    currentStep.value = 4

    // Clear stored progress
    localStorage.removeItem('onboarding_progress')
    localStorage.removeItem('onboarding_account')
    localStorage.removeItem('onboarding_business')

    $q.notify({
      type: 'positive',
      message: 'Application submitted successfully!',
      position: 'top',
      timeout: 4000
    })

  } catch (error) {
    console.error('❌ Application submission error:', error)
    
    let errorMessage = 'Failed to submit application. Please try again.'
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    } else if (error.response?.data?.errors) {
      const errorMessages = Object.values(error.response.data.errors).flat()
      errorMessage = errorMessages.join(', ')
    } else if (error.message) {
      errorMessage = error.message
    }

    $q.notify({
      type: 'negative',
      message: errorMessage,
      position: 'top',
      timeout: 5000
    })
  } finally {
    submitting.value = false
    globalLoading.value = false
  }
}

const saveProgress = () => {
  // Save progress to localStorage
  localStorage.setItem('onboarding_progress', currentStep.value.toString())
  localStorage.setItem('onboarding_account', JSON.stringify(account.value))
  localStorage.setItem('onboarding_business', JSON.stringify({
    ...business.value,
    logo: null // Don't store file object
  }))
}

const goToDashboard = () => {
  const role = account.value.role
  if (role === 'admin') {
    router.push('/admin-dashboard')
  } else {
    router.push('/dashboard')
  }
}

const trackApplication = () => {
  router.push('/dashboard?tab=status')
}

const showTerms = () => {
  $q.notify({
    type: 'info',
    message: 'Terms of Service will be displayed here',
    position: 'top'
  })
}

const showPrivacy = () => {
  $q.notify({
    type: 'info',
    message: 'Privacy Policy will be displayed here',
    position: 'top'
  })
}

// Utility methods
const getPasswordStrengthColor = () => {
  const strength = passwordStrength.value
  if (strength >= 75) return '#4caf50'
  if (strength >= 50) return '#ff9800'
  if (strength >= 25) return '#f44336'
  return '#999'
}

const getPasswordStrengthText = () => {
  const strength = passwordStrength.value
  if (strength >= 75) return 'Strong'
  if (strength >= 50) return 'Good'
  if (strength >= 25) return 'Weak'
  return 'Very Weak'
}

const getRoleDisplayName = (role) => {
  const roleNames = {
    merchant: 'Business Merchant',
    admin: 'Platform Administrator'
  }
  return roleNames[role] || role
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  // Restore progress if available
  const savedStep = localStorage.getItem('onboarding_progress')
  const savedAccount = localStorage.getItem('onboarding_account')
  const savedBusiness = localStorage.getItem('onboarding_business')

  if (savedStep) {
    currentStep.value = parseInt(savedStep)
  }

  if (savedAccount) {
    try {
      const accountData = JSON.parse(savedAccount)
      account.value = { ...account.value, ...accountData }
    } catch (e) {
      console.error('Error parsing saved account data:', e)
    }
  }

  if (savedBusiness) {
    try {
      const businessData = JSON.parse(savedBusiness)
      business.value = { ...business.value, ...businessData }
    } catch (e) {
      console.error('Error parsing saved business data:', e)
    }
  }
})
</script>

<style scoped>
.onboarding-wizard {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  background: linear-gradient(135deg, #0a0a0a 0%, #0f0e12 50%, #121018 100%);
  min-height: 100vh;
  color: #ffffff;
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

/* Enhanced Stepper */
.custom-stepper {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 24px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  overflow: hidden;
}

.custom-stepper :deep(.q-stepper__header) {
  background: rgba(189, 240, 0, 0.05);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding: 24px;
}

.custom-stepper :deep(.q-stepper__tab) {
  color: #999;
  transition: all 0.3s ease;
}

.custom-stepper :deep(.q-stepper__tab--active) {
  color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 12px;
}

.custom-stepper :deep(.q-stepper__tab--done) {
  color: #4caf50;
}

.step-panel {
  background: transparent;
}

/* Enhanced Step Content */
.step-content {
  padding: 32px;
  min-height: 500px;
}

.step-header {
  text-align: center;
  margin-bottom: 40px;
}

.step-icon {
  margin-bottom: 16px;
}

.step-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  color: #bdf000;
}

.step-description {
  color: #cfcfcf;
  font-size: 1.1rem;
  margin: 0;
  line-height: 1.5;
}

/* Enhanced Form */
.form-container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
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

.custom-input :deep(.q-field__control) {
  background: rgba(255, 255, 255, 0.08) !important;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.custom-input :deep(.q-field__control:hover) {
  border-color: rgba(189, 240, 0, 0.4);
  background: rgba(255, 255, 255, 0.12) !important;
}

.custom-input :deep(.q-field__control.q-field__control--focused) {
  border-color: #bdf000;
  box-shadow: 0 0 0 2px rgba(189, 240, 0, 0.2);
}

.custom-input :deep(.q-field__native) {
  color: #ffffff !important;
  font-weight: 500;
}

.custom-input :deep(.q-field__label) {
  color: #bdf000 !important;
}

.password-toggle {
  color: #999;
  transition: color 0.3s ease;
}

.password-toggle:hover {
  color: #bdf000;
}

/* Password Strength */
.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.strength-text {
  font-size: 0.8rem;
  font-weight: 600;
  color: #999;
}

/* Logo Upload */
.logo-upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.upload-area {
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
  margin-bottom: 16px;
}

.upload-area:hover {
  border-color: #bdf000;
  background: rgba(189, 240, 0, 0.05);
}

.upload-placeholder {
  text-align: center;
}

.upload-placeholder p {
  margin: 16px 0 8px 0;
  color: #ffffff;
  font-weight: 600;
}

.upload-hint {
  color: #cfcfcf;
  font-size: 0.8rem;
}

.logo-preview {
  position: relative;
  width: 100%;
  height: 100%;
}

.logo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* Terms Section */
.terms-section {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  margin-top: 24px;
}

.terms-text {
  color: #cfcfcf;
  font-size: 0.9rem;
  line-height: 1.5;
}

.terms-link {
  color: #bdf000;
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
}

/* Enhanced Review */
.review-container {
  margin-bottom: 32px;
}

.review-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.review-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 12px;
}

.review-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.review-item:last-child {
  border-bottom: none;
}

.review-label {
  color: #999;
  font-weight: 500;
}

.review-value {
  color: #ffffff;
  font-weight: 600;
}

.final-terms {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.final-terms-text {
  color: #cfcfcf;
  font-size: 0.9rem;
  line-height: 1.5;
}

/* Enhanced Success */
.success-content {
  text-align: center;
  padding: 48px 24px;
}

.success-animation {
  margin-bottom: 32px;
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

.success-title {
  color: #4caf50;
  margin: 0 0 16px 0;
  font-size: 2.2rem;
  font-weight: 800;
}

.success-description {
  color: #cfcfcf;
  font-size: 1.1rem;
  margin-bottom: 32px;
  line-height: 1.6;
}

.application-summary {
  margin-bottom: 32px;
}

.summary-card {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(76, 175, 80, 0.2);
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  color: #4caf50;
  font-weight: 600;
  font-size: 1.1rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-label {
  color: #4caf50;
  font-weight: 500;
}

.summary-value {
  color: #ffffff;
  font-weight: 600;
}

.next-steps {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
  text-align: left;
}

.next-steps-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0 0 20px 0;
  text-align: center;
}

.steps-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.next-step-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(189, 240, 0, 0.2);
  color: #bdf000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.step-info {
  flex: 1;
}

.step-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.step-desc {
  color: #999;
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Enhanced Actions */
.step-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.continue-btn,
.submit-btn,
.dashboard-btn {
  border-radius: 12px;
  font-weight: 700;
  padding: 12px 32px;
  transition: all 0.3s ease;
}

.continue-btn:hover,
.submit-btn:hover,
.dashboard-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(189, 240, 0, 0.3);
}

.previous-btn {
  border-radius: 12px;
  color: #999;
  transition: all 0.3s ease;
}

.previous-btn:hover {
  color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
}

.success-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 768px) {
  .onboarding-wizard {
    padding: 16px;
  }

  .step-content {
    padding: 24px 16px;
  }

  .form-container {
    padding: 24px;
  }

  .form-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .step-title {
    font-size: 1.6rem;
  }

  .step-actions {
    flex-direction: column;
    align-items: center;
  }

  .continue-btn,
  .submit-btn,
  .dashboard-btn {
    width: 100%;
    max-width: 300px;
  }

  .success-actions {
    flex-direction: column;
    align-items: center;
  }

  .upload-area {
    width: 150px;
    height: 150px;
  }
}

/* Enhanced focus states */
.custom-input:focus-within {
  transform: translateY(-1px);
}

.continue-btn:focus-visible,
.submit-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Form validation states */
.custom-input.error :deep(.q-field__control) {
  border-color: #f44336 !important;
  background: rgba(244, 67, 54, 0.1) !important;
}

/* Progress indicator */
.step-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #bdf000, #8bc34a);
  border-radius: 2px;
}
</style>