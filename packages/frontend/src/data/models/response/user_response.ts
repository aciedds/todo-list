import type { User } from "../../../domain/models/user_model";

export interface AuthResponse {
  token: string;
  user: User;
  refreshToken?: string;
  expiresIn?: number;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updateAt?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: AuthResponse;
}