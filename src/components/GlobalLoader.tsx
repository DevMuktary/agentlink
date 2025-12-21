'use client';

export default function GlobalLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full">
      <div className="relative flex items-center justify-center">
        {/* The Spinner Ring */}
        <div className="absolute h-16 w-16 rounded-full border-4 border-slate-200 dark:border-slate-700"></div>
        <div className="absolute h-16 w-16 rounded-full border-4 border-t-blue-600 dark:border-t-blue-400 animate-spin"></div>
        
        {/* The Logo (AG) */}
        <div className="h-10 w-10 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center relative z-10">
          <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tighter">
            AG
          </span>
        </div>
      </div>
      
      {/* Optional Pulse Text */}
      <p className="mt-6 text-sm font-medium text-slate-400 dark:text-slate-500 animate-pulse tracking-wide uppercase text-[10px]">
        Loading Resources...
      </p>
    </div>
  );
}
