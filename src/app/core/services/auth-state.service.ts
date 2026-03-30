import { Injectable, signal, computed, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { LoginResponse, Branch, AuthorizedBranch } from '../models';
import { jwtDecode } from 'jwt-decode';

export interface UserSession {
  id: string;
  username: string;
  role: string;
  fullName?: string;
  email?: string;
  permissions: string[];
  branchId?: string;
  authorizedBranches: AuthorizedBranch[];
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly TOKEN_KEY = 'st_token';
  private readonly USER_KEY = 'st_user';

  // Signals for reactive state
  private _currentUser = signal<UserSession | null>(null);
  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => !!this._currentUser());
  readonly permissions = computed(() => this._currentUser()?.permissions || []);

  readonly isAdmin = computed(() => {
    const role = this._currentUser()?.role.toLowerCase();
    return role === 'admin' || role === 'systemadmin';
  });

  readonly isManager = computed(() => {
    const role = this._currentUser()?.role.toLowerCase();
    return role === 'manager' || role === 'branchmanager';
  });

  readonly isSeller = computed(() => {
    return this._currentUser()?.role.toLowerCase() === 'seller';
  });

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

    const user: UserSession = {
      id: response.id,
      username: response.username,
      role: response.role,
      permissions: permissions,
      branchId: response.branchId,
      authorizedBranches: response.authorizedBranches,
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
