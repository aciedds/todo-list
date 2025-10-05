import { PrismaClient } from "@prisma/client";
import type { Prisma } from "../../../prisma/generated";


export class UserDataSource {
  private prisma: PrismaClient;
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }
  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.user.delete({
      where: { id },
      include: {
        todos: true // Include todos for cascade deletion info
      }
    });
  }
}
