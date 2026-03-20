import { Component, OnInit, ViewChildren, ViewChild, QueryList, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { AnimationService } from '../../core/services/animation.service';
import { Dashboard } from '../../core/models/models';

import { DashboardChartsComponent } from './components/dashboard-charts/dashboard-charts.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, DashboardChartsComponent],
  template: `
<div class="page-header" #header>
    <div>
      <h1>Dashboard</h1>
      <p>Resumen de métricas del sistema</p>
    </div>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <ng-container *ngIf="!loading && data">
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="card flex flex-col items-center justify-center p-8 bg-white" #card>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Vendido</div>
        <div class="text-3xl font-bold text-slate-900 mb-2">RD$ {{ data.totalSales | number:'1.2-2' }}</div>
        <div class="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">💰</div>
      </div>
      <div class="card flex flex-col items-center justify-center p-8 bg-white" #card>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Ganancia Neta</div>
        <div class="text-3xl font-bold mb-2" [class.text-emerald-600]="data.profit >= 0" [class.text-rose-600]="data.profit < 0">
          RD$ {{ data.profit | number:'1.2-2' }}
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">📈</div>
      </div>
      <div class="card flex flex-col items-center justify-center p-8 bg-white" #card>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Stock Bajo</div>
        <div class="text-3xl font-bold mb-2" [class.text-amber-600]="data.lowStockProducts > 0">{{ data.lowStockProducts }}</div>
        <div class="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">⚠️</div>
      </div>
      <div class="card flex flex-col items-center justify-center p-8 bg-white" #card>
        <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Total Productos</div>
        <div class="text-3xl font-bold text-slate-900 mb-2">{{ data.totalProducts }}</div>
        <div class="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center text-xl">📦</div>
      </div>
    </div>

    <!-- Analytic Charts -->
    <app-dashboard-charts *ngIf="data" [data]="data" #chartsContainer />

    <!-- Top Products -->
    <div class="card" #productsCard>
      <div class="card__header"><h2>Top Productos por Ingresos</h2></div>
      <table class="data-table" *ngIf="data.topProducts.length > 0; else noData">
        <thead>
          <tr>
            <th>#</th>
            <th>Producto</th>
            <th>Unidades Vendidas</th>
            <th>Ingresos</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let p of data.topProducts; let i = index" #row>
            <td><span class="badge badge--accent">{{ i + 1 }}</span></td>
            <td class="fw-semibold">{{ p.productName }}</td>
            <td>{{ p.quantitySold }}</td>
            <td class="text-success fw-bold">RD$ {{ p.revenue | number:'1.2-2' }}</td>
          </tr>
        </tbody>
      </table>
      <ng-template #noData><p class="text-muted" style="padding:20px;text-align:center">Sin ventas registradas aún.</p></ng-template>
    </div>
  </ng-container>
  `
})
export class DashboardComponent implements OnInit {
  @ViewChildren('card') cards!: QueryList<ElementRef>;
  @ViewChildren('row') rows!: QueryList<ElementRef>;
  @ViewChildren('productsCard') productsCard!: QueryList<ElementRef>;
  @ViewChild('chartsContainer', { read: ElementRef }) chartsContainer!: ElementRef;

  data: Dashboard | null = null;
  loading = true;

  constructor(
    private api: ApiService,
    private anime: AnimationService
  ) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => { 
        this.data = d; 
        this.loading = false;
        setTimeout(() => {
          this.anime.staggerIn(this.cards.map(c => c.nativeElement));
          
          if (this.chartsContainer) {
            this.anime.fadeIn(this.chartsContainer.nativeElement, 0.4);
          }

          if (this.productsCard.first) {
            this.anime.fadeIn(this.productsCard.first.nativeElement, 0.6);
          }
          if (this.rows.length > 0) {
            this.anime.staggerIn(this.rows.map(r => r.nativeElement), 0.03);
          }
        }, 300);
      },
      error: () => { this.loading = false; }
    });
  }
}
