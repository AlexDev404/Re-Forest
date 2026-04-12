import { api } from './client';

export interface LeaderboardEntry {
  Id: number;
  FirstName: string | null;
  LastName: string | null;
  CreatedAt: string | null;
  treesPlanted: number;
  achievementCount: number;
}

export const leaderboardAdapter = {
  getLeaderboard() {
    return api.get<{ leaderboard: LeaderboardEntry[] }>('/leaderboard');
  }
};
