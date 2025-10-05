import { AuthenticationError } from "../../utils/error_utils/authentication_error";
import { NotFoundError } from "../../utils/error_utils/not_found_error";
import { UserInputError } from "../../utils/error_utils/user_error_input";
import type { UserRepository } from "../repository/user_repository";

export class UserUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async registerUser(data: { email: string; password: string, name: string }) {
    // Validate required fields
    if (!data.email || !data.password || !data.name) {
      throw new UserInputError('Email, password, and name are required.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new UserInputError('Please provide a valid email address.');
    }

    // Validate password strength
    if (data.password.length < 8) {
      throw new UserInputError('Password must be at least 8 characters long.');
    }

    // Validate name
    if (data.name.trim().length < 2) {
      throw new UserInputError('Name must be at least 2 characters long.');
    }

    // Check if user already exists
    const existingUser = await this.userRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new UserInputError('A user with this email already exists.');
    }

    const hashedPassword = await Bun.password.hash(data.password);
    const newUser = await this.userRepository.createUser({
      email: data.email.toLowerCase().trim(),
      name: data.name.trim(),
      password: hashedPassword,
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  }

  async loginUser(data: { email: string; password: string }) {
    if (!data.email || !data.password) {
      throw new UserInputError('Email and password are required.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      throw new UserInputError('Please provide a valid email address.');
    }

    const user = await this.userRepository.findUserByEmail(data.email.toLowerCase().trim());
    if (!user) {
      throw new AuthenticationError('Invalid credentials.');
    }

    const isMatch = await Bun.password.verify(data.password, user.password);
    if (!isMatch) {
      throw new AuthenticationError('Invalid credentials.');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt
      }
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }
    // Hapus password dari objek sebelum dikembalikan
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateUser(id: string, data: { email?: string; password?: string; name?: string }, currentUserId: string) {
    if (id !== currentUserId) {
      throw new AuthenticationError('You can only update your own profile.');
    }

    // Validate email format if provided
    if (data.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(data.email)) {
        throw new UserInputError('Please provide a valid email address.');
      }

      // Check if email is already taken by another user
      const existingUser = await this.userRepository.findUserByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        throw new UserInputError('A user with this email already exists.');
      }
      data.email = data.email.toLowerCase().trim();
    }

    // Validate name if provided
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length < 2) {
        throw new UserInputError('Name must be at least 2 characters long.');
      }
      data.name = data.name.trim();
    }

    // Validate password if provided
    if (data.password) {
      if (data.password.length < 8) {
        throw new UserInputError('Password must be at least 8 characters long.');
      }
      data.password = await Bun.password.hash(data.password);
    }

    const updatedUser = await this.userRepository.updateUser(id, data);
    if (!updatedUser) {
      throw new NotFoundError('User not found.');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  async updateUserPassword(id: string, data: { password: string; currentPassword: string }, currentUserId: string) {
    if (id !== currentUserId) {
      throw new AuthenticationError('You can only update your own profile.');
    }

    // Validate new password strength
    if (data.password.length < 8) {
      throw new UserInputError('Password must be at least 8 characters long.');
    }

    // Verify current password
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isCurrentPasswordValid = await Bun.password.verify(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect.');
    }

    const hashedPassword = await Bun.password.hash(data.password);
    const updatedUser = await this.userRepository.updateUser(id, { password: hashedPassword });
    if (!updatedUser) {
      throw new NotFoundError('User not found.');
    }

    return { message: 'Password updated successfully.' };
  }

  async deleteUser(id: string, currentUserId: string) {
    if (id !== currentUserId) {
      throw new AuthenticationError('You can only delete your own profile.');
    }

    // Verify user exists before deletion
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const deletedUser = await this.userRepository.deleteUser(id);
    if (!deletedUser) {
      throw new NotFoundError('User not found.');
    }

    return { message: 'User deleted successfully.' };
  }

  // Additional utility methods
  async getUserProfile(id: string, currentUserId: string) {
    if (id !== currentUserId) {
      throw new AuthenticationError('You can only view your own profile.');
    }

    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async changeEmail(id: string, data: { newEmail: string; currentPassword: string }, currentUserId: string) {
    if (id !== currentUserId) {
      throw new AuthenticationError('You can only update your own profile.');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.newEmail)) {
      throw new UserInputError('Please provide a valid email address.');
    }

    // Check if email is already taken
    const existingUser = await this.userRepository.findUserByEmail(data.newEmail);
    if (existingUser) {
      throw new UserInputError('A user with this email already exists.');
    }

    // Verify current password
    const user = await this.userRepository.findUserById(id);
    if (!user) {
      throw new NotFoundError('User not found.');
    }

    const isCurrentPasswordValid = await Bun.password.verify(data.currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AuthenticationError('Current password is incorrect.');
    }

    const updatedUser = await this.userRepository.updateUser(id, {
      email: data.newEmail.toLowerCase().trim()
    });

    if (!updatedUser) {
      throw new NotFoundError('User not found.');
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}

