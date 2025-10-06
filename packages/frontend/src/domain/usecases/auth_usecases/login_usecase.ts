import type { UserRepository } from "../../repositories/user_repository";

export class LoginUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }
  
  async execute(credentials: any) {
    return this.userRepository.login(credentials);
  }
}