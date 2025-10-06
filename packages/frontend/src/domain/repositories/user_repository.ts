import type { ChangePasswordData, LoginCredentials, RegisterData, UpdateUserData, ChangeEmailData } from "../../data/models/request/user_request";
import type { AuthResponse } from "../../data/models/response/user_response";
import type { User } from "../models/user_model";

export interface UserRepository {
  login(credentials: LoginCredentials): Promise<AuthResponse>;
  register(userInfo: RegisterData): Promise<User>;
  getProfile(): Promise<User>;
  updateProfile(data: UpdateUserData): Promise<User>;
  changePassword(data: ChangePasswordData): Promise<void>;
  changeEmail(data: ChangeEmailData): Promise<User>;
  logout(): Promise<void>;
  deleteAccount(): Promise<void>;
}