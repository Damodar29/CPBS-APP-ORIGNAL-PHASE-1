
import React from 'react';
import { X, Info, Heart, MessageCircle, Youtube, Instagram, Facebook } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAbout?: () => void;
  onOpenDonate?: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, onOpenAbout, onOpenDonate }) => {
  const handleFeedback = () => {
    window.open('https://wa.me/917049304733', '_blank');
  };

  const handleYoutube = () => {
    window.open('https://www.youtube.com/channel/UC3i5l3jbvNcnvd72DP1oPsA', '_blank');
  };

  const handleInstagram = () => {
    window.open('https://www.instagram.com/chaitanya_prem_bhakti/?hl=en', '_blank');
  };

  const handleFacebook = () => {
    window.open('https://www.facebook.com/chaitanyaprembhakti/', '_blank');
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

           <h2 className="text-white text-xl font-bold leading-tight group-hover:translate-x-1 transition-transform">Shree Chaitanya Prem Bhakti Sangh</h2>
           <p className="text-saffron-100 text-sm mt-1 group-hover:translate-x-1 transition-transform delay-75">Bhajan Reader</p>
        </div>

        {/* Menu Items */}
        <div className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Donate moved to top */}
          <MenuItem icon={<Heart />} label="Donate" onClick={onOpenDonate} />
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          
          {/* YouTube Channel */}
          <MenuItem icon={<Youtube />} label="Youtube Channel" onClick={handleYoutube} />
          
          {/* Instagram */}
          <MenuItem icon={<Instagram />} label="Instagram Page" onClick={handleInstagram} />
          
          {/* Facebook Page (Replaced Share) */}
          <MenuItem icon={<Facebook />} label="Facebook Page" onClick={handleFacebook} />
          
          {/* About */}
          <MenuItem icon={<Info />} label="About" onClick={onOpenAbout} />
          
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          
          <MenuItem 
            icon={<MessageCircle />} 
            label="Feedback / Queries" 
            subtext="(replied within a day)" 
            onClick={handleFeedback}
          />
        </div>
        
        {/* Footer - added pb for safe area */}
        <div className="p-4 text-center text-xs text-slate-400 pb-[calc(1rem+env(safe-area-inset-bottom))]">
           v1.0.0 • Offline Mode
        </div>
      </div>
    </>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; subtext?: string; onClick?: () => void }> = ({ icon, label, subtext, onClick }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-left group"
  >
    <span className="text-saffron-500 group-hover:scale-110 transition-transform">{icon}</span>
    <div>
      <div className="font-medium">{label}</div>
      {subtext && <div className="text-xs text-slate-400 font-normal">{subtext}</div>}
    </div>
  </button>
);
