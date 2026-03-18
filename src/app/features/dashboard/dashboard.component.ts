import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { Dashboard } from '../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
<div>
  <div class="page-header">
    <div>
      <h1>Dashboard</h1>
      <p>Resumen de métricas del sistema</p>
    </div>
  </div>

  <div *ngIf="loading" class="spinner"></div>

  <ng-container *ngIf="!loading && data">
    <div class="metric-grid">
      <div class="metric-card">
        <div class="metric-label">Total Vendido</div>
        <div class="metric-value">RD$ {{ data.totalSales | number:'1.2-2' }}</div>
        <div class="metric-icon">💰</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Total Comprado</div>
        <div class="metric-value">RD$ {{ data.totalPurchases | number:'1.2-2' }}</div>
        <div class="metric-icon">🛒</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Ganancia Neta</div>
        <div class="metric-value" [class.text-success]="data.profit >= 0" [class.text-danger]="data.profit < 0">
          RD$ {{ data.profit | number:'1.2-2' }}
        </div>
        <div class="metric-icon">📈</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Facturas Emitidas</div>
        <div class="metric-value">{{ data.totalInvoices }}</div>
        <div class="metric-icon">🧾</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Clientes</div>
        <div class="metric-value">{{ data.totalClients }}</div>
        <div class="metric-icon">👥</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Productos</div>
        <div class="metric-value">{{ data.totalProducts }}</div>
        <div class="metric-icon">📦</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Stock Bajo</div>
        <div class="metric-value" [class.text-warning]="data.lowStockProducts > 0">{{ data.lowStockProducts }}</div>
        <div class="metric-icon">⚠️</div>
      </div>
      <div class="metric-card">
        <div class="metric-label">Compras Realizadas</div>
        <div class="metric-value">{{ data.totalPurchasesCount }}</div>
        <div class="metric-icon">📋</div>
      </div>
    </div>

    <!-- Top Products -->
    <div class="card">
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
          <tr *ngFor="let p of data.topProducts; let i = index">
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
</div>
  `
})
export class DashboardComponent implements OnInit {
  data: Dashboard | null = null;
  loading = true;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
