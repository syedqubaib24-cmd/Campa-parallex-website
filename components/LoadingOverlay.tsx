
import React from 'react';

interface LoadingOverlayProps {
  progress: number;
  variantName: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ progress, variantName }) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center transition-opacity duration-1000">
      <div className="mb-8 overflow-hidden">
        <h1 className="text-6xl font-black tracking-tighter text-white animate-pulse">CAMPA</h1>
      </div>
      <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-white transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="mt-4 flex flex-col items-center gap-1">
        <p className="text-xs uppercase tracking-[0.3em] text-white/50 font-light">Loading Experience</p>
        <p className="text-sm font-bold text-white">{variantName} ({Math.round(progress)}%)</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;
