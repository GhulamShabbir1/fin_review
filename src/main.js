import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

// Import Quasar
import { Quasar, Dialog, Notify, Loading, Dark, setCssVar } from 'quasar'
import quasarLang from 'quasar/lang/en-US'
import quasarIconSet from 'quasar/icon-set/material-icons'
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'
import 'animate.css'

// Import Neon Styles
import './styles/neon.css'

// ✅ Create Pinia instance directly
const pinia = createPinia()
const app = createApp(App)

// ✅ Install Pinia FIRST
app.use(pinia)
app.use(router)
app.use(Quasar, {
  plugins: { Dialog, Notify, Loading, Dark },
  lang: quasarLang,
  iconSet: quasarIconSet
})

// Set neon brand colors
setCssVar('primary', '#00ffff')
setCssVar('secondary', '#ff00ff')
setCssVar('accent', '#8b5cf6')
setCssVar('dark', '#0a0a0a')

// ✅ Mount the app
app.mount('#app')

// ✅ Make Pinia globally available
window.__PINIA__ = pinia

// ✅ Initialize auth store after everything is ready
setTimeout(() => {
  try {
    const { useAuthStore } = require('./store/auth')
    const auth = useAuthStore()
    if (auth.loadStoredData) {
      auth.loadStoredData()
    }
  } catch (err) {
    console.log('Auth store initialization deferred', err)
  }
}, 200)