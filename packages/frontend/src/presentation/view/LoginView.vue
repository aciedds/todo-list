<template>
  <div class="login-container">
    <!-- Background with gradient -->
    <div class="login-background">
      <div class="login-background-gradient"></div>
      <div class="login-background-pattern"></div>
    </div>

    <!-- Main login card -->
    <div class="login-card">
      <!-- Header -->
      <div class="login-header">
        <div class="login-logo">
          <div class="logo-icon">📝</div>
          <h1 class="logo-text">TodoApp</h1>
        </div>
        <p class="login-subtitle">Welcome back! Please sign in to your account</p>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model="loginForm.email"
              type="email"
              class="form-input"
              :class="{ error: loginErrors.email }"
              placeholder="Enter your email"
              required
              @blur="validateEmail"
              @input="clearError"
            />
            <div class="input-icon">✉️</div>
          </div>
          <span v-if="loginErrors.email" class="error-message">{{ loginErrors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="loginForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ error: loginErrors.password }"
              placeholder="Enter your password"
              required
              @blur="validatePassword"
              @input="clearError"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="loginErrors.password" class="error-message">{{ loginErrors.password }}</span>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="rememberMe" />
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">Remember me</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            Forgot password?
          </a>
        </div>

        <button 
          type="submit" 
          class="login-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </button>

        <div v-if="authStore.error" class="error-banner">
          <span class="error-icon">⚠️</span>
          {{ authStore.error }}
          <button @click="authStore.clearError()" class="error-close">×</button>
        </div>
      </form>

      <!-- Social Login -->
      <div class="social-login">
        <div class="divider">
          <span>Or continue with</span>
        </div>
        <div class="social-buttons">
          <button class="social-button google" @click="handleSocialLogin('google')">
            <span class="social-icon">🔍</span>
            Google
          </button>
          <button class="social-button github" @click="handleSocialLogin('github')">
            <span class="social-icon">🐙</span>
            GitHub
          </button>
        </div>
      </div>

      <!-- Sign up link -->
      <div class="signup-link">
        <p>Don't have an account? 
          <router-link to="/register" class="signup-text">Sign up here</router-link>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <p>&copy; 2024 TodoApp. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth_store'
import type { LoginCredentials } from '../../data/models/request/user_request'

const router = useRouter()
const authStore = useAuthStore()

// Reactive state
const isLoading = computed(() => authStore.isLoading)

// Form data
const loginForm = reactive<LoginCredentials>({
  email: '',
  password: ''
})

// UI state
const showPassword = ref(false)
const rememberMe = ref(false)

// Form errors
const loginErrors = reactive({
  email: '',
  password: ''
})

// Form validation
const isFormValid = computed(() => {
  return loginForm.email && 
         loginForm.password && 
         !loginErrors.email && 
         !loginErrors.password
})

// Validation functions
const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!loginForm.email) {
    loginErrors.email = 'Email is required'
  } else if (!emailRegex.test(loginForm.email)) {
    loginErrors.email = 'Please enter a valid email address'
  } else {
    loginErrors.email = ''
  }
}

const validatePassword = () => {
  if (!loginForm.password) {
    loginErrors.password = 'Password is required'
  } else if (loginForm.password.length < 6) {
    loginErrors.password = 'Password must be at least 6 characters'
  } else {
    loginErrors.password = ''
  }
}

const clearError = () => {
  authStore.clearError()
}

// Form handlers
const handleLogin = async () => {
  try {
    await authStore.handleLogin(loginForm)
    // Navigation is handled by the store
  } catch (error) {
    console.error('Login failed:', error)
  }
}

const handleForgotPassword = () => {
  router.push({ name: 'forgot-password' })
}

const handleSocialLogin = (provider: string) => {
  console.log(`Social login with ${provider}`)
  // Implement social login logic
}

// Auto-focus email input on mount
onMounted(() => {
  const emailInput = document.getElementById('email') as HTMLInputElement
  if (emailInput) {
    emailInput.focus()
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.login-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.login-background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.login-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  max-width: 450px;
  margin: 0 auto;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.logo-icon {
  font-size: 2.5rem;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: white;
  margin: 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
}

.login-form {
  width: 100%;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: fadeInUp 0.3s ease-out;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-input.error {
  border-color: #ef4444;
  background: #fef2f2;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-size: 1.1rem;
  color: #9ca3af;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  color: #9ca3af;
  padding: 0.25rem;
}

.error-message {
  display: block;
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6b7280;
}

.checkbox-wrapper input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 18px;
  height: 18px;
  border: 2px solid #d1d5db;
  border-radius: 4px;
  margin-right: 0.5rem;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.checkbox-wrapper input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.forgot-password {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.forgot-password:hover {
  color: #5a67d8;
}

.login-button {
  width: 100%;
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.login-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-banner {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.error-icon {
  font-size: 1.1rem;
}

.error-close {
  background: none;
  border: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.2rem;
  margin-left: auto;
  padding: 0;
}

.social-login {
  margin-top: 2rem;
  width: 100%;
}

.divider {
  text-align: center;
  position: relative;
  margin-bottom: 1.5rem;
  color: #9ca3af;
  font-size: 0.9rem;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e5e7eb;
  z-index: 1;
}

.divider span {
  background: white;
  padding: 0 1rem;
  position: relative;
  z-index: 2;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  color: #374151;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.social-button:hover {
  border-color: #d1d5db;
  background: #f9fafb;
}

.social-button.google:hover {
  border-color: #db4437;
  color: #db4437;
}

.social-button.github:hover {
  border-color: #333;
  color: #333;
}

.social-icon {
  font-size: 1.1rem;
}

.signup-link {
  margin-top: 2rem;
  text-align: center;
}

.signup-link p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin: 0;
}

.signup-text {
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signup-text:hover {
  color: #e0e7ff;
  text-decoration: underline;
}

.login-footer {
  text-align: center;
  padding: 1rem 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .login-card {
    padding: 1rem;
    margin: 1rem;
  }
  
  .login-form {
    padding: 1.5rem;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .social-buttons {
    flex-direction: column;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>