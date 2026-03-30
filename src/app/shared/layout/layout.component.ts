import { Component, computed, ViewChild, ElementRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthStateService } from '../../core/services/auth-state.service';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { ApiService } from '../../core/services/api.service';
import { BranchStateService } from '../../core/services/branch-state.service';
import { ThemeService } from '../../core/services/theme.service';

import { HasPermissionDirective } from '../../core/directives/has-permission.directive';
import { NotificationBellComponent } from '../components/notification-bell/notification-bell.component';
import { SidebarService } from '../../core/services/sidebar.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterOutlet, RouterLink, RouterLinkActive, HasPermissionDirective, NotificationBellComponent],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss']
})
export class LayoutComponent implements OnInit {
  private authState = inject(AuthStateService);
  private router = inject(Router);
  private anime = inject(FlipAnimationService);
  private api = inject(ApiService);
  public branchState = inject(BranchStateService);
  public theme = inject(ThemeService);
  public sidebar = inject(SidebarService);
  public isSidebarCollapsed = false;

  @ViewChild('mainContent') mainContent!: ElementRef;

  username = computed(() => this.authState.currentUser()?.username ?? 'Usuario');
  userInitials = computed(() => this.username().charAt(0).toUpperCase());
  
  isAdmin = this.authState.isAdmin;
  isManager = this.authState.isManager;
  isSeller = this.authState.isSeller;

  isAdminOrManager = computed(() => this.isAdmin() || this.isManager());
  canSeeBranches = computed(() => this.isAdmin() || (this.isManager() && this.branchState.authorizedBranches().length > 1));

  ngOnInit(): void {
    // Page transitions on navigation
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      if (this.mainContent) {
        this.anime.pageTransition(this.mainContent.nativeElement);
      }
    });
  }
  
  logout() { this.authState.logout(); }
}
