import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map, tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl + '/auth';
  public isLogged = signal(false);
  public isInitialized = signal(false);
  public currentUser = signal<{ id: string; username: string } | null>(null); // 新增用户信息

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth() {
    if (typeof window !== 'undefined' && window?.localStorage) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // 尝试从 token 中解析用户信息
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          this.currentUser.set({
            id: payload.sub,
            username: payload.username
          });
          this.isLogged.set(true);
        } catch (error) {
          console.error('Error parsing token:', error);
          // Token 无效，清除
          localStorage.removeItem('auth_token');
          this.isLogged.set(false);
          this.currentUser.set(null);
        }
      }
    }
    this.isInitialized.set(true);
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { username, password }).pipe(
      tap(r => {
        if (r?.token && typeof window !== 'undefined' && window?.localStorage) {
          localStorage.setItem('auth_token', r.token);
          // 设置用户信息
          if (r.user) {
            this.currentUser.set(r.user);
          }
          this.isLogged.set(true);
        }
      }),
      catchError(error => {
        console.error('Login error:', error);
        return throwError(() => error);
      })
    );
  }

  register(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/register`, { username, password }).pipe(
      catchError(error => {
        console.error('Registration error:', error);
        return throwError(() => error);
      })
    );
  }

  logout() {
    if (typeof window !== 'undefined' && window?.localStorage) {
      localStorage.removeItem('auth_token');
    }
    this.isLogged.set(false);
    this.currentUser.set(null); // 清除用户信息
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window?.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  // 便捷方法获取用户名
  getCurrentUsername(): string {
    return this.currentUser()?.username || '';
  }
}