// ...existing code...
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task.service';
import { Task } from '../task.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-task-edit',
  imports: [FormsModule],
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
        error: () => {
          this.error = '加载任务失败';
        }
      });
    } else {
      // 新建时设置默认值
      this.task = { status: 'todo' };
    }
  }

  saveTask(form: any): void {
    if (!form || !form.valid) {
      this.error = '请完整填写表单';
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
      next: () => {
        this.saving = false;
        this.router.navigate(['/']);
      },
      error: () => {
        this.saving = false;
        this.error = '保存失败，请稍后重试';
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/']);
  }
}
// ...existing code...