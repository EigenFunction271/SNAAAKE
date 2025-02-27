interface LoadingScreenProps {
  progress: number;
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-black z-50">
      <div className="w-64 mb-8">
        <div className="h-2 bg-gray-800 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
      <p className="text-cyan-400 text-sm">
        Loading assets... {Math.floor(progress * 100)}%
      </p>
    </div>
  );
} 