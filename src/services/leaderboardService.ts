import { LeaderboardEntry } from '../types';
import * as firebase from './firebase';

const LEADERBOARD_KEY = '2048_fusion_leaderboard';
let cachedScores: LeaderboardEntry[] = [];
let leaderboardUnsubscribe: (() => void) | null = null;

/**
 * Initialize real-time leaderboard sync
 */
const initializeLeaderboardSync = () => {
  if (leaderboardUnsubscribe) return;
  
  leaderboardUnsubscribe = firebase.listenToLeaderboardUpdates((scores: any[]) => {
    cachedScores = scores
      .map((score: any) => ({
        username: score.username,
        score: score.score,
        date: score.timestamp
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(cachedScores));
  });
};

export const leaderboardService = {
  /**
   * Get cached scores (synced from Firebase)
   */
  getScores: (): LeaderboardEntry[] => {
    // Try Firebase first (cloud)
    initializeLeaderboardSync();
    
    if (cachedScores.length > 0) {
      return cachedScores;
    }
    
    // Fallback to localStorage
    const scores = localStorage.getItem(LEADERBOARD_KEY);
    if (!scores) return [];
    try {
      return JSON.parse(scores).sort((a: LeaderboardEntry, b: LeaderboardEntry) => b.score - a.score);
    } catch {
      return [];
    }
  },

  /**
   * Save score to Firebase and localStorage
   */
  saveScore: (username: string, score: number) => {
    const newEntry: LeaderboardEntry = {
      username,
      score,
      date: new Date().toISOString()
    };
    
    // Save to Firebase
    firebase.saveScoreToLeaderboard(username, score).catch(err => {
      console.error('Failed to save score to Firebase:', err);
    });
    
    // Also save to localStorage
    const localScores = leaderboardService.getScores();
    const updatedScores = [...localScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 100);
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(updatedScores));
  },

  /**
   * Get top scores (cloud)
   */
  getTopScoresCloud: async (): Promise<LeaderboardEntry[]> => {
    try {
      const scores = await firebase.getTopScores(100);
      return scores.map((score: any) => ({
        username: score.username,
        score: score.score,
        date: score.timestamp
      }));
    } catch (error) {
      console.error('Failed to get top scores from cloud:', error);
      return leaderboardService.getScores();
    }
  }
};
