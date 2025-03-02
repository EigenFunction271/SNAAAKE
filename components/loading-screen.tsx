interface LoadingScreenProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="text-2xl font-bold text-cyan-400">Loading...</div>
      <div className="w-64 h-2 bg-black/30 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
      <div className="text-sm text-cyan-400">{Math.round(progress * 100)}%</div>
    </div>
  );
} 