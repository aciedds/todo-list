import type { UpdateUserData } from "../../../data/models/request/user_request";
import type { User } from "../../models/user_model";
import type { UserRepository } from "../../repositories/user_repository";

export class UpdateProfileUseCase {
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async execute(data: UpdateUserData): Promise<User> {
    return this.userRepository.updateProfile(data);
  }
}