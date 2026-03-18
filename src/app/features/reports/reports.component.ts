import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ReportSummary } from '../../core/models/models';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div>
  <div class="page-header">
    <div>
      <h1>Reportes</h1>
      <p>Consulta y exporta reportes por período</p>
    </div>
  </div>

  <!-- Filter -->
  <div class="card" style="margin-bottom:24px">
    <div class="card__header"><h2>Filtro por Período</h2></div>
    <div class="form-row" style="align-items:flex-end;gap:16px">
      <div class="form-group" style="margin-bottom:0">
        <label>Desde</label>
        <input type="date" [(ngModel)]="from" />
      </div>
      <div class="form-group" style="margin-bottom:0">
        <label>Hasta</label>
        <input type="date" [(ngModel)]="to" />
      </div>
      <button class="btn btn--primary" (click)="loadReport()" [disabled]="loading">
        {{ loading ? 'Consultando...' : '🔍 Consultar' }}
      </button>
      <button class="btn btn--success" (click)="exportExcel()" [disabled]="!summary || exporting">
        {{ exporting ? 'Exportando...' : '📥 Exportar Excel' }}
      </button>
    </div>
    <div *ngIf="error" class="alert alert--error" style="margin-top:12px">{{ error }}</div>
  </div>

  <!-- Summary Cards -->
  <div class="metric-grid" *ngIf="summary">
    <div class="metric-card">
      <div class="metric-label">Total Ventas</div>
      <div class="metric-value text-success">RD$ {{ summary.totalSales | number:'1.2-2' }}</div>
      <div class="metric-icon">💰</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Total Compras</div>
      <div class="metric-value text-warning">RD$ {{ summary.totalPurchases | number:'1.2-2' }}</div>
      <div class="metric-icon">🛒</div>
    </div>
    <div class="metric-card">
      <div class="metric-label">Ganancia Neta</div>
      <div class="metric-value" [class.text-success]="summary.netProfit >= 0" [class.text-danger]="summary.netProfit < 0">
        RD$ {{ summary.netProfit | number:'1.2-2' }}
      </div>
      <div class="metric-icon">📈</div>
    </div>
  </div>

  <!-- Sales Table -->
  <div class="card" *ngIf="summary && summary.sales.length > 0" style="margin-bottom:24px">
    <div class="card__header"><h2>Ventas ({{ summary.sales.length }})</h2></div>
    <table class="data-table">
      <thead><tr><th># Factura</th><th>Cliente</th><th>Fecha</th><th>Total</th></tr></thead>
      <tbody>
        <tr *ngFor="let s of summary.sales">
          <td class="font-mono text-accent">{{ s.invoiceNumber }}</td>
          <td>{{ s.clientName }}</td>
          <td>{{ s.invoiceDate | date:'dd/MM/yyyy' }}</td>
          <td class="fw-bold text-success">RD$ {{ s.total | number:'1.2-2' }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Purchases Table -->
  <div class="card" *ngIf="summary && summary.purchases.length > 0">
    <div class="card__header"><h2>Compras ({{ summary.purchases.length }})</h2></div>
    <table class="data-table">
      <thead><tr><th># Compra</th><th>Proveedor</th><th>Fecha</th><th>Total</th></tr></thead>
      <tbody>
        <tr *ngFor="let p of summary.purchases">
          <td class="font-mono text-accent">{{ p.purchaseNumber }}</td>
          <td>{{ p.supplier }}</td>
          <td>{{ p.purchaseDate | date:'dd/MM/yyyy' }}</td>
          <td class="fw-bold text-warning">RD$ {{ p.total | number:'1.2-2' }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div *ngIf="summary && summary.sales.length === 0 && summary.purchases.length === 0" class="card">
    <p class="text-muted" style="padding:40px;text-align:center">No hay datos para el período seleccionado.</p>
  </div>
</div>
  `
})
export class ReportsComponent implements OnInit {
  summary: ReportSummary | null = null;
  loading = false;
  exporting = false;
  error = '';

  from = '';
  to = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    this.from = firstDay.toISOString().split('T')[0];
    this.to = today.toISOString().split('T')[0];
    this.loadReport();
  }

  loadReport(): void {
    if (!this.from || !this.to) { this.error = 'Selecciona ambas fechas.'; return; }
    this.loading = true; this.error = '';
    this.api.getReportSummary(this.from + 'T00:00:00', this.to + 'T23:59:59').subscribe({
      next: (s) => { this.summary = s; this.loading = false; },
      error: (e) => { this.error = e.error?.message ?? 'Error al cargar reporte.'; this.loading = false; }
    });
  }

  exportExcel(): void {
    this.exporting = true;
    this.api.exportReportExcel(this.from + 'T00:00:00', this.to + 'T23:59:59').subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `StockTech_Reporte_${this.from}_${this.to}.xlsx`;
        a.click();
        window.URL.revokeObjectURL(url);
        this.exporting = false;
      },
      error: () => { this.exporting = false; }
    });
  }
}
