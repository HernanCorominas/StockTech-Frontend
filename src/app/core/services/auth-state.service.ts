import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/models';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly TOKEN_KEY = 'st_token';
  private readonly USER_KEY = 'st_user';

  constructor(private router: Router) {}

  saveSession(response: LoginResponse): void {
    localStorage.setItem(this.TOKEN_KEY, response.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify({
      username: response.username,
      role: response.role,
      expiresAt: response.expiresAt
    }));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return false;
    try {
      const user = JSON.parse(userStr);
      return new Date(user.expiresAt) > new Date();
    } catch {
      return false;
    }
  }

  getUser(): { username: string; role: string } | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (!userStr) return null;
    try { return JSON.parse(userStr); } catch { return null; }
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/auth/login']);
  }
}
