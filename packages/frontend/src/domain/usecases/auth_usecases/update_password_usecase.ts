import type { ChangePasswordData } from "../../../data/models/request/user_request";
import type { UserRepository } from "../../repositories/user_repository";

export class UpdatePasswordUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(currentPassword: string, password: string): Promise<void> {
    const data: ChangePasswordData = {
      currentPassword,
      password,
    };
    return this.userRepository.changePassword(data);
  }
}