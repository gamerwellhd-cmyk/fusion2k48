import { BlockData, BlockValue, SpecialType } from '../types';
import { COLS, ROWS } from '../constants';
import { specials } from '../systems/powerups';

export const generateRandomValue = (): BlockValue => {
  const rand = Math.random();
  
  // 10% chance for a special powerup with balanced frequencies
  if (rand < 0.10) {
    const r = Math.random();
    if (r < 0.15) return 'bomb';     // 1.5% total (High impact, low frequency)
    if (r < 0.35) return 'teleport'; // 2.0% total (Tactical)
    if (r < 0.65) return 'freeze';   // 3.0% total (Strategic)
    return 'double';                 // 3.5% total (Scoring)
  }
  
  // Weights for values: 2, 4, 8, 16, 32, 64
  const weights = [0.4, 0.3, 0.15, 0.08, 0.05, 0.02];
  const values = [2, 4, 8, 16, 32, 64];
  
  let cumulative = 0;
  const r = Math.random();
  for (let i = 0; i < weights.length; i++) {
    cumulative += weights[i];
    if (r < cumulative) return values[i];
  }
  return 2;
};

export const getBlockColor = (value: BlockValue): string => {
  if (value === 'TNT') return 'bg-red-600 text-white';
  
  if (typeof value === 'string' && value in specials) {
    const special = specials[value as SpecialType];
    return `bg-gradient-to-br ${special.color} text-white`;
  }
  
  const colors: Record<number, string> = {
    2: 'bg-petrol-100 text-petrol-900',
    4: 'bg-petrol-200 text-petrol-900',
    8: 'bg-petrol-300 text-petrol-950',
    16: 'bg-petrol-400 text-white',
    32: 'bg-petrol-500 text-white',
    64: 'bg-petrol-600 text-white',
    128: 'bg-petrol-700 text-white',
    256: 'bg-petrol-800 text-white',
    512: 'bg-petrol-900 text-white',
    1024: 'bg-petrol-950 text-white',
    2048: 'bg-teal-500 text-white',
    4096: 'bg-cyan-600 text-white',
    8192: 'bg-blue-700 text-white',
  };
  
  return colors[value as number] || 'bg-petrol-900 text-white';
};

export const createInitialGrid = (): (BlockData | null)[][] => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
};
