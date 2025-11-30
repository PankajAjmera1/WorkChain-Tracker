import { Component, Input, OnInit, OnChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { CategoryStats } from '../../core/models/tracker.model';

@Component({
  selector: 'app-activity-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-container">
      @if (chartData && chartData.datasets[0].data.length > 0) {
        <canvas baseChart
          [data]="chartData"
          [options]="chartOptions"
          [type]="chartType">
        </canvas>
      } @else {
        <p class="no-data">No activity data yet. Start tracking to see your breakdown!</p>
      }
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .no-data {
      color: var(--md-sys-color-on-surface-variant);
      text-align: center;
      font-size: 14px;
    }

    canvas {
      max-height: 280px;
    }
  `]
})
export class ActivityChartComponent implements OnInit, OnChanges {
  @Input() stats: CategoryStats[] = [];
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartType = 'doughnut' as const;
  chartData?: ChartData<'doughnut'>;
  chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'var(--md-sys-color-on-surface)',
          font: {
            family: 'Inter, system-ui, sans-serif',
            size: 12
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed || 0;
            const hours = Math.floor(value / 60);
            const mins = Math.floor(value % 60);
            const timeStr = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
            return `${label}: ${timeStr}`;
          }
        }
      }
    },
    cutout: '65%'
  };

  ngOnInit() {
    this.updateChart();
  }

  ngOnChanges() {
    this.updateChart();
  }

  private updateChart() {
    if (!this.stats || this.stats.length === 0) {
      this.chartData = {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderWidth: 0
        }]
      };
      return;
    }

    this.chartData = {
      labels: this.stats.map(s => s.category.charAt(0).toUpperCase() + s.category.slice(1)),
      datasets: [{
        data: this.stats.map(s => s.minutes),
        backgroundColor: this.stats.map(s => s.color),
        borderWidth: 2,
        borderColor: '#fff',
        hoverOffset: 10,
        hoverBorderWidth: 3
      }]
    };

    // Update chart if it exists
    if (this.chart) {
      this.chart.update();
    }
  }
}
