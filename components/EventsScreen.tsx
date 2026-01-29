
import React from 'react';
import { ArrowLeft, Calendar, MapPin, Clock, Info } from 'lucide-react';

interface EventsScreenProps {
  onBack: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage: 'en' | 'hi';
}

export const EventsScreen: React.FC<EventsScreenProps> = ({ onBack, scrollBarSide = 'left', settingsLanguage }) => {
  
  const t = {
    en: {
      title: "Upcoming Mahotsav",
      noEvents: "No upcoming Mahotsav scheduled at the moment.",
      location: "Location",
      time: "Time"
    },
    hi: {
      title: "आगामी महोत्सव",
      noEvents: "इस समय कोई आगामी महोत्सव निर्धारित नहीं है।",
      location: "स्थान",
      time: "समय"
    }
  }[settingsLanguage];

  // Events list - Currently empty as per request
  const events: any[] = [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Header */}
      <div className="flex-none bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 shadow-sm z-10">
        <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-300" />
        </button>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
           <Calendar className="w-6 h-6 text-saffron-500" />
           {t.title}
        </h2>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] max-w-2xl mx-auto space-y-4">
            
            {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400">
                    <Info size={48} className="mb-4 opacity-50" />
                    <p>{t.noEvents}</p>
                </div>
            ) : (
                events.map((event, index) => (
                    <div 
                        key={event.id} 
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden animate-fade-in-up"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Date Banner */}
                        <div className="bg-saffron-50 dark:bg-slate-700/50 px-5 py-3 border-b border-saffron-100 dark:border-slate-700 flex items-center gap-3">
                            <Calendar size={18} className="text-saffron-600 dark:text-saffron-400" />
                            <span className="font-bold text-saffron-800 dark:text-saffron-200 text-sm tracking-wide uppercase">
                                {event.date}
                            </span>
                        </div>

                        <div className="p-5">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
                                {event.title}
                            </h3>
                            <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 leading-relaxed">
                                {event.description}
                            </p>

                            <div className="flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <Clock size={16} className="mt-0.5 shrink-0" />
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="mt-0.5 shrink-0" />
                                    <span>{event.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            )}

            <div className="pt-8 text-center">
               <p className="text-xs text-slate-400 dark:text-slate-600 italic">
                  {settingsLanguage === 'en' 
                    ? "Events are subject to change. Please contact us for confirmation." 
                    : "कार्यक्रमों में बदलाव हो सकता है। पुष्टि के लिए कृपया संपर्क करें।"}
               </p>
            </div>

        </div>
      </div>
    </div>
  );
};
