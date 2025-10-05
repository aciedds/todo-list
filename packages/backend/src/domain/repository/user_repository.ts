import type { Prisma, Todo, User } from "../../../prisma/generated";

export interface UserRepository {
  createUser(data: Prisma.UserCreateInput): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserById(id: string): Promise<User | null>;
  updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User | null>;
  deleteUser(id: string): Promise<User | null>;
}