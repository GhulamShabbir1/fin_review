<template>
  <q-btn
    flat
    round
    :icon="isDark ? 'brightness_5' : 'brightness_3'"
    @click="toggleDarkMode"
    class="dark-mode-toggle"
    :class="{ 'dark-mode': isDark }"
  >
    <q-tooltip>{{ isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode' }}</q-tooltip>
  </q-btn>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const isDark = ref(false)

const toggleDarkMode = () => {
  isDark.value = !isDark.value
  $q.dark.set(isDark.value)
  localStorage.setItem('darkMode', isDark.value.toString())
}

onMounted(() => {
  // Check for saved theme preference or default to light mode
  const savedTheme = localStorage.getItem('darkMode')
  if (savedTheme) {
    isDark.value = savedTheme === 'true'
  } else {
    // Check system preference
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  $q.dark.set(isDark.value)
})

// Listen for system theme changes
watch(() => window.matchMedia('(prefers-color-scheme: dark)').matches, (newValue) => {
  if (!localStorage.getItem('darkMode')) {
    isDark.value = newValue
    $q.dark.set(isDark.value)
  }
})
</script>

<style scoped>
.dark-mode-toggle {
  transition: all 0.3s ease;
  background: var(--gradient-accent);
  color: var(--primary);
  border: 2px solid transparent;
}

.dark-mode-toggle:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(255, 183, 3, 0.4);
}

.dark-mode-toggle.dark-mode {
  background: var(--gradient-primary);
  color: var(--neutral);
}

.dark-mode-toggle.dark-mode:hover {
  box-shadow: 0 4px 12px rgba(65, 105, 225, 0.4);
}
</style>
