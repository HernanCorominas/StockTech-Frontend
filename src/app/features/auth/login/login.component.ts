import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthStateService } from '../../../core/services/auth-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  error = '';
  showPassword = false;
  year = new Date().getFullYear();
  // 72 dots (12 cols × 6 visible rows) for grid decoration
  gridDots = Array(72).fill(0);

  constructor(
    private api: ApiService,
    private authState: AuthStateService,
    private router: Router
  ) {}

  login(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.error = '';

    this.api.login({ username: this.username, password: this.password }).subscribe({
      next: (res) => {
        this.authState.saveSession(res);
        this.router.navigate(['/dashboard']);
      },
      error: (err: any) => {
        this.error = err.error?.message ?? 'Usuario o contraseña incorrectos';
        this.loading = false;
      }
    });
  }
}
