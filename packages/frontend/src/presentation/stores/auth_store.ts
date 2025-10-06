import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { UserRepositoryImpl } from '../../data/repositories/user_repository';
import { LoginUseCase } from '../../domain/usecases/auth_usecases/login_usecase';
import { RegisterUseCase } from '../../domain/usecases/auth_usecases/register_usecase';
import { useRouter } from 'vue-router';
import type { User } from '../../domain/models/user_model';
import { UserDataSource } from '../../data/source/user_remote_source';
import apiClient from '../../data/services/api_service';
import type {
  LoginCredentials,
  RegisterData,
  UpdateUserData,
  ChangePasswordData
} from '../../data/models/request/user_request';
import type { ApiError } from '../../data/services/api_service';

// Inisialisasi dependensi (Dependency Injection manual)
const userDataSource = new UserDataSource(apiClient);
const userRepository = new UserRepositoryImpl(userDataSource);
const loginUseCase = new LoginUseCase(userRepository);
const registerUseCase = new RegisterUseCase(userRepository);

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  // State
  const token = ref<string | null>(localStorage.getItem('token'));
  const user = ref<User | null>(JSON.parse(localStorage.getItem('user') || 'null'));
  const refreshToken = ref<string | null>(localStorage.getItem('refreshToken'));
  const isLoading = ref<boolean>(false);
  const error = ref<string | null>(null);
  const lastActivity = ref<number>(Date.now());

  // Computed
  const isAuthenticated = computed(() => !!token.value);
  const isTokenExpired = computed(() => {
    if (!token.value) return true;
    try {
      const parts = token.value.split('.');
      if (parts.length !== 3 || !parts[1]) return true;
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  });

  // Actions
  async function handleLogin(credentials: LoginCredentials) {
    try {
      isLoading.value = true;
      error.value = null;

      const result = await loginUseCase.execute(credentials);

      // Store authentication data
      token.value = result.token;
      user.value = result.user;
      refreshToken.value = result.refreshToken || null;
      lastActivity.value = Date.now();

      // Persist to localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }

      // Set token expiration if provided
      if (result.expiresIn) {
        const expirationTime = Date.now() + (result.expiresIn * 1000);
        localStorage.setItem('tokenExpiration', expirationTime.toString());
      }

      router.push('/');
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Login failed. Please check your credentials.';
      console.error("Login failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function handleRegister(userInfo: RegisterData) {
    try {
      isLoading.value = true;
      error.value = null;

      await registerUseCase.execute(userInfo);

      router.push('/login');
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Registration failed. Please try again.';
      console.error("Registration failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function handleLogout() {
    try {
      isLoading.value = true;

      // Call logout endpoint if authenticated
      if (isAuthenticated.value) {
        await userRepository.logout();
      }
    } catch (err) {
      console.warn("Logout API call failed", err);
      // Continue with local logout even if API call fails
    } finally {
      // Clear local state
      token.value = null;
      user.value = null;
      refreshToken.value = null;
      error.value = null;
      lastActivity.value = 0;

      // Clear localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiration');

      isLoading.value = false;
      router.push('/login');
    }
  }

  async function refreshAuthToken() {
    try {
      if (!refreshToken.value) {
        throw new Error('No refresh token available');
      }

      const result = await userRepository.refreshToken();

      // Update tokens
      token.value = result.token;
      refreshToken.value = result.refreshToken || refreshToken.value;
      user.value = result.user;
      lastActivity.value = Date.now();

      // Update localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      if (result.refreshToken) {
        localStorage.setItem('refreshToken', result.refreshToken);
      }

      return result;
    } catch (err) {
      console.error("Token refresh failed", err);
      // If refresh fails, logout user
      await handleLogout();
      throw err;
    }
  }

  async function updateProfile(updateData: UpdateUserData) {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedUser = await userRepository.updateProfile(updateData);
      user.value = updatedUser;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to update profile';
      console.error("Profile update failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function changePassword(passwordData: ChangePasswordData) {
    try {
      isLoading.value = true;
      error.value = null;

      await userRepository.changePassword(passwordData);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to change password';
      console.error("Password change failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      isLoading.value = true;
      error.value = null;

      await userRepository.requestPasswordReset(email);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to request password reset';
      console.error("Password reset request failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function resetPassword(token: string, newPassword: string) {
    try {
      isLoading.value = true;
      error.value = null;

      await userRepository.resetPassword(token, newPassword);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to reset password';
      console.error("Password reset failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function verifyEmail(token: string) {
    try {
      isLoading.value = true;
      error.value = null;

      await userRepository.verifyEmail(token);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to verify email';
      console.error("Email verification failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function resendVerificationEmail() {
    try {
      isLoading.value = true;
      error.value = null;

      await userRepository.resendVerificationEmail();
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to resend verification email';
      console.error("Resend verification failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteAccount(password: string) {
    try {
      isLoading.value = true;
      error.value = null;

      await userRepository.deleteAccount(password);

      // Logout after successful account deletion
      await handleLogout();
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to delete account';
      console.error("Account deletion failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  function updateLastActivity() {
    lastActivity.value = Date.now();
  }

  function clearError() {
    error.value = null;
  }

  function checkTokenExpiration() {
    if (isTokenExpired.value && isAuthenticated.value) {
      // Try to refresh token, if that fails, logout
      refreshAuthToken().catch(() => {
        handleLogout();
      });
    }
  }

  // Auto-check token expiration every 5 minutes
  setInterval(checkTokenExpiration, 5 * 60 * 1000);

  return {
    // State
    user,
    token,
    refreshToken,
    isLoading,
    error,
    lastActivity,

    // Computed
    isAuthenticated,
    isTokenExpired,

    // Actions
    handleLogin,
    handleRegister,
    handleLogout,
    refreshAuthToken,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    deleteAccount,
    updateLastActivity,
    clearError,
    checkTokenExpiration
  };
});