export interface Todo {
  id: string;
  title: string;
  content?: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  isOwner?: boolean;
}