import type { UserRepository } from "../../repositories/user_repository";

export class DeleteAccountUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(): Promise<void> {
    return this.userRepository.deleteAccount();
  }
}