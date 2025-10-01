import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map, tap, catchError } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl + '/auth';
  public isLogged = signal(false);
  public isInitialized = signal(false); // 新增：是否已初始化

  constructor(private http: HttpClient) {
    this.initializeAuth();
  }

  private initializeAuth() {
    if (typeof window !== 'undefined' && window?.localStorage) {
      const token = localStorage.getItem('auth_token');
      this.isLogged.set(!!token);
    }
    this.isInitialized.set(true); // 标记为已初始化
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { username, password }).pipe(
      tap(r => {
        if (r?.token && typeof window !== 'undefined' && window?.localStorage) {
          localStorage.setItem('auth_token', r.token);
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
  }

  getToken(): string | null {
    if (typeof window !== 'undefined' && window?.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  }
}