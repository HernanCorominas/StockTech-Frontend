import { Component, OnInit, ViewChildren, ViewChild, QueryList, ElementRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { FlipAnimationService } from '../../core/services/flip-animation.service';
import { BranchStateService } from '../../core/services/branch-state.service';
import { Dashboard } from '../../core/models';
import { toObservable } from '@angular/core/rxjs-interop';

import { DashboardChartsComponent } from './components/dashboard-charts/dashboard-charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardChartsComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  @ViewChildren('card') cards!: QueryList<ElementRef>;
  @ViewChildren('row') rows!: QueryList<ElementRef>;
  @ViewChildren('productsCard') productsCard!: QueryList<ElementRef>;
  @ViewChildren('branchesCard') branchesCard!: QueryList<ElementRef>;
  @ViewChildren('branchRow') branchRows!: QueryList<ElementRef>;
  @ViewChild('chartsContainer', { read: ElementRef }) chartsContainer!: ElementRef;

  private api = inject(ApiService);
  private anime = inject(FlipAnimationService);
  public branchState = inject(BranchStateService);

  data: Dashboard | null = null;
  loading = true;

  constructor() {
    // Reactively re-load when branch changes
    toObservable(this.branchState.selectedBranchId).subscribe(() => {
      this.loadData();
    });
  }

  ngOnInit(): void {}

  private loadData() {
    this.loading = true;
    this.api.getDashboard(this.branchState.selectedBranchId() ?? undefined).subscribe({
      next: (d) => { 
        this.data = d; 
        this.loading = false;
        requestAnimationFrame(() => {
          this.animate();
        });
      },
      error: () => { this.loading = false; }
    });
  }

  private animate() {
    this.anime.staggerIn(this.cards.map(c => c.nativeElement));
    if (this.productsCard.first) this.anime.fadeIn(this.productsCard.first.nativeElement);
    if (this.branchesCard.first) this.anime.fadeIn(this.branchesCard.first.nativeElement);
    if (this.rows.length > 0) this.anime.staggerIn(this.rows.map(r => r.nativeElement), 0.03);
    if (this.branchRows.length > 0) this.anime.staggerIn(this.branchRows.map(b => b.nativeElement), 0.03);
  }
}
