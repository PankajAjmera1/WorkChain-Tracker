import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stats-card',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="stats-card glass-card fade-in" [class]="'color-' + color">
      <mat-card-content>
        <div class="stats-icon" [class]="'color-' + color">
          <mat-icon>{{ icon }}</mat-icon>
        </div>
        <div class="stats-content">
          <p class="stats-title">{{ title }}</p>
          <h2 class="stats-value">{{ value }}</h2>
          @if (trend !== undefined) {
            <p class="stats-trend" [class.positive]="trend > 0" [class.negative]="trend < 0">
              <mat-icon>{{ trend > 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
              {{ Math.abs(trend) }}% vs yesterday
            </p>
          }
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    :host {
      display: block;
    }

    .stats-card {
      border-radius: 16px !important;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      cursor: pointer;
      background: #ffffff;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
      border: 1px solid #e0e0e0;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.1) !important;
      }

      // Dark Theme Support
      @media (prefers-color-scheme: dark) {
         background: #1e1e1e;
         border-color: #333;
         box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      }
    }

    // Host context for manual theme switching
    :host-context([data-theme="dark"]) .stats-card {
        background: #1e1e1e;
        border-color: #333;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    mat-card-content {
      padding: 24px !important;
      display: flex;
      align-items: flex-start;
      gap: 16px;
    }

    .stats-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      
      mat-icon {
        font-size: 24px;
        width: 24px;
        height: 24px;
      }

      // Color variants
      &.color-primary { background: #eaddff; color: #21005d; }
      &.color-accent { background: #f9dedc; color: #410e0b; }
      &.color-info { background: #cce5ff; color: #004085; }
      &.color-success { background: #e8f5e9; color: #1b5e20; }
      &.color-warn { background: #fbe9e7; color: #bf360c; }
    }

    :host-context([data-theme="dark"]) .stats-icon {
        &.color-primary { background: #4f378b; color: #eaddff; }
        &.color-accent { background: #8c1d18; color: #f9dedc; }
        &.color-info { background: #003366; color: #cce5ff; }
        &.color-success { background: #1b5e20; color: #e8f5e9; }
        &.color-warn { background: #8c1d18; color: #ffdad6; }
    }

    .stats-content {
      flex: 1;

      .stats-title {
        color: #49454f;
        font-size: 12px;
        font-weight: 500;
        margin: 0 0 4px 0;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .stats-value {
        color: #1c1b1f;
        font-size: 24px;
        font-weight: 600;
        margin: 0;
        line-height: 1.2;
      }

      .stats-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 12px;
        font-weight: 500;
        margin-top: 4px;

        &.positive { color: #1b5e20; }
        &.negative { color: #b3261e; }

        mat-icon {
          font-size: 14px;
          width: 14px;
          height: 14px;
        }
      }
    }

    :host-context([data-theme="dark"]) .stats-content {
        .stats-title { color: #cac4d0; }
        .stats-value { color: #e6e1e5; }
        .stats-trend.positive { color: #a5d6a7; }
        .stats-trend.negative { color: #f2b8b5; }
    }
  `]
})
export class StatsCardComponent {
  @Input() title!: string;
  @Input() value!: string;
  @Input() icon!: string;
  @Input() color: 'primary' | 'accent' | 'success' | 'info' | 'warn' = 'primary';
  @Input() trend?: number;

  Math = Math;
}
