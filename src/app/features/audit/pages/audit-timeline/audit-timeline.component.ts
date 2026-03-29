import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ViewChildren, QueryList, inject, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditLogService } from '../../../../core/services/audit-log.service';
import { AuditLog } from '../../../../core/models';
import { FlipAnimationService } from '../../../../core/services/flip-animation.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';
import { SidebarService } from '../../../../core/services/sidebar.service';

@Component({
  selector: 'app-audit-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit-timeline.component.html',
  styleUrls: ['./audit-timeline.component.scss']
})
export class AuditTimelineComponent implements OnInit, OnDestroy {
  private auditService = inject(AuditLogService);
  private anime = inject(FlipAnimationService);
  private auth = inject(AuthStateService);
  private sidebar = inject(SidebarService);

  @ViewChild('sideFilters', { static: true }) sideFilters!: TemplateRef<any>;

  logs: AuditLog[] = [];
  loading = true;
  isGlobalAdmin = false;

  startDate = '';
  endDate = '';
  
  page = 1;
  pageSize = 10;
  totalCount = 0;
  Math = Math;

  @ViewChildren('timelineItem') items!: QueryList<ElementRef>;

  ngOnInit() {
    this.isGlobalAdmin = this.auth.currentUser()?.role?.toLowerCase() === 'admin';
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    this.startDate = lastMonth.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    
    this.sidebar.setTemplate(this.sideFilters);
    this.load(1);
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  load(pageIndex: number = 1) {
    this.page = pageIndex;
    this.loading = true;
    const filters = { start: this.startDate, end: this.endDate };
    this.auditService.getLogs(this.page, this.pageSize, filters).subscribe({
      next: (res) => {
        this.logs = res.items;
        this.totalCount = res.totalCount;
        this.loading = false;
        setTimeout(() => this.animateItems(), 50);
      },
      error: () => this.loading = false
    });
  }

  private animateItems() {
    if (this.items && this.items.length > 0) {
      this.anime.staggerIn(this.items.map(i => i.nativeElement), 0.05);
    }
  }

  formatJson(jsonStr?: string): any {
    if (!jsonStr) return null;
    try { return JSON.parse(jsonStr); } catch { return null; }
  }

  objectKeys(obj: any): string[] { return obj ? Object.keys(obj) : []; }
}
