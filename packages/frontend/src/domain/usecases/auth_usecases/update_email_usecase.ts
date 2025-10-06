import type { ChangeEmailData } from "../../../data/models/request/user_request";
import type { User } from "../../models/user_model";
import type { UserRepository } from "../../repositories/user_repository";

export class UpdateEmailUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(newEmail: string, currentPassword: string): Promise<User> {
    const data: ChangeEmailData = {
      newEmail,
      currentPassword,
    };
    return this.userRepository.changeEmail(data);
  }
}