import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('task-management');

  constructor(private auth: AuthService, private router: Router) {}

  get logged() {
    return this.auth.isLogged();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
