<template>
  <q-form @submit.prevent="submit" class="merchant-registration-form">
    <!-- Loading Overlay -->
    <div v-if="globalLoading" class="loading-overlay">
      <q-spinner-dots color="lime" size="60px" />
      <p class="loading-text">Processing registration...</p>
    </div>

    <!-- Enhanced Stepper -->
    <q-stepper 
      v-model="step" 
      header-nav 
      color="lime" 
      animated
      class="registration-stepper lime-glow"
      :class="`step-${step}`"
      keep-alive
    >
      <!-- Step 1: Enhanced Business Details -->
      <q-step 
        :name="1" 
        title="Business Details" 
        icon="store" 
        :done="step > 1"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="store" size="40px" color="lime" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Business Information</h3>
            <p class="step-subtitle">Tell us about your business to get started</p>
          </div>
        </div>

        <div class="form-container">
          <div class="form-fields">
            <div class="form-group">
              <label class="field-label">
                <q-icon name="business" size="16px" class="q-mr-xs" />
                Business Name *
              </label>
              <q-input 
                v-model="form.business_name" 
                placeholder="Enter your business name" 
                outlined 
                dense 
                required 
                class="modern-input"
                :rules="[val => !!val || 'Business name is required']"
                :error="!!errors.business_name"
                :error-message="errors.business_name"
                @blur="validateField('business_name')"
                @input="clearError('business_name')"
              >
                <template v-slot:prepend>
                  <q-icon name="business" color="lime" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="email" size="16px" class="q-mr-xs" />
                Business Email *
              </label>
              <q-input 
                v-model="form.email" 
                type="email" 
                placeholder="business@example.com" 
                outlined 
                dense 
                required 
                class="modern-input"
                :rules="[
                  val => !!val || 'Email is required',
                  val => /.+@.+\..+/.test(val) || 'Invalid email format'
                ]"
                :error="!!errors.email"
                :error-message="errors.email"
                @blur="validateField('email')"
                @input="clearError('email')"
              >
                <template v-slot:prepend>
                  <q-icon name="email" color="blue" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="language" size="16px" class="q-mr-xs" />
                Website URL
              </label>
              <q-input 
                v-model="form.website" 
                placeholder="https://yourbusiness.com" 
                outlined 
                dense 
                class="modern-input"
                type="url"
                :error="!!errors.website"
                :error-message="errors.website"
                @blur="validateField('website')"
                @input="clearError('website')"
              >
                <template v-slot:prepend>
                  <q-icon name="language" color="purple" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="category" size="16px" class="q-mr-xs" />
                Business Category
              </label>
              <q-select 
                v-model="form.category" 
                :options="businessCategoryOptions"
                placeholder="Select your business category" 
                outlined 
                dense 
                emit-value
                map-options
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="category" color="orange" />
                </template>
              </q-select>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="description" size="16px" class="q-mr-xs" />
                Business Description
              </label>
              <q-input 
                v-model="form.description" 
                type="textarea" 
                placeholder="Describe your business..." 
                outlined 
                rows="3"
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="description" color="teal" />
                </template>
              </q-input>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 2: Enhanced Branding -->
      <q-step 
        :name="2" 
        title="Branding" 
        icon="image" 
        :done="step > 2"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="image" size="40px" color="blue" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Brand Identity</h3>
            <p class="step-subtitle">Upload your business logo and set brand colors</p>
          </div>
        </div>

        <div class="form-container">
          <div class="branding-section">
            <!-- Logo Upload -->
            <div class="logo-upload-container">
              <label class="field-label">
                <q-icon name="image" size="16px" class="q-mr-xs" />
                Business Logo
              </label>
              
              <div class="upload-area" @click="triggerFileUpload" :class="{ 'has-logo': logoPreview }">
                <div v-if="!logoPreview" class="upload-placeholder">
                  <q-icon name="cloud_upload" size="48px" color="lime" />
                  <p class="upload-text">Click to upload logo</p>
                  <span class="upload-hint">PNG, JPG, WebP • Max 2MB • 256×256px recommended</span>
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
                        @click.stop="triggerFileUpload"
                      />
                      <q-btn 
                        round 
                        dense 
                        flat 
                        icon="delete" 
                        color="white"
                        @click.stop="removeLogo"
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
                  <span class="progress-text">{{ uploadProgress }}%</span>
                </div>
              </q-linear-progress>
            </div>

            <!-- Brand Colors (Optional) -->
            <div class="brand-colors-section">
              <label class="field-label">
                <q-icon name="palette" size="16px" class="q-mr-xs" />
                Brand Colors (Optional)
              </label>
              <div class="color-picker-container">
                <div class="color-input-group">
                  <label class="color-label">Primary Color</label>
                  <q-input 
                    v-model="form.primary_color" 
                    type="color" 
                    class="color-input"
                  />
                </div>
                <div class="color-input-group">
                  <label class="color-label">Secondary Color</label>
                  <q-input 
                    v-model="form.secondary_color" 
                    type="color" 
                    class="color-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 3: Enhanced Bank Details -->
      <q-step 
        :name="3" 
        title="Bank Details" 
        icon="account_balance" 
        :done="step > 3"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="account_balance" size="40px" color="green" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Banking Information</h3>
            <p class="step-subtitle">Secure banking details for payments</p>
          </div>
        </div>

        <div class="form-container">
          <div class="security-notice q-mb-lg">
            <q-icon name="security" color="green" size="20px" class="q-mr-sm" />
            <span>Your banking information is encrypted and secure</span>
          </div>

          <div class="form-fields">
            <div class="form-group">
              <label class="field-label">
                <q-icon name="person" size="16px" class="q-mr-xs" />
                Account Holder Name *
              </label>
              <q-input 
                v-model="form.bank_account_name" 
                placeholder="Full name as per bank records" 
                outlined 
                dense 
                required
                class="modern-input"
                :rules="[val => !!val || 'Account holder name is required']"
                :error="!!errors.bank_account_name"
                :error-message="errors.bank_account_name"
                @blur="validateField('bank_account_name')"
                @input="clearError('bank_account_name')"
              >
                <template v-slot:prepend>
                  <q-icon name="person" color="green" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="credit_card" size="16px" class="q-mr-xs" />
                Bank Account Number *
              </label>
              <q-input 
                v-model="form.bank_account_number" 
                placeholder="Enter account number" 
                outlined 
                dense 
                required
                class="modern-input"
                :rules="[
                  val => !!val || 'Account number is required',
                  val => /^\d{8,20}$/.test(val) || 'Must be 8-20 digits'
                ]"
                :error="!!errors.bank_account_number"
                :error-message="errors.bank_account_number"
                @blur="validateField('bank_account_number')"
                @input="clearError('bank_account_number')"
                mask="####################"
              >
                <template v-slot:prepend>
                  <q-icon name="credit_card" color="blue" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="code" size="16px" class="q-mr-xs" />
                IFSC / SWIFT Code *
              </label>
              <q-input 
                v-model="form.bank_ifsc_swift" 
                placeholder="Bank IFSC or SWIFT code" 
                outlined 
                dense 
                required
                class="modern-input"
                :rules="[val => !!val || 'IFSC/SWIFT code is required']"
                :error="!!errors.bank_ifsc_swift"
                :error-message="errors.bank_ifsc_swift"
                @blur="validateField('bank_ifsc_swift')"
                @input="clearError('bank_ifsc_swift')"
              >
                <template v-slot:prepend>
                  <q-icon name="code" color="purple" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="account_balance" size="16px" class="q-mr-xs" />
                Bank Name
              </label>
              <q-input 
                v-model="form.bank_name" 
                placeholder="Name of your bank" 
                outlined 
                dense 
                class="modern-input"
              >
                <template v-slot:prepend>
                  <q-icon name="account_balance" color="indigo" />
                </template>
              </q-input>
            </div>

            <div class="form-group">
              <label class="field-label">
                <q-icon name="schedule" size="16px" class="q-mr-xs" />
                Payout Frequency *
              </label>
              <q-select 
                v-model="form.payout_preferences" 
                :options="enhancedPayoutOptions"
                placeholder="How often do you want to receive payments?" 
                multiple 
                outlined 
                dense 
                class="modern-input"
                :rules="[val => val && val.length > 0 || 'Select at least one payout preference']"
                :error="!!errors.payout_preferences"
                :error-message="errors.payout_preferences"
                use-chips
                @update:model-value="clearError('payout_preferences')"
              >
                <template v-slot:prepend>
                  <q-icon name="schedule" color="orange" />
                </template>
                <template v-slot:selected-item="scope">
                  <q-chip
                    removable
                    dense
                    @remove="scope.removeAtIndex(scope.index)"
                    :tabindex="scope.tabindex"
                    color="lime"
                    text-color="black"
                    class="payout-chip"
                  >
                    {{ scope.opt.label }}
                  </q-chip>
                </template>
              </q-select>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 2: Enhanced Branding -->
      <q-step 
        :name="2" 
        title="Branding" 
        icon="palette" 
        :done="step > 2"
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="palette" size="40px" color="purple" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Brand Identity</h3>
            <p class="step-subtitle">Upload your logo and customize your brand</p>
          </div>
        </div>

        <div class="form-container">
          <div class="branding-grid">
            <!-- Enhanced Logo Upload -->
            <div class="logo-section">
              <label class="field-label">
                <q-icon name="image" size="16px" class="q-mr-xs" />
                Business Logo
              </label>
              
              <div class="logo-upload-area" @click="triggerFileUpload" :class="{ 'has-logo': logoPreview }">
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
                        @click.stop="triggerFileUpload"
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

            <!-- Brand Colors -->
            <div class="colors-section">
              <label class="field-label">
                <q-icon name="palette" size="16px" class="q-mr-xs" />
                Brand Colors
              </label>
              <div class="color-picker-grid">
                <div class="color-input-group">
                  <label class="color-label">Primary Color</label>
                  <div class="color-input-container">
                    <q-input 
                      v-model="form.primary_color" 
                      type="color" 
                      class="color-input"
                    />
                    <span class="color-value">{{ form.primary_color }}</span>
                  </div>
                </div>
                <div class="color-input-group">
                  <label class="color-label">Secondary Color</label>
                  <div class="color-input-container">
                    <q-input 
                      v-model="form.secondary_color" 
                      type="color" 
                      class="color-input"
                    />
                    <span class="color-value">{{ form.secondary_color }}</span>
                  </div>
                </div>
              </div>
              
              <!-- Color Preview -->
              <div class="color-preview">
                <div class="preview-card" :style="{ 
                  backgroundColor: form.primary_color, 
                  borderColor: form.secondary_color 
                }">
                  <div class="preview-content">
                    <div class="preview-logo" v-if="logoPreview">
                      <img :src="logoPreview" alt="Logo Preview" />
                    </div>
                    <div class="preview-text" :style="{ color: form.secondary_color }">
                      {{ form.business_name || 'Your Business' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-step>

      <!-- Step 3: Enhanced Bank Details -->
      <q-step 
        :name="3" 
        title="Verification" 
        icon="verified" 
        class="step-content animate-fade-in"
      >
        <div class="step-header">
          <div class="step-icon">
            <q-icon name="verified" size="40px" color="orange" />
          </div>
          <div class="step-text">
            <h3 class="step-title">Final Review</h3>
            <p class="step-subtitle">Review your information before submitting</p>
          </div>
        </div>

        <div class="form-container">
          <!-- Review Sections -->
          <div class="review-container">
            <div class="review-section">
              <div class="review-header">
                <h4 class="review-title">
                  <q-icon name="store" size="20px" color="lime" class="q-mr-sm" />
                  Business Information
                </h4>
                <q-btn flat color="lime" icon="edit" @click="editStep(1)" size="sm">
                  Edit
                </q-btn>
              </div>
              <div class="review-content">
                <div class="review-item">
                  <span class="review-label">Business Name:</span>
                  <span class="review-value">{{ form.business_name }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Email:</span>
                  <span class="review-value">{{ form.email }}</span>
                </div>
                <div class="review-item" v-if="form.website">
                  <span class="review-label">Website:</span>
                  <span class="review-value">{{ form.website }}</span>
                </div>
                <div class="review-item" v-if="form.category">
                  <span class="review-label">Category:</span>
                  <span class="review-value">{{ form.category }}</span>
                </div>
              </div>
            </div>

            <div class="review-section">
              <div class="review-header">
                <h4 class="review-title">
                  <q-icon name="account_balance" size="20px" color="green" class="q-mr-sm" />
                  Banking Details
                </h4>
                <q-btn flat color="lime" icon="edit" @click="editStep(3)" size="sm">
                  Edit
                </q-btn>
              </div>
              <div class="review-content">
                <div class="review-item">
                  <span class="review-label">Account Holder:</span>
                  <span class="review-value">{{ form.bank_account_name }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">Account Number:</span>
                  <span class="review-value">****{{ form.bank_account_number.slice(-4) }}</span>
                </div>
                <div class="review-item">
                  <span class="review-label">IFSC/SWIFT:</span>
                  <span class="review-value">{{ form.bank_ifsc_swift }}</span>
                </div>
                <div class="review-item" v-if="form.payout_preferences.length">
                  <span class="review-label">Payout Frequency:</span>
                  <span class="review-value">{{ form.payout_preferences.join(', ') }}</span>
                </div>
              </div>
            </div>

            <div class="review-section" v-if="logoPreview">
              <div class="review-header">
                <h4 class="review-title">
                  <q-icon name="image" size="20px" color="purple" class="q-mr-sm" />
                  Branding
                </h4>
                <q-btn flat color="lime" icon="edit" @click="editStep(2)" size="sm">
                  Edit
                </q-btn>
              </div>
              <div class="review-content">
                <div class="brand-preview">
                  <div class="brand-logo">
                    <img :src="logoPreview" alt="Business Logo" />
                  </div>
                  <div class="brand-colors" v-if="form.primary_color || form.secondary_color">
                    <div class="color-swatch" :style="{ backgroundColor: form.primary_color }"></div>
                    <div class="color-swatch" :style="{ backgroundColor: form.secondary_color }"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Terms and Conditions -->
          <div class="terms-section">
            <q-checkbox
              v-model="agreeToTerms"
              color="lime"
              class="terms-checkbox"
            >
              <span class="terms-text">
                I agree to the 
                <a href="#" class="terms-link" @click.prevent="showTerms">Terms of Service</a>, 
                <a href="#" class="terms-link" @click.prevent="showPrivacy">Privacy Policy</a>, and
                <a href="#" class="terms-link" @click.prevent="showMerchantAgreement">Merchant Agreement</a>
              </span>
            </q-checkbox>
          </div>
        </div>
      </q-step>

      <!-- Enhanced Navigation -->
      <template #navigation>
        <q-stepper-navigation class="stepper-navigation">
          <div class="navigation-content">
            <div class="nav-left">
              <q-btn 
                v-if="step > 1" 
                flat 
                @click="previousStep" 
                label="Previous" 
                class="previous-btn"
                :disable="submitting"
              >
                <q-icon name="arrow_back" size="16px" class="q-mr-sm" />
              </q-btn>
            </div>
            
            <div class="nav-center">
              <div class="step-indicator">
                <span class="current-step">Step {{ step }}</span>
                <span class="total-steps">of 3</span>
              </div>
            </div>
            
            <div class="nav-right">
              <q-btn 
                @click="nextStep" 
                :label="step < 3 ? 'Continue' : 'Submit Application'" 
                :loading="submitting" 
                class="continue-btn"
                :disable="!isStepValid(step)"
                color="lime"
                size="lg"
              >
                <q-icon :name="step < 3 ? 'arrow_forward' : 'send'" size="16px" class="q-ml-sm" />
              </q-btn>
            </div>
          </div>
        </q-stepper-navigation>
      </template>
    </q-stepper>

    <!-- Help Dialog -->
    <q-dialog v-model="showLogoHelp" persistent>
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
              <span><strong>Usage:</strong> Will appear on checkout pages and receipts</span>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="right">
          <q-btn label="Got it" color="lime" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card class="success-dialog">
        <q-card-section class="success-content">
          <div class="success-animation">
            <q-icon name="check_circle" size="80px" color="green" class="success-icon" />
          </div>
          <div class="text-h5 text-green q-mt-md">Registration Submitted!</div>
          <div class="text-body2 text-grey-7 q-mt-sm">
            Your merchant application has been submitted successfully and is now under review.
          </div>
          
          <div class="application-details q-mt-lg">
            <div class="detail-card">
              <div class="detail-item">
                <span class="detail-label">Application ID:</span>
                <span class="detail-value">#{{ applicationId }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Submitted:</span>
                <span class="detail-value">{{ formatDateTime(new Date()) }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Expected Review:</span>
                <span class="detail-value">24-48 hours</span>
              </div>
            </div>
          </div>
        </q-card-section>
        
        <q-card-actions align="center">
          <q-btn flat label="Close" @click="closeSuccess" />
          <q-btn color="lime" label="Go to Dashboard" @click="goToDashboard" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { api } from '../../boot/axios'

const router = useRouter()
const $q = useQuasar()

// Reactive data
const step = ref(1)
const submitting = ref(false)
const globalLoading = ref(false)
const uploadProgress = ref(0)
const logoFile = ref(null)
const logoPreview = ref('')
const showLogoHelp = ref(false)
const showSuccess = ref(false)
const agreeToTerms = ref(false)
const errors = ref({})
const applicationId = ref('')

// Form data
const form = ref({
  business_name: '',
  email: '',
  website: '',
  category: '',
  description: '',
  logo: null,
  bank_account_name: '',
  bank_account_number: '',
  bank_ifsc_swift: '',
  bank_name: '',
  payout_preferences: [],
  primary_color: '#bdf000',
  secondary_color: '#2196f3'
})

// File input reference
const fileInput = ref(null)

// Options
const enhancedPayoutOptions = [
  { label: 'Daily (Instant)', value: 'daily', description: 'Receive payments every day' },
  { label: 'Weekly', value: 'weekly', description: 'Receive payments every week' },
  { label: 'Bi-weekly', value: 'biweekly', description: 'Receive payments every 2 weeks' },
  { label: 'Monthly', value: 'monthly', description: 'Receive payments monthly' }
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
  { label: 'Entertainment', value: 'entertainment' },
  { label: 'Other', value: 'other' }
]

// Computed properties

// Validation methods
const isStepValid = (stepNumber) => {
  switch (stepNumber) {
    case 1:
      return form.value.business_name && 
             form.value.email && 
             /.+@.+\..+/.test(form.value.email)
    case 2:
      return true // Branding is optional
    case 3:
      return form.value.bank_account_name && 
             form.value.bank_account_number && 
             form.value.bank_ifsc_swift &&
             agreeToTerms.value
    default:
      return false
  }
}

const validateField = (field) => {
  const value = form.value[field]
  
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
    case 'payout_preferences':
      if (!value || value.length === 0) {
        errors.value[field] = 'Please select at least one payout preference'
      }
      break
  }
}

const clearError = (field) => {
  if (errors.value[field]) {
    delete errors.value[field]
  }
}

const nextStep = () => {
  if (!isStepValid(step.value)) {
    $q.notify({
      type: 'warning',
      message: 'Please complete all required fields correctly',
      position: 'top'
    })
    return
  }

  if (step.value < 3) {
    step.value++
    saveProgress()
  } else {
    submitRegistration()
  }
}

const previousStep = () => {
  if (step.value > 1) {
    step.value--
  }
}

const editStep = (targetStep) => {
  step.value = targetStep
}

const triggerFileUpload = () => {
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

  form.value.logo = file
  logoFile.value = file

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
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
  form.value.logo = null
  logoFile.value = null
  logoPreview.value = ''
  uploadProgress.value = 0
}

const submitRegistration = async () => {
  try {
    submitting.value = true
    globalLoading.value = true
    
    console.log('🔄 Submitting merchant registration...')

    // Prepare form data
    const formData = new FormData()
    
    // Add text fields
    formData.append('business_name', form.value.business_name)
    formData.append('email', form.value.email)
    formData.append('bank_account_name', form.value.bank_account_name)
    formData.append('bank_account_number', form.value.bank_account_number)
    formData.append('bank_ifsc_swift', form.value.bank_ifsc_swift)
    
    if (form.value.website) {
      formData.append('website', form.value.website)
    }
    if (form.value.category) {
      formData.append('category', form.value.category)
    }
    if (form.value.description) {
      formData.append('description', form.value.description)
    }
    if (form.value.bank_name) {
      formData.append('bank_name', form.value.bank_name)
    }
    if (form.value.primary_color) {
      formData.append('primary_color', form.value.primary_color)
    }
    if (form.value.secondary_color) {
      formData.append('secondary_color', form.value.secondary_color)
    }
    
    // Add payout preferences
    form.value.payout_preferences.forEach((pref, index) => {
      formData.append(`payout_preferences[${index}]`, pref)
    })
    
    // Add logo file if uploaded
    if (form.value.logo) {
      formData.append('logo', form.value.logo)
    }

    // ✅ Use your business registration endpoint: POST /api/merchant/register
    const response = await api.post('/api/merchant/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        uploadProgress.value = Math.round((progressEvent.loaded * 100) / progressEvent.total)
      }
    })

    console.log('✅ Merchant registration successful:', response.data)

    // Generate application ID
    applicationId.value = response.data?.application_id || 
                         response.data?.id || 
                         `APP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Clear stored progress
    clearProgress()

    // Show success dialog
    showSuccess.value = true

    $q.notify({
      type: 'positive',
      message: 'Registration submitted successfully!',
      position: 'top',
      timeout: 4000,
      actions: [
        { 
          label: 'View Status', 
          color: 'white', 
          handler: () => router.push('/dashboard?tab=status')
        }
      ]
    })

  } catch (error) {
    console.error('❌ Registration error:', error)
    
    let errorMessage = 'Registration failed. Please try again.'
    
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
    uploadProgress.value = 0
  }
}

const saveProgress = () => {
  // Save progress to localStorage
  localStorage.setItem('merchant_registration_step', step.value.toString())
  localStorage.setItem('merchant_registration_form', JSON.stringify({
    ...form.value,
    logo: null // Don't store file object
  }))
  localStorage.setItem('merchant_registration_logo_preview', logoPreview.value || '')
}

const clearProgress = () => {
  localStorage.removeItem('merchant_registration_step')
  localStorage.removeItem('merchant_registration_form')
  localStorage.removeItem('merchant_registration_logo_preview')
}

const closeSuccess = () => {
  showSuccess.value = false
}

const goToDashboard = () => {
  showSuccess.value = false
  router.push('/dashboard')
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

const showMerchantAgreement = () => {
  $q.notify({
    type: 'info',
    message: 'Merchant Agreement will be displayed here',
    position: 'top'
  })
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
watch(() => form.value, saveProgress, { deep: true })

// Restore progress on mount
const restoreProgress = () => {
  const savedStep = localStorage.getItem('merchant_registration_step')
  const savedForm = localStorage.getItem('merchant_registration_form')
  const savedLogoPreview = localStorage.getItem('merchant_registration_logo_preview')

  if (savedStep) {
    step.value = parseInt(savedStep)
  }

  if (savedForm) {
    try {
      const formData = JSON.parse(savedForm)
      form.value = { ...form.value, ...formData }
    } catch (e) {
      console.error('Error parsing saved form data:', e)
    }
  }

  if (savedLogoPreview) {
    logoPreview.value = savedLogoPreview
  }
}

// Initialize
restoreProgress()
</script>

<style scoped>
.merchant-registration-form {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
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
.registration-stepper {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 24px;
  padding: 32px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  backdrop-filter: blur(12px);
  overflow: hidden;
}

.registration-stepper :deep(.q-stepper__header) {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 16px;
  margin-bottom: 32px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  padding: 20px;
}

.registration-stepper :deep(.q-stepper__tab) {
  color: #999;
  transition: all 0.3s ease;
}

.registration-stepper :deep(.q-stepper__tab--active) {
  color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
  border-radius: 12px;
}

.registration-stepper :deep(.q-stepper__tab--done) {
  color: #4caf50;
}

/* Enhanced Step Content */
.step-content {
  padding: 24px 0;
  min-height: 400px;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(189, 240, 0, 0.2);
}

.step-icon {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(189, 240, 0, 0.3);
}

.step-text {
  flex: 1;
}

.step-title {
  font-size: 1.8rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0 0 8px 0;
}

.step-subtitle {
  font-size: 1rem;
  color: #999;
  margin: 0;
  line-height: 1.5;
}

/* Enhanced Form */
.form-container {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 32px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
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

.payout-chip {
  border-radius: 12px;
}

/* Enhanced Branding Section */
.branding-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.logo-section {
  display: flex;
  flex-direction: column;
}

.logo-upload-area {
  width: 100%;
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
  font-size: 1.1rem;
}

.upload-requirements {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.requirement-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #999;
  font-size: 0.8rem;
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

/* Brand Colors */
.colors-section {
  display: flex;
  flex-direction: column;
}

.color-picker-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.color-input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-label {
  color: #999;
  font-size: 0.85rem;
  font-weight: 500;
}

.color-input-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.color-input {
  width: 60px;
  height: 40px;
}

.color-input :deep(.q-field__control) {
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.color-value {
  color: #999;
  font-family: monospace;
  font-size: 0.9rem;
}

.color-preview {
  margin-top: 20px;
}

.preview-card {
  padding: 20px;
  border-radius: 12px;
  border: 2px solid;
  transition: all 0.3s ease;
  text-align: center;
}

.preview-logo {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 8px;
  overflow: hidden;
}

.preview-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-text {
  font-weight: 600;
  font-size: 1.1rem;
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

/* Enhanced Review */
.review-container {
  margin-bottom: 32px;
}

.review-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
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
  padding: 8px 0;
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

.brand-preview {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  border: 2px solid rgba(189, 240, 0, 0.3);
}

.brand-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.brand-colors {
  display: flex;
  gap: 8px;
}

.color-swatch {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

/* Terms Section */
.terms-section {
  background: rgba(189, 240, 0, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
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

/* Enhanced Navigation */
.stepper-navigation {
  background: rgba(255, 255, 255, 0.05);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px 32px;
  border-radius: 0 0 24px 24px;
}

.navigation-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 20px;
}

.nav-left {
  justify-self: start;
}

.nav-center {
  justify-self: center;
}

.nav-right {
  justify-self: end;
}

.step-indicator {
  text-align: center;
}

.current-step {
  font-size: 1.1rem;
  font-weight: 700;
  color: #bdf000;
}

.total-steps {
  font-size: 0.9rem;
  color: #999;
  margin-left: 4px;
}

.continue-btn {
  border-radius: 12px;
  font-weight: 700;
  padding: 12px 32px;
  transition: all 0.3s ease;
}

.continue-btn:hover:not(:disabled) {
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

/* Help Dialog */
.help-dialog {
  min-width: 500px;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
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

/* Success Dialog */
.success-dialog {
  min-width: 500px;
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

.application-details {
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(76, 175, 80, 0.2);
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
  color: #4caf50;
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
  animation: fadeInUp 0.6s forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 1024px) {
  .branding-grid {
    grid-template-columns: 1fr;
    gap: 24px;
  }
}

@media (max-width: 768px) {
  .merchant-registration-form {
    padding: 16px;
  }
  
  .registration-stepper {
    padding: 20px;
  }
  
  .step-content {
    padding: 20px 0;
  }
  
  .form-container {
    padding: 20px;
  }
  
  .step-header {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .step-title {
    font-size: 1.5rem;
  }
  
  .navigation-content {
    grid-template-columns: 1fr;
    gap: 16px;
    text-align: center;
  }
  
  .nav-left,
  .nav-right {
    justify-self: center;
  }
  
  .continue-btn,
  .previous-btn {
    width: 100%;
    max-width: 300px;
  }
  
  .logo-upload-area {
    height: 150px;
  }
  
  .help-dialog,
  .success-dialog {
    min-width: 90vw;
    margin: 16px;
  }
}

@media (max-width: 480px) {
  .step-icon {
    width: 56px;
    height: 56px;
  }
  
  .upload-text {
    font-size: 1rem;
  }
  
  .color-picker-grid {
    gap: 12px;
  }
  
  .brand-preview {
    flex-direction: column;
    gap: 12px;
  }
}

/* Enhanced focus states */
.modern-input:focus-within {
  transform: translateY(-1px);
}

.continue-btn:focus-visible,
.previous-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Form validation states */
.modern-input.error :deep(.q-field__control) {
  border-color: #f44336 !important;
  background: rgba(244, 67, 54, 0.1) !important;
}
</style>