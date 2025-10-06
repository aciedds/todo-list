import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// Extend Window interface for analytics
declare global {
  interface Window {
    gtag?: (...args: any[]) => void
  }
}

// Fallback components for when view components don't exist yet
const createFallbackComponent = (name: string) => ({
  template: `
    <div class="fallback-view">
      <h1>${name}</h1>
      <p>This component is not implemented yet.</p>
      <p>Please create the corresponding view component in the views directory.</p>
    </div>
  `,
  style: `
    .fallback-view {
      padding: 2rem;
      text-align: center;
      max-width: 600px;
      margin: 0 auto;
    }
    .fallback-view h1 {
      color: #333;
      margin-bottom: 1rem;
    }
    .fallback-view p {
      color: #666;
      margin-bottom: 0.5rem;
    }
  `
})

// Lazy load components for better performance
// These will use fallback components until the actual view components are created
const HomeView = () => import('../view/HomeView.vue')
const LoginView = () => import('../view/LoginView.vue')
const RegisterView = () => import('../view/RegisterView.vue')
const ProfileView = () => Promise.resolve(createFallbackComponent('Profile View'))
const TodoDetailView = () => Promise.resolve(createFallbackComponent('Todo Detail View'))
const NotFoundView = () => Promise.resolve(createFallbackComponent('404 - Page Not Found'))
const ForgotPasswordView = () => Promise.resolve(createFallbackComponent('Forgot Password View'))
const ResetPasswordView = () => Promise.resolve(createFallbackComponent('Reset Password View'))
const VerifyEmailView = () => Promise.resolve(createFallbackComponent('Verify Email View'))

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      requiresAuth: true,
      title: 'Todo List',
      description: 'Manage your todos'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      requiresGuest: true,
      title: 'Login',
      description: 'Sign in to your account'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      requiresGuest: true,
      title: 'Register',
      description: 'Create a new account'
    }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      requiresAuth: true,
      title: 'Profile',
      description: 'Manage your profile'
    }
  },
  {
    path: '/todo/:id',
    name: 'todo-detail',
    component: TodoDetailView,
    meta: {
      requiresAuth: true,
      title: 'Todo Detail',
      description: 'View todo details'
    },
    props: true
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: {
      requiresGuest: true,
      title: 'Forgot Password',
      description: 'Reset your password'
    }
  },
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: {
      requiresGuest: true,
      title: 'Reset Password',
      description: 'Set your new password'
    },
    props: true
  },
  {
    path: '/verify-email/:token',
    name: 'verify-email',
    component: VerifyEmailView,
    meta: {
      requiresGuest: true,
      title: 'Verify Email',
      description: 'Verify your email address'
    },
    props: true
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
    meta: {
      title: 'Page Not Found',
      description: 'The page you are looking for does not exist'
    }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    // Return to saved position if available, otherwise scroll to top
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// Navigation guards
router.beforeEach(async (to, _from, next) => {
  // Get token from localStorage
  const token = localStorage.getItem('token')
  const isAuthenticated = !!token

  // Check if token is expired
  let isTokenExpired = false
  if (token) {
    try {
      const parts = token.split('.')
      if (parts.length === 3 && parts[1]) {
        const payload = JSON.parse(atob(parts[1]))
        isTokenExpired = payload.exp * 1000 < Date.now()
      } else {
        isTokenExpired = true
      }
    } catch {
      isTokenExpired = true
    }
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth) {
    if (!isAuthenticated || isTokenExpired) {
      // Clear invalid token
      if (isTokenExpired) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('tokenExpiration')
      }

      // Redirect to login with return URL
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }

  // Check if route requires guest (not authenticated)
  if (to.meta.requiresGuest) {
    if (isAuthenticated && !isTokenExpired) {
      // Redirect authenticated users away from auth pages
      next({ name: 'home' })
      return
    }
  }

  // Set page title
  if (to.meta.title) {
    document.title = `${to.meta.title} - Todo App`
  }

  // Set meta description
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }

  next()
})

// After navigation guard
router.afterEach((to, _from) => {
  // Track page views (if analytics is set up)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'GA_MEASUREMENT_ID', {
      page_path: to.fullPath
    })
  }

  // Clear any previous error messages
  const errorElement = document.querySelector('.error-message')
  if (errorElement) {
    errorElement.remove()
  }
})

// Error handling
router.onError((error) => {
  console.error('Router error:', error)

  // Handle chunk loading errors
  if (error.message.includes('Loading chunk')) {
    // Reload the page to get the latest chunk
    window.location.reload()
  }
})

export default router