
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  confirmPassword?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  password: string;
}

export interface ChangeEmailData {
  newEmail: string;
  currentPassword: string;
}