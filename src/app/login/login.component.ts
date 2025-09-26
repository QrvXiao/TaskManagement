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
    <div class="login-container">
      <h2>{{ mode === 'login' ? 'Login' : 'Register' }}</h2>
      <div class="form-container" [class.disabled]="loading">
        <input 
          #usernameInput
          [(ngModel)]="username" 
          placeholder="username"
          [disabled]="loading"
          (keyup.enter)="onEnter()" />
        <input 
          #passwordInput
          [(ngModel)]="password" 
          type="password" 
          placeholder="password"
          [disabled]="loading"
          (keyup.enter)="onEnter()" />
        <div *ngIf="error" class="error">{{ error }}</div>
        <div *ngIf="loading" class="loading">Processing...</div>
        <button 
          (click)="submitForm()"
          [disabled]="!isFormValid() || loading">
          {{ loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register') }}
        </button>
      </div>
      <p>
        <a (click)="toggle()" [class.disabled]="loading" style="cursor: pointer;">
          {{ mode === 'login' ? 'Need an account? Register' : 'Have an account? Login' }}
        </a>
      </p>
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    .error {
      color: #d32f2f;
      margin: 10px 0;
      padding: 12px;
      border: 1px solid #d32f2f;
      background-color: #ffeaea;
      border-radius: 4px;
      font-weight: 500;
    }
    .loading {
      color: #1976d2;
      margin: 10px 0;
      padding: 12px;
      background-color: #e3f2fd;
      border-radius: 4px;
      text-align: center;
    }
    .disabled {
      pointer-events: none;
      opacity: 0.6;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      box-sizing: border-box;
      font-size: 16px;
    }
    input:focus {
      outline: none;
      border-color: #1976d2;
      box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
    }
    input:disabled {
      background-color: #f5f5f5;
      cursor: not-allowed;
    }
    button {
      width: 100%;
      padding: 12px;
      background-color: #1976d2;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      font-weight: 500;
    }
    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
    button:hover:not(:disabled) {
      background-color: #1565c0;
    }
    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }
    a {
      text-decoration: none;
      color: #1976d2;
      font-size: 14px;
      text-align: center;
      display: block;
      margin-top: 20px;
    }
    a:hover:not(.disabled) {
      text-decoration: underline;
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

  isFormValid(): boolean {
    return this.username.trim().length > 0 && this.password.trim().length > 0;
  }

  onEnter() {
    if (this.isFormValid() && !this.loading) {
      this.submitForm();
    }
  }

  toggle() {
    if (this.loading) return;
    this.mode = this.mode === 'login' ? 'register' : 'login';
    this.error = '';
  }

  submitForm() {
    if (!this.isFormValid() || this.loading) return;
    
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