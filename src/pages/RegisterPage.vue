<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-card neon-card">
        <div class="register-header">
          <h1 class="neon-text">Join FinteckX</h1>
          <p class="text-secondary">Create your account and start your journey</p>
        </div>
        
        <q-form @submit="handleRegister" class="register-form">
          <div class="form-row">
            <q-input
              v-model="form.name"
              label="Full Name"
              class="neon-input"
              :rules="[val => !!val || 'Name is required']"
              outlined
            />
          </div>
          
          <div class="form-row">
            <q-input
              v-model="form.email"
              label="Email"
              type="email"
              class="neon-input"
              :rules="[val => !!val || 'Email is required', val => /.+@.+\..+/.test(val) || 'Invalid email']"
              outlined
            />
          </div>
          
          <div class="form-row">
            <q-input
              v-model="form.password"
              label="Password"
              type="password"
              class="neon-input"
              :rules="[val => !!val || 'Password is required', val => val.length >= 8 || 'Password must be at least 8 characters']"
              outlined
            />
          </div>
          
          <div class="form-row">
            <q-input
              v-model="form.password_confirmation"
              label="Confirm Password"
              type="password"
              class="neon-input"
              :rules="[val => !!val || 'Please confirm password', val => val === form.password || 'Passwords do not match']"
              outlined
            />
          </div>
          
          <div class="form-row">
            <q-select
              v-model="form.role"
              :options="roleOptions"
              label="Account Type"
              class="neon-input"
              :rules="[val => !!val || 'Please select account type']"
              outlined
            />
          </div>
          
          <div class="form-actions">
            <q-btn
              type="submit"
              class="neon-btn full-width"
              :loading="loading"
              size="lg"
            >
              Create Account
            </q-btn>
          </div>
        </q-form>
        
        <div class="login-link">
          <p>Already have an account? <router-link to="/login" class="neon-link">Sign In</router-link></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
import { useAuthStore } from 'src/stores/auth'

export default {
  name: 'RegisterPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore()
    
    const loading = ref(false)
    const form = ref({
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      role: 'merchant'
    })
    
    const roleOptions = [
      { label: 'Merchant', value: 'merchant' },
      { label: 'Admin', value: 'admin' }
    ]
    
    const handleRegister = async () => {
      loading.value = true
      try {
        await authStore.register(form.value)
        $q.notify({
          type: 'positive',
          message: 'Account created successfully!',
          position: 'top'
        })
        router.push('/login')
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Registration failed',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      roleOptions,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg-primary);
}

.register-container {
  width: 100%;
  max-width: 500px;
}

.register-card {
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  text-shadow: 0 0 20px var(--neon-cyan);
}

.form-row {
  margin-bottom: 20px;
}

.form-actions {
  margin-top: 30px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.neon-link {
  color: var(--neon-cyan);
  text-decoration: none;
  transition: all 0.3s ease;
}

.neon-link:hover {
  text-shadow: 0 0 10px var(--neon-cyan);
}
</style>