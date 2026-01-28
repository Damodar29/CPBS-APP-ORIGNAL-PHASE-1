
import React, { useState } from 'react';
import { X, ExternalLink, RefreshCw, Share2 } from 'lucide-react';

interface QuotePopupProps {
  onClose: () => void;
  onOpenFull: () => void;
}

export const QuotePopup: React.FC<QuotePopupProps> = ({ onClose, onOpenFull }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);

  // --- IMAGE LOGIC (Matches DailyQuotes.tsx) ---
  const getStaticDayOfYear = (date: Date) => {
    const month = date.getMonth();
    const day = date.getDate();
    const leapYearDate = new Date(2024, month, day);
    const start = new Date(2024, 0, 0); 
    const diff = leapYearDate.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  const getQuoteImageUrl = (date: Date) => {
    const dayOfYear = getStaticDayOfYear(date);
    const fileName = dayOfYear === 1 ? "1.jpg" : `1-${dayOfYear}.jpg`;
    return `https://res.cloudinary.com/drlnfmqrh/image/upload/${fileName}?v=2&retry=${retry}`;
  };

  const today = new Date();
  const imageUrl = getQuoteImageUrl(today);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Daily Quote - CPBS',
          text: 'Check out today\'s spiritual quote!',
          url: imageUrl
        });
      } catch (err) {
        console.log('Share failed', err);
      }
    } else {
       // Fallback copy
       try {
        await navigator.clipboard.writeText(imageUrl);
        alert("Image URL copied to clipboard");
       } catch(e) {}
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl transform transition-all animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col max-h-[85vh] border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-saffron-500 to-saffron-600 p-5 flex justify-between items-start relative overflow-hidden">
           {/* Decorative circles */}
           <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8 blur-xl"></div>
           <div className="absolute bottom-0 left-0 w-16 h-16 bg-black/10 rounded-full -ml-8 -mb-8 blur-lg"></div>

           <div className="relative z-10">
              <h3 className="text-white font-bold text-xl font-hindi leading-tight drop-shadow-sm">नित्य वाणी</h3>
              <p className="text-saffron-50 text-xs font-medium opacity-90 mt-1 uppercase tracking-wide">
                  Quote of the Day • {today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
           </div>
           <button 
              onClick={onClose} 
              className="relative z-10 text-white/90 hover:text-white bg-black/20 hover:bg-black/30 rounded-full p-1.5 transition-colors backdrop-blur-sm"
           >
              <X size={20} />
           </button>
        </div>

        {/* Image Area */}
        <div 
            className="relative bg-slate-100 dark:bg-slate-950 flex-1 min-h-[300px] flex items-center justify-center overflow-hidden cursor-pointer group"
            onClick={onOpenFull}
        >
           {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-0">
                  <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-slate-300 border-t-saffron-500 rounded-full animate-spin"></div>
                      <span className="text-xs text-slate-400 font-medium">Loading Quote...</span>
                  </div>
              </div>
           )}
           
           {!error ? (
              <>
                <img 
                    src={imageUrl} 
                    alt="Daily Quote" 
                    className={`w-full h-full object-contain transition-all duration-500 ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => { setError(true); setIsLoading(false); }}
                />
                {!isLoading && (
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                        <span className="bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">Tap to view full gallery</span>
                    </div>
                )}
              </>
           ) : (
              <div className="flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                 <p className="text-sm mb-3 font-medium">Unable to load quote</p>
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsLoading(true); setError(false); setRetry(r => r + 1); }} 
                    className="text-xs bg-slate-200 dark:bg-slate-800 px-4 py-2 rounded-full flex items-center gap-2 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 font-bold"
                 >
                    <RefreshCw size={14} /> Retry
                 </button>
              </div>
           )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white dark:bg-slate-900 flex gap-3 z-10 relative">
           <button 
             onClick={handleShare}
             className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
             title="Share"
           >
             <Share2 size={20} />
           </button>
           <button 
             onClick={() => { onClose(); onOpenFull(); }}
             className="flex-1 py-3 px-4 rounded-xl font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity shadow-lg flex items-center justify-center gap-2 text-sm"
           >
             <ExternalLink size={18} /> View Gallery
           </button>
        </div>

      </div>
    </div>
  );
};
