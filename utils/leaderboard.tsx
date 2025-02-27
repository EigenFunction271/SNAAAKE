export interface LeaderboardEntry {
  playerName: string;
  score: number;
  date: string;
  aiCount: number;
  gameTime: number;
}

export class LeaderboardManager {
  private static readonly STORAGE_KEY = 'snakeGameLeaderboard';
  private static readonly MAX_ENTRIES = 10;

  static getLeaderboard(): LeaderboardEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to read leaderboard:', error);
      return [];
    }
  }

  static addEntry(entry: LeaderboardEntry): void {
    try {
      const leaderboard = this.getLeaderboard();
      leaderboard.push(entry);
      
      // Sort by score (descending) and limit to top 10
      leaderboard.sort((a, b) => b.score - a.score);
      const topEntries = leaderboard.slice(0, this.MAX_ENTRIES);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(topEntries));
    } catch (error) {
      console.error('Failed to save leaderboard:', error);
    }
  }

  static isHighScore(score: number): boolean {
    const leaderboard = this.getLeaderboard();
    return leaderboard.length < this.MAX_ENTRIES || score > leaderboard[leaderboard.length - 1].score;
  }

  static clearLeaderboard(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear leaderboard:', error);
    }
  }
} 
} 