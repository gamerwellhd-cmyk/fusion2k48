import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronUp } from 'lucide-react';
import { COLS, ROWS } from '../constants';
import { useGameLogic } from '../hooks/useGameLogic';
import Block from './Block';
import LaunchDock from './LaunchDock';
import GameOverOverlay from './GameOverOverlay';
import { GameHeader } from './GameHeader';
import { RestartShop } from './RestartShop';

interface GameBoardProps {
  username: string;
  onBackToMenu: () => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ username, onBackToMenu }) => {
  const {
    grid,
    dockBlock,
    nextBlock,
    score,
    highScore,
    gameState,
    isProcessing,
    teleportDirection,
    toggleTeleportDirection,
    handleLaunch,
    restartGame,
    coins,
    restartTokens,
    useRestartToken,
  } = useGameLogic(username);

  const [hoveredCol, setHoveredCol] = React.useState<number | null>(null);
  const [isShopOpen, setIsShopOpen] = useState(false);

  const handleRestartShopClick = () => {
    setIsShopOpen(true);
  };

  const handlePurchase = (tokens: number) => {
    // Shop will automatically update player profile
    // We just need to let the shop modal handle it
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-petrol-950 text-zinc-100 font-sans overflow-hidden">
      {/* Header */}
      <GameHeader 
        username={username}
        highScore={highScore}
        coins={coins}
        restartTokens={restartTokens}
        connectedPlayers={1}
        onShopClick={handleRestartShopClick}
      />

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-between px-2 sm:px-4 py-4 overflow-y-auto">
        {/* Game Area Container */}
        <div className="relative flex flex-col gap-2">
          <motion.div
            key={score}
            initial={{ opacity: 0.7, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-1 pb-1"
          >
            <div>
              <p className="text-[10px] uppercase tracking-widest text-petrol-400 font-mono">Pontuacao atual</p>
              <p className="text-2xl sm:text-3xl font-black text-white leading-none">{score.toLocaleString()}</p>
            </div>
          </motion.div>

          {/* Main Grid Area */}
          <div className="relative bg-petrol-950 p-1.5 rounded-[32px] border-4 border-petrol-900 shadow-2xl flex-shrink min-h-0">
            {/* Grid Background */}
            <div 
              className="grid gap-1 sm:gap-1.5"
              style={{ 
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                width: 'min(85vw, 350px)',
                height: 'min(120vw, 60vh, 560px)'
              }}
            >
              {Array.from({ length: ROWS * COLS }).map((_, i) => (
                <div key={i} className="bg-petrol-900/20 rounded-[16px] border border-petrol-900/30" />
              ))}
            </div>

            {/* Blocks Layer */}
            <div className="absolute inset-1.5 pointer-events-none">
              <div 
                className="grid gap-1 sm:gap-1.5 h-full w-full"
                style={{ 
                  gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${ROWS}, 1fr)`
                }}
              >
                <AnimatePresence>
                  {grid.flat().map((block) => block && (
                    <Block key={block.id} block={block} />
                  ))}
                </AnimatePresence>
              </div>
            </div>

            {/* Game Over Overlay */}
            {gameState === 'GAME_OVER' && (
              <GameOverOverlay 
                score={score} 
                onRestart={() => {
                  if (useRestartToken()) {
                    // Token was used and game restarted
                  } else {
                    // No tokens, go back to menu
                    onBackToMenu();
                  }
                }} 
                onBackToMenu={onBackToMenu} 
              />
            )}
          </div>

          {/* Launch Pad (The Dock) */}
          <div className="relative bg-petrol-900/40 p-1.5 rounded-[24px] border-2 border-petrol-800/50 shadow-inner">
            <div 
              className="grid gap-1 sm:gap-1.5"
              style={{ 
                gridTemplateColumns: `repeat(${COLS}, 1fr)`,
                width: 'min(85vw, 350px)',
                height: '50px'
              }}
            >
              {Array.from({ length: COLS }).map((_, c) => (
                <div 
                  key={c} 
                  className={`
                    relative flex items-center justify-center rounded-[16px] border transition-all duration-200
                    ${hoveredCol === c ? 'bg-white/10 border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]' : 'bg-black/20 border-white/5'}
                  `}
                >
                  <AnimatePresence>
                    {hoveredCol === c && (
                      <motion.div
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -10, opacity: 0 }}
                        className="text-white/60"
                      >
                        <ChevronUp size={24} className="animate-bounce" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Interaction Layer (Only on Dock) */}
            <div className="absolute inset-1.5 grid grid-cols-5 gap-1 sm:gap-1.5">
              {Array.from({ length: COLS }).map((_, c) => (
                <button
                  key={c}
                  onClick={() => handleLaunch(c)}
                  onMouseEnter={() => setHoveredCol(c)}
                  onMouseLeave={() => setHoveredCol(null)}
                  className="w-full h-full cursor-pointer z-20"
                  disabled={gameState !== 'PLAYING' || isProcessing}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center w-full mb-4">
          <LaunchDock 
            dockBlock={dockBlock} 
            nextBlock={nextBlock} 
            onRestart={restartGame} 
            teleportDirection={teleportDirection}
            onToggleTeleportDirection={toggleTeleportDirection}
          />

          {/* Instructions */}
          <div className="mt-2 sm:mt-4 text-center max-w-xs pb-2">
            <p className="text-petrol-400 text-[10px] uppercase font-bold tracking-widest leading-relaxed">
              Tap a column to launch. Merge same numbers to reach 2048!
            </p>
          </div>
        </div>
      </div>

      {/* Restart Shop Modal */}
      <RestartShop 
        username={username}
        coins={coins}
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        onPurchase={handlePurchase}
      />
    </div>
  );
};

export default GameBoard;
