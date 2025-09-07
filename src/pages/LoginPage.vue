<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-card neon-card">
        <div class="login-header">
          <h1 class="neon-text">Welcome Back</h1>
          <p class="text-secondary">Sign in to your FinteckX account</p>
        </div>
        
        <q-form @submit="handleLogin" class="login-form">
          <div class="form-row">
            <q-input
              v-model="form.email"
              label="Email"
              type="email"
              class="neon-input"
              :rules="[val => !!val || 'Email is required']"
              outlined
            />
          </div>
          
          <div class="form-row">
            <q-input
              v-model="form.password"
              label="Password"
              type="password"
              class="neon-input"
              :rules="[val => !!val || 'Password is required']"
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
              Sign In
            </q-btn>
          </div>
        </q-form>
        
        <div class="register-link">
          <p>Don't have an account? <router-link to="/register" class="neon-link">Create Account</router-link></p>
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
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const $q = useQuasar()
    const authStore = useAuthStore()
    
    const loading = ref(false)
    const form = ref({
      email: '',
      password: ''
    })
    
    const handleLogin = async () => {
      loading.value = true
      try {
        await authStore.login(form.value)
        $q.notify({
          type: 'positive',
          message: 'Login successful!',
          position: 'top'
        })
        
        // Redirect based on user role
        const user = authStore.user
        if (user?.role === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/merchant/dashboard')
        }
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: error.message || 'Login failed',
          position: 'top'
        })
      } finally {
        loading.value = false
      }
    }
    
    return {
      form,
      loading,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: var(--bg-primary);
}

.login-container {
  width: 100%;
  max-width: 400px;
}

.login-card {
  padding: 40px;
  border-radius: 20px;
  backdrop-filter: blur(10px);
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header h1 {
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

.register-link {
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