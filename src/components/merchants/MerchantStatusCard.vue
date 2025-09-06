<template>
  <q-card class="status-card lime-glow">
    <!-- Enhanced Status Header -->
    <q-card-section class="status-header">
      <div class="header-content">
        <div class="status-title">
          <div class="title-icon">
            <q-icon :name="getStatusMainIcon(status)" :color="getStatusColor(status)" size="28px" />
          </div>
          <div class="title-text">
            <h4 class="title-main">Account Status</h4>
            <div class="title-subtitle">Current verification status</div>
          </div>
        </div>
        <div class="status-badge-container">
          <q-chip :color="getStatusColor(status)" :label="getStatusLabel(status)" :icon="getStatusIcon(status)"
            size="md" class="status-chip" />
          <div class="last-updated">
            Last updated: {{ formatTimeAgo(lastUpdated) }}
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Dark Mode Toggle Button -->
    <div class="dark-mode-toggle">
      <q-btn :icon="isDarkMode ? 'light_mode' : 'dark_mode'" round flat @click="toggleDarkMode"
        :color="isDarkMode ? 'amber' : 'blue'">
        <q-tooltip>Toggle Dark Mode</q-tooltip>
      </q-btn>
    </div>

    <!-- Enhanced Status Content -->
    <q-card-section class="status-content">
      <div class="status-description">
        <div class="description-text">{{ getStatusDescription(status) }}</div>
        <div class="status-details" v-if="getStatusDetails(status)">
          <q-icon name="info_outline" size="16px" color="blue" class="q-mr-sm" />
          {{ getStatusDetails(status) }}
        </div>
      </div>

      <!-- Enhanced Progress Section -->
      <div v-if="showProgress" class="progress-section">
        <div class="progress-header">
          <div class="progress-title">
            <q-icon name="timeline" size="20px" color="lime" class="q-mr-sm" />
            Verification Progress
          </div>
          <div class="progress-percentage">{{ progress }}%</div>
        </div>

        <q-linear-progress :value="progress / 100" :color="getProgressColor(progress)" size="8px" class="progress-bar"
          rounded />

        <div class="progress-steps">
          <div v-for="(step, index) in enhancedOnboardingSteps" :key="index" class="progress-step" :class="{
            completed: index < completedSteps,
            current: index === completedSteps,
            failed: step.status === 'failed'
          }" @click="showStepDetails(step, index)">
            <div class="step-icon">
              <q-icon :name="getStepIcon(index, completedSteps, step.status)"
                :color="getStepColor(index, completedSteps, step.status)" size="20px" />
            </div>
            <div class="step-content">
              <div class="step-name">{{ step.name }}</div>
              <div class="step-description">{{ step.description }}</div>
              <div class="step-status" v-if="step.status">
                <q-chip :color="getStepStatusColor(step.status)" :label="step.status" size="xs" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Requirements Section -->
      <div v-if="showRequirements" class="requirements-section">
        <div class="requirements-header">
          <h5 class="requirements-title">
            <q-icon name="checklist" size="18px" color="orange" class="q-mr-sm" />
            Required Actions
          </h5>
        </div>
        <div class="requirements-list">
          <div v-for="(requirement, index) in pendingRequirements" :key="index" class="requirement-item"
            :class="requirement.priority">
            <div class="requirement-icon">
              <q-icon :name="requirement.icon" :color="requirement.color" size="16px" />
            </div>
            <div class="requirement-content">
              <div class="requirement-name">{{ requirement.name }}</div>
              <div class="requirement-description">{{ requirement.description }}</div>
            </div>
            <div class="requirement-action">
              <q-btn :color="requirement.actionColor" :label="requirement.actionLabel"
                @click="handleRequirement(requirement)" size="sm" flat />
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced Status Actions -->
      <div v-if="showActions" class="status-actions">
        <div class="actions-grid">
          <q-btn v-if="status === 'pending' || status === 'under_review'" color="lime" icon="refresh"
            label="Refresh Status" @click="refreshStatus" :loading="checkingStatus" class="action-btn primary-action" />

          <q-btn v-if="status === 'rejected'" color="orange" icon="edit" label="Update Information" @click="updateInfo"
            class="action-btn secondary-action" />

          <q-btn v-if="status === 'suspended'" color="red" icon="support_agent" label="Contact Support"
            @click="contactSupport" class="action-btn secondary-action" />

          <q-btn v-if="status === 'approved' || status === 'verified'" color="blue" icon="dashboard"
            label="Start Payments" @click="goToPayments" class="action-btn primary-action" />

          <q-btn color="grey" icon="history" label="View History" @click="toggleTimeline" flat
            class="action-btn tertiary-action" />
        </div>
      </div>
    </q-card-section>

    <!-- Enhanced Status Timeline -->
    <q-card-section v-if="showTimeline && timelineVisible" class="status-timeline">
      <div class="timeline-header">
        <h4 class="timeline-title">
          <q-icon name="timeline" size="20px" color="lime" class="q-mr-sm" />
          Status History
        </h4>
        <q-btn flat round dense icon="close" @click="timelineVisible = false" color="grey" />
      </div>

      <div class="timeline">
        <div v-for="(event, index) in enhancedStatusTimeline" :key="index" class="timeline-item" :class="event.type">
          <div class="timeline-icon">
            <q-icon :name="event.icon" :color="event.color" size="18px" />
          </div>
          <div class="timeline-content">
            <div class="timeline-title">{{ event.title }}</div>
            <div class="timeline-time">{{ formatDateTime(event.timestamp) }}</div>
            <div class="timeline-description" v-if="event.description">
              {{ event.description }}
            </div>
            <div class="timeline-user" v-if="event.user">
              <q-icon name="person" size="12px" class="q-mr-xs" />
              {{ event.user }}
            </div>
          </div>
        </div>
      </div>
    </q-card-section>

    <!-- Step Details Dialog -->
    <q-dialog v-model="showStepDialog" persistent>
      <q-card class="step-dialog">
        <q-card-section class="dialog-header">
          <div class="text-h6">{{ selectedStep?.name }}</div>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section v-if="selectedStep">
          <div class="step-detail-content">
            <div class="step-status-display">
              <q-icon :name="getStepIcon(selectedStepIndex, completedSteps, selectedStep.status)"
                :color="getStepColor(selectedStepIndex, completedSteps, selectedStep.status)" size="32px" />
              <div class="status-info">
                <div class="status-name">{{ selectedStep.status || 'pending' }}</div>
                <div class="status-desc">{{ selectedStep.description }}</div>
              </div>
            </div>

            <div class="step-requirements" v-if="selectedStep.requirements">
              <h6>Requirements:</h6>
              <ul>
                <li v-for="req in selectedStep.requirements" :key="req">{{ req }}</li>
              </ul>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Close" v-close-popup />
          <q-btn v-if="selectedStep?.actionRequired" color="lime" :label="selectedStep.actionLabel || 'Take Action'"
            @click="handleStepAction(selectedStep)" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'


const router = useRouter()
const $q = useQuasar()

// Props
const props = defineProps({
  status: {
    type: String,
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0
  },
  showActions: {
    type: Boolean,
    default: true
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  showTimeline: {
    type: Boolean,
    default: false
  },
  merchantId: {
    type: [String, Number],
    default: null
  }
})

// Emits
const emit = defineEmits(['check-status', 'update-info', 'contact-support', 'status-updated'])

// Reactive data
const checkingStatus = ref(false)
const timelineVisible = ref(false)
const showStepDialog = ref(false)
const selectedStep = ref(null)
const selectedStepIndex = ref(0)
const lastUpdated = ref(new Date())

// Computed properties
const completedSteps = computed(() => Math.floor(props.progress / 20))

const enhancedOnboardingSteps = computed(() => [
  {
    name: 'Account Created',
    description: 'Basic account setup completed',
    status: props.progress >= 20 ? 'completed' : 'pending',
    requirements: ['Valid email address', 'Strong password', 'Account verification'],
    actionRequired: props.progress < 20,
    actionLabel: 'Complete Setup'
  },
  {
    name: 'Business Information',
    description: 'Business details submitted',
    status: props.progress >= 40 ? 'completed' : props.progress >= 20 ? 'current' : 'pending',
    requirements: ['Business name', 'Bank account details', 'Business category'],
    actionRequired: props.progress >= 20 && props.progress < 40,
    actionLabel: 'Submit Business Info'
  },
  {
    name: 'Document Upload',
    description: 'Required documents uploaded',
    status: props.progress >= 60 ? 'completed' : props.progress >= 40 ? 'current' : 'pending',
    requirements: ['Business license', 'Bank statements', 'ID verification'],
    actionRequired: props.progress >= 40 && props.progress < 60,
    actionLabel: 'Upload Documents'
  },
  {
    name: 'Verification',
    description: 'Account under verification',
    status: props.progress >= 80 ? 'completed' : props.progress >= 60 ? 'current' : 'pending',
    requirements: ['Document review', 'Bank verification', 'Compliance check'],
    actionRequired: false,
    actionLabel: 'Wait for Review'
  },
  {
    name: 'Approval',
    description: 'Account approved and active',
    status: props.progress >= 100 ? 'completed' : props.progress >= 80 ? 'current' : 'pending',
    requirements: ['Final approval', 'Account activation', 'Payment setup'],
    actionRequired: false,
    actionLabel: 'Account Active'
  }
])

const pendingRequirements = computed(() => {
  const requirements = []

  if (props.status === 'pending' && props.progress < 40) {
    requirements.push({
      name: 'Complete Business Information',
      description: 'Please provide your business details and banking information',
      icon: 'business',
      color: 'orange',
      priority: 'high',
      actionLabel: 'Complete Now',
      actionColor: 'orange',
      action: 'complete-business-info'
    })
  }

  if (props.status === 'pending' && props.progress < 60) {
    requirements.push({
      name: 'Upload Required Documents',
      description: 'Upload business license and verification documents',
      icon: 'upload_file',
      color: 'blue',
      priority: 'high',
      actionLabel: 'Upload',
      actionColor: 'blue',
      action: 'upload-documents'
    })
  }

  if (props.status === 'rejected') {
    requirements.push({
      name: 'Address Rejection Issues',
      description: 'Review and fix the issues mentioned in the rejection notice',
      icon: 'error_outline',
      color: 'red',
      priority: 'urgent',
      actionLabel: 'Fix Issues',
      actionColor: 'red',
      action: 'fix-rejection'
    })
  }

  return requirements
})

const showRequirements = computed(() => {
  return pendingRequirements.value.length > 0
})

const enhancedStatusTimeline = computed(() => {
  const timeline = [
    {
      title: 'Account Created',
      description: 'Your merchant account was successfully created',
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      icon: 'person_add',
      color: 'green',
      type: 'success',
      user: 'System'
    }
  ]

  if (props.progress >= 40) {
    timeline.push({
      title: 'Business Information Submitted',
      description: 'Business details and banking information provided',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      icon: 'store',
      color: 'blue',
      type: 'info',
      user: props.merchantId ? `Merchant ${props.merchantId}` : 'You'
    })
  }

  if (props.status === 'under_review') {
    timeline.push({
      title: 'Under Review',
      description: 'Your application is being reviewed by our verification team',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      icon: 'search',
      color: 'orange',
      type: 'warning',
      user: 'Verification Team'
    })
  }

  if (props.status === 'approved' || props.status === 'verified') {
    timeline.push({
      title: 'Account Approved',
      description: 'Your merchant account has been approved and activated',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: 'check_circle',
      color: 'green',
      type: 'success',
      user: 'Admin Team'
    })
  }

  if (props.status === 'rejected') {
    timeline.push({
      title: 'Application Rejected',
      description: 'Your application was rejected. Please review the feedback and resubmit.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      icon: 'cancel',
      color: 'red',
      type: 'error',
      user: 'Review Team'
    })
  }

  return timeline.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
})

// ✅ Watch for status changes from parent component
watch(() => props.status, (newStatus, oldStatus) => {
  if (newStatus !== oldStatus) {
    console.log('📬 Status prop changed in MerchantStatusCard:', oldStatus, '→', newStatus)
    lastUpdated.value = new Date()

    // Show notification for status changes
    if (newStatus === 'approved' || newStatus === 'verified') {
      $q.notify({
        type: 'positive',
        message: '🎉 Your merchant account has been approved!',
        position: 'top',
        icon: 'check_circle',
        timeout: 8000
      })
    } else if (newStatus === 'rejected') {
      $q.notify({
        type: 'negative',
        message: '❌ Your application was rejected. Please update your information.',
        position: 'top',
        icon: 'cancel',
        timeout: 8000
      })
    }
  }
})

// Methods - ✅ REMOVED ALL NON-EXISTENT API CALLS
const refreshStatus = async () => {
  try {
    checkingStatus.value = true
    console.log('🔄 Refreshing status from MerchantStatusCard...')

    // ✅ Simply emit to parent to trigger status refresh
    // Parent component will handle the actual API calls
    emit('check-status', {
      merchantId: props.merchantId,
      currentStatus: props.status,
      timestamp: new Date()
    })

    $q.notify({
      type: 'info',
      message: 'Status refresh requested. Please wait for updates...',
      position: 'top',
      timeout: 3000
    })

    lastUpdated.value = new Date()

  } catch (error) {
    console.error('❌ Status refresh error:', error)
    $q.notify({
      type: 'negative',
      message: 'Failed to refresh status. Please try again.',
      position: 'top'
    })
  } finally {
    checkingStatus.value = false
  }
}

const updateInfo = () => {
  emit('update-info')
  router.push('/dashboard?tab=profile')
}

const contactSupport = () => {
  emit('contact-support')
  router.push('/support')
}

const goToPayments = () => {
  router.push('/checkout')
}

const toggleTimeline = () => {
  timelineVisible.value = !timelineVisible.value
}

const showStepDetails = (step, index) => {
  selectedStep.value = step
  selectedStepIndex.value = index
  showStepDialog.value = true
}

const handleStepAction = (step) => {
  showStepDialog.value = false

  switch (step.action || 'default') {
    case 'complete-business-info':
      router.push('/dashboard?tab=business')
      break
    case 'upload-documents':
      router.push('/dashboard?tab=documents')
      break
    case 'fix-rejection':
      router.push('/dashboard?tab=issues')
      break
    default:
      $q.notify({
        type: 'info',
        message: 'Action functionality coming soon',
        position: 'top'
      })
  }
}

const handleRequirement = (requirement) => {
  switch (requirement.action) {
    case 'complete-business-info':
      router.push('/dashboard?tab=business')
      break
    case 'upload-documents':
      router.push('/dashboard?tab=documents')
      break
    case 'fix-rejection':
      router.push('/dashboard?tab=issues')
      break
    default:
      $q.notify({
        type: 'info',
        message: 'Requirement action coming soon',
        position: 'top'
      })
  }
}

// Utility methods
const getStatusMainIcon = (status) => {
  const icons = {
    approved: 'verified',
    verified: 'verified',
    pending: 'pending',
    rejected: 'cancel',
    suspended: 'block',
    under_review: 'search'
  }
  return icons[status] || 'help'
}

const getStatusColor = (status) => {
  const colors = {
    approved: 'green',
    verified: 'green',
    pending: 'orange',
    rejected: 'red',
    suspended: 'red',
    under_review: 'blue'
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    approved: 'check_circle',
    verified: 'verified',
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
    verified: 'Verified',
    pending: 'Pending Review',
    rejected: 'Rejected',
    suspended: 'Suspended',
    under_review: 'Under Review'
  }
  return labels[status] || 'Unknown'
}

const getStatusDescription = (status) => {
  const descriptions = {
    approved: 'Congratulations! Your merchant account has been approved and you can start accepting payments.',
    verified: 'Your account is fully verified and active. You can accept payments and access all features.',
    pending: 'Your application is being reviewed by our team. This process typically takes 24-48 hours.',
    rejected: 'Your application was not approved. Please review the feedback and update your information.',
    suspended: 'Your account has been temporarily suspended. Please contact our support team for assistance.',
    under_review: 'Your application is currently under detailed review by our verification specialists.'
  }
  return descriptions[status] || 'Status information not available.'
}

const getStatusDetails = (status) => {
  const details = {
    pending: 'We will notify you via email once the review is complete.',
    under_review: 'Our team is verifying your business information and documents.',
    rejected: 'Check your email for specific feedback and required corrections.',
    suspended: 'Contact support immediately to resolve any compliance issues.'
  }
  return details[status] || ''
}

const getProgressColor = (progress) => {
  if (progress >= 80) return 'green'
  if (progress >= 60) return 'lime'
  if (progress >= 40) return 'blue'
  if (progress >= 20) return 'orange'
  return 'red'
}

const getStepIcon = (index, completed, stepStatus) => {
  if (stepStatus === 'failed') return 'error'
  if (index < completed) return 'check_circle'
  if (index === completed) return 'radio_button_checked'
  return 'radio_button_unchecked'
}

const getStepColor = (index, completed, stepStatus) => {
  if (stepStatus === 'failed') return 'red'
  if (index < completed) return 'green'
  if (index === completed) return 'orange'
  return 'grey'
}

const getStepStatusColor = (status) => {
  const colors = {
    completed: 'green',
    current: 'orange',
    pending: 'grey',
    failed: 'red'
  }
  return colors[status] || 'grey'
}

const formatTimeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)

  if (diff < 60000) return 'Just now'
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
  return `${Math.floor(diff / 86400000)}d ago`
}

const formatDateTime = (date) => {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Add dark mode state
const isDarkMode = ref(false)

// Toggle dark mode function
const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  document.body.classList.toggle('dark-mode')
}


// Lifecycle
onMounted(() => {
  console.log('✅ MerchantStatusCard mounted with status:', props.status)

  // ✅ REMOVED: No more auto API calls that don't exist
  // Status updates will come from parent component via props
})
</script>

<style scoped>
.status-card {
  background: rgba(18, 18, 18, 0.95);
  border-radius: 20px;
  border: 1px solid rgba(189, 240, 0, 0.2);
  transition: all 0.3s ease;
  overflow: hidden;
}

.status-card:hover {
  border-color: rgba(189, 240, 0, 0.4);
  transform: translateY(-2px);
}

/* Enhanced Header */
.status-header {
  background: rgba(189, 240, 0, 0.05);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding: 24px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.status-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(189, 240, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-main {
  color: #ffffff;
  font-weight: 700;
  margin: 0;
  font-size: 1.2rem;
}

.title-subtitle {
  color: #999;
  font-size: 0.9rem;
  margin-top: 2px;
}

.status-badge-container {
  text-align: right;
}

.status-chip {
  font-weight: 600;
  text-transform: capitalize;
  border-radius: 16px;
  margin-bottom: 8px;
}

.last-updated {
  font-size: 0.75rem;
  color: #999;
}

/* Dark Mode Toggle */
.dark-mode-toggle {
  padding: 16px;
  text-align: right;
}

.dark-mode-toggle .q-btn {
  background: rgba(189, 240, 0, 0.1);
  color: #121212;
}

.dark-mode-toggle .q-btn:hover {
  background: rgba(189, 240, 0, 0.2);
}

/* Enhanced Content */
.status-content {
  padding: 24px;
}

.status-description {
  margin-bottom: 24px;
}

.description-text {
  color: #cfcfcf;
  line-height: 1.6;
  margin-bottom: 12px;
}

.status-details {
  color: #2196f3;
  font-size: 0.9rem;
  background: rgba(33, 150, 243, 0.1);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid rgba(33, 150, 243, 0.2);
  display: flex;
  align-items: center;
}

/* Enhanced Progress */
.progress-section {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 24px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.progress-title {
  color: #bdf000;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.progress-percentage {
  color: #ffffff;
  font-weight: 700;
  font-size: 1.1rem;
}

.progress-bar {
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.progress-steps {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.progress-step {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  transition: all 0.3s ease;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.progress-step:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(189, 240, 0, 0.3);
  transform: translateX(4px);
}

.progress-step.completed {
  background: rgba(76, 175, 80, 0.1);
  border-color: rgba(76, 175, 80, 0.3);
}

.progress-step.current {
  background: rgba(255, 152, 0, 0.1);
  border-color: rgba(255, 152, 0, 0.3);
}

.progress-step.failed {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
}

.step-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.step-content {
  flex: 1;
}

.step-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.step-description {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.4;
}

.step-status {
  margin-top: 8px;
}

/* Requirements Section */
.requirements-section {
  background: rgba(255, 152, 0, 0.05);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 152, 0, 0.2);
  margin-bottom: 24px;
}

.requirements-header {
  margin-bottom: 16px;
}

.requirements-title {
  color: #ff9800;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
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
  padding: 16px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
}

.requirement-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(189, 240, 0, 0.3);
}

.requirement-item.high {
  border-left: 4px solid #ff9800;
}

.requirement-item.urgent {
  border-left: 4px solid #f44336;
}

.requirement-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

.requirement-content {
  flex: 1;
}

.requirement-name {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.requirement-description {
  color: #999;
  font-size: 0.85rem;
  line-height: 1.4;
}

/* Enhanced Actions */
.status-actions {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 20px;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.action-btn {
  border-radius: 12px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
}

.primary-action {
  background: linear-gradient(135deg, #bdf000, #a0d000);
  color: #09050d;
}

.secondary-action {
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.tertiary-action {
  color: #999;
}

.tertiary-action:hover {
  color: #bdf000;
  background: rgba(189, 240, 0, 0.1);
}

/* Enhanced Timeline */
.status-timeline {
  background: rgba(255, 255, 255, 0.02);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 24px;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
  padding-bottom: 12px;
}

.timeline-title {
  color: #bdf000;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
}

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
  background: linear-gradient(180deg, rgba(189, 240, 0, 0.8), rgba(189, 240, 0, 0.2));
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-item:last-child {
  margin-bottom: 0;
}

.timeline-item.success {
  color: #4caf50;
}

.timeline-item.warning {
  color: #ff9800;
}

.timeline-item.error {
  color: #f44336;
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
  border-radius: 8px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.timeline-title {
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 4px;
}

.timeline-time {
  color: #bdf000;
  font-size: 0.8rem;
  margin-bottom: 8px;
}

.timeline-description {
  color: #cfcfcf;
  font-size: 0.85rem;
  line-height: 1.4;
  margin-bottom: 8px;
}

.timeline-user {
  color: #999;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
}

/* Step Dialog */
.step-dialog {
  min-width: 500px;
  background: #1a1a1a;
  color: #ffffff;
  border-radius: 16px;
}

.dialog-header {
  background: rgba(189, 240, 0, 0.1);
  border-bottom: 1px solid rgba(189, 240, 0, 0.2);
}

.step-detail-content {
  padding: 20px 0;
}

.step-status-display {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.status-info {
  flex: 1;
}

.status-name {
  font-weight: 600;
  color: #ffffff;
  text-transform: capitalize;
}

.status-desc {
  color: #999;
  font-size: 0.9rem;
}

.step-requirements h6 {
  color: #bdf000;
  margin: 16px 0 8px 0;
}

.step-requirements ul {
  color: #cfcfcf;
  padding-left: 20px;
}

/* Lime glow effect */
.lime-glow {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(189, 240, 0, 0.2), 0 0 20px rgba(189, 240, 0, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }

  .progress-steps {
    gap: 8px;
  }

  .progress-step {
    padding: 12px;
  }

  .step-dialog {
    min-width: 90vw;
    margin: 16px;
  }

  .requirements-list {
    gap: 8px;
  }

  .requirement-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}

/* Enhanced focus states */
.progress-step:focus-visible,
.action-btn:focus-visible {
  outline: 2px solid rgba(189, 240, 0, 0.5);
  outline-offset: 2px;
}

/* Animation for status changes */
.status-chip {
  animation: statusChange 0.5s ease-out;
}

@keyframes statusChange {
  0% {
    transform: scale(0.9);
    opacity: 0.7;
  }

  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Dark mode styles */
.dark-mode {
  background-color: #121212;
  color: #e0e0e0;
}

.dark-mode .status-card {
  background: rgba(18, 18, 18, 0.95);
  border: 1px solid rgba(189, 240, 0, 0.3);
}

.dark-mode .title-main {
  color: #e0e0e0;
}

.dark-mode .title-subtitle,
.dark-mode .last-updated,
.dark-mode .description-text,
.dark-mode .status-details,
.dark-mode .progress-percentage,
.dark-mode .step-name,
.dark-mode .step-description,
.dark-mode .requirement-name,
.dark-mode .requirement-description,
.dark-mode .timeline-title,
.dark-mode .timeline-time,
.dark-mode .timeline-description,
.dark-mode .timeline-user {
  color: #e0e0e0;
}

.dark-mode .status-chip {
  background: rgba(189, 240, 0, 0.1);
  color: #e0e0e0;
}

.dark-mode .q-btn {
  background: rgba(189, 240, 0, 0.1);
  color: #121212;
}

.dark-mode .q-btn.secondary-action {
  border: 1px solid rgba(189, 240, 0, 0.3);
}

.dark-mode .q-btn.tertiary-action {
  color: #bdf000;
}

.dark-mode .lime-glow {
  box-shadow: 0 8px 32px rgba(255, 255, 255, 0.1), 0 0 0 1px rgba(189, 240, 0, 0.3), 0 0 20px rgba(189, 240, 0, 0.2);
}
</style>