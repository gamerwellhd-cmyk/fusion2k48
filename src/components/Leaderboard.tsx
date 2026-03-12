import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, ArrowLeft, Medal, Calendar, Cloud } from 'lucide-react';
import { leaderboardService } from '../services/leaderboardService';
import * as firebase from '../services/firebase';

interface LeaderboardProps {
  onBack: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [scores, setScores] = useState(leaderboardService.getScores());
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  useEffect(() => {
    // Get initial scores
    const initialScores = leaderboardService.getScores();
    setScores(initialScores);

    // Listen to Firebase updates
    const unsubscribe = firebase.listenToLeaderboardUpdates((cloudScores: any[]) => {
      const formattedScores = cloudScores
        .map((score: any) => ({
          username: score.username,
          score: score.score,
          date: score.timestamp
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 100);
      
      setScores(formattedScores);
      setIsCloudSynced(true);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen bg-petrol-950 p-6 flex flex-col items-center text-zinc-100"
    >
      <div className="w-full max-w-2xl">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 font-mono text-[10px] uppercase opacity-40 hover:opacity-100 transition-opacity mb-8 tracking-widest"
        >
          <ArrowLeft size={16} />
          Return to Terminal
        </button>

        <div className="flex items-center gap-4 mb-12">
          <div className="p-4 bg-petrol-600 rounded-2xl text-white shadow-lg shadow-petrol-900/50">
            <Trophy size={32} />
          </div>
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter">Hall of Fame</h2>
            <p className="font-mono text-[10px] opacity-40 uppercase tracking-[0.3em] flex items-center gap-2">
              {isCloudSynced ? (
                <>
                  <Cloud size={12} className="text-petrol-400" />
                  Cloud Synced
                </>
              ) : (
                'Local Records'
              )}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {scores.length > 0 ? (
            scores.map((entry, index) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  flex items-center justify-between p-5 bg-petrol-900/40 border border-petrol-800/30 rounded-2xl backdrop-blur-sm
                  ${index === 0 ? 'ring-2 ring-petrol-400/30 bg-petrol-800/40' : ''}
                `}
              >
                <div className="flex items-center gap-5">
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-black text-lg
                    ${index === 0 ? 'bg-petrol-400 text-petrol-950' : 'bg-black/20 text-zinc-400'}
                  `}>
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-black text-xl uppercase italic tracking-tight">{entry.username}</h3>
                    <div className="flex items-center gap-2 font-mono text-[9px] opacity-30 uppercase tracking-widest">
                      <Calendar size={10} />
                      {new Date(entry.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-black text-petrol-400 tracking-tighter">
                    {entry.score.toLocaleString()}
                  </div>
                  <div className="font-mono text-[9px] opacity-30 uppercase tracking-widest">Points</div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 opacity-20">
              <Medal size={48} className="mx-auto mb-4" />
              <p className="font-mono uppercase text-xs tracking-[0.2em]">No records found</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;
