import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-achievements',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="achievements-container">
      <h1>🏅 Achievements - Coming Soon!</h1>
      <p>Your badges and milestones will appear here.</p>
    </div>
  `,
  styles: [`
    .achievements-container {
      padding: 3rem;
      text-align: center;
      color: #F1F5F9;
      
      h1 {
        font-size: 3rem;
        margin-bottom: 1rem;
      }
      
      p {
        font-size: 1.2rem;
        color: #94A3B8;
      }
    }
  `]
})
export class AchievementsComponent { }
