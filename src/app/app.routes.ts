import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { PermissionGuard } from './core/guards/permission.guard';
import { BranchGuard } from './core/guards/branch.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () => import('./shared/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      { path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'clients', loadComponent: () => import('./features/clients/clients.component').then(m => m.ClientsComponent) },
      { path: 'products', loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent) },
      { path: 'products/movements', loadComponent: () => import('./features/products/pages/stock-movements/stock-movements.component').then(m => m.StockMovementsComponent) },
      { path: 'suppliers', loadComponent: () => import('./features/suppliers/suppliers.component').then(m => m.SuppliersComponent) },
      { path: 'branches', loadComponent: () => import('./features/branches/branches.component').then(m => m.BranchesComponent), canActivate: [BranchGuard] },
      { path: 'invoices', loadComponent: () => import('./features/invoices/invoices.component').then(m => m.InvoicesComponent) },
      { path: 'purchases', loadComponent: () => import('./features/purchases/purchases.component').then(m => m.PurchasesComponent) },
      { path: 'reports', loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent) },
      { path: 'audit', loadComponent: () => import('./features/audit/pages/audit-timeline/audit-timeline.component').then(m => m.AuditTimelineComponent), canActivate: [PermissionGuard], data: { permission: 'admin:*' } },
      { path: 'users', loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent), canActivate: [PermissionGuard], data: { permission: 'user:read' } },
      { path: 'roles', loadComponent: () => import('./features/roles').then(m => m.RolesComponent), canActivate: [PermissionGuard], data: { permission: 'admin:*' } },
      { path: 'settings', loadComponent: () => import('./features/admin/settings/settings.component').then(m => m.SettingsComponent), canActivate: [PermissionGuard], data: { permission: 'admin:*' } },
      { path: 'pos', loadComponent: () => import('./features/pos/pos-shell/pos-shell.component').then(m => m.PosShellComponent) },
      { path: 'forbidden', loadComponent: () => import('./shared/components/forbidden/forbidden.component').then(m => m.ForbiddenComponent) },
    ]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  { path: '**', redirectTo: '/dashboard' }
];
