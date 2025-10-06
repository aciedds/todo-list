import type { User } from "../../models/user_model";
import type { UserRepository } from "../../repositories/user_repository";

export class GetProfileUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(): Promise<User> {
    return this.userRepository.getProfile();
  }
}