import { Component, inject, OnInit, signal, AfterViewInit, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { ApiService } from '../../core/services/api.service';
import { DashboardSummary, Vehicle } from '../../core/models';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DecimalPipe, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  private api = inject(ApiService);

  @ViewChild('trendChart') trendChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('profitChart') profitChartRef!: ElementRef<HTMLCanvasElement>;

  summary = signal<DashboardSummary | null>(null);
  vehicles = signal<Vehicle[]>([]);
  loading = signal(true);

  filterVehicleId = '';
  filterFrom = this.todayIso();
  filterTo = this.todayIso();

  private trendChart?: Chart;
  private profitChart?: Chart;

  ngOnInit(): void {
    this.api.get<Vehicle[]>('vehicles').subscribe(v => this.vehicles.set(v));
    this.loadSummary();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.renderCharts(), 100);
  }

  ngOnDestroy(): void {
    this.trendChart?.destroy();
    this.profitChart?.destroy();
  }

  todayIso(): string {
    return new Date().toISOString().substring(0, 10);
  }

  applyFilter(): void {
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    const params: Record<string, string | number> = {
      from: this.filterFrom,
      to: this.filterTo
    };
    if (this.filterVehicleId) params['vehicleId'] = +this.filterVehicleId;

    this.api.get<DashboardSummary>('dashboard', params).subscribe({
      next: data => {
        this.summary.set(data);
        this.loading.set(false);
        setTimeout(() => this.renderCharts(), 50);
      },
      error: () => this.loading.set(false)
    });
  }

  renderCharts(): void {
    const s = this.summary();
    if (!s) return;

    this.trendChart?.destroy();
    this.profitChart?.destroy();

    if (this.trendChartRef?.nativeElement) {
      this.trendChart = new Chart(this.trendChartRef.nativeElement, {
        type: 'bar',
        data: {
          labels: s.financialTrend.map(t => t.label),
          datasets: [
            { label: 'Returns (Income)', data: s.financialTrend.map(t => t.returns), backgroundColor: '#22c55e' },
            { label: 'Spend (Expense)', data: s.financialTrend.map(t => t.spend), backgroundColor: '#ef4444' },
            { label: 'Net Profit', data: s.financialTrend.map(t => t.profit), backgroundColor: '#3b82f6' }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: '#64748b' } } },
          scales: {
            x: { ticks: { color: '#64748b' }, grid: { color: '#e2e8f0' } },
            y: { ticks: { color: '#64748b' }, grid: { color: '#e2e8f0' } }
          }
        }
      });
    }

    if (this.profitChartRef?.nativeElement && s.profitDistribution.length) {
      const colors = ['#7c3aed', '#3b82f6', '#22c55e', '#eab308', '#ef4444'];
      this.profitChart = new Chart(this.profitChartRef.nativeElement, {
        type: 'doughnut',
        data: {
          labels: s.profitDistribution.map(p => p.label),
          datasets: [{
            data: s.profitDistribution.map(p => p.value),
            backgroundColor: colors.slice(0, s.profitDistribution.length)
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: '#64748b' } } }
        }
      });
    }
  }
}
