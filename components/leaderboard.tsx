import { LeaderboardEntry } from "@/utils/leaderboard";

interface LeaderboardDisplayProps {
  entries: LeaderboardEntry[];
  currentScore?: LeaderboardEntry;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function LeaderboardDisplay({
  entries,
  currentScore,
  onPlayAgain,
  onMainMenu,
}: LeaderboardDisplayProps) {
  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/50 border border-cyan-500/30 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-4xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600 font-orbitron">
          Leaderboard
        </h2>

        {currentScore && (
          <div className="mb-6 p-4 bg-cyan-500/20 rounded-lg border border-cyan-500/30">
            <h3 className="text-cyan-400 mb-2 font-orbitron">Your Score</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-orbitron">
              <div>
                <div className="text-sm text-gray-400">Score</div>
                <div className="font-mono text-xl">{currentScore.score}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Time</div>
                <div>{formatTime(currentScore.gameTime)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">AI Opponents</div>
                <div>{currentScore.aiCount}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Date</div>
                <div>{formatDate(currentScore.date)}</div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {entries.map((entry, index) => (
            <div
              key={index}
              className={`grid grid-cols-2 md:grid-cols-4 gap-4 p-3 rounded font-orbitron ${
                currentScore && entry.score === currentScore.score
                  ? "bg-cyan-500/20 border border-cyan-500/30"
                  : "bg-black/30"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span className="text-cyan-400">{index + 1}.</span>
                <span className="font-mono">{entry.score}</span>
              </div>
              <div>{formatTime(entry.gameTime)}</div>
              <div>{entry.aiCount} AI</div>
              <div>{formatDate(entry.date)}</div>
            </div>
          ))}
        </div>

        <div className="flex space-x-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white py-4 px-6 rounded font-orbitron text-lg transition-all duration-300 shadow-[0_0_15px_rgba(6,182,212,0.5)] hover:shadow-[0_0_25px_rgba(6,182,212,0.7)]"
          >
            Play Again
          </button>
          <button
            onClick={onMainMenu}
            className="flex-1 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/20 py-4 px-6 rounded font-orbitron text-lg transition-all duration-300 shadow-[0_0_10px_rgba(6,182,212,0.3)] hover:shadow-[0_0_20px_rgba(6,182,212,0.5)]"
          >
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
} 