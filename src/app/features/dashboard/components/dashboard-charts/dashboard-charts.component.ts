import { Component, Input, OnInit, AfterViewInit, ViewChild, ElementRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { Chart, registerables } from 'chart.js';
import { Dashboard, MonthlySummary, CategoryStock } from '../../../../core/models';
import { AnimationService } from '../../../../core/services/animation.service';
import { ThemeService } from '../../../../core/services/theme.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard-charts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-charts.component.html',
  styleUrls: ['./dashboard-charts.component.scss']
})
export class DashboardChartsComponent implements AfterViewInit, OnChanges {
  @Input() data!: Dashboard;
  
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('categoryChart') categoryChartRef!: ElementRef<HTMLCanvasElement>;

  @ViewChild('salesPanel') salesPanelRef!: ElementRef<HTMLElement>;
  @ViewChild('categoryPanel') categoryPanelRef!: ElementRef<HTMLElement>;

  private salesChart?: Chart;
  private categoryChart?: Chart;

  private theme = inject(ThemeService);

  constructor(private anime: AnimationService) {
    toObservable(this.theme.isDarkMode).subscribe(() => {
      this.updateChartColors();
    });
  }

  ngAfterViewInit() {
    this.createCharts();
    setTimeout(() => {
        this.anime.staggerIn([this.salesPanelRef.nativeElement, this.categoryPanelRef.nativeElement], 0.1);
    }, 400);
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

    this.salesChart = new Chart(this.salesChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: this.data.monthlySales.map((s: MonthlySummary) => s.month),
        datasets: [{
          label: 'Ventas (RD$)',
          data: this.data.monthlySales.map((s: MonthlySummary) => s.total),
          borderColor: accent,
          backgroundColor: `${accent}1a`,
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
            border: { display: false }
          },
          x: { 
            grid: { display: false } ,
            border: { display: false }
          }
        }
      }
    });

    this.categoryChart = new Chart(this.categoryChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: this.data.categoryDistribution.map((c: CategoryStock) => c.category),
        datasets: [{
          data: this.data.categoryDistribution.map((c: CategoryStock) => c.stockCount),
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

    this.updateChartColors();
  }

  private updateChartColors() {
    if (!this.salesChart && !this.categoryChart) return;

    const isDark = this.theme.isDarkMode();
    const textColor = isDark ? '#FFFFFF' : '#000000';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)';

    if (this.salesChart) {
      if (this.salesChart.options.scales?.['y']) {
        this.salesChart.options.scales['y'].grid = { color: gridColor };
        this.salesChart.options.scales['y'].ticks = { color: textColor };
      }
      if (this.salesChart.options.scales?.['x']) {
        this.salesChart.options.scales['x'].ticks = { color: textColor };
      }
      this.salesChart.update();
    }

    if (this.categoryChart) {
      if (this.categoryChart.options.plugins?.legend?.labels) {
        this.categoryChart.options.plugins.legend.labels.color = textColor;
      }
      this.categoryChart.update();
    }
  }

  private updateCharts() {
    if (this.salesChart) {
      this.salesChart.data.labels = this.data.monthlySales.map((s: MonthlySummary) => s.month);
      this.salesChart.data.datasets[0].data = this.data.monthlySales.map((s: MonthlySummary) => s.total);
      this.salesChart.update();
    }
    if (this.categoryChart) {
      this.categoryChart.data.labels = this.data.categoryDistribution.map((c: CategoryStock) => c.category);
      this.categoryChart.data.datasets[0].data = this.data.categoryDistribution.map((c: CategoryStock) => c.stockCount);
      this.categoryChart.update();
    }
  }
}
