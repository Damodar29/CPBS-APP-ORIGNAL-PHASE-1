
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { Search, Menu, Settings, X, History, Trash2 } from 'lucide-react';
import { RAW_BHAJAN_DATA } from './data/rawBhajans';
import { BOOKS_DATA } from './data/books';
import { parseRawBhajanText, calculateSearchScore, getMatchingSnippet, convertToIAST, smartNormalize, transliterateForSearch, isFuzzyMatch } from './utils/textProcessor';
import { Bhajan, FontSize, ScriptType, AppTab } from './types';
import { BhajanList } from './components/BhajanList';
import { BhajanReader } from './components/BhajanReader';
import { HighlightText } from './components/HighlightText';
import { SplashScreen } from './components/SplashScreen';
import { SideMenu } from './components/SideMenu';
import { SettingsScreen } from './components/SettingsScreen';
import { AboutScreen } from './components/AboutScreen';
import { DonateScreen } from './components/DonateScreen';
import { BottomNav } from './components/BottomNav';
import { BookList } from './components/BookList';

// Increment this version when logic changes to force client update
const DATA_VERSION = '5';

export const App: React.FC = () => {
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [isNewBhajan, setIsNewBhajan] = useState(false);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>('songs');
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);

  // Settings State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('cpbs_theme');
    if (saved !== null) return saved === 'dark';
    return true; // Default to Dark Mode
  });

  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('cpbs_fontsize');
    const parsed = parseInt(saved || '20', 10);
    return isNaN(parsed) ? 20 : parsed;
  });

  const [script, setScript] = useState<ScriptType>(() => (localStorage.getItem('cpbs_script') as ScriptType) || 'devanagari');
  
  const [keepAwake, setKeepAwake] = useState<boolean>(() => {
    const saved = localStorage.getItem('cpbs_awake');
    if (saved !== null) return saved === 'true';
    return true; // Default to Keep Awake
  });

  const [settingsLanguage, setSettingsLanguage] = useState<'en' | 'hi'>(() => {
     return (localStorage.getItem('cpbs_settings_lang') as 'en' | 'hi') || 'hi';
  });

  const [devMode, setDevMode] = useState<boolean>(false);

  // Sorting State
  const [indexMode, setIndexMode] = useState<'latin' | 'devanagari'>(() => {
    return (localStorage.getItem('cpbs_index_mode') as 'latin' | 'devanagari') || 'devanagari';
  });

  const [historyIds, setHistoryIds] = useState<string[]>(() => {
     try {
       return JSON.parse(localStorage.getItem('cpbs_history') || '[]');
     } catch { return []; }
  });

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll Management
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // --- ANDROID BACK BUTTON HANDLING (HISTORY API) ---
  
  // We use a ref to track current state inside the event listener to avoid stale closures
  const stateRef = useRef({ 
    hasSelectedBhajan: !!selectedBhajan, 
    isSettingsOpen, 
    isAboutOpen,
    isDonateOpen,
    isSideMenuOpen,
    isSearchFocused
  });

  // Sync ref with state
  useEffect(() => {
    stateRef.current = { 
      hasSelectedBhajan: !!selectedBhajan, 
      isSettingsOpen, 
      isAboutOpen,
      isDonateOpen,
      isSideMenuOpen,
      isSearchFocused
    };
  }, [selectedBhajan, isSettingsOpen, isAboutOpen, isDonateOpen, isSideMenuOpen, isSearchFocused]);

  useEffect(() => {
    // On mount, replace state to ensure we have a clean slate to go back to
    try {
        window.history.replaceState({ view: 'root' }, '');
    } catch (e) {
        console.warn('History replaceState failed', e);
    }

    const handlePopState = (event: PopStateEvent) => {
      // Logic: If any overlay is open, the 'back' action (popstate) should close it.
      // We check our Ref to see what is open and close it.
      try {
          const { hasSelectedBhajan, isSettingsOpen, isAboutOpen, isDonateOpen, isSideMenuOpen, isSearchFocused } = stateRef.current;

          if (hasSelectedBhajan) {
            setSelectedBhajan(null);
            setIsNewBhajan(false);
          } else if (isDonateOpen) {
            setIsDonateOpen(false);
          } else if (isSettingsOpen) {
            setIsSettingsOpen(false);
          } else if (isAboutOpen) {
            setIsAboutOpen(false);
          } else if (isSideMenuOpen) {
            setIsSideMenuOpen(false);
          } else if (isSearchFocused) {
            setIsSearchFocused(false);
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
          }
      } catch (e) {
          console.error("Error in popstate handler", e);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Helper to push state when opening a view
  const openView = (viewName: string) => {
    try {
        window.history.pushState({ view: viewName }, '', `#${viewName}`);
    } catch (e) {
        console.warn('History pushState failed', e);
    }
  };

  // Helper to go back (used by UI buttons to trigger the same logic as Hardware Back)
  const goBack = useCallback(() => {
    // 1. Try to use History API
    try {
        window.history.back();
    } catch (e) {
        console.warn('History back failed', e);
    }

    // 2. SAFETY FALLBACK:
    // If popstate doesn't fire (e.g., no history entry, or delay), force the UI update after a short tick.
    // This ensures buttons are never "dead" even if the history stack is empty.
    setTimeout(() => {
        const { hasSelectedBhajan, isSettingsOpen, isAboutOpen, isDonateOpen, isSideMenuOpen, isSearchFocused } = stateRef.current;
        
        // Explicitly close top-most layer if it's still open
        if (hasSelectedBhajan) setSelectedBhajan(null);
        else if (isDonateOpen) setIsDonateOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isAboutOpen) setIsAboutOpen(false);
        else if (isSideMenuOpen) setIsSideMenuOpen(false);
        else if (isSearchFocused) {
            setIsSearchFocused(false);
            if (document.activeElement instanceof HTMLElement) {
              document.activeElement.blur();
            }
        }
    }, 100);
  }, []);

  // --- WRAPPERS FOR UI ACTIONS ---

  const handleOpenReader = (bhajan: Bhajan) => {
    if (mainScrollRef.current) {
        scrollPositionRef.current = mainScrollRef.current.scrollTop;
    }
    addToHistory(bhajan.id);
    setSelectedBhajan(bhajan);
    setIsNewBhajan(false);
    setIsSearchFocused(false);
    openView('reader');
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    openView('settings');
  };

  const handleOpenAbout = () => {
    setIsSideMenuOpen(false);
    setIsAboutOpen(true);
    openView('about');
  };

  const handleOpenDonate = () => {
    setIsSideMenuOpen(false);
    setIsDonateOpen(true);
    openView('donate');
  };

  const handleOpenMenu = () => {
    setIsSideMenuOpen(true);
    openView('menu');
  };

  const handleCreateBhajanWrapper = () => {
    // Close settings first (logically replacing the view, or stacking)
    // To be simple, we can just replace settings with reader in history or stack them.
    // Stacking is safer for "Back" behavior.
    handleCreateBhajan(); 
    // handleCreateBhajan sets selectedBhajan, so we should push history for reader
    openView('reader');
  };


  // --- EFFECTS ---
  
  // Debounce Search
  useEffect(() => {
      const handler = setTimeout(() => {
          setDebouncedQuery(searchQuery);
      }, 300);
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
  useEffect(() => localStorage.setItem('cpbs_settings_lang', settingsLanguage), [settingsLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Restore Scroll Position when returning from Reader
  useLayoutEffect(() => {
    if (!selectedBhajan && scrollPositionRef.current > 0 && mainScrollRef.current) {
       mainScrollRef.current.scrollTop = scrollPositionRef.current;
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
       // Go back automatically after delete
       goBack(); 
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

  const handleClearHistory = () => {
    if (window.confirm("Clear all history?")) {
      setHistoryIds([]);
    }
  };

  // --- FILTERING LOGIC ---

  const addToHistory = (id: string) => {
    setHistoryIds(prev => {
      const newHistory = [id, ...prev.filter(hId => hId !== id)].slice(0, 50);
      return newHistory;
    });
  };

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
    return filteredBhajans.slice(0, 6);
  }, [filteredBhajans, searchQuery, isSearchFocused]);

  if (isLoading) return <SplashScreen />;

  return (
    <div className={`flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-900 ${selectedBhajan ? 'overflow-hidden' : ''}`}>
      
      {/* --- OVERLAYS --- */}
      {/* Use goBack for closing to sync with hardware back button */}
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={goBack} 
        onOpenAbout={handleOpenAbout} 
        onOpenDonate={handleOpenDonate}
      />

      <SettingsScreen 
        isOpen={isSettingsOpen} 
        onClose={goBack}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        script={script}
        onScriptChange={setScript}
        darkMode={darkMode}
        onThemeChange={(val) => setDarkMode(val)}
        keepAwake={keepAwake}
        onKeepAwakeChange={setKeepAwake}
        settingsLanguage={settingsLanguage}
        onSettingsLanguageChange={setSettingsLanguage}
        devMode={devMode}
        onDevModeChange={setDevMode}
        onResetData={handleResetData}
        onRestoreDeleted={handleRestoreDeleted}
        onAddBhajan={handleCreateBhajanWrapper}
        allBhajans={bhajans}
      />
      
      <AboutScreen 
         isOpen={isAboutOpen}
         onClose={goBack}
         onOpenDonate={handleOpenDonate}
      />

      <DonateScreen 
         isOpen={isDonateOpen}
         onClose={goBack}
      />

      {selectedBhajan && (
        <BhajanReader
          bhajan={selectedBhajan}
          onBack={goBack}
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

      {/* --- FIXED HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 p-2 h-16 max-w-3xl mx-auto">
           <button onClick={handleOpenMenu} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0">
              <Menu className="w-6 h-6" />
           </button>
           
           <div className="flex-1 relative" ref={searchContainerRef}>
              <div className="relative group">
                 <input
                    type="text"
                    placeholder="Search bhajans..."
                    className="w-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border border-transparent focus:border-saffron-400 dark:focus:border-saffron-500 rounded-full py-2 pl-10 pr-10 focus:outline-none focus:ring-2 focus:ring-saffron-200 dark:focus:ring-saffron-900/30 transition-all shadow-inner h-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                 />
                 <Search className={`absolute left-3.5 top-2.5 w-5 h-5 pointer-events-none transition-colors ${isSearchFocused ? 'text-saffron-500' : 'text-slate-400'}`} />
                 
                 {searchQuery && (
                   <button 
                      onClick={() => { setSearchQuery(''); setIsSearchFocused(true); }} 
                      className="absolute right-2 top-1.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-all"
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
                            onClick={() => handleOpenReader(bhajan)}
                            className="w-full text-left px-4 py-3 hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors flex flex-col border-b border-slate-100 dark:border-slate-700 last:border-0"
                          >
                             <span className="font-hindi text-slate-800 dark:text-slate-200 font-bold truncate w-full">
                                <HighlightText text={script === 'iast' ? bhajan.titleIAST : bhajan.title} highlight={debouncedQuery} />
                             </span>
                             {matchedLine ? (
                               <div className="flex items-center gap-1 mt-1">
                                  <span className="shrink-0 text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-1 rounded uppercase font-bold tracking-wider">Line</span>
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

           <button onClick={handleOpenSettings} className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0">
              <Settings className="w-6 h-6" />
           </button>
        </div>
      </header>

      {/* --- SCROLLABLE MAIN CONTENT --- */}
      {/* Dynamic padding using calc() to handle both fixed element height (4rem/16) and safe area */}
      <main 
        ref={mainScrollRef}
        className="flex-1 overflow-y-auto w-full max-w-3xl mx-auto scroll-smooth pt-[calc(4rem+env(safe-area-inset-top))] pb-[calc(5rem+env(safe-area-inset-bottom))] no-scrollbar-on-mobile"
      >
         {activeTab === 'songs' && (
            <BhajanList 
               bhajans={filteredBhajans}
               onSelect={handleOpenReader}
               searchQuery={debouncedQuery}
               script={script}
               indexMode={indexMode}
               onIndexModeChange={setIndexMode}
            />
         )}

         {activeTab === 'books' && (
            <BookList books={BOOKS_DATA} />
         )}

         {activeTab === 'history' && (
            <div className="min-h-full bg-white dark:bg-slate-900">
               {historyBhajans.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-slate-400">
                     <History size={48} strokeWidth={1} className="mb-4 opacity-50" />
                     <p>No recently viewed songs</p>
                  </div>
               ) : (
                  <>
                     <div className="flex items-center justify-between px-4 py-3 bg-slate-50/95 dark:bg-slate-900/95 sticky top-0 border-b border-slate-100 dark:border-slate-800 backdrop-blur-sm z-10">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Recently Viewed</span>
                        <button 
                           onClick={handleClearHistory}
                           className="text-xs flex items-center gap-1 text-red-500 hover:text-red-600 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full transition-colors"
                        >
                           <Trash2 size={12} /> Clear
                        </button>
                     </div>
                     <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                        {historyBhajans.map(bhajan => (
                           <li key={bhajan.id}>
                              <button
                                 onClick={() => handleOpenReader(bhajan)}
                                 className="w-full text-left py-4 px-4 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors"
                              >
                                 <div className="font-hindi text-slate-800 dark:text-slate-200 font-bold text-lg leading-tight">
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
