
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, Copy, Share2, Check } from 'lucide-react';
import { QUOTES_DATA } from '../data/quotes';
import { DailyQuote } from '../types';

interface DailyQuotesProps {
  onBack: () => void;
}

// Trial images for specific dates (Format: "Date MonthIndex")
// Month is 0-indexed (0 = Jan, 1 = Feb, etc.)
const QUOTE_IMAGES: Record<string, string> = {
  "28 0": "https://res.cloudinary.com/drlnfmqrh/image/upload/v1769550644/028_28_JAN_jp48nc.jpg",
  "29 0": "https://res.cloudinary.com/drlnfmqrh/image/upload/v1769550648/029_29_JAN_jx6xli.jpg"
};

export const DailyQuotes: React.FC<DailyQuotesProps> = ({ onBack }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [quote, setQuote] = useState<DailyQuote | null>(null);
  const [copied, setCopied] = useState(false);

  // Month names in Hindi to match data keys
  const HINDI_MONTHS = [
    "जनवरी", "फ़रवरी", "मार्च", "अप्रैल", "मई", "जून",
    "जुलाई", "अगस्त", "सितंबर", "अक्टूबर", "नवंबर", "दिसंबर"
  ];

  // Also support alternate spellings if necessary
  const ALT_HINDI_MONTHS: Record<number, string[]> = {
     1: ["फ़रवरी", "फरवरी"],
     8: ["सितंबर", "सितम्बर"]
  };

  const formatDateKey = (date: Date): string => {
    const day = date.getDate();
    const monthIndex = date.getMonth();
    return `${day} ${HINDI_MONTHS[monthIndex]}`;
  };

  // Check if we have an image for this date
  const imageKey = `${currentDate.getDate()} ${currentDate.getMonth()}`;
  const quoteImage = QUOTE_IMAGES[imageKey];

  useEffect(() => {
    const key = formatDateKey(currentDate);
    // Try primary key
    let foundQuote = QUOTES_DATA.find(q => q.dateKey === key);
    
    // Try alternate spelling if not found
    if (!foundQuote && ALT_HINDI_MONTHS[currentDate.getMonth()]) {
         const day = currentDate.getDate();
         const alts = ALT_HINDI_MONTHS[currentDate.getMonth()];
         for (const altMonth of alts) {
             const altKey = `${day} ${altMonth}`;
             foundQuote = QUOTES_DATA.find(q => q.dateKey === altKey);
             if (foundQuote) break;
         }
    }

    setQuote(foundQuote || null);
  }, [currentDate]);

  const changeDate = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + days);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCopy = () => {
    if (quoteImage) {
        // For images, copy the URL
        if (typeof navigator !== 'undefined' && navigator.clipboard) {
            navigator.clipboard.writeText(quoteImage).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        }
        return;
    }

    if (!quote) return;
    const textToCopy = `*नित्य वाणी - ${quote.dateKey}*\n\n${quote.text}\n\n${quote.source || ''}`;
    
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }
  };

  const handleShare = async () => {
    if (quoteImage) {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Daily Quote - CPBS',
                    text: 'Check out today\'s quote!',
                    url: quoteImage
                });
            } catch (err) {
                console.log('Share canceled');
            }
        } else {
            handleCopy();
        }
        return;
    }

    if (!quote) return;
    const textToShare = `*नित्य वाणी - ${quote.dateKey}*\n\n${quote.text}\n\n${quote.source || ''}`;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Daily Quote - CPBS',
                text: textToShare,
            });
        } catch (err) {
            console.log('Share canceled');
        }
    } else {
        handleCopy();
    }
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
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden border border-saffron-100 dark:border-slate-700 relative">
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
                            // Fallback if image fails
                            (e.target as HTMLImageElement).src = 'https://ui-avatars.com/api/?name=Maharaj&background=f97316&color=fff&size=128';
                        }}
                      />
                  </div>

                  {quoteImage ? (
                      <div className="animate-in fade-in zoom-in-95 duration-300 mb-4">
                          <img 
                            src={quoteImage} 
                            alt="Quote of the Day" 
                            className="w-full h-auto rounded-lg shadow-sm border border-slate-100 dark:border-slate-700"
                          />
                      </div>
                  ) : quote ? (
                      <div className="animate-in fade-in zoom-in-95 duration-300">
                          <div className="mb-6">
                              <span className="text-4xl text-saffron-200 dark:text-slate-600 font-serif leading-none">❝</span>
                              <p className="text-xl sm:text-2xl font-hindi text-slate-800 dark:text-slate-100 leading-loose px-2 whitespace-pre-line">
                                  {quote.text}
                              </p>
                              <span className="text-4xl text-saffron-200 dark:text-slate-600 font-serif leading-none block text-right mt-2">❞</span>
                          </div>

                          <div className="w-16 h-1 bg-saffron-100 dark:bg-slate-700 mx-auto mb-4 rounded-full" />

                          {quote.source && (
                             <p className="text-sm font-hindi font-medium text-saffron-600 dark:text-saffron-400 italic">
                                {quote.source}
                             </p>
                          )}
                      </div>
                  ) : (
                      <div className="py-12 text-slate-400">
                          <p className="mb-2 text-lg">No quote available for this date.</p>
                          <p className="text-xs">More quotes are being added soon.</p>
                      </div>
                  )}
              </div>

              {/* Action Bar */}
              {(quote || quoteImage) && (
                  <div className="bg-slate-50 dark:bg-slate-900/50 p-4 flex justify-around border-t border-slate-100 dark:border-slate-700">
                      <button 
                        onClick={handleCopy}
                        className="flex flex-col items-center gap-1 text-slate-500 hover:text-saffron-600 transition-colors"
                      >
                          <div className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                             {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                          </div>
                          <span className="text-[10px] font-bold uppercase">{copied ? 'Copied' : (quoteImage ? 'Copy Link' : 'Copy')}</span>
                      </button>

                      <button 
                         onClick={handleShare}
                         className="flex flex-col items-center gap-1 text-slate-500 hover:text-saffron-600 transition-colors"
                      >
                          <div className="p-2 rounded-full bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700">
                             <Share2 size={20} />
                          </div>
                          <span className="text-[10px] font-bold uppercase">Share</span>
                      </button>
                  </div>
              )}
          </div>

      </div>
    </div>
  );
};
