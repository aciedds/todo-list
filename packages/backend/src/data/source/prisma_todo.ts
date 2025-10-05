
import type { Prisma, PrismaClient } from "../../../prisma/generated";

export class TodoDataSource {
  private prisma: PrismaClient
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  //create a todo
  async create(data: Prisma.TodoUncheckedCreateInput) {
    return this.prisma.todo.create({ data });
  }

  //get all todos for a specific user
  async findAll(userId: string) {
    return this.prisma.todo.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  //get todo by id for a specific user
  async findById(id: string, userId: string) {
    return this.prisma.todo.findFirst({
      where: {
        id,
        authorId: userId
      }
    });
  }

  //get todo by id for owner verification
  async findByIdForOwner(id: string, userId: string) {
    return this.prisma.todo.findFirst({
      where: {
        id,
        authorId: userId
      }
    });
  }

  //update todo by id for a specific user
  async update(id: string, data: Prisma.TodoUpdateInput, userId: string) {
    return this.prisma.todo.update({
      where: {
        id,
        authorId: userId
      },
      data
    });
  }

  //delete todo by id for a specific user
  async delete(id: string, userId: string) {
    return this.prisma.todo.delete({
      where: {
        id,
        authorId: userId
      }
    });
  }
}