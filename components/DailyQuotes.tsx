
import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, WifiOff, Maximize2, X, ZoomIn, ZoomOut } from 'lucide-react';

interface DailyQuotesProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
}

export const DailyQuotes: React.FC<DailyQuotesProps> = ({ onBack, scrollBarSide = 'left' }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [imageError, setImageError] = useState(false);
  const [retryTrigger, setRetryTrigger] = useState(0); // Used to force reload URL
  const [isLoading, setIsLoading] = useState(true);
  
  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Month names in Hindi to match data keys (for display)
  const HINDI_MONTHS = [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ];

  const WEEKDAYS = [
      "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
  ];

  const formatDateDisplay = (date: Date): string => {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    return `${day} ${HINDI_MONTHS[monthIndex]}`;
  };

  const formatYearDayDisplay = (date: Date): string => {
      return `${date.getFullYear()} ${WEEKDAYS[date.getDay()]}`;
  };

  // --- DYNAMIC IMAGE URL GENERATION ---
  const CLOUD_NAME = "drlnfmqrh";
  
  // Calculate Day of Year (1 - 366) based on a LEAP YEAR (e.g. 2024)
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
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${fileName}?v=2&retry=${retryTrigger}`;
  };

  const quoteImage = getQuoteImageUrl(currentDate);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    setImageError(false);
    setIsLoading(true);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setImageError(false);
    setIsLoading(true);
  };

  const handleRetry = () => {
      setIsLoading(true);
      setImageError(false);
      setRetryTrigger(prev => prev + 1);
  };

  const openLightbox = () => {
      if (!imageError) {
          setZoomLevel(1);
          setIsLightboxOpen(true);
      }
  };

  const closeLightbox = () => {
      setIsLightboxOpen(false);
  };

  const handleZoomIn = (e: React.MouseEvent) => {
      e.stopPropagation();
      setZoomLevel(prev => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
      e.stopPropagation();
      setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header - Matches Screenshot Orange */}
      <div className="flex-none bg-saffron-500 text-white p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold font-hindi">नित्य वाणी</h2>
        </div>
        <button 
           onClick={handleToday}
           className="text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full backdrop-blur-sm transition-colors"
        >
            आज (Today)
        </button>
      </div>

      {/* Content Area - Scrollbar Applied */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 pb-[calc(6rem+env(safe-area-inset-bottom))] flex flex-col items-center min-h-full">
          
          {/* Date Navigation Pill - Matches Screenshot (Dark rounded bar) */}
          <div className="w-full max-w-md bg-slate-800 rounded-full p-2 px-4 flex items-center justify-between shadow-lg mb-8 mt-4 border border-slate-700">
              <button 
                 onClick={() => changeDate(-1)}
                 className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                  <ChevronLeft size={24} />
              </button>
              
              <div className="flex flex-col items-center">
                  <span className="text-xl font-bold text-saffron-500 font-hindi leading-none mb-1">
                      {formatDateDisplay(currentDate)}
                  </span>
                  <span className="text-xs text-slate-400 font-sans tracking-wide">
                      {formatYearDayDisplay(currentDate)}
                  </span>
              </div>

              <button 
                 onClick={() => changeDate(1)}
                 className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white transition-colors"
              >
                  <ChevronRight size={24} />
              </button>
          </div>

          {/* Main Card - Dark Background matching "Black Outline" */}
          <div className="w-full max-w-md bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 relative mt-8">
              
              {/* Maharaj Image - Positioned overlapping top */}
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20">
                  <div className="w-24 h-24 rounded-full border-4 border-slate-900 shadow-xl overflow-hidden bg-saffron-100">
                      <img 
                        src="https://res.cloudinary.com/drlnfmqrh/image/upload/v1769567914/Screenshot_2026-01-28_080815_oegm4g.png" 
                        alt="Maharaj Ji" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Maharaj&background=f97316&color=fff&size=128';
                        }}
                      />
                  </div>
              </div>

              {/* Quote Image Container */}
              <div className="mt-10 relative min-h-[300px] flex items-center justify-center bg-slate-900 rounded-xl overflow-hidden group">
                  {!imageError ? (
                      <>
                        {isLoading && (
                            <div className="absolute inset-0 flex items-center justify-center z-0">
                                <div className="w-8 h-8 border-4 border-slate-700 border-t-saffron-500 rounded-full animate-spin"></div>
                            </div>
                        )}
                        <img 
                            src={quoteImage} 
                            alt={`Quote for ${formatDateDisplay(currentDate)}`} 
                            onClick={openLightbox}
                            className={`w-full h-auto rounded-xl shadow-inner relative z-10 transition-all duration-300 cursor-zoom-in ${isLoading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                            onLoad={() => setIsLoading(false)}
                            onError={() => {
                                setImageError(true);
                                setIsLoading(false);
                            }}
                        />
                        {!isLoading && (
                             <button 
                                onClick={openLightbox}
                                className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100 z-20 shadow-lg"
                                title="Zoom Image"
                             >
                                <Maximize2 size={20} />
                             </button>
                        )}
                      </>
                  ) : (
                      <div className="py-12 text-slate-500 flex flex-col items-center justify-center w-full border-2 border-dashed border-slate-800 rounded-xl">
                          <WifiOff className="w-10 h-10 opacity-50 mb-4" />
                          <p className="text-sm font-medium text-slate-400">Image not available</p>
                          <button 
                             onClick={handleRetry}
                             className="mt-4 flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-saffron-400 px-4 py-2 rounded-full text-xs font-bold transition-colors"
                          >
                             <RefreshCw size={14} /> Retry
                          </button>
                      </div>
                  )}
              </div>
          </div>
          
        </div>
      </div>

      {/* Zoom Lightbox */}
      {isLightboxOpen && (
          <div className="fixed inset-0 z-[60] bg-black/95 flex flex-col animate-in fade-in duration-200">
              
              {/* Toolbar */}
              <div className="flex-none p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between bg-black/50 backdrop-blur-sm z-20">
                  <div className="text-white/80 text-sm font-medium">
                      {formatDateDisplay(currentDate)}
                  </div>
                  <button 
                      onClick={closeLightbox}
                      className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                      <X size={24} />
                  </button>
              </div>

              {/* Scrollable Image Area */}
              <div className="flex-1 overflow-auto flex items-center justify-center p-4" onClick={closeLightbox}>
                   <img 
                      src={quoteImage}
                      alt="Full Quote"
                      onClick={(e) => e.stopPropagation()}
                      className="transition-all duration-200 ease-out shadow-2xl"
                      style={{ 
                          width: `${zoomLevel * 100}%`,
                          maxWidth: 'none',
                          objectFit: 'contain'
                      }}
                   />
              </div>

              {/* Bottom Controls */}
              <div className="flex-none p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] flex justify-center z-20 pointer-events-none">
                  <div className="flex items-center gap-6 bg-slate-800/90 backdrop-blur-md px-6 py-3 rounded-full shadow-2xl border border-slate-700 pointer-events-auto">
                      <button 
                          onClick={handleZoomOut}
                          disabled={zoomLevel <= 0.5}
                          className="text-white hover:text-saffron-400 disabled:opacity-30 transition-colors"
                      >
                          <ZoomOut size={28} />
                      </button>
                      
                      <span className="text-white font-mono font-bold w-12 text-center select-none">
                          {Math.round(zoomLevel * 100)}%
                      </span>

                      <button 
                          onClick={handleZoomIn}
                          disabled={zoomLevel >= 4}
                          className="text-white hover:text-saffron-400 disabled:opacity-30 transition-colors"
                      >
                          <ZoomIn size={28} />
                      </button>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};
