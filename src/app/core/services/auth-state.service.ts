import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LoginResponse } from '../models/models';
import { jwtDecode } from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly TOKEN_KEY = 'st_token';
  private readonly USER_KEY = 'st_user';

  // Signals for reactive state
  private _currentUser = signal<{ username: string; role: string; permissions: string[] } | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly permissions = computed(() => this._currentUser()?.permissions || []);

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.restoreSession();
  }

  saveSession(response: LoginResponse): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem(this.TOKEN_KEY, response.token);
    
    // Decode permissions from token
    let permissions: string[] = [];
    try {
      const decoded: any = jwtDecode(response.token);
      const claims = decoded['permission'];
      if (claims) {
        permissions = Array.isArray(claims) ? claims : [claims];
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }

    const user = {
      username: response.username,
      role: response.role,
      permissions: permissions,
      expiresAt: response.expiresAt
    };
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this._currentUser.set(user);
  }

  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private restoreSession(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (new Date(user.expiresAt) > new Date()) {
          this._currentUser.set(user);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }
}
