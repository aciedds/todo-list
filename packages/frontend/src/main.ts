import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './presentation/router'
import './style.css'
// @ts-ignore - Vue SFC files don't have type declarations by default
import App from './App.vue'

// Extend Vue app instance with custom properties
declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $log: typeof console.log
    $error: typeof console.error
    $formatDate: (date: string | Date) => string
    $formatDateTime: (date: string | Date) => string
    $truncate: (text: string, length?: number) => string
  }
}

// Extend HTMLElement for custom directives
declare global {
  interface HTMLElement {
    clickOutsideEvent?: (event: Event) => void
  }
}

// Create Vue app instance
const app = createApp(App)

// Create Pinia store
const pinia = createPinia()

// Configure Pinia with plugins
pinia.use(({ store }) => {
  // Watch for state changes and persist to localStorage
  store.$subscribe((_mutation, state) => {
    if (store.$id === 'auth') {
      // Only persist auth store state
      localStorage.setItem('auth-store', JSON.stringify(state))
    }
  })
})

// Install plugins
app.use(pinia)
app.use(router)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err)
  console.error('Component instance:', instance)
  console.error('Error info:', info)

  // You can add error reporting service here
  // Example: Sentry.captureException(err)
}

// Global warning handler
app.config.warnHandler = (msg, instance, trace) => {
  console.warn('Vue warning:', msg)
  console.warn('Component instance:', instance)
  console.warn('Trace:', trace)
}

// Global properties
app.config.globalProperties.$log = console.log
app.config.globalProperties.$error = console.error

// Custom directives
app.directive('focus', {
  mounted(el) {
    el.focus()
  }
})

app.directive('click-outside', {
  mounted(el, binding) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el === event.target || el.contains(event.target as Node))) {
        binding.value(event)
      }
    }
    document.addEventListener('click', el.clickOutsideEvent)
  },
  unmounted(el) {
    document.removeEventListener('click', el.clickOutsideEvent)
  }
})

// Global mixins
app.mixin({
  methods: {
    $formatDate(date: string | Date) {
      return new Date(date).toLocaleDateString()
    },
    $formatDateTime(date: string | Date) {
      return new Date(date).toLocaleString()
    },
    $truncate(text: string, length: number = 100) {
      return text.length > length ? text.substring(0, length) + '...' : text
    }
  }
})

// Mount the app
app.mount('#app')

// Development helpers
if (import.meta.env.DEV) {
  // Expose app instance to global scope for debugging
  ; (window as any).__VUE_APP__ = app

  // Add development tools
  console.log('🚀 Vue app mounted successfully!')
  console.log('📱 App instance available as window.__VUE_APP__')
  console.log('🔧 Development mode enabled')
}

// Production optimizations
if (import.meta.env.PROD) {
  // Performance monitoring
  if ('performance' in window) {
    window.addEventListener('load', () => {
      const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      console.log('App load time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms')
    })
  }
}
