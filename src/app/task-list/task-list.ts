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
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.loadTasks();
    });
  }

  loadTasks() {
    this.loading = true;
    this.error = '';
    this.taskService.getTasks().subscribe({
      next: tasks => { 
        this.tasks = tasks; 
        this.loading = false; 
      },
      error: err => { 
        this.error = err?.error?.error || 'Failed to load tasks'; 
        this.loading = false; 
      }
    });
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks.filter(task => task.status === status);
  }

  getStatusIcon(status: string): string {
    switch (status) {
      case 'todo': return '📝';
      case 'in-progress': return '⚡';
      case 'done': return '✅';
      default: return '📝';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'todo': return 'To Do';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  }

  formatDate(dateString: string | null): string {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return '';
    }
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id || index.toString();
  }

  confirmDelete(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    this.taskService.deleteTask(id).subscribe({
      next: () => this.loadTasks(),
      error: err => alert(err?.error?.error || 'Delete failed')
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
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.deleteTask(id).subscribe(() => {
        this.loadTasks();
      });
    }
  }
}