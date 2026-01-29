
import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-saffron-600 text-white">
      
      {/* Background Animated Particles */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-yellow-400/20 rounded-full blur-[100px] animate-float-slow"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-red-700/20 rounded-full blur-[120px] animate-float-slow-reverse"></div>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
        @keyframes fill-white {
          from { fill-opacity: 0; }
          to { fill-opacity: 1; }
        }
        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, 30px); }
        }
        @keyframes float-slow-reverse {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-20px, -20px); }
        }
        .animate-draw {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 1.2s cubic-bezier(0.35, 0, 0.25, 1) forwards;
        }
        .animate-draw-fill {
          stroke-dasharray: 1000;
          stroke-dashoffset: 1000;
          animation: dash 1.2s cubic-bezier(0.35, 0, 0.25, 1) forwards, fill-white 0.5s ease-out 0.8s forwards;
        }
        .animate-fade-up-delay {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.5s forwards;
        }
        .animate-fade-up-delay-2 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.8s forwards;
        }
      `}</style>

      <div className="relative z-10 flex flex-col items-center gap-8">
         
         {/* Logo Icon with Stroke Animation */}
         <div className="relative drop-shadow-2xl">
             <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-125 animate-pulse-slow"></div>
             <svg viewBox="0 0 100 200" className="h-32 w-auto relative z-10">
                {/* U Shape - Outline Only (Transparent Fill) */}
                <path 
                    d="M25 10 L 25 90 Q 25 125 50 125 Q 75 125 75 90 L 75 10" 
                    fill="transparent" 
                    stroke="white" 
                    strokeWidth="6" 
                    strokeLinecap="round" 
                    className="animate-draw"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }}
                />
                {/* Tulsi Leaf - Outline -> Filled White */}
                <path 
                    d="M50 115 Q 20 155 50 195 Q 80 155 50 115" 
                    fill="white"
                    fillOpacity="0"
                    stroke="white"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animate-draw-fill"
                    style={{ filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.5))' }}
                />
             </svg>
         </div>

         {/* Text Block */}
         <div className="flex flex-col items-center justify-center text-center">
             <h1 className="text-5xl font-logo tracking-wide drop-shadow-lg leading-none mb-3 animate-fade-up-delay">
               Shree Chaitanya
             </h1>
             
             <div className="w-20 h-1 bg-white/90 rounded-full mb-3 shadow-sm animate-fade-up-delay-2 origin-left"></div>

             <h2 className="text-sm font-sans font-bold tracking-[0.3em] uppercase drop-shadow-md opacity-90 animate-fade-up-delay-2">
               Prem Bhakti Sangh
             </h2>
         </div>

         {/* Refined Loading Indicator */}
         <div className="flex gap-3 mt-10 opacity-80 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDuration: '1s' }}></div>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s', animationDuration: '1s' }}></div>
            <div className="w-2.5 h-2.5 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s', animationDuration: '1s' }}></div>
         </div>
         
      </div>
    </div>
  );
};
