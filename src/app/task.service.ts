import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Task } from './task.model';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../environments/environment';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private apiUrl = environment.apiUrl + '/tasks';

  constructor(private http: HttpClient) {}

  getTasks(): Observable<Task[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(items => items.map(i => ({ ...i, id: i.id ?? i._id })))
    );
  }

  getTask(id: string): Observable<Task> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(i => ({ ...i, id: i.id ?? i._id }))
    );
  }

  addTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<any>(this.apiUrl, task).pipe(
      map(i => ({ ...i, id: i.id ?? i._id }))
    );
  }

  updateTask(id: string, updated: Partial<Task>): Observable<Task> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, updated).pipe(
      map(i => ({ ...i, id: i.id ?? i._id }))
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}