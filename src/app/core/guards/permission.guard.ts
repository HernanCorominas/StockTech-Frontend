import { Injectable, inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthStateService } from '../services/auth-state.service';

@Injectable({ providedIn: 'root' })
export class PermissionGuard implements CanActivate {
  private auth = inject(AuthStateService);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const requiredPermission = route.data['permission'] as string;
    if (!requiredPermission) return true;

    const permissions = this.auth.permissions();
    const hasPermission = permissions.includes(requiredPermission) || permissions.includes('admin:*');

    if (hasPermission) return true;

    this.router.navigate(['/forbidden']);
    return false;
  }
}
