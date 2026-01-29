
import React, { useState, useEffect } from 'react';
import { X, Info, Heart, MessageCircle, Youtube, Instagram, Facebook, Home, Download, Calendar, CalendarCheck, ExternalLink, AlertTriangle } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAbout?: () => void;
  onOpenDonate?: () => void;
  onHome?: () => void;
  onOpenDownloaded?: () => void;
  onOpenDailyQuotes?: () => void;
  onOpenEvents?: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage: 'en' | 'hi';
}

export const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, onClose, onOpenAbout, onOpenDonate, onHome, onOpenDownloaded, onOpenDailyQuotes, onOpenEvents, scrollBarSide = 'left', settingsLanguage 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingLink, setPendingLink] = useState<{ url: string; title: string; icon?: React.ReactNode; colorClass?: string } | null>(null);

  // Translations
  const t = {
    en: {
      title: "Shree Chaitanya Prem Bhakti Sangh",
      subtitle: "Bhajan Reader",
      home: "Home",
      dailyQuotes: "Daily Quotes (नित्य वाणी)",
      events: "Upcoming Mahotsav",
      downloads: "Downloaded Bhajans",
      donate: "Donate",
      youtube: "Youtube Channel",
      instagram: "Instagram Page",
      facebook: "Facebook Page",
      about: "About",
      feedback: "Feedback / Queries",
      feedbackSub: "(replied within a day)",
      online: "Online",
      offline: "Offline Mode",
      openLink: "Open Link?",
      linkDesc: "You are leaving the app to visit",
      cancel: "Cancel",
      open: "Open"
    },
    hi: {
      title: "श्री चैतन्य प्रेम भक्ति संघ",
      subtitle: "भजन संग्रह",
      home: "मुख पृष्ठ",
      dailyQuotes: "नित्य वाणी",
      events: "आगामी महोत्सव",
      downloads: "डाउनलोड किए गए भजन",
      donate: "सहयोग / दान",
      youtube: "यूट्यूब चैनल",
      instagram: "इंस्टाग्राम पेज",
      facebook: "फेसबुक पेज",
      about: "परिचय",
      feedback: "सुझाव / संपर्क",
      feedbackSub: "(एक दिन में उत्तर)",
      online: "ऑनलाइन",
      offline: "ऑफलाइन",
      openLink: "लिंक खोलें?",
      linkDesc: "आप ऐप से बाहर जा रहे हैं:",
      cancel: "रद्द करें",
      open: "खोलें"
    }
  }[settingsLanguage];

  useEffect(() => {
    const handleStatusChange = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  // Close confirmation modal when side menu closes
  useEffect(() => {
    if (!isOpen) {
      setPendingLink(null);
    }
  }, [isOpen]);

  const handleFeedback = () => {
    setPendingLink({
        url: 'https://wa.me/917049304733',
        title: t.feedback,
        icon: <MessageCircle size={24} />,
        colorClass: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
    });
  };

  const handleYoutube = () => {
    setPendingLink({
        url: 'https://www.youtube.com/channel/UC3i5l3jbvNcnvd72DP1oPsA',
        title: t.youtube,
        icon: <Youtube size={24} />,
        colorClass: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
    });
  };

  const handleInstagram = () => {
    setPendingLink({
        url: 'https://www.instagram.com/chaitanya_prem_bhakti/?hl=en',
        title: t.instagram,
        icon: <Instagram size={24} />,
        colorClass: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400'
    });
  };

  const handleFacebook = () => {
    setPendingLink({
        url: 'https://www.facebook.com/chaitanyaprembhakti/',
        title: t.facebook,
        icon: <Facebook size={24} />,
        colorClass: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
    });
  };

  const confirmNavigation = () => {
      if (pendingLink) {
          window.open(pendingLink.url, '_blank');
          setPendingLink(null);
      }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header - Clickable to open About */}
        <div 
          onClick={onOpenAbout}
          className="relative h-48 bg-gradient-to-br from-saffron-400 to-saffron-600 flex flex-col justify-end p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] cursor-pointer hover:brightness-105 active:brightness-95 transition-all group"
        >
           <button 
             onClick={(e) => {
               e.stopPropagation();
               onClose();
             }}
             className="absolute top-[calc(1rem+env(safe-area-inset-top))] right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors z-10"
           >
             <X className="w-6 h-6" />
           </button>
           
           {/* Logo */}
           <div className="mb-4 transform group-hover:scale-105 transition-transform duration-300 origin-left">
              <svg viewBox="0 0 100 200" className="h-16 w-auto text-white fill-current drop-shadow-md">
                 <path d="M25 10 L 25 90 Q 25 125 50 125 Q 75 125 75 90 L 75 10" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                 <path d="M50 115 Q 20 155 50 195 Q 80 155 50 115" fill="currentColor" />
              </svg>
           </div>

           <h2 className="text-white text-xl font-bold leading-tight group-hover:translate-x-1 transition-transform">
             {t.title}
           </h2>
           <p className="text-saffron-100 text-sm mt-1 group-hover:translate-x-1 transition-transform delay-75">
             {t.subtitle}
           </p>
        </div>

        {/* Menu Items - Scrollbar Applied */}
        <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
          <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 space-y-1">
            <MenuItem icon={<Home />} label={t.home} onClick={onHome} />
            
            <MenuItem icon={<Calendar />} label={t.dailyQuotes} onClick={onOpenDailyQuotes} />

            <MenuItem icon={<CalendarCheck />} label={t.events} onClick={onOpenEvents} />
            
            <MenuItem icon={<Download />} label={t.downloads} onClick={onOpenDownloaded} />

            <MenuItem icon={<Heart />} label={t.donate} onClick={onOpenDonate} />
            
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
            
            {/* YouTube Channel */}
            <MenuItem icon={<Youtube />} label={t.youtube} onClick={handleYoutube} />
            
            {/* Instagram */}
            <MenuItem icon={<Instagram />} label={t.instagram} onClick={handleInstagram} />
            
            {/* Facebook Page */}
            <MenuItem icon={<Facebook />} label={t.facebook} onClick={handleFacebook} />
            
            {/* About */}
            <MenuItem icon={<Info />} label={t.about} onClick={onOpenAbout} />
            
            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
            
            <MenuItem 
              icon={<MessageCircle />} 
              label={t.feedback} 
              subtext={t.feedbackSub} 
              onClick={handleFeedback}
            />
          </div>
        </div>
        
        {/* Footer - added pb for safe area */}
        <div className="p-4 text-center text-xs text-slate-400 pb-[calc(1rem+env(safe-area-inset-bottom))]">
           v1.0.0 • {isOnline ? t.online : t.offline}
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingLink && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-2xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${pendingLink.colorClass || 'bg-saffron-100 dark:bg-saffron-900/20 text-saffron-600 dark:text-saffron-400'}`}>
                          {pendingLink.icon || <ExternalLink size={24} />}
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                          {t.openLink}
                      </h3>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                          {t.linkDesc} <strong>{pendingLink.title}</strong>
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setPendingLink(null)}
                              className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                          >
                              {t.cancel}
                          </button>
                          <button 
                              onClick={confirmNavigation}
                              className="flex-1 py-2.5 text-white font-bold bg-saffron-500 hover:bg-saffron-600 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                          >
                              {t.open} <ExternalLink size={14} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; subtext?: string; onClick?: () => void }> = ({ icon, label, subtext, onClick }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors text-left group"
  >
    <span className="text-saffron-500 group-hover:scale-110 transition-transform">{icon}</span>
    <div>
      <div className="font-medium">{label}</div>
      {subtext && <div className="text-xs text-slate-400 font-normal">{subtext}</div>}
    </div>
  </button>
);
