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
  UpdateUserData
} from '../../data/models/request/user_request';
import type { ApiError } from '../../data/services/api_service';
import { UpdateProfileUseCase } from '../../domain/usecases/auth_usecases/update_profile_usecase';
import { UpdatePasswordUseCase } from '../../domain/usecases/auth_usecases/update_password_usecase';
import { UpdateEmailUseCase } from '../../domain/usecases/auth_usecases/update_email_usecase';
import { DeleteAccountUseCase } from '../../domain/usecases/auth_usecases/delete_account_usecase';
import { LogoutUseCase } from '../../domain/usecases/auth_usecases/logout_usecase';

// Inisialisasi dependensi (Dependency Injection manual)
const userDataSource = new UserDataSource(apiClient);
const userRepository = new UserRepositoryImpl(userDataSource);
const loginUseCase = new LoginUseCase(userRepository);
const registerUseCase = new RegisterUseCase(userRepository);
const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
const changePasswordUseCase = new UpdatePasswordUseCase(userRepository);
const changeEmailUseCase = new UpdateEmailUseCase(userRepository);
const deleteAccountUseCase = new DeleteAccountUseCase(userRepository);
const logoutUseCase = new LogoutUseCase(userRepository);

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
        await logoutUseCase.execute();
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

  // Note: refreshAuthToken removed - not available in backend

  async function updateProfile(updateData: UpdateUserData) {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedUser = await updateProfileUseCase.execute(updateData);
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

  async function changePassword(currentPassword: string, newPassword: string) {
    try {
      isLoading.value = true;
      error.value = null;

      await changePasswordUseCase.execute(currentPassword, newPassword);
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to change password';
      console.error("Password change failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function changeEmail(newEmail: string, currentPassword: string) {
    try {
      isLoading.value = true;
      error.value = null;

      const updatedUser = await changeEmailUseCase.execute(newEmail, currentPassword);
      user.value = updatedUser;

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      return updatedUser;
    } catch (err) {
      const apiError = err as ApiError;
      error.value = apiError.message || 'Failed to change email';
      console.error("Email change failed", err);
      throw apiError;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteAccount() {
    try {
      isLoading.value = true;
      error.value = null;

      await deleteAccountUseCase.execute();

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
      // Since refresh token is not available, just logout
      handleLogout();
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
    updateProfile,
    changePassword,
    changeEmail,
    deleteAccount,
    updateLastActivity,
    clearError,
    checkTokenExpiration
  };
});