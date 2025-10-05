
import { UserDataSource } from "../data/source/prisma_user";
import { UserRepositoryImpl } from "../data/repository/user_repository_impl";
import { UserUseCase } from "../domain/usecase/user_usecase";
import { TodoDataSource } from "../data/source/prisma_todo";
import { TodoRepositoryImpl } from "../data/repository/todo_repository_impl";
import { TodoUseCase } from "../domain/usecase/todo_usecase";
import { PrismaClient } from "../../prisma/generated/client";


const prisma = new PrismaClient();

//user
const userDataSource = new UserDataSource(prisma);
const userRepository = new UserRepositoryImpl(userDataSource);
const userUseCase = new UserUseCase(userRepository);

//todo
const todoDataSource = new TodoDataSource(prisma);
const todoRepository = new TodoRepositoryImpl(todoDataSource);
const todoUseCase = new TodoUseCase(todoRepository);

export { prisma, userDataSource, userRepository, userUseCase, todoDataSource, todoRepository, todoUseCase };