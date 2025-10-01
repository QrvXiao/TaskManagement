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

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
