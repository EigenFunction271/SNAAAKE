import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScoreData {
  id: string;
  name: string;
  score: number;
  color: string;
  isPlayer: boolean;
}

interface ScoreSidebarProps {
  scores: ScoreData[];
  gameTime: number;
}

export function ScoreSidebar({ scores, gameTime }: ScoreSidebarProps) {
  const [sortedScores, setSortedScores] = useState<ScoreData[]>([]);

  useEffect(() => {
    setSortedScores([...scores].sort((a, b) => b.score - a.score));
  }, [scores]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed right-4 top-4 w-48 bg-black/50 border border-cyan-500/30 rounded-lg p-4 backdrop-blur-sm">
      <div className="text-center mb-4">
        <div className="text-cyan-400 text-sm">Time</div>
        <div className="font-mono text-xl">{formatTime(gameTime)}</div>
      </div>
      
      <div className="space-y-2">
        <AnimatePresence>
          {sortedScores.map((score, index) => (
            <motion.div
              key={score.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center justify-between p-2 rounded ${
                score.isPlayer ? 'bg-cyan-500/20' : 'bg-black/30'
              }`}
              style={{ borderLeft: `4px solid ${score.color}` }}
            >
              <div className="flex items-center space-x-2">
                <span className="text-sm">{index + 1}.</span>
                <span className="text-sm truncate">{score.name}</span>
              </div>
              <span className="font-mono">{score.score}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
} 