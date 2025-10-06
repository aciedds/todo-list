
import { ApiClient } from '../services/api_service';
import type { User } from '../../domain/models/user_model';
import type { ApiError } from '../services/api_service';
import type { ChangePasswordData, LoginCredentials, RegisterData, UpdateUserData, ChangeEmailData } from '../models/request/user_request';
import type { AuthResponse, UserProfileResponse, RegisterResponse, LoginResponse } from '../models/response/user_response';

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
      const response = await this.apiClient.post<LoginResponse>('/users/login', credentials);
      return response.data.data;
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
      const response = await this.apiClient.post<RegisterResponse>('/users/register', userInfo);
      return {
        id: response.data.data.id,
        email: response.data.data.email,
        name: response.data.data.name,
        createdAt: response.data.data.createdAt
      };
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
      const response = await this.apiClient.get<{ success: boolean; data: UserProfileResponse }>('/users/profile');
      return {
        id: response.data.data.id,
        email: response.data.data.email,
        name: response.data.data.name,
        createdAt: response.data.data.createdAt,
        updateAt: response.data.data.updateAt
      };
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
      // Get current user ID from profile first
      const profileResponse = await this.apiClient.get<{ success: boolean; data: UserProfileResponse }>('/users/profile');
      const userId = profileResponse.data.data.id;

      const response = await this.apiClient.put<{ success: boolean; data: UserProfileResponse }>(`/users/${userId}`, data);
      return {
        id: response.data.data.id,
        email: response.data.data.email,
        name: response.data.data.name,
        createdAt: response.data.data.createdAt,
        updateAt: response.data.data.updateAt
      };
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
      // Get current user ID from profile first
      const profileResponse = await this.apiClient.get<{ success: boolean; data: UserProfileResponse }>('/users/profile');
      const userId = profileResponse.data.data.id;

      await this.apiClient.put(`/users/${userId}/password`, data);
    } catch (error) {
      console.error('Failed to change password:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout user (client-side only since backend doesn't have logout endpoint)
   */
  async logout(): Promise<void> {
    try {
      // Since backend doesn't have a logout endpoint, we just clear local storage
      // This is typically handled by the auth store or service
      console.log('Logout handled client-side');
    } catch (error) {
      console.error('Logout failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change user email
   */
  async changeEmail(data: ChangeEmailData): Promise<User> {
    try {
      this.validateEmail(data.newEmail);
      if (!data.currentPassword || typeof data.currentPassword !== 'string') {
        throw new Error('Current password is required');
      }
      // Get current user ID from profile first
      const profileResponse = await this.apiClient.get<{ success: boolean; data: UserProfileResponse }>('/users/profile');
      const userId = profileResponse.data.data.id;

      const response = await this.apiClient.put<{ success: boolean; data: UserProfileResponse }>(`/users/${userId}/email`, data);
      return {
        id: response.data.data.id,
        email: response.data.data.email,
        name: response.data.data.name,
        createdAt: response.data.data.createdAt,
        updateAt: response.data.data.updateAt
      };
    } catch (error) {
      console.error('Failed to change email:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      // Get current user ID from profile first
      const profileResponse = await this.apiClient.get<{ success: boolean; data: UserProfileResponse }>('/users/profile');
      const userId = profileResponse.data.data.id;

      await this.apiClient.delete(`/users/${userId}`);
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

    if (data.password !== undefined) {
      this.validatePassword(data.password);
    }
  }

  private validateChangePasswordData(data: ChangePasswordData): void {
    if (!data || typeof data !== 'object') {
      throw new Error('Change password data is required');
    }

    if (!data.currentPassword || typeof data.currentPassword !== 'string') {
      throw new Error('Current password is required');
    }

    this.validatePassword(data.password);

    if (data.currentPassword === data.password) {
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