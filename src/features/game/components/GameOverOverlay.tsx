import React from 'react';
import { motion } from 'motion/react';
import { Trophy, RefreshCw, Home } from 'lucide-react';

interface GameOverOverlayProps {
  score: number;
  onRestart: () => void;
  onBackToMenu?: () => void;
}

const GameOverOverlay: React.FC<GameOverOverlayProps> = ({ score, onRestart, onBackToMenu }) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 bg-petrol-950/90 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-6 text-center"
    >
      <Trophy className="text-petrol-400 mb-4" size={64} />
      <h2 className="text-4xl font-black mb-2 uppercase tracking-tighter text-white">Game Over</h2>
      <p className="text-petrol-300 mb-6">You reached a score of <span className="text-white font-bold">{score}</span></p>
      
      <div className="flex flex-col gap-3 w-full max-w-[200px]">
        <button 
          onClick={onRestart}
          className="bg-petrol-600 hover:bg-petrol-500 text-white font-black py-4 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 uppercase tracking-widest shadow-lg shadow-black/50"
        >
          <RefreshCw size={20} /> Play Again
        </button>
        
        {onBackToMenu && (
          <button 
            onClick={onBackToMenu}
            className="bg-white/10 hover:bg-white/20 text-white font-bold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 uppercase text-xs tracking-widest border border-white/10"
          >
            <Home size={16} /> Menu
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default GameOverOverlay;
