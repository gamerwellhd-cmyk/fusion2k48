import React from 'react';
import { motion } from 'motion/react';
import { Coffee, ShoppingBag, TrendingUp, Users } from 'lucide-react';

interface GameHeaderProps {
  username: string;
  highScore: number;
  coins: number;
  restartTokens: number;
  connectedPlayers?: number;
  onShopClick?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  username,
  highScore,
  coins,
  restartTokens,
  connectedPlayers = 1,
  onShopClick,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full bg-petrol-950/70 backdrop-blur-sm border-b border-petrol-800/30 sticky top-0 z-10"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-petrol-500 to-petrol-700 rounded-full flex items-center justify-center font-black text-xs text-white shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              {username.substring(0, 2).toUpperCase()}
            </motion.div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-black uppercase tracking-tight text-white leading-none">
                2048 <span className="text-petrol-400">Fusion</span>
              </h1>
              <p className="text-[10px] font-mono uppercase tracking-wider opacity-60 text-petrol-300 truncate max-w-[120px] sm:max-w-none">
                {username}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2 text-xs font-mono">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-petrol-700/50 bg-petrol-900/50 text-petrol-200">
              <TrendingUp size={12} />
              <span>Best {highScore.toLocaleString()}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-orange-700/40 bg-orange-900/20 text-orange-300">
              <Coffee size={12} />
              <span>{coins}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-petrol-700/50 bg-petrol-900/50 text-petrol-200">
              <span>Restart {restartTokens}</span>
            </div>

            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-petrol-700/50 bg-petrol-900/40 text-petrol-300 opacity-80">
              <Users size={12} />
              <span>{connectedPlayers}</span>
            </div>

            {onShopClick && (
              <button
                onClick={onShopClick}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-petrol-600/60 bg-petrol-700/30 text-petrol-100 hover:bg-petrol-700/50 transition-colors"
              >
                <ShoppingBag size={12} />
                Loja
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
