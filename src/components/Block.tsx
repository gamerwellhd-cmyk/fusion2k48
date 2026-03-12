import React from 'react';
import { motion } from 'motion/react';
import { Bomb } from 'lucide-react';
import { BlockData } from '../types';
import { getBlockColor } from '../utils/gameLogic';
import { specials } from '../systems/powerups';

interface BlockProps {
  block: BlockData;
}

const Block: React.FC<BlockProps> = ({ block }) => {
  const isSpecial = typeof block.value === 'string';
  const special = isSpecial ? (specials[block.value as keyof typeof specials] || null) : null;

  return (
    <motion.div
      initial={block.isNew ? { y: 500, opacity: 0 } : false}
      animate={{ 
        y: 0, 
        opacity: 1,
        scale: block.isExploding ? [1, 1.5, 1.8] : (block.isMerging ? [1, 1.5, 1] : 1),
        filter: block.isMerging ? ["brightness(1)", "brightness(2.5)", "brightness(1)"] : "brightness(1)",
        gridRowStart: block.row + 1,
        gridColumnStart: block.col + 1,
        ...(isSpecial && !block.isExploding && {
          boxShadow: [
            "0 0 0px rgba(255,255,255,0)",
            "0 0 20px rgba(255,255,255,0.5)",
            "0 0 0px rgba(255,255,255,0)"
          ]
        })
      }}
      exit={{ scale: 0, opacity: 0, transition: { duration: 0.1 } }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30,
        y: { type: "spring", stiffness: 500, damping: 35 },
        scale: { type: "tween", duration: 0.2 },
        filter: { duration: 0.2 },
        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }}
      className={`
        w-full h-full flex items-center justify-center 
        text-lg sm:text-2xl font-black shadow-lg border-b-4 border-black/20
        ${isSpecial ? 'rounded-[30%] border-2 border-white/40 z-10' : 'rounded-lg'}
        ${block.isExploding ? 'bg-red-600 z-50 ring-4 ring-orange-500 shadow-orange-500/50' : getBlockColor(block.value)}
        ${block.isFrozen ? 'ring-4 ring-blue-400/50 grayscale-[0.5]' : ''}
      `}
      style={{
        gridRowStart: block.row + 1,
        gridColumnStart: block.col + 1
      }}
    >
      {isSpecial && special ? (
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <special.icon size={32} className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
        </motion.div>
      ) : block.value === 'TNT' ? (
        <motion.div
          animate={block.isExploding ? { rotate: [0, 10, -10, 10, 0], scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.2, repeat: block.isExploding ? Infinity : 0 }}
        >
          <Bomb size={24} className={block.isExploding ? 'text-white' : ''} />
        </motion.div>
      ) : (
        <span className="drop-shadow-sm">{block.value}</span>
      )}
    </motion.div>
  );
};

export default Block;
