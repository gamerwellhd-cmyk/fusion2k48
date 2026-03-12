import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Zap, Bomb, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { BlockValue, SpecialType } from '../types';
import { getBlockColor } from '../utils/gameLogic';
import { specials } from '../systems/powerups';

interface LaunchDockProps {
  dockBlock: BlockValue;
  nextBlock: BlockValue;
  onRestart: () => void;
  teleportDirection?: 'left' | 'right';
  onToggleTeleportDirection?: () => void;
}

const LaunchDock: React.FC<LaunchDockProps> = ({ 
  dockBlock, 
  nextBlock, 
  onRestart,
  teleportDirection,
  onToggleTeleportDirection
}) => {
  const renderBlockContent = (value: BlockValue, size: number) => {
    if (value === 'TNT') return <Bomb size={size} />;
    if (typeof value === 'string' && value in specials) {
      const Icon = specials[value as SpecialType].icon;
      return <Icon size={size} className="text-white drop-shadow-md" />;
    }
    return value;
  };

  const isSpecialDock = typeof dockBlock === 'string';
  const isSpecialNext = typeof nextBlock === 'string';
  const isTeleport = dockBlock === 'teleport';

  return (
    <div className="mt-2 sm:mt-8 w-full max-w-md flex items-center justify-center gap-4 sm:gap-8">
      <div className="flex flex-col items-center gap-1">
        <p className="text-[8px] sm:text-[10px] text-petrol-500 uppercase font-bold tracking-widest">Next</p>
        <div className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-base sm:text-lg font-black opacity-50 ${getBlockColor(nextBlock)} ${isSpecialNext ? 'rounded-[30%] border border-white/20' : 'rounded-lg'}`}>
          {renderBlockContent(nextBlock, 20)}
        </div>
      </div>

      <div className="relative flex items-center gap-2">
        <AnimatePresence>
          {isTeleport && (
            <motion.button
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              onClick={onToggleTeleportDirection}
              className={`absolute -left-10 p-1 rounded-full border transition-colors ${teleportDirection === 'left' ? 'bg-purple-500 border-purple-400 text-white' : 'bg-petrol-950 border-petrol-900 text-petrol-500'}`}
            >
              <ChevronLeft size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        <motion.div 
          animate={{ 
            y: [0, -5, 0],
            boxShadow: isSpecialDock ? [
              "0 0 0px rgba(255,255,255,0)",
              "0 0 15px rgba(255,255,255,0.3)",
              "0 0 0px rgba(255,255,255,0)"
            ] : "none"
          }}
          transition={{ 
            y: { repeat: Infinity, duration: 2 },
            boxShadow: { repeat: Infinity, duration: 2 }
          }}
          className={`w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center text-2xl sm:text-3xl font-black shadow-xl border-b-4 border-black/30 ${getBlockColor(dockBlock)} ${isSpecialDock ? 'rounded-[30%] border-2 border-white/30' : 'rounded-xl'}`}
        >
          {renderBlockContent(dockBlock, 32)}
        </motion.div>

        <AnimatePresence>
          {isTeleport && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={onToggleTeleportDirection}
              className={`absolute -right-10 p-1 rounded-full border transition-colors ${teleportDirection === 'right' ? 'bg-purple-500 border-purple-400 text-white' : 'bg-petrol-950 border-petrol-900 text-petrol-500'}`}
            >
              <ChevronRight size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
          <Zap className="text-petrol-400 fill-petrol-400" size={14} />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <button 
          onClick={onRestart}
          className="p-2 sm:p-3 bg-petrol-950 rounded-full border border-petrol-900 text-petrol-500 hover:text-white transition-colors"
          title="Restart"
        >
          <RefreshCw size={18} />
        </button>
      </div>
    </div>
  );
};

export default LaunchDock;
