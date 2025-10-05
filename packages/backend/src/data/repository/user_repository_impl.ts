
import { Prisma, type User } from "../../../prisma/generated";
import type { UserRepository } from "../../domain/repository/user_repository";
import type { UserDataSource } from "../source/prisma_user";

export class UserRepositoryImpl implements UserRepository {
  private dataSource: UserDataSource;

  constructor(dataSource: UserDataSource) {
    this.dataSource = dataSource;
  }

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.dataSource.create(data);
  }

  findUserByEmail(email: string): Promise<User | null> {
    return this.dataSource.findByEmail(email);
  }

  findUserById(id: string): Promise<User | null> {
    return this.dataSource.findById(id);
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User | null> {
    try {
      return await this.dataSource.update(id, data);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      } else {
        throw error;
      }
    }
  }

  async deleteUser(id: string): Promise<User | null> {
    try {
      return await this.dataSource.delete(id);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        return null;
      } else {
        throw error;
      }
    }
  }
}
