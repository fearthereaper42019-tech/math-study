
import React from 'react';

export const GameTab: React.FC<{ onLaunch: (url: string) => void }> = ({ onLaunch }) => {
  return (
    <div className="h-full flex items-center justify-center px-6 scrollbar-hide">
      <div className="max-w-7xl mx-auto text-center space-y-6">
        <div className="space-y-2 mb-12">
          <h2 className="text-6xl font-black tracking-tighter uppercase opacity-20">Eternity Arcade</h2>
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">System Offline</p>
        </div>

        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-16 shadow-2xl scale-110">
          <div className="text-8xl mb-6 opacity-20">🚧</div>
          <h3 className="text-4xl font-black tracking-tighter uppercase mb-4">WIP</h3>
          <p className="text-sm font-bold opacity-40 uppercase tracking-widest">
            Work in Progress. Unavailable.
          </p>
          <div className="mt-10 flex justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse" />
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse [animation-delay:0.2s]" />
            <div className="w-2 h-2 rounded-full bg-white/20 animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>

        <p className="text-[10px] font-bold opacity-10 uppercase tracking-[0.4em] pt-10">
          Returning Soon
        </p>
      </div>
    </div>
  );
};
