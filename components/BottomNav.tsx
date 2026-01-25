
import React from 'react';
import { Music, BookOpen, History } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom)] z-30">
      <div className="flex items-center justify-around h-16">
        <NavButton 
          icon={<Music />} 
          label="Songs" 
          active={activeTab === 'songs'} 
          onClick={() => onTabChange('songs')} 
        />
        <NavButton 
          icon={<BookOpen />} 
          label="Books" 
          active={activeTab === 'books'} 
          onClick={() => onTabChange('books')} 
        />
        <NavButton 
          icon={<History />} 
          label="History" 
          active={activeTab === 'history'} 
          onClick={() => onTabChange('history')} 
        />
      </div>
    </nav>
  );
};

const NavButton: React.FC<{ icon: React.ReactElement; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-colors ${active ? 'text-saffron-600 dark:text-saffron-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    <div className={`p-1 rounded-full ${active ? 'bg-saffron-50 dark:bg-slate-700' : ''} mb-0.5`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 } as any)}
    </div>
    <span className="text-[10px] font-bold">{label}</span>
  </button>
);
