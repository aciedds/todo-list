import type { AuthResponse, ChangePasswordData, LoginCredentials, RegisterData, UpdateUserData } from "../../data/models/request/user_request";
import type { User } from "../models/user_model";

export interface UserRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(userInfo: RegisterData): Promise<User>;
  getProfile(): Promise<User>;
  updateProfile(data: UpdateUserData): Promise<User>;
  changePassword(data: ChangePasswordData): Promise<void>;
  logout(): Promise<void>;
  refreshToken(): Promise<AuthResponse>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  verifyEmail(token: string): Promise<void>;
  resendVerificationEmail(): Promise<void>;
  deleteAccount(password: string): Promise<void>;
}