import { useState, useEffect, useCallback } from 'react';
import { BlockData, BlockValue, GameState } from '../types';
import { COLS, ROWS, MERGE_SPEED, ANIMATION_SPEED, EXPLOSION_SPEED, SCORE_PER_TNT_BLOCK, ANALYSIS_DELAY } from '../constants';
import { generateRandomValue, createInitialGrid } from '../utils/gameLogic';
import { leaderboardService } from '../services/leaderboardService';
import { playerService } from '../services/playerService';

export const useGameLogic = (username?: string) => {
  const [grid, setGrid] = useState<(BlockData | null)[][]>(createInitialGrid());
  const [dockBlock, setDockBlock] = useState<BlockValue>(generateRandomValue());
  const [nextBlock, setNextBlock] = useState<BlockValue>(generateRandomValue());
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [isProcessing, setIsProcessing] = useState(false);
  const [teleportDirection, setTeleportDirection] = useState<'left' | 'right'>('left');
  const [coins, setCoins] = useState(0);
  const [restartTokens, setRestartTokens] = useState(0);

  // Load high score and player profile
  useEffect(() => {
    const saved = localStorage.getItem('2048-fusion-highscore');
    if (saved) setHighScore(parseInt(saved));

    if (username) {
      const profile = playerService.getPlayerProfile(username);
      setCoins(profile.totalCoins);
      setRestartTokens(profile.restartTokens);
      setHighScore(profile.totalScore);
    }
  }, [username]);

  // Save high score
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('2048-fusion-highscore', score.toString());
    }
  }, [score, highScore]);

  const toggleTeleportDirection = useCallback(() => {
    setTeleportDirection(prev => prev === 'left' ? 'right' : 'left');
  }, []);

  const checkGameOver = useCallback((currentGrid: (BlockData | null)[][]) => {
    return currentGrid[ROWS - 1].every(cell => cell !== null);
  }, []);

  const processMerges = useCallback(async (currentGrid: (BlockData | null)[][]) => {
    let tempGrid = JSON.parse(JSON.stringify(currentGrid));
    let hasMoreMerges = true;
    
    // Ensure the block has settled visually before starting merges
    await new Promise(resolve => setTimeout(resolve, ANALYSIS_DELAY));

    while (hasMoreMerges) {
      hasMoreMerges = false;
      let bestMerge: { r: number, c: number, neighbors: { r: number, c: number }[], score: number } | null = null;

      // Find the best possible merge in the entire grid
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const block = tempGrid[r][c];
          if (!block || block.value === 'TNT' || block.isMerging || block.isFrozen) continue;

          const neighbors: { r: number, c: number }[] = [];
          const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

          for (const [dr, dc] of directions) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
              const neighbor = tempGrid[nr][nc];
              if (neighbor && neighbor.value === block.value && !neighbor.isMerging && !neighbor.isFrozen) {
                neighbors.push({ r: nr, c: nc });
              }
            }
          }

          if (neighbors.length > 0) {
            const multiplier = Math.pow(2, neighbors.length);
            const mergeScore = (block.value as number) * multiplier;
            
            if (!bestMerge || mergeScore > bestMerge.score) {
              bestMerge = { r, c, neighbors, score: mergeScore };
            } else if (mergeScore === bestMerge.score) {
              // Tie-breaker: prioritize lower row (higher index) then left-most column
              if (r > bestMerge.r || (r === bestMerge.r && c < bestMerge.c)) {
                bestMerge = { r, c, neighbors, score: mergeScore };
              }
            }
          }
        }
      }

      if (bestMerge) {
        hasMoreMerges = true;
        const { r, c, neighbors, score: mergeScore } = bestMerge;
        
        // Stage 1: Mark all blocks involved in the merge
        tempGrid[r][c] = { ...tempGrid[r][c]!, isMerging: true };
        for (const n of neighbors) {
          tempGrid[n.r][n.c] = { ...tempGrid[n.r][n.c]!, isMerging: true };
        }
        setGrid([...tempGrid]);
        
        // Wait for the "pulse" animation
        await new Promise(resolve => setTimeout(resolve, MERGE_SPEED));

        // Stage 2: Execute the merge (update target, remove neighbors)
        const block = tempGrid[r][c];
        tempGrid[r][c] = {
          ...block,
          value: mergeScore,
          isMerging: true 
        };

        for (const n of neighbors) {
          tempGrid[n.r][n.c] = null;
        }

        setGrid([...tempGrid]);
        setScore(s => s + mergeScore);
        
        // Wait a bit for the new block to be seen
        await new Promise(resolve => setTimeout(resolve, 50));

        // Apply gravity after each merge to allow cascading
        let gravityOccurred = false;
        for (let col = 0; col < COLS; col++) {
          let writeRow = 0;
          for (let row = 0; row < ROWS; row++) {
            if (tempGrid[row][col] !== null) {
              if (row !== writeRow) {
                tempGrid[writeRow][col] = { ...tempGrid[row][col], row: writeRow };
                tempGrid[row][col] = null;
                gravityOccurred = true;
              }
              writeRow++;
            }
          }
        }
        
        if (gravityOccurred) {
          setGrid([...tempGrid]);
          // Small delay for gravity animation to finish
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Reset merging flags for the next iteration of the cascade
        tempGrid = tempGrid.map((row: any) => row.map((b: any) => b ? { ...b, isMerging: false } : null));
      }
    }

    setGrid(tempGrid);
    
    if (checkGameOver(tempGrid)) {
      setGameState('GAME_OVER');
      if (username) {
        leaderboardService.saveScore(username, score);
        const updatedProfile = playerService.updateGameStats(username, score);
        setCoins(updatedProfile.totalCoins);
        setRestartTokens(updatedProfile.restartTokens);
      }
    }
    
    setIsProcessing(false);
  }, [checkGameOver]);

  const handleLaunch = async (col: number) => {
    if (gameState !== 'PLAYING' || isProcessing) return;

    let targetRow = -1;
    for (let r = 0; r < ROWS; r++) {
      if (grid[r][col] === null) {
        targetRow = r;
        break;
      }
    }

    if (targetRow === -1) return;

    setIsProcessing(true);
    
    const newBlock: BlockData = {
      id: Math.random().toString(36).substr(2, 9),
      value: dockBlock,
      row: targetRow,
      col: col,
      isNew: true
    };

    const newGrid = grid.map(row => [...row]);
    newGrid[targetRow][col] = newBlock;
    setGrid(newGrid);
    
    setDockBlock(nextBlock);
    setNextBlock(generateRandomValue());

    await new Promise(resolve => setTimeout(resolve, ANIMATION_SPEED));
    
    // Decrement frozen status for all blocks every turn
    const updatedGrid = newGrid.map(row => row.map(block => {
      if (block && block.isFrozen) {
        return { ...block, isFrozen: block.isFrozen - 1 };
      }
      return block;
    }));

    if (newBlock.value === 'TNT' || newBlock.value === 'bomb') {
      const explodingGrid = updatedGrid.map(row => [...row]);
      explodingGrid[targetRow][col] = { ...newBlock, isExploding: true };
      setGrid(explodingGrid);
      
      await new Promise(resolve => setTimeout(resolve, EXPLOSION_SPEED));
      
      const finalGrid = explodingGrid.map(row => [...row]);
      const startR = Math.max(0, targetRow - 1);
      const endR = Math.min(ROWS - 1, targetRow + 1);
      const startC = Math.max(0, col - 1);
      const endC = Math.min(COLS - 1, col + 1);
      
      let blocksCleared = 0;
      for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
          if (finalGrid[r][c] !== null) {
            blocksCleared++;
            finalGrid[r][c] = null;
          }
        }
      }
      
      applyGravity(finalGrid);
      setGrid(finalGrid);
      setScore(s => s + (blocksCleared * SCORE_PER_TNT_BLOCK));
      setIsProcessing(false);
      
      if (checkGameOver(finalGrid)) {
        setGameState('GAME_OVER');
        if (username) {
          leaderboardService.saveScore(username, score);
          const updatedProfile = playerService.updateGameStats(username, score);
          setCoins(updatedProfile.totalCoins);
          setRestartTokens(updatedProfile.restartTokens);
        }
      }
      return;
    }

    if (newBlock.value === 'freeze') {
      const finalGrid = updatedGrid.map(row => [...row]);
      const startR = Math.max(0, targetRow - 1);
      const endR = Math.min(ROWS - 1, targetRow + 1);
      const startC = Math.max(0, col - 1);
      const endC = Math.min(COLS - 1, col + 1);

      for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
          if (finalGrid[r][c] && finalGrid[r][c]?.id !== newBlock.id) {
            finalGrid[r][c] = { ...finalGrid[r][c]!, isFrozen: 3 };
          }
        }
      }
      // Remove the freeze block itself
      finalGrid[targetRow][col] = null;
      applyGravity(finalGrid);
      setGrid(finalGrid);
      setIsProcessing(false);
      return;
    }

    if (newBlock.value === 'double') {
      const finalGrid = updatedGrid.map(row => [...row]);
      const startR = Math.max(0, targetRow - 1);
      const endR = Math.min(ROWS - 1, targetRow + 1);
      const startC = Math.max(0, col - 1);
      const endC = Math.min(COLS - 1, col + 1);

      for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
          const target = finalGrid[r][c];
          if (target && typeof target.value === 'number' && target.id !== newBlock.id) {
            finalGrid[r][c] = { ...target, value: (target.value as number) * 2 };
          }
        }
      }
      // Remove the double block itself
      finalGrid[targetRow][col] = null;
      applyGravity(finalGrid);
      setGrid(finalGrid);
      setIsProcessing(false);
      return;
    }

    if (newBlock.value === 'teleport') {
      const finalGrid = updatedGrid.map(row => [...row]);
      const startR = Math.max(0, targetRow - 1);
      const endR = Math.min(ROWS - 1, targetRow + 1);
      const startC = Math.max(0, col - 1);
      const endC = Math.min(COLS - 1, col + 1);

      const blocksToTeleport: BlockData[] = [];
      for (let r = startR; r <= endR; r++) {
        for (let c = startC; c <= endC; c++) {
          if (finalGrid[r][c] && finalGrid[r][c]?.id !== newBlock.id) {
            blocksToTeleport.push({ ...finalGrid[r][c]! });
            finalGrid[r][c] = null;
          }
        }
      }
      // Remove the teleport block itself
      finalGrid[targetRow][col] = null;

      // Re-insert blocks in chosen direction
      for (const block of blocksToTeleport) {
        let inserted = false;
        const columnsToTry = teleportDirection === 'left' 
          ? Array.from({ length: COLS }, (_, i) => i) 
          : Array.from({ length: COLS }, (_, i) => COLS - 1 - i);

        for (const c of columnsToTry) {
          for (let r = 0; r < ROWS; r++) {
            if (finalGrid[r][c] === null) {
              finalGrid[r][c] = { ...block, row: r, col: c };
              inserted = true;
              break;
            }
          }
          if (inserted) break;
        }
      }

      applyGravity(finalGrid);
      setGrid(finalGrid);
      setIsProcessing(false);
      return;
    }

    processMerges(updatedGrid);
  };

  const applyGravity = (tempGrid: (BlockData | null)[][]) => {
    for (let c = 0; c < COLS; c++) {
      let writeRow = 0;
      for (let r = 0; r < ROWS; r++) {
        if (tempGrid[r][c] !== null) {
          if (r !== writeRow) {
            tempGrid[writeRow][c] = { ...tempGrid[r][c]!, row: writeRow };
            tempGrid[r][c] = null;
          }
          writeRow++;
        }
      }
    }
  };

  const restartGame = () => {
    setGrid(createInitialGrid());
    setScore(0);
    setGameState('PLAYING');
    setDockBlock(generateRandomValue());
    setNextBlock(generateRandomValue());
    setIsProcessing(false);
  };

  const useRestartToken = (): boolean => {
    if (!username || restartTokens <= 0) return false;

    if (playerService.useRestartToken(username)) {
      setRestartTokens(prev => prev - 1);
      restartGame();
      return true;
    }
    return false;
  };

  const getUpdatedPlayerProfile = () => {
    if (!username) return null;
    return playerService.getPlayerProfile(username);
  };

  return {
    grid,
    dockBlock,
    nextBlock,
    score,
    highScore,
    gameState,
    isProcessing,
    teleportDirection,
    coins,
    restartTokens,
    toggleTeleportDirection,
    handleLaunch,
    restartGame,
    useRestartToken,
    getUpdatedPlayerProfile
  };
};
