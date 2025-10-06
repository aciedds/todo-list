import type { UserRepository } from "../../repositories/user_repository";
import type { LoginCredentials } from "../../../data/models/request/user_request";
import type { AuthResponse } from "../../../data/models/response/user_response";

export class LoginUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.userRepository.login(credentials);
  }
}