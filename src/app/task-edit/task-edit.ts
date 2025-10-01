import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-edit',
  imports: [FormsModule, CommonModule],
  templateUrl: './task-edit.html',
  styleUrl: './task-edit.scss'
})
export class TaskEdit implements OnInit {
  task: Partial<Task> = {};
  isEdit = false;
  saving = false;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.taskService.getTask(id).subscribe({
        next: found => {
          this.task = { ...found };
          // 后端返回 ISO 字符串，转换为 input[type="date"] 接受的 yyyy-MM-dd
          if (this.task.dueDate) {
            try {
              this.task.dueDate = new Date(this.task.dueDate).toISOString().slice(0, 10);
            } catch {
              this.task.dueDate = null;
            }
          } else {
            this.task.dueDate = null;
          }
        },
        error: (err) => {
          this.error = err?.error?.error || 'Failed to load task';
          console.error('Load task error:', err);
        }
      });
    } else {
      // 新建时设置默认值
      this.task = { 
        status: 'todo',
        title: '',
        description: '',
        assignee: '',
        dueDate: null
      };
    }
  }

  saveTask(form: any): void {
    if (!form || !form.valid) {
      this.error = 'Please fill in all required fields correctly';
      return;
    }

    this.saving = true;
    this.error = '';

    // 准备发送给后端的 payload：将 yyyy-MM-dd 转回 ISO 字符串
    const payload: Partial<Task> = { ...this.task };
    if (payload.dueDate) {
      // input 返回 yyyy-MM-dd -> 转为 ISO
      payload.dueDate = new Date(payload.dueDate).toISOString();
    } else {
      // 明确不要发送空字符串
      payload.dueDate = undefined;
    }

    const obs: Observable<Task> = (this.isEdit && this.task.id)
      ? this.taskService.updateTask(this.task.id, payload)
      : this.taskService.addTask(payload as Task);

    obs.subscribe({
      next: (savedTask) => {
        this.saving = false;
        console.log('Task saved successfully:', savedTask);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.error || 'Save failed, please try again';
        console.error('Save task error:', err);
      }
    });
  }

  cancel(): void {
    if (this.saving) return;
    
    // 如果表单有未保存的更改，询问用户确认
    if (this.hasUnsavedChanges()) {
      if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
        this.router.navigate(['/']);
      }
    } else {
      this.router.navigate(['/']);
    }
  }

  private hasUnsavedChanges(): boolean {
    // 简单检查是否有内容
    return !!(this.task.title || this.task.description || this.task.assignee || this.task.dueDate);
  }
}