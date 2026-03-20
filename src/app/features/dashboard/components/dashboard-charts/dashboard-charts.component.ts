import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';
import { Dashboard } from '../../../../core/models/models';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <!-- Sales Trend -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
        <h3 class="text-sm font-bold text-slate-900 mb-4 uppercase letter-spacing-wide">Tendencia de Ventas (6 Meses)</h3>
        <div class="flex-1 relative">
          <canvas #salesChart></canvas>
        </div>
      </div>

      <!-- Inventory Distribution -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-[400px]">
        <h3 class="text-sm font-bold text-slate-900 mb-4 uppercase letter-spacing-wide">Distribución de Inventario</h3>
        <div class="flex-1 relative flex items-center justify-center">
          <canvas #categoryChart></canvas>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    canvas { width: 100% !important; height: 100% !important; }
  `]
})
export class DashboardChartsComponent implements AfterViewInit, OnChanges {
  @Input() data!: Dashboard;
  
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  private salesChart?: Chart;
  private categoryChart?: Chart;

  ngAfterViewInit() {
    this.createCharts();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['data'] && !changes['data'].firstChange) {
      this.updateCharts();
    }
  }

  private createCharts() {
    if (!this.data) return;

    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent').trim() || '#3b82f6';

    // Sales Chart
    this.salesChart = new Chart(this.salesChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.data.monthlySales.map(s => s.month),
        datasets: [{
          label: 'Ventas (RD$)',
          data: this.data.monthlySales.map(s => s.total),
          borderColor: accent,
          backgroundColor: `${accent}1a`, // 10% opacity
          borderWidth: 4,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: accent,
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { 
            beginAtZero: true, 
            grid: { color: 'rgba(0,0,0,0.03)' },
            border: { display: false }
          },
          x: { 
            grid: { display: false } ,
            border: { display: false }
          }
        }
      }
    });

    // Category Chart
    this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.data.categoryDistribution.map(c => c.category),
        datasets: [{
          data: this.data.categoryDistribution.map(c => c.stockCount),
          backgroundColor: [
            accent, '#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#94a3b8'
          ],
          borderWidth: 0,
          cutout: '75%'
        } as any]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'bottom', 
            labels: { 
              usePointStyle: true, 
              padding: 25,
              font: { size: 11, weight: 'bold' }
            } 
          }
        }
      }
    });
  }

  private updateCharts() {
    if (this.salesChart) {
      this.salesChart.data.labels = this.data.monthlySales.map(s => s.month);
      this.salesChart.data.datasets[0].data = this.data.monthlySales.map(s => s.total);
      this.salesChart.update();
    }
    if (this.categoryChart) {
      this.categoryChart.data.labels = this.data.categoryDistribution.map(c => c.category);
      this.categoryChart.data.datasets[0].data = this.data.categoryDistribution.map(c => c.stockCount);
      this.categoryChart.update();
    }
  }
}
