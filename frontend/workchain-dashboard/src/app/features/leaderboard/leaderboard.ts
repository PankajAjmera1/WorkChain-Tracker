import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LeaderboardUser {
  address: string;
  hours: number;
  score: number;
  badges: string[];
}

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './leaderboard.html',
  styleUrls: ['./leaderboard.scss']
})
export class LeaderboardComponent implements OnInit {
  currentTimeframe: 'all' | 'month' | 'week' | 'today' = 'all';

  leaderboardData: LeaderboardUser[] = [
    {
      address: '0x2b5e...3d4f',
      hours: 987,
      score: 88654,
      badges: ['💎', '⭐', '🌱']
    },
    {
      address: '0x9f3a...7c2b',
      hours: 876,
      score: 82341,
      badges: ['⭐', '🌱']
    },
    {
      address: '0x5d8c...1a9e',
      hours: 765,
      score: 76892,
      badges: ['💻', '🌱']
    },
    {
      address: '0x3e7b...4f6d',
      hours: 654,
      score: 71234,
      badges: ['🌱']
    },
    {
      address: '0x8a1c...9b3e',
      hours: 543,
      score: 65789,
      badges: ['💻', '⭐']
    },
    {
      address: '0x6c4d...2e8f',
      hours: 432,
      score: 60123,
      badges: ['🔥', '🌱']
    },
    {
      address: '0x1f9e...7a5c',
      hours: 321,
      score: 54567,
      badges: ['⭐']
    },
    {
      address: '0x4b2a...8d6f',
      hours: 210,
      score: 48901,
      badges: ['🌱']
    }
  ];

  ngOnInit() {
    console.log('Leaderboard loaded');
  }

  changeTimeframe(timeframe: 'all' | 'month' | 'week' | 'today') {
    this.currentTimeframe = timeframe;
    // TODO: Fetch filtered data from blockchain
    console.log('Timeframe changed to:', timeframe);
  }
}
