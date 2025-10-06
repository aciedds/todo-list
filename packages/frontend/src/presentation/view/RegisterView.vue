<template>
  <div class="register-container">
    <!-- Background with gradient -->
    <div class="register-background">
      <div class="register-background-gradient"></div>
      <div class="register-background-pattern"></div>
    </div>

    <!-- Main register card -->
    <div class="register-card">
      <!-- Header -->
      <div class="register-header">
        <div class="register-logo">
          <div class="logo-icon">📝</div>
          <h1 class="logo-text">TodoApp</h1>
        </div>
        <p class="register-subtitle">Create your account to get started</p>
      </div>

      <!-- Register Form -->
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name" class="form-label">Full Name</label>
          <div class="input-wrapper">
            <input
              id="name"
              v-model="registerForm.name"
              type="text"
              class="form-input"
              :class="{ error: registerErrors.name }"
              placeholder="Enter your full name"
              required
              @blur="validateName"
              @input="clearError"
            />
            <div class="input-icon">👤</div>
          </div>
          <span v-if="registerErrors.name" class="error-message">{{ registerErrors.name }}</span>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email Address</label>
          <div class="input-wrapper">
            <input
              id="email"
              v-model="registerForm.email"
              type="email"
              class="form-input"
              :class="{ error: registerErrors.email }"
              placeholder="Enter your email"
              required
              @blur="validateEmail"
              @input="clearError"
            />
            <div class="input-icon">✉️</div>
          </div>
          <span v-if="registerErrors.email" class="error-message">{{ registerErrors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="registerForm.password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ error: registerErrors.password }"
              placeholder="Create a strong password"
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
          <span v-if="registerErrors.password" class="error-message">{{ registerErrors.password }}</span>
          <div class="password-strength">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.level"
                :style="{ width: passwordStrength.percentage + '%' }"
              ></div>
            </div>
            <span class="strength-text">{{ passwordStrength.text }}</span>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <div class="input-wrapper">
            <input
              id="confirmPassword"
              v-model="registerForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="form-input"
              :class="{ error: registerErrors.confirmPassword }"
              placeholder="Confirm your password"
              required
              @blur="validateConfirmPassword"
              @input="clearError"
            />
            <button
              type="button"
              class="password-toggle"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span v-if="registerErrors.confirmPassword" class="error-message">{{ registerErrors.confirmPassword }}</span>
        </div>

        <div class="form-options">
          <label class="checkbox-wrapper">
            <input type="checkbox" v-model="agreeToTerms" required />
            <span class="checkbox-custom"></span>
            <span class="checkbox-label">
              I agree to the 
              <a href="#" class="terms-link">Terms of Service</a> 
              and 
              <a href="#" class="terms-link">Privacy Policy</a>
            </span>
          </label>
        </div>

        <button 
          type="submit" 
          class="register-button"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="loading-spinner"></span>
          {{ isLoading ? 'Creating account...' : 'Create Account' }}
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

      <!-- Sign in link -->
      <div class="signin-link">
        <p>Already have an account? 
          <router-link to="/login" class="signin-text">Sign in here</router-link>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div class="register-footer">
      <p>&copy; 2024 TodoApp. All rights reserved.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth_store'
import type { RegisterData } from '../../data/models/request/user_request'

const authStore = useAuthStore()

// Reactive state
const isLoading = computed(() => authStore.isLoading)

// Form data
const registerForm = reactive<RegisterData>({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// UI state
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const agreeToTerms = ref(false)

// Form errors
const registerErrors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

// Password strength calculation
const passwordStrength = computed(() => {
  const password = registerForm.password
  if (!password) return { level: '', percentage: 0, text: '' }
  
  let score = 0
  if (password.length >= 8) score += 20
  if (password.length >= 12) score += 10
  if (/[a-z]/.test(password)) score += 10
  if (/[A-Z]/.test(password)) score += 10
  if (/[0-9]/.test(password)) score += 10
  if (/[^A-Za-z0-9]/.test(password)) score += 20
  if (password.length >= 16) score += 20
  
  if (score < 30) return { level: 'weak', percentage: score, text: 'Weak' }
  if (score < 60) return { level: 'medium', percentage: score, text: 'Medium' }
  if (score < 80) return { level: 'good', percentage: score, text: 'Good' }
  return { level: 'strong', percentage: score, text: 'Strong' }
})

// Form validation
const isFormValid = computed(() => {
  return registerForm.name &&
         registerForm.email &&
         registerForm.password &&
         registerForm.confirmPassword &&
         !Object.values(registerErrors).some(error => error) &&
         agreeToTerms.value
})

// Validation functions
const validateName = () => {
  if (!registerForm.name) {
    registerErrors.name = 'Name is required'
  } else if (registerForm.name.length < 2) {
    registerErrors.name = 'Name must be at least 2 characters'
  } else {
    registerErrors.name = ''
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!registerForm.email) {
    registerErrors.email = 'Email is required'
  } else if (!emailRegex.test(registerForm.email)) {
    registerErrors.email = 'Please enter a valid email address'
  } else {
    registerErrors.email = ''
  }
}

const validatePassword = () => {
  if (!registerForm.password) {
    registerErrors.password = 'Password is required'
  } else if (registerForm.password.length < 8) {
    registerErrors.password = 'Password must be at least 8 characters'
  } else {
    registerErrors.password = ''
  }
}

const validateConfirmPassword = () => {
  if (!registerForm.confirmPassword) {
    registerErrors.confirmPassword = 'Please confirm your password'
  } else if (registerForm.password !== registerForm.confirmPassword) {
    registerErrors.confirmPassword = 'Passwords do not match'
  } else {
    registerErrors.confirmPassword = ''
  }
}

const clearError = () => {
  authStore.clearError()
}

// Form handlers
const handleRegister = async () => {
  try {
    await authStore.handleRegister(registerForm)
    // Navigation is handled by the store
  } catch (error) {
    console.error('Registration failed:', error)
  }
}

const handleSocialLogin = (provider: string) => {
  console.log(`Social login with ${provider}`)
  // Implement social login logic
}

// Auto-focus name input on mount
onMounted(() => {
  const nameInput = document.getElementById('name') as HTMLInputElement
  if (nameInput) {
    nameInput.focus()
  }
})
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.register-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}

.register-background-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-background-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: 
    radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.register-card {
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

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-logo {
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

.register-subtitle {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1.1rem;
  margin: 0;
}

.register-form {
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

.password-strength {
  margin-top: 0.5rem;
}

.strength-bar {
  width: 100%;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.good { background: #10b981; }
.strength-fill.strong { background: #059669; }

.strength-text {
  font-size: 0.8rem;
  color: #6b7280;
  font-weight: 500;
}

.form-options {
  margin-bottom: 1.5rem;
}

.checkbox-wrapper {
  display: flex;
  align-items: flex-start;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6b7280;
  line-height: 1.4;
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
  margin-top: 0.1rem;
  position: relative;
  transition: all 0.3s ease;
  flex-shrink: 0;
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

.terms-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.terms-link:hover {
  text-decoration: underline;
}

.register-button {
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

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
}

.register-button:disabled {
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

.signin-link {
  margin-top: 2rem;
  text-align: center;
}

.signin-link p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  margin: 0;
}

.signin-text {
  color: white;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.signin-text:hover {
  color: #e0e7ff;
  text-decoration: underline;
}

.register-footer {
  text-align: center;
  padding: 1rem 2rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

/* Responsive design */
@media (max-width: 640px) {
  .register-card {
    padding: 1rem;
    margin: 1rem;
  }
  
  .register-form {
    padding: 1.5rem;
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