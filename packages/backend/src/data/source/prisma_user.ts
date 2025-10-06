import { PrismaClient } from "@prisma/client";
import type { Prisma } from "../../../prisma/generated";


export class UserDataSource {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.User.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.User.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.User.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.User.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.User.delete({
      where: { id },
      include: {
        todos: true // Include todos for cascade deletion info
      }
    });
  }
}
