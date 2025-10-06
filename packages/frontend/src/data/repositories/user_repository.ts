import type { User } from "../../domain/models/user_model";
import type { UserRepository } from "../../domain/repositories/user_repository";
import type { UserDataSource } from "../source/user_remote_source";
import type { LoginCredentials, RegisterData, UpdateUserData, ChangePasswordData, ChangeEmailData } from "../models/request/user_request";
import type { AuthResponse } from "../models/response/user_response";
import type { ApiError } from "../services/api_service";

export class UserRepositoryImpl implements UserRepository {
  private userDataSource: UserDataSource;

  constructor(userDataSource: UserDataSource) {
    this.userDataSource = userDataSource;
  }

  /**
   * User login
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      return await this.userDataSource.login(credentials);
    } catch (error) {
      console.error('Repository: Login failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * User registration
   */
  async register(userInfo: RegisterData): Promise<User> {
    try {
      return await this.userDataSource.register(userInfo);
    } catch (error) {
      console.error('Repository: Registration failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(): Promise<User> {
    try {
      return await this.userDataSource.getProfile();
    } catch (error) {
      console.error('Repository: Failed to fetch user profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UpdateUserData): Promise<User> {
    try {
      return await this.userDataSource.updateProfile(data);
    } catch (error) {
      console.error('Repository: Failed to update user profile:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      await this.userDataSource.changePassword(data);
    } catch (error) {
      console.error('Repository: Failed to change password:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await this.userDataSource.logout();
    } catch (error) {
      console.error('Repository: Logout failed:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Change user email
   */
  async changeEmail(data: ChangeEmailData): Promise<User> {
    try {
      return await this.userDataSource.changeEmail(data);
    } catch (error) {
      console.error('Repository: Failed to change email:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Delete user account
   */
  async deleteAccount(): Promise<void> {
    try {
      await this.userDataSource.deleteAccount();
    } catch (error) {
      console.error('Repository: Failed to delete account:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle errors from the data source
   */
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