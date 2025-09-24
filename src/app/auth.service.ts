import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiUrl + '/auth';
  public isLogged = signal(false);

  constructor(private http: HttpClient) {
    if (typeof window !== 'undefined' && window?.localStorage) {
      this.isLogged.set(!!localStorage.getItem('auth_token'));
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.api}/login`, { username, password }).pipe(
      tap(r => {
        if (r?.token) {
          localStorage.setItem('auth_token', r.token);
          this.isLogged.set(true);
        }
      })
    );
  }

  register(username: string, password: string) {
    return this.http.post<any>(`${this.api}/register`, { username, password });
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.isLogged.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }
}