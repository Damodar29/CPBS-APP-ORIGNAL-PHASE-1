
import React from 'react';
import { X, Info, Share2, Star, Heart, FileText, MessageCircle, Youtube } from 'lucide-react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={`fixed top-0 left-0 bottom-0 w-80 bg-white dark:bg-slate-900 z-50 shadow-2xl transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header */}
        <div className="relative h-48 bg-gradient-to-br from-saffron-400 to-saffron-600 flex flex-col justify-end p-6">
           <button 
             onClick={onClose}
             className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full"
           >
             <X className="w-6 h-6" />
           </button>
           
           {/* Logo */}
           <div className="mb-4">
              <svg viewBox="0 0 100 200" className="h-16 w-auto text-white fill-current drop-shadow-md">
                 <path d="M25 10 L 25 90 Q 25 125 50 125 Q 75 125 75 90 L 75 10" fill="none" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
                 <path d="M50 115 Q 20 155 50 195 Q 80 155 50 115" fill="currentColor" />
              </svg>
           </div>

           <h2 className="text-white text-xl font-bold leading-tight">Shree Chaitanya Prem Bhakti Sangh</h2>
           <p className="text-saffron-100 text-sm mt-1">Bhajan Reader</p>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-12rem)]">
          <MenuItem icon={<Youtube />} label="Video Tutorial" />
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          <MenuItem icon={<Info />} label="About" />
          <MenuItem icon={<Share2 />} label="Share the App" />
          <MenuItem icon={<Star />} label="Rate the App" />
          <MenuItem icon={<Heart />} label="Donate" />
          <div className="h-px bg-slate-100 dark:bg-slate-800 my-2" />
          <MenuItem icon={<FileText />} label="Privacy Policy" />
          <MenuItem icon={<MessageCircle />} label="Feedback / Queries" subtext="(replied within a day)" />
        </div>
        
        <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-slate-400">
           v1.0.0 • Offline Mode
        </div>
      </div>
    </>
  );
};

const MenuItem: React.FC<{ icon: React.ReactNode; label: string; subtext?: string }> = ({ icon, label, subtext }) => (
  <button className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-saffron-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors text-left group">
    <span className="text-saffron-500 group-hover:scale-110 transition-transform">{icon}</span>
    <div>
      <div className="font-medium">{label}</div>
      {subtext && <div className="text-xs text-slate-400 font-normal">{subtext}</div>}
    </div>
  </button>
);
