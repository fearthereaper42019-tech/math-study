
import React from 'react';

export const GridEffect: React.FC<{ enabled: boolean }> = ({ enabled }) => {
  if (!enabled) return null;
  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[6] opacity-[0.07]" 
      style={{
        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }}
    />
  );
};
