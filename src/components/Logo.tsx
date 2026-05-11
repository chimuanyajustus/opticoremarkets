import React from 'react';

const Logo: React.FC<{ className?: string; small?: boolean }> = ({ className = '', small = false }) => (
  <div className={`flex items-center ${className}`}>
    <div className={`flex items-center justify-center rounded-2xl ${small ? 'w-10 h-10' : 'w-12 h-12'} bg-gradient-to-br from-blue-600 to-purple-600`}>
      <svg viewBox="0 0 32 32" className="w-6 h-6 text-white" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 20L16 12L24 20V24H20V18H12V24H8V20Z" fill="currentColor" />
      </svg>
    </div>
    <div className="ml-3">
      <div className={`font-semibold ${small ? 'text-lg' : 'text-xl'} text-white leading-tight`}>Opticore</div>
      <div className="text-xs uppercase tracking-[0.25em] text-slate-400">Markets</div>
    </div>
  </div>
);

export default Logo;
