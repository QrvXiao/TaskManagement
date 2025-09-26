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
    <form #f="ngForm" (ngSubmit)="submit(f)" [class.disabled]="loading">
      <input 
        name="username" 
        [(ngModel)]="username" 
        required 
        placeholder="username"
        [disabled]="loading" />
      <input 
        name="password" 
        [(ngModel)]="password" 
        required 
        type="password" 
        placeholder="password"
        [disabled]="loading" />
      <div *ngIf="error" class="error">{{ error }}</div>
      <div *ngIf="loading" class="loading">Processing...</div>
      <button 
        type="submit" 
        [disabled]="!f.valid || loading">
        {{ loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register') }}
      </button>
    </form>
    <p>
      <a (click)="toggle()" [class.disabled]="loading">
        {{ mode === 'login' ? 'Need an account? Register' : 'Have an account? Login' }}
      </a>
    </p>
  `,
  styles: [`
    .error {
      color: red;
      margin: 10px 0;
      padding: 8px;
      border: 1px solid red;
      background-color: #ffeaea;
    }
    .loading {
      color: blue;
      margin: 10px 0;
    }
    .disabled {
      pointer-events: none;
      opacity: 0.6;
    }
    form.disabled input, form.disabled button {
      pointer-events: none;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  error = '';
  loading = false;
  mode: 'login' | 'register' = 'login';

  constructor(private auth: AuthService, private router: Router) {}

  toggle() {
    if (this.loading) return; // 防止在加载时切换模式
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submit(form: any) {
    if (!form.valid || this.loading) return;
    
    this.loading = true;
    this.error = '';

    if (this.mode === 'register') {
      this.auth.register(this.username, this.password).subscribe({
        next: () => {
          // 注册成功后自动登录
          this.auth.login(this.username, this.password).subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/']);
            },
            error: (e) => {
              this.loading = false;
              this.error = e?.error?.error || '自动登录失败，请手动登录';
            }
          });
        },
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.error || '注册失败';
        }
      });
    } else {
      this.auth.login(this.username, this.password).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.error || '登录失败';
          console.error('Login error:', e); // 调试用
        }
      });
    }
  }
}