import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-petrol-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-petrol-600 rounded-[20px] animate-pulse mx-auto mb-4"></div>
        <p className="text-petrol-300 font-mono text-xs uppercase tracking-widest">Carregando...</p>
      </div>
    </div>
  );
}
