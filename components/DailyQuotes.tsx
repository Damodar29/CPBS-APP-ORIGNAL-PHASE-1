
import React, { useState } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';

interface DailyQuotesProps {
  onBack: () => void;
}

export const DailyQuotes: React.FC<DailyQuotesProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [imageError, setImageError] = useState(false);

  // Month names in Hindi to match data keys (for display)
  const HINDI_MONTHS = [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ];

  const formatDateKey = (date: Date): string => {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    return `${day} ${HINDI_MONTHS[monthIndex]}`;
  };

  // --- DYNAMIC IMAGE URL GENERATION ---
  const CLOUD_NAME = "drlnfmqrh";
  
  // Calculate Day of Year (1 - 366)
  const getDayOfYear = (date: Date) => {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  };

  // Generates URL based on Day of Year
  // Jan 1 (Day 1) -> 1.jpg
  // Jan 2 (Day 2) -> 1-2.jpg
  // Feb 1 (Day 32) -> 1-32.jpg
  const getQuoteImageUrl = (date: Date) => {
    const dayOfYear = getDayOfYear(date);
    
    // Exception for Day 1 as per user request (1.jpg instead of 1-1.jpg)
    // For all other days: 1-{DayOfYear}.jpg
    const fileName = dayOfYear === 1 ? "1.jpg" : `1-${dayOfYear}.jpg`;
    
    // Using root upload folder based on provided links (no 'quotes/' prefix in URL)
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${fileName}`;
  };

  const quoteImage = getQuoteImageUrl(currentDate);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
    setImageError(false); // Reset error state for new date
  };

  const handleToday = () => {
    setCurrentDate(new Date());
    setImageError(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-saffron-50 dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="flex-none bg-saffron-500 text-white p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between shadow-md z-10">
        <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold font-hindi">नित्य वाणी</h2>
        </div>
        <button 
           onClick={handleToday}
           className="text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-sm transition-colors"
        >
            आज (Today)
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-[calc(6rem+env(safe-area-inset-bottom))]">
          
          {/* Navigation Bar */}
          <div className="flex items-center justify-between bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-saffron-100 dark:border-slate-700 mb-6">
              <button 
                 onClick={() => changeDate(-1)}
                 className="p-3 hover:bg-saffron-50 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                  <ChevronLeft size={24} />
              </button>
              
              <div className="flex flex-col items-center">
                  <span className="text-lg font-bold text-saffron-700 dark:text-saffron-400 font-hindi">
                      {formatDateKey(currentDate)}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                      {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric' })}
                  </span>
              </div>

              <button 
                 onClick={() => changeDate(1)}
                 className="p-3 hover:bg-saffron-50 dark:hover:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
              >
                  <ChevronRight size={24} />
              </button>
          </div>

          {/* Quote Card */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-saffron-100 dark:border-slate-700 relative min-h-[400px]">
              {/* Decorative Header Pattern */}
              <div className="h-2 bg-gradient-to-r from-saffron-400 to-red-500" />
              
              <div className="p-6 pt-8 text-center relative">
                  {/* Maharaj Image - Adjusted position (-mt-6) so face is visible */}
                  <div className="w-32 h-32 mx-auto rounded-full border-4 border-white dark:border-slate-700 shadow-xl overflow-hidden -mt-6 bg-saffron-100 mb-6 relative z-10">
                      <img 
                        src="https://res.cloudinary.com/drlnfmqrh/image/upload/v1769567914/Screenshot_2026-01-28_080815_oegm4g.png" 
                        alt="Maharaj Ji" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Maharaj&background=f97316&color=fff&size=128';
                        }}
                      />
                  </div>

                  {!imageError ? (
                      <div className="animate-in fade-in zoom-in-95 duration-300 mb-4">
                          <img 
                            src={quoteImage} 
                            alt={`Quote for ${formatDateKey(currentDate)}`} 
                            className="w-full h-auto rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"
                            onError={() => setImageError(true)}
                          />
                      </div>
                  ) : (
                      <div className="py-12 text-slate-400 flex flex-col items-center justify-center">
                          <ImageOff className="w-12 h-12 mb-3 opacity-20" />
                          <p className="mb-2 text-lg font-medium">Quote image not found</p>
                          <p className="text-xs opacity-70 text-center px-4 mb-2">
                             We could not find the image for this date.
                          </p>
                          <p className="text-[10px] font-mono bg-slate-100 dark:bg-slate-900 px-2 py-1 rounded text-slate-500">
                                Expected: {quoteImage.split('/').pop()}
                          </p>
                      </div>
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};
