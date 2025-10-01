export interface Task {
  id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  assignee?: string;
  dueDate?: string | null;
  userId?: string;
  createdAt?: string;  // 新增
  updatedAt?: string;  // 新增
}