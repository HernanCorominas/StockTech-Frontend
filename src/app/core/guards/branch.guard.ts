import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class BranchGuard implements CanActivate {
  private auth = inject(AuthStateService);
  private router = inject(Router);

  canActivate(): boolean {
    const isAdmin = this.auth.isAdmin();
    const isManager = this.auth.isManager();
    const authorizedCount = this.auth.currentUser()?.authorizedBranches?.length || 0;

    // Access to /branches allowed if Admin OR Manager with more than 1 branch
    if (isAdmin || (isManager && authorizedCount > 1)) {
      return true;
    }

    this.router.navigate(['/forbidden']);
    return false;
  }
}
