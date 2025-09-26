import { Routes } from '@angular/router';
import { TaskList } from './task-list/task-list';
import { TaskDetail } from './task-detail/task-detail';
import { TaskEdit } from './task-edit/task-edit';
import { LoginComponent } from './login/login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: TaskList, canActivate: [authGuard] },
  { path: 'task/:id', component: TaskDetail, canActivate: [authGuard], data: { prerender: false }  },
  { path: 'edit/:id', component: TaskEdit, canActivate: [authGuard], data: { prerender: false }  },
  { path: 'new', component: TaskEdit, canActivate: [authGuard] }
];  