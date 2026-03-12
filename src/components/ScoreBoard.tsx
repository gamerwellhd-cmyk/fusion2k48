import React from 'react';

interface ScoreBoardProps {
  score: number;
  highScore: number;
}

const ScoreBoard: React.FC<ScoreBoardProps> = ({ score, highScore }) => {
  return (
    <div className="w-full max-w-md flex justify-between items-center mb-2 sm:mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-petrol-400 uppercase">2048 Fusion</h1>
        <p className="text-[10px] text-petrol-500 font-mono uppercase tracking-widest">Shoot & Merge</p>
      </div>
      <div className="flex gap-2">
        <div className="bg-petrol-950/50 px-2 sm:px-3 py-1 rounded-lg border border-petrol-900">
          <p className="text-[8px] sm:text-[10px] text-petrol-500 uppercase font-bold">Score</p>
          <p className="text-lg sm:text-xl font-black font-mono">{score}</p>
        </div>
        <div className="bg-petrol-950/50 px-2 sm:px-3 py-1 rounded-lg border border-petrol-900">
          <p className="text-[8px] sm:text-[10px] text-petrol-500 uppercase font-bold">Best</p>
          <p className="text-lg sm:text-xl font-black font-mono">{highScore}</p>
        </div>
      </div>
    </div>
  );
};

export default ScoreBoard;
