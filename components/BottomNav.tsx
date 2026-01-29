
import React from 'react';
import { Music, BookOpen, History, Mic2, Users } from 'lucide-react';
import { AppTab } from '../types';

interface BottomNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  devMode: boolean;
  settingsLanguage: 'en' | 'hi';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange, devMode, settingsLanguage }) => {
  const t = {
    en: {
      bhajans: "Bhajans",
      authors: "Authors",
      books: "Books",
      lectures: "Lectures",
      history: "History"
    },
    hi: {
      bhajans: "भजन",
      authors: "रचयिता",
      books: "ग्रंथ",
      lectures: "प्रवचन",
      history: "इतिहास"
    }
  }[settingsLanguage];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 pb-[env(safe-area-inset-bottom)] z-30">
      <div className="flex items-center justify-around h-16">
        <NavButton 
          icon={<Music />} 
          label={t.bhajans}
          active={activeTab === 'songs'} 
          onClick={() => onTabChange('songs')} 
        />
        {devMode && (
          <NavButton 
            icon={<Users />} 
            label={t.authors} 
            active={activeTab === 'authors'} 
            onClick={() => onTabChange('authors')} 
          />
        )}
        <NavButton 
          icon={<BookOpen />} 
          label={t.books}
          active={activeTab === 'books'} 
          onClick={() => onTabChange('books')} 
        />
        <NavButton 
          icon={<Mic2 />} 
          label={t.lectures}
          active={activeTab === 'lectures'} 
          onClick={() => onTabChange('lectures')} 
        />
        <NavButton 
          icon={<History />} 
          label={t.history}
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
    className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 active:scale-90 ${active ? 'text-saffron-600 dark:text-saffron-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
  >
    <div className={`p-1 rounded-full transition-all duration-300 ${active ? 'bg-saffron-50 dark:bg-slate-700 -translate-y-1' : ''} mb-0.5`}>
      {React.cloneElement(icon, { size: 22, strokeWidth: active ? 2.5 : 2 } as any)}
    </div>
    <span className={`text-[10px] font-bold transition-opacity duration-200 ${active ? 'opacity-100' : 'opacity-80'}`}>{label}</span>
  </button>
);
