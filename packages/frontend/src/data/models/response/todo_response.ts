

export interface TodoResponse {
  id: string;
  title: string;
  content?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface CreateTodoResponse {
  success: boolean;
  message: string;
  data: TodoResponse;
}

export interface GetTodosResponse {
  success: boolean;
  data: TodoResponse[];
}

export interface GetTodoResponse {
  success: boolean;
  data: TodoResponse;
}

export interface UpdateTodoResponse {
  success: boolean;
  message: string;
  data: TodoResponse;
}

export interface DeleteTodoResponse {
  success: boolean;
  message: string;
  data: TodoResponse;
}