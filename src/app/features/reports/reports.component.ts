import { Component, OnInit, OnDestroy, inject, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { BranchStateService } from '../../core/services/branch-state.service';
import { SidebarService } from '../../core/services/sidebar.service';
import { ReportSummary } from '../../core/models';
import { FilterPanelComponent, FilterOption } from '../../shared/components/filter-panel/filter-panel.component';
import { FilterChipsComponent, ActiveFilter } from '../../shared/components/filter-chips/filter-chips.component';
import { AuthStateService } from '../../core/services/auth-state.service';
import { CategoryService } from '../../core/services/category.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterPanelComponent, FilterChipsComponent],
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit, OnDestroy {
  private api = inject(ApiService);
  private branchState = inject(BranchStateService);
  private sidebar = inject(SidebarService);
  private authState = inject(AuthStateService);
  private categoryService = inject(CategoryService);

  @ViewChild('reportActions', { static: true }) reportActions!: TemplateRef<any>;

  summary: ReportSummary | null = null;
  loading = false;
  error = '';
  exporting = false;
  showFilterPanel = false;
  filters: any = {};
  categories: any[] = [];
  branches: any[] = [];
  filterConfig: FilterOption[] = [];
  activeChips: ActiveFilter[] = [];
  isAdmin = this.authState.isAdmin();

  constructor() {
    toObservable(this.branchState.selectedBranchId).subscribe(() => this.loadData());
  }

  ngOnInit(): void {
    forkJoin({
      categories: this.categoryService.getAll(),
      branches: this.isAdmin ? this.api.getBranches() : of([])
    }).subscribe((res: any) => {
      this.categories = res.categories;
      this.branches = res.branches;
      this.initFilterConfig();
    });
    this.loadData();
  }

  ngOnDestroy(): void {
    this.sidebar.clear();
  }

  initFilterConfig() {
    this.filterConfig = [
      {
        id: 'categoryId',
        label: 'Categoría',
        type: 'select',
        options: this.categories.map(c => ({ value: c.id, label: c.name }))
      },
      { id: 'startDate', label: 'Desde', type: 'date' },
      { id: 'endDate', label: 'Hasta', type: 'date' }
    ];

    if (this.isAdmin) {
      this.filterConfig.unshift({
        id: 'branchId',
        label: 'Sucursal',
        type: 'select',
        options: this.branches.map(b => ({ value: b.id, label: b.name })),
        value: this.branchState.selectedBranchId()
      });
    }
  }

  applyFilters(newFilters: any) {
    this.filters = { ...newFilters };
    this.updateActiveChips();
    this.loadData();
  }

  updateActiveChips() {
    this.activeChips = [];
    Object.keys(this.filters).forEach(key => {
      const config = this.filterConfig.find(f => f.id === key);
      const val = this.filters[key];
      if (config && val) {
        let displayValue = val.toString();
        if (config.type === 'select') {
          displayValue = config.options?.find(o => o.value === val)?.label || val;
        }
        this.activeChips.push({ id: key, label: config.label, displayValue: displayValue });
      }
    });
  }

  removeFilter(id: string) {
    delete this.filters[id];
    const config = this.filterConfig.find(f => f.id === id);
    if (config) config.value = undefined;
    this.updateActiveChips();
    this.loadData();
  }

  clearFilters() {
    this.filters = {};
    this.filterConfig.forEach(f => f.value = undefined);
    this.activeChips = [];
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const branchId = this.filters.branchId ?? this.branchState.selectedBranchId();
    const from = this.filters.startDate ?? new Date().toISOString().split('T')[0];
    const to = this.filters.endDate ?? new Date().toISOString().split('T')[0];
    
    this.api.getReportSummary(from + 'T00:00:00', to + 'T23:59:59', branchId ?? undefined).subscribe({
      next: (s) => { this.summary = s; this.loading = false; },
      error: (e) => { this.error = e.error?.message ?? 'Error al cargar reporte.'; this.loading = false; }
    });
  }

  exportExcel(): void {
    this.exporting = true;
    const branchId = this.filters.branchId ?? this.branchState.selectedBranchId();
    const from = (this.filters.startDate ?? new Date().toISOString().split('T')[0]) + 'T00:00:00';
    const to = (this.filters.endDate ?? new Date().toISOString().split('T')[0]) + 'T23:59:59';

    this.api.exportReportExcel(from, to, branchId ?? undefined).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StockTech_Reporte_${from.split('T')[0]}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => { this.exporting = false; }
    });
  }

  exportPdf(): void {
    // Currently reuse excel if pdf is not implemented or add separate call
    this.exportExcel();
  }
}
