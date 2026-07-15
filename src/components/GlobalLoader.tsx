'use client';

import Image from 'next/image';

export default function GlobalLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative flex items-center justify-center">
        {/* The Spinner Ring */}
        <div className="absolute h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
        <div className="absolute h-16 w-16 rounded-full border-4 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
        
        {/* The Logo */}
        <div className="h-10 w-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center relative z-10 overflow-hidden shadow-sm">
          <Image 
            src="/logo-agenthub.png" 
            alt="AgentHub" 
            width={28} 
            height={28} 
            className="object-contain drop-shadow-sm"
          />
        </div>
      </div>
      
      {/* Pulse Text */}
      <p className="mt-6 text-sm font-bold text-slate-400 dark:text-slate-500 animate-pulse tracking-widest uppercase text-[10px]">
        Loading AgentHub...
      </p>
    </div>
  );
}
