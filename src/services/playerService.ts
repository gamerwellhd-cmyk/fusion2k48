/**
 * Player Service
 * Manages player profile, coins, and restart tokens
 * Syncs with Firebase for cloud storage
 */

import { LeaderboardEntry } from '../types';
import * as firebase from './firebase';

export interface PlayerProfile {
  username: string;
  totalCoins: number; // "Café" coins
  restartTokens: number; // Restart tokens available
  totalScore: number; // All-time high score
  gamesPlayed: number;
  lastPlayed: string;
}

const PLAYER_DATA_KEY = '2048_fusion_player';
const DEFAULT_PLAYER_DATA: PlayerProfile = {
  username: '',
  totalCoins: 50, // Starting coins
  restartTokens: 3, // Starting restart tokens
  totalScore: 0,
  gamesPlayed: 0,
  lastPlayed: new Date().toISOString(),
};

const getStorageKey = (username: string): string => {
  const userId = firebase.getCurrentUserId();

  // Prefer UID to bind profile data to authenticated account.
  if (userId) {
    return `${PLAYER_DATA_KEY}_${userId}`;
  }

  // Legacy fallback when user is not authenticated.
  return `${PLAYER_DATA_KEY}_${username}`;
};

export const playerService = {
  /**
   * Get or create player profile
   */
  getPlayerProfile: (username: string): PlayerProfile => {
    const storageKey = getStorageKey(username);
    const stored = localStorage.getItem(storageKey);
    
    // Try to sync from Firebase
    const userId = firebase.getCurrentUserId();
    if (userId) {
      firebase.getPlayerFromFirebase(userId).then(firebaseData => {
        if (firebaseData) {
          localStorage.setItem(storageKey, JSON.stringify(firebaseData));
        }
      });
    }

    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return { ...DEFAULT_PLAYER_DATA, username };
      }
    }

    const newPlayer = { ...DEFAULT_PLAYER_DATA, username };
    playerService.savePlayerProfile(newPlayer);
    return newPlayer;
  },

  /**
   * Save player profile
   */
  savePlayerProfile: (profile: PlayerProfile): void => {
    const storageKey = getStorageKey(profile.username);
    localStorage.setItem(storageKey, JSON.stringify(profile));
    
    // Sync to Firebase
    const userId = firebase.getCurrentUserId();
    if (userId) {
      firebase.savePlayerToFirebase(profile.username, profile).catch(err => {
        console.error('Failed to sync to Firebase:', err);
      });
    }
  },

  /**
   * Add coins to player
   */
  addCoins: (username: string, amount: number): PlayerProfile => {
    const profile = playerService.getPlayerProfile(username);
    profile.totalCoins = Math.max(0, profile.totalCoins + amount);
    playerService.savePlayerProfile(profile);
    return profile;
  },

  /**
   * Spend coins (returns true if successful)
   */
  spendCoins: (username: string, amount: number): boolean => {
    const profile = playerService.getPlayerProfile(username);

    if (profile.totalCoins < amount) {
      return false;
    }

    profile.totalCoins -= amount;
    playerService.savePlayerProfile(profile);
    return true;
  },

  /**
   * Add restart token
   */
  addRestartToken: (username: string, amount: number = 1): PlayerProfile => {
    const profile = playerService.getPlayerProfile(username);
    profile.restartTokens += amount;
    playerService.savePlayerProfile(profile);
    return profile;
  },

  /**
   * Use restart token (returns true if successful)
   */
  useRestartToken: (username: string): boolean => {
    const profile = playerService.getPlayerProfile(username);

    if (profile.restartTokens <= 0) {
      return false;
    }

    profile.restartTokens -= 1;
    playerService.savePlayerProfile(profile);
    return true;
  },

  /**
   * Buy restart tokens using coins
   * Cost: 25 coins per token
   */
  buyRestartTokens: (username: string, quantity: number = 1): boolean => {
    const costPerToken = 25;
    const totalCost = costPerToken * quantity;

    if (!playerService.spendCoins(username, totalCost)) {
      return false;
    }

    const profile = playerService.getPlayerProfile(username);
    profile.restartTokens += quantity;
    playerService.savePlayerProfile(profile);
    return true;
  },

  /**
   * Update game stats after score
   */
  updateGameStats: (username: string, score: number): PlayerProfile => {
    const profile = playerService.getPlayerProfile(username);
    profile.totalScore = Math.max(profile.totalScore, score);
    profile.gamesPlayed += 1;
    profile.lastPlayed = new Date().toISOString();

    // Award coins based on score
    const coinsEarned = Math.floor(score / 100);
    profile.totalCoins += coinsEarned;

    playerService.savePlayerProfile(profile);
    return profile;
  },

  /**
   * Get all connected players (for demo)
   */
  getAllPlayers: (): PlayerProfile[] => {
    const allKeys = Object.keys(localStorage).filter(k => k.startsWith(PLAYER_DATA_KEY));
    return allKeys
      .map(key => {
        try {
          return JSON.parse(localStorage.getItem(key) || '{}') as PlayerProfile;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as PlayerProfile[];
  },
};
