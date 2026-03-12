import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import SplashScreen from './components/SplashScreen';
import Leaderboard from './components/Leaderboard';
import { GameState } from './types';
import { useFirebaseInit } from './hooks/useFirebaseInit';

export default function App() {
  const { isInitialized, error } = useFirebaseInit();
  const [gameState, setGameState] = useState<GameState>('SPLASH');
  const [username, setUsername] = useState('');

  const handleStartGame = (name: string) => {
    setUsername(name);
    setGameState('PLAYING');
  };

  const handleViewLeaderboard = () => {
    setGameState('LEADERBOARD');
  };

  const handleBackToMenu = () => {
    setGameState('SPLASH');
  };

  useEffect(() => {
    if (error) {
      console.warn('Firebase sync disabled:', error);
    }
  }, [error]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-petrol-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 bg-petrol-600 rounded-[20px] animate-pulse mx-auto mb-4"></div>
          <p className="text-petrol-300 font-mono text-xs uppercase tracking-widest">Inicializando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-petrol-950">
      {gameState === 'SPLASH' && (
        <SplashScreen onStart={handleStartGame} onViewLeaderboard={handleViewLeaderboard} />
      )}
      
      {gameState === 'PLAYING' && (
        <GameBoard username={username} onBackToMenu={handleBackToMenu} />
      )}

      {gameState === 'LEADERBOARD' && (
        <Leaderboard onBack={handleBackToMenu} />
      )}
    </div>
  );
}
