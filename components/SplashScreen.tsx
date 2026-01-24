
import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-saffron-500 to-saffron-600 text-white">
      <div className="animate-fade-in-up flex flex-col items-center gap-6">
         
         {/* Logo Icon - Vertical Center */}
         <svg viewBox="0 0 100 200" className="h-28 w-auto fill-current drop-shadow-md">
            {/* U Shape */}
            <path d="M25 10 L 25 90 Q 25 125 50 125 Q 75 125 75 90 L 75 10" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            {/* Tulsi Leaf - Balanced Size */}
            <path d="M50 115 Q 20 155 50 195 Q 80 155 50 115" fill="currentColor" />
         </svg>

         {/* Text Block */}
         <div className="flex flex-col items-center justify-center text-center">
             <h1 className="text-5xl font-logo tracking-wide drop-shadow-md leading-none mb-2">
               Shree Chaitanya
             </h1>
             
             <div className="w-16 h-1 bg-white/90 rounded-full my-2 shadow-sm"></div>

             <h2 className="text-sm font-sans font-bold tracking-[0.2em] uppercase drop-shadow-sm opacity-90">
               Prem Bhakti Sangh
             </h2>
         </div>

         {/* Loading Indicator */}
         <div className="flex gap-2 mt-8 opacity-60">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
         </div>
         
      </div>
    </div>
  );
};
