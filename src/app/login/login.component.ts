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
    <form #f="ngForm" (ngSubmit)="submit($event, f)" [class.disabled]="loading">
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
      <a (click)="toggle()" [class.disabled]="loading" style="cursor: pointer;">
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
      border-radius: 4px;
    }
    .loading {
      color: blue;
      margin: 10px 0;
      padding: 8px;
      background-color: #e6f3ff;
      border-radius: 4px;
    }
    .disabled {
      pointer-events: none;
      opacity: 0.6;
    }
    form.disabled input, form.disabled button {
      pointer-events: none;
    }
    form {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
    }
    input {
      width: 100%;
      padding: 8px;
      margin: 8px 0;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
    }
    button {
      width: 100%;
      padding: 10px;
      margin: 10px 0;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    button:hover:not(:disabled) {
      background-color: #0056b3;
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
    if (this.loading) return;
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submit(event: Event, form: any) {
    // 阻止表单默认提交行为
    event.preventDefault();
    
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
          console.error('Login error:', e);
        }
      });
    }
  }
}