import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule],
  templateUrl: './task-detail.html',
  styleUrl: './task-detail.scss'
})
export class TaskDetail {
  task?: Task;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.taskService.getTask(id).subscribe({
        next: found => {
          this.task = found;
        },
        error: err => {
          console.error('Error loading task:', err);
        }
      });
    }
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

  formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  }

  back() {
    this.router.navigate(['/']);
  }

  edit() {
    if (this.task) {
      this.router.navigate(['/edit', this.task.id]);
    }
  }
}