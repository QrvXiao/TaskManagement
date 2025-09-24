import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule],
  templateUrl: './task-list.html',
  styleUrl: './task-list.scss'
})
export class TaskList implements OnInit {
  tasks: Task[] = [];
  loading = false;
  error = '';  

  constructor(private taskService: TaskService, private router: Router) {}

  ngOnInit(): void {
    this.loadTasks();
    // 可选：从编辑/详情返回后刷新列表
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.loadTasks();
    });
  }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.taskService.getTasks().subscribe({
      next: tasks => { this.tasks = tasks; this.loading = false; },
      error: err => { this.error = err?.error?.error || 'Failed to load tasks'; this.loading = false; }
    });
  }

  confirmDelete(id: string) {
    if (!confirm('确定要删除此任务吗？')) return;
    this.taskService.deleteTask(id).subscribe({
      next: () => this.loadTasks(),
      error: err => alert(err?.error?.error || '删除失败')
    });
  }

  newTask() {
    this.router.navigate(['/new']);
  }

  viewTask(id: string) {
    this.router.navigate(['/task', id]);
  }

  editTask(id: string) {
    this.router.navigate(['/edit', id]);
  }

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe(() => {
      this.loadTasks(); // 删除任务后刷新列表
    });
  }
}