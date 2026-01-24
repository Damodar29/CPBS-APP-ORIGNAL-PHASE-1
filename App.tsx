
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { Search, Menu, Settings, Filter, X, History } from 'lucide-react';
import { RAW_BHAJAN_DATA } from './data/rawBhajans';
import { parseRawBhajanText, calculateSearchScore, getMatchingSnippet, convertToIAST, smartNormalize, transliterateForSearch, isFuzzyMatch } from './utils/textProcessor';
import { Bhajan, FontSize, ScriptType, AppTab } from './types';
import { BhajanList } from './components/BhajanList';
import { BhajanReader } from './components/BhajanReader';
import { HighlightText } from './components/HighlightText';
import { SplashScreen } from './components/SplashScreen';
import { SideMenu } from './components/SideMenu';
import { SettingsScreen } from './components/SettingsScreen';
import { BottomNav } from './components/BottomNav';
import { CategoryList } from './components/CategoryList';

// Increment this version when logic changes to force client update
const DATA_VERSION = '5';

export const App: React.FC = () => {
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState(''); // New: For performance
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [isNewBhajan, setIsNewBhajan] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>('songs');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Settings State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('cpbs_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('cpbs_fontsize');
    const parsed = parseInt(saved || '20', 10);
    return isNaN(parsed) ? 20 : parsed;
  });

  const [script, setScript] = useState<ScriptType>(() => (localStorage.getItem('cpbs_script') as ScriptType) || 'devanagari');
  const [keepAwake, setKeepAwake] = useState<boolean>(() => localStorage.getItem('cpbs_awake') === 'true');
  const [devMode, setDevMode] = useState<boolean>(false);

  const [indexMode, setIndexMode] = useState<'latin' | 'devanagari'>(() => {
    return (localStorage.getItem('cpbs_index_mode') as 'latin' | 'devanagari') || 'latin';
  });

  const [historyIds, setHistoryIds] = useState<string[]>(() => {
     try {
       return JSON.parse(localStorage.getItem('cpbs_history') || '[]');
     } catch { return []; }
  });

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // --- EFFECTS ---
  
  // Debounce Search
  useEffect(() => {
      const handler = setTimeout(() => {
          setDebouncedQuery(searchQuery);
      }, 300); // 300ms delay
      return () => clearTimeout(handler);
  }, [searchQuery]);

  // Initialization
  useEffect(() => {
    const startTime = Date.now();
    const savedVersion = localStorage.getItem('cpbs_data_version');
    const savedData = localStorage.getItem('cpbs_all_bhajans');
    
    let loadedData: Bhajan[] = [];
    let usedSaved = false;

    if (savedData && savedVersion === DATA_VERSION) {
      try {
        loadedData = JSON.parse(savedData);
        usedSaved = true;
      } catch (e) {
        console.error("Failed to parse saved bhajans", e);
      }
    }

    if (!usedSaved) {
       loadedData = parseRawBhajanText(RAW_BHAJAN_DATA);
       if (savedData) {
          try {
             const oldData = JSON.parse(savedData) as Bhajan[];
             const customSongs = oldData.filter(b => b.id.startsWith('custom-'));
             loadedData = [...customSongs, ...loadedData];
          } catch(e) {}
       }
       localStorage.setItem('cpbs_all_bhajans', JSON.stringify(loadedData));
       localStorage.setItem('cpbs_data_version', DATA_VERSION);
    }
    
    setBhajans(loadedData);

    const MIN_SPLASH_DURATION = 1000; 
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsed);
    const timer = setTimeout(() => setIsLoading(false), remainingTime);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('cpbs_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('cpbs_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => localStorage.setItem('cpbs_fontsize', fontSize.toString()), [fontSize]);
  useEffect(() => localStorage.setItem('cpbs_script', script), [script]);
  useEffect(() => localStorage.setItem('cpbs_index_mode', indexMode), [indexMode]);
  useEffect(() => localStorage.setItem('cpbs_history', JSON.stringify(historyIds)), [historyIds]);
  useEffect(() => localStorage.setItem('cpbs_awake', String(keepAwake)), [keepAwake]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useLayoutEffect(() => {
    if (!selectedBhajan && scrollPositionRef.current > 0) {
       window.scrollTo(0, scrollPositionRef.current);
    }
  }, [selectedBhajan]);

  // --- DATA MANAGEMENT ---

  const saveToStorage = (data: Bhajan[]) => {
    localStorage.setItem('cpbs_all_bhajans', JSON.stringify(data));
    setBhajans(data);
  };

  const handleUpdateBhajan = (id: string, newTitle: string, newContent: string) => {
    const updatedBhajans = bhajans.map(b => {
      if (b.id === id) {
        const titleIAST = convertToIAST(newTitle);
        const contentIAST = convertToIAST(newContent);
        const combinedText = `${newTitle} ${newContent}`;
        const transliteratedText = transliterateForSearch(combinedText);
        const normalizedIndex = smartNormalize(transliteratedText);
        const searchIndex = `${combinedText.toLowerCase()} ${normalizedIndex}`;
        const searchTokens = Array.from(new Set(
           transliteratedText.toLowerCase().split(/[\s,।॥!?-]+/)
           .filter(t => t.length > 2)
           .map(t => smartNormalize(t))
        ));
        const contentLines = newContent.split('\n');
        const firstLine = contentLines.find(line => line.trim().length > 0)?.trim() || newTitle;
        const firstLineIAST = convertToIAST(firstLine);

        return {
          ...b, title: newTitle, titleIAST, content: newContent, contentIAST,
          firstLine, firstLineIAST, searchIndex, searchTokens
        };
      }
      return b;
    });
    saveToStorage(updatedBhajans);
    const updatedSelected = updatedBhajans.find(b => b.id === id);
    if (updatedSelected) setSelectedBhajan(updatedSelected);
    setIsNewBhajan(false);
  };

  const handleCreateBhajan = () => {
    const newId = `custom-${Date.now()}`;
    const newBhajan: Bhajan = {
      id: newId, title: 'New Bhajan Title', titleIAST: 'New Bhajan Title',
      content: 'Enter lyrics here...', contentIAST: 'Enter lyrics here...',
      firstLine: 'Enter lyrics here...', firstLineIAST: 'Enter lyrics here...',
      searchIndex: '', searchTokens: [],
    };
    setIsNewBhajan(true); 
    setSelectedBhajan(newBhajan);
    setIsSettingsOpen(false); 
    setBhajans(prev => [newBhajan, ...prev]);
  };

  const handleDeleteBhajan = (id: string) => {
    if (window.confirm("Are you sure you want to delete this bhajan?")) {
       const filtered = bhajans.filter(b => b.id !== id);
       saveToStorage(filtered);
       setSelectedBhajan(null);
    }
  };

  const handleRestoreDeleted = () => {
     const freshData = parseRawBhajanText(RAW_BHAJAN_DATA);
     const currentIds = new Set(bhajans.map(b => b.id));
     const missingBhajans = freshData.filter(b => !currentIds.has(b.id));
     if (missingBhajans.length === 0) { alert("No built-in songs are missing."); return; }
     if (window.confirm(`Found ${missingBhajans.length} missing built-in songs. Restore them?`)) {
        const updated = [...bhajans, ...missingBhajans];
        saveToStorage(updated);
        alert(`Restored ${missingBhajans.length} songs.`);
     }
  };

  const handleResetData = () => {
    if (window.confirm("Reset all data to default? Your custom songs will be lost.")) {
       localStorage.removeItem('cpbs_all_bhajans');
       const freshData = parseRawBhajanText(RAW_BHAJAN_DATA);
       setBhajans(freshData);
       localStorage.setItem('cpbs_data_version', DATA_VERSION);
       alert("Data reset successfully.");
    }
  };

  // --- FILTERING LOGIC ---

  const addToHistory = (id: string) => {
    setHistoryIds(prev => {
      const newHistory = [id, ...prev.filter(hId => hId !== id)].slice(0, 50);
      return newHistory;
    });
  };

  // Advanced Scoring and Sorting
  const filteredBhajans = useMemo(() => {
    if (!debouncedQuery.trim()) return bhajans;
    
    // Map to objects with score
    const scored = bhajans.map(b => ({
        bhajan: b,
        score: calculateSearchScore(b, debouncedQuery, script)
    }));

    // Filter out zero scores
    const matches = scored.filter(item => item.score > 0);

    // Sort by Score Descending
    matches.sort((a, b) => b.score - a.score);

    return matches.map(m => m.bhajan);
  }, [bhajans, debouncedQuery, script]);

  const historyBhajans = useMemo(() => {
    return historyIds.map(id => bhajans.find(b => b.id === id)).filter(Boolean) as Bhajan[];
  }, [historyIds, bhajans]);

  const suggestions = useMemo(() => {
    if (!searchQuery.trim() || !isSearchFocused) return [];
    // Just use filtered bhajans, they are already sorted by relevance
    return filteredBhajans.slice(0, 6);
  }, [filteredBhajans, searchQuery, isSearchFocused]);

  const handleSelectBhajan = (bhajan: Bhajan) => {
    scrollPositionRef.current = window.scrollY;
    addToHistory(bhajan.id);
    setSelectedBhajan(bhajan);
    setIsNewBhajan(false);
    setIsSearchFocused(false);
  };

  if (isLoading) return <SplashScreen />;

  return (
    <div className={`min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 ${selectedBhajan ? 'h-screen overflow-hidden' : ''}`}>
      
      {/* --- SIDE MENU --- */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />

      {/* --- SETTINGS SCREEN --- */}
      <SettingsScreen 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        script={script}
        onScriptChange={setScript}
        darkMode={darkMode}
        onThemeChange={(val) => setDarkMode(val)}
        keepAwake={keepAwake}
        onKeepAwakeChange={setKeepAwake}
        devMode={devMode}
        onDevModeChange={setDevMode}
        onResetData={handleResetData}
        onRestoreDeleted={handleRestoreDeleted}
        onAddBhajan={handleCreateBhajan}
        allBhajans={bhajans}
      />

      {/* --- BHAJAN READER OVERLAY --- */}
      {selectedBhajan && (
        <BhajanReader
          bhajan={selectedBhajan}
          onBack={() => {
             if (isNewBhajan) setBhajans(prev => prev.filter(b => b.id !== selectedBhajan.id));
             setSelectedBhajan(null);
          }}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          searchQuery={debouncedQuery}
          script={script}
          onToggleScript={() => setScript(s => s === 'devanagari' ? 'iast' : 'devanagari')}
          keepAwake={keepAwake}
          devMode={devMode}
          onSave={handleUpdateBhajan}
          onDelete={handleDeleteBhajan}
          autoEdit={isNewBhajan}
        />
      )}

      {/* --- MAIN HEADER --- */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-2 p-3">
           <button onClick={() => setIsSideMenuOpen(true)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Menu className="w-6 h-6" />
           </button>
           
           <div className="flex-1 relative" ref={searchContainerRef}>
              <div className="relative group">
                 <input
                    type="text"
                    placeholder="Search bhajans..."
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-saffron-400 dark:focus:border-saffron-500 rounded-full py-2.5 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-saffron-200 dark:focus:ring-saffron-900/30 transition-all shadow-inner"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                 />
                 <Search className={`absolute left-3.5 top-3 w-5 h-5 pointer-events-none transition-colors ${isSearchFocused ? 'text-saffron-500' : 'text-slate-400'}`} />
                 
                 {searchQuery && (
                   <button 
                      onClick={() => { setSearchQuery(''); setIsSearchFocused(true); }} 
                      className="absolute right-2 top-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
                    >
                     <X className="w-4 h-4" />
                   </button>
                 )}
              </div>

              {/* Suggestions Dropdown */}
              {isSearchFocused && searchQuery && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl z-50 overflow-hidden border border-slate-100 dark:border-slate-700 animate-fade-in-up">
                  <ul>
                    {suggestions.map((bhajan) => {
                      const matchedLine = getMatchingSnippet(bhajan, debouncedQuery, script);
                      return (
                        <li key={bhajan.id}>
                          <button
                            onClick={() => handleSelectBhajan(bhajan)}
                            className="w-full text-left px-4 py-3 hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors flex flex-col border-b border-slate-100 dark:border-slate-700 last:border-0"
                          >
                             <span className="font-hindi text-slate-800 dark:text-slate-200 font-bold truncate w-full">
                                <HighlightText text={script === 'iast' ? bhajan.titleIAST : bhajan.title} highlight={debouncedQuery} />
                             </span>
                             {matchedLine ? (
                               <div className="flex items-center gap-1 mt-1">
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1 rounded uppercase font-bold tracking-wider">Line</span>
                                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate w-full italic">
                                      <HighlightText text={matchedLine} highlight={debouncedQuery} />
                                  </span>
                               </div>
                             ) : (
                               <span className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 w-full font-hindi">
                                  {script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine}
                               </span>
                             )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
           </div>

           <button onClick={() => setIsSettingsOpen(true)} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <Settings className="w-6 h-6" />
           </button>
        </div>

        {activeTab === 'songs' && (
           <div className="px-4 pb-2 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              <span>{filteredBhajans.length} Songs</span>
              <button 
                onClick={() => setIndexMode(indexMode === 'latin' ? 'devanagari' : 'latin')}
                className="flex items-center gap-1 hover:text-saffron-600 dark:hover:text-saffron-400 transition-colors"
              >
                 <Filter size={12} />
                 <span>Sort: {indexMode === 'latin' ? 'A-Z' : 'अ-ज्ञ'}</span>
              </button>
           </div>
        )}
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto scroll-smooth">
         {activeTab === 'songs' && (
            <BhajanList 
               bhajans={filteredBhajans}
               onSelect={handleSelectBhajan}
               searchQuery={debouncedQuery}
               script={script}
               indexMode={indexMode}
               onIndexModeChange={setIndexMode}
            />
         )}

         {activeTab === 'authors' && (
            <CategoryList 
               bhajans={bhajans} 
               onSelect={handleSelectBhajan} 
               script={script}
            />
         )}

         {activeTab === 'history' && (
            <div className="pb-24">
               {historyBhajans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                     <History size={48} strokeWidth={1} className="mb-4 opacity-50" />
                     <p>No recently viewed songs</p>
                  </div>
               ) : (
                  <>
                     <div className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider bg-slate-50/95 dark:bg-slate-900/95 sticky top-0 border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm z-10">
                        Recently Viewed
                     </div>
                     <ul className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-800">
                        {historyBhajans.map(bhajan => (
                           <li key={bhajan.id}>
                              <button
                                 onClick={() => handleSelectBhajan(bhajan)}
                                 className="w-full text-left py-3.5 px-4 hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors"
                              >
                                 <div className="font-hindi text-slate-800 dark:text-slate-200 font-bold text-lg">
                                    {script === 'iast' ? bhajan.titleIAST : bhajan.title}
                                 </div>
                                 <div className="text-sm text-slate-500 mt-1 truncate font-hindi">
                                    {script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine}
                                 </div>
                              </button>
                           </li>
                        ))}
                     </ul>
                  </>
               )}
            </div>
         )}
      </main>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};
