
import { ApiClient } from '../services/api_service';
import type { User } from '../../domain/models/user_model';
import type { ApiError } from '../services/api_service';
import type { AuthResponse, ChangePasswordData, LoginCredentials, RegisterData, UpdateUserData } from '../models/request/user_request';

export class UserDataSource {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      this.validateLoginCredentials(credentials);
      const response = await this.apiClient.post<AuthResponse>('/users/login', credentials);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * User registration
   */
  async register(userInfo: RegisterData): Promise<User> {
    try {
      this.validateRegisterData(userInfo);
      const response = await this.apiClient.post<User>('/users/register', userInfo);
      return response.data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      const response = await this.apiClient.get<User>('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserData): Promise<User> {
    try {
      this.validateUpdateData(data);
      const response = await this.apiClient.put<User>('/users/profile', data);
      return response.data;
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      this.validateChangePasswordData(data);
      await this.apiClient.post('/users/change-password', data);
    } catch (error) {
      console.error('Failed to change password:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/users/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await this.apiClient.post<AuthResponse>('/users/refresh-token');
      return response.data;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      this.validateEmail(email);
      await this.apiClient.post('/users/forgot-password', { email });
    } catch (error) {
      console.error('Password reset request failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      this.validatePassword(newPassword);
      if (!token || token.trim().length === 0) {
        throw new Error('Reset token is required');
      }
      await this.apiClient.post('/users/reset-password', { token, newPassword });
    } catch (error) {
      console.error('Password reset failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      if (!token || token.trim().length === 0) {
        throw new Error('Verification token is required');
      }
      await this.apiClient.post('/users/verify-email', { token });
    } catch (error) {
      console.error('Email verification failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Resend email verification
   */
  async resendVerificationEmail(): Promise<void> {
    try {
      await this.apiClient.post('/users/resend-verification');
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(password: string): Promise<void> {
    try {
      this.validatePassword(password);
      await this.apiClient.delete('/users/account', { data: { password } });
    } catch (error) {
      console.error('Failed to delete account:', error);
      throw this.handleError(error);
    }
  }

  // Private validation methods
  private validateEmail(email: string): void {
    if (!email || typeof email !== 'string') {
      throw new Error('Email is required');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Please provide a valid email address');
    }

    if (email.length > 254) {
      throw new Error('Email must be 254 characters or less');
    }
  }

  private validatePassword(password: string): void {
    if (!password || typeof password !== 'string') {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (password.length > 128) {
      throw new Error('Password must be 128 characters or less');
    }

    // Check for at least one uppercase, one lowercase, one number, and one special character
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/;
    if (!passwordRegex.test(password)) {
      throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }
  }

  private validateLoginCredentials(credentials: LoginCredentials): void {
    if (!credentials || typeof credentials !== 'object') {
      throw new Error('Login credentials are required');
    }

    this.validateEmail(credentials.email);

    if (!credentials.password || typeof credentials.password !== 'string') {
      throw new Error('Password is required');
    }
  }

  private validateRegisterData(data: RegisterData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Registration data is required');
    }

    this.validateEmail(data.email);
    this.validatePassword(data.password);

    if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
      throw new Error('Name is required and must be a non-empty string');
    }

    if (data.name.length > 100) {
      throw new Error('Name must be 100 characters or less');
    }

    if (data.confirmPassword && data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match');
    }
  }

  private validateUpdateData(data: UpdateUserData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Update data is required');
    }

    if (data.email !== undefined) {
      this.validateEmail(data.email);
    }

    if (data.name !== undefined) {
      if (typeof data.name !== 'string' || data.name.trim().length === 0) {
        throw new Error('Name must be a non-empty string');
      }
      if (data.name.length > 100) {
        throw new Error('Name must be 100 characters or less');
      }
    }

    if (data.bio !== undefined && data.bio.length > 500) {
      throw new Error('Bio must be 500 characters or less');
    }
  }

  private validateChangePasswordData(data: ChangePasswordData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Change password data is required');
    }

    if (!data.currentPassword || typeof data.currentPassword !== 'string') {
      throw new Error('Current password is required');
    }

    this.validatePassword(data.newPassword);

    if (data.newPassword !== data.confirmPassword) {
      throw new Error('New passwords do not match');
    }

    if (data.currentPassword === data.newPassword) {
      throw new Error('New password must be different from current password');
    }
  }

  private handleError(error: any): ApiError {
    if (error.response) {
      return {
        message: error.response.data?.message || 'Server error occurred',
        status: error.response.status,
        code: error.response.data?.code,
      };
    } else if (error.request) {
      return {
        message: 'Network error - please check your connection',
        status: 0,
      };
    } else {
      return {
        message: error.message || 'An unexpected error occurred',
      };
    }
  }
}