import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="profile-container">
      <h1>👤 Profile - Coming Soon!</h1>
      <p>Your personal stats and achievements will appear here.</p>
    </div>
  `,
  styles: [`
    .profile-container {
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
export class ProfileComponent { }
