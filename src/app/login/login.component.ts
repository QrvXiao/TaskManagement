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
    <div class="login-container fade-in">
      <div class="login-card">
        <div class="login-header">
          <div class="login-icon">
            {{ mode === 'login' ? '🔐' : '👤' }}
          </div>
          <h2>{{ mode === 'login' ? 'Welcome Back' : 'Create Account' }}</h2>
          <p>{{ mode === 'login' ? 'Sign in to your account' : 'Join us today' }}</p>
        </div>

        <form #f="ngForm" (ngSubmit)="submit($event, f)" [class.disabled]="loading">
          <div class="form-group">
            <label class="form-label" for="username">
              <i class="icon">👤</i> Username
            </label>
            <input 
              id="username"
              name="username" 
              [(ngModel)]="username" 
              required 
              placeholder="Enter your username"
              class="form-control"
              [disabled]="loading" />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">
              <i class="icon">🔒</i> Password
            </label>
            <input 
              id="password"
              name="password" 
              [(ngModel)]="password" 
              required 
              type="password" 
              placeholder="Enter your password"
              class="form-control"
              [disabled]="loading" />
          </div>

          <div *ngIf="error" class="error">
            <i class="icon">⚠️</i> {{ error }}
          </div>

          <div *ngIf="loading" class="loading-state">
            <div class="spinner"></div>
            <span>Processing...</span>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary login-btn"
            [disabled]="!f.valid || loading">
            <span *ngIf="!loading">
              <i class="icon">{{ mode === 'login' ? '🚀' : '✨' }}</i>
              {{ mode === 'login' ? 'Sign In' : 'Create Account' }}
            </span>
            <span *ngIf="loading">
              <div class="btn-spinner"></div>
              Processing...
            </span>
          </button>
        </form>

        <div class="login-footer">
          <p>
            {{ mode === 'login' ? "Don't have an account?" : 'Already have an account?' }}
            <a (click)="toggle()" [class.disabled]="loading" class="toggle-link">
              {{ mode === 'login' ? 'Create one' : 'Sign in' }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
      padding: 40px;
      width: 100%;
      max-width: 420px;
      position: relative;
      overflow: hidden;
    }

    .login-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 4px;
      background: linear-gradient(90deg, #667eea, #764ba2);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .login-header h2 {
      margin: 0 0 8px 0;
      color: #333;
      font-weight: 600;
    }

    .login-header p {
      color: #6c757d;
      margin: 0;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 24px;
    }

    .form-label {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      font-weight: 500;
      color: #495057;
    }

    .form-control {
      transition: all 0.3s ease;
    }

    .form-control:focus {
      transform: translateY(-1px);
    }

    .login-btn {
      width: 100%;
      padding: 14px;
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 24px;
      position: relative;
      overflow: hidden;
    }

    .loading-state {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      color: #667eea;
      margin: 16px 0;
      font-weight: 500;
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 2px solid #e9ecef;
      border-top: 2px solid #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .btn-spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top: 2px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .login-footer {
      text-align: center;
      border-top: 1px solid #e9ecef;
      padding-top: 24px;
    }

    .login-footer p {
      margin: 0;
      color: #6c757d;
      font-size: 14px;
    }

    .toggle-link {
      color: #667eea;
      font-weight: 500;
      cursor: pointer;
      text-decoration: none;
      margin-left: 4px;
      transition: color 0.3s ease;
    }

    .toggle-link:hover:not(.disabled) {
      color: #764ba2;
      text-decoration: underline;
    }

    .disabled {
      pointer-events: none;
      opacity: 0.6;
    }

    form.disabled {
      pointer-events: none;
      opacity: 0.7;
    }

    .error {
      background: #fee;
      border: 1px solid #fcc;
      color: #c66;
      padding: 12px;
      border-radius: 8px;
      margin: 16px 0;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    }

    @media (max-width: 480px) {
      .login-card {
        padding: 28px 20px;
        margin: 0 16px;
      }
      
      .login-icon {
        font-size: 36px;
      }
      
      .login-header h2 {
        font-size: 20px;
      }
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
    event.preventDefault();
    
    if (!form.valid || this.loading) return;
    
    this.loading = true;
    this.error = '';

    if (this.mode === 'register') {
      this.auth.register(this.username, this.password).subscribe({
        next: () => {
          this.auth.login(this.username, this.password).subscribe({
            next: () => {
              this.loading = false;
              this.router.navigate(['/']);
            },
            error: (e) => {
              this.loading = false;
              this.error = e?.error?.error || 'Auto-login failed, please sign in manually';
            }
          });
        },
        error: (e) => {
          this.loading = false;
          this.error = e?.error?.error || 'Registration failed';
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
          this.error = e?.error?.error || 'Login failed';
        }
      });
    }
  }
}