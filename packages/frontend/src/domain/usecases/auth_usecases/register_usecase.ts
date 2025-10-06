import type { UserRepository } from "../../repositories/user_repository";
import type { RegisterData } from "../../../data/models/request/user_request";
import type { User } from "../../models/user_model";

export class RegisterUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(userInfo: RegisterData): Promise<User> {
    return this.userRepository.register(userInfo);
  }
}