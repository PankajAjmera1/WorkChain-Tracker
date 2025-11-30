import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { LeaderboardComponent } from './features/leaderboard/leaderboard';
import { ProfileComponent } from './features/profile/profile';
import { AchievementsComponent } from './features/achievements/achievements';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    DashboardComponent,
    LeaderboardComponent,
    ProfileComponent,
    AchievementsComponent
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
  title = 'WorkChain Dashboard';
  currentPage = 'dashboard';

  navigateTo(page: string) {
    this.currentPage = page;
  }
}
