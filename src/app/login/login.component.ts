import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <h2>{{ mode === 'login' ? 'Login' : 'Register' }}</h2>
    <form #f="ngForm" (ngSubmit)="submit(f)">
      <input name="username" [(ngModel)]="username" required placeholder="username" />
      <input name="password" [(ngModel)]="password" required type="password" placeholder="password" />
      <div *ngIf="error" class="error">{{ error }}</div>
      <button type="submit">{{ mode === 'login' ? 'Login' : 'Register' }}</button>
    </form>
    <p>
      <a (click)="toggle()">{{ mode === 'login' ? 'Need an account? Register' : 'Have an account? Login' }}</a>
    </p>
  `
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  mode: 'login' | 'register' = 'login';

  constructor(private auth: AuthService, private router: Router) {}

  toggle() {
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submit(form: any) {
    if (!form.valid) return;
    this.error = '';

    if (this.mode === 'register') {
      this.auth.register(this.username, this.password).subscribe({
        next: () => {
          // 可选：注册后直接登录
          this.auth.login(this.username, this.password).subscribe({
            next: () => this.router.navigate(['/']),
            error: (e) => this.error = e?.error?.error || '自动登录失败，请手动登录'
          });
        },
        error: (e) => this.error = e?.error?.error || '注册失败'
      });
    } else {
      this.auth.login(this.username, this.password).subscribe({
        next: () => this.router.navigate(['/']),
        error: (e) => this.error = e?.error?.error || '登录失败'
      });
    }
  }
}