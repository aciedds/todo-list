
export interface CreateTodoData {
  title: string;
  content?: string;
  completed?: boolean;
}

export interface UpdateTodoData {
  title?: string;
  content?: string;
  completed?: boolean;
}

export interface TodoFilters {
  completed?: boolean;
  search?: string;
  sortBy?: 'title' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}