import type { UserRepository } from "../../repositories/user_repository";

export class RegisterUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  async execute(userInfo: any) {
    return this.userRepository.register(userInfo);
  }
}