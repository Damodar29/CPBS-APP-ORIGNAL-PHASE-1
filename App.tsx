
import React, { useState, useEffect, useMemo, useRef, useLayoutEffect, useCallback } from 'react';
import { Search, Menu, Settings, X, History, Trash2, FileText, Headphones, Music, BookOpen, Mic } from 'lucide-react';
import { RAW_BHAJAN_DATA_1 } from './data/rawBhajans1';
import { RAW_BHAJAN_DATA_2 } from './data/rawBhajans2';
import { RAW_BHAJAN_DATA_3 } from './data/rawBhajans3';
import { RAW_BHAJAN_DATA_4 } from './data/rawBhajans4';
import { RAW_BHAJAN_DATA_5 } from './data/rawBhajans5';
import { RAW_BHAJAN_DATA_6 } from './data/rawBhajans6';
import { BOOKS_DATA } from './data/books';
import { LECTURES_DATA } from './data/lectures';
import { parseRawBhajanText, calculateSearchScore, getMatchingSnippet, convertToIAST, smartNormalize, transliterateForSearch, isFuzzyMatch, calculateBookScore, calculateLectureScore } from './utils/textProcessor';
import { Bhajan, FontSize, ScriptType, AppTab, LectureData, Book, HistoryEntry } from './types';
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
import { DownloadedList } from './components/DownloadedList';
import { LectureList } from './components/LectureList';
import { DailyQuotes } from './components/DailyQuotes';
import { CategoryList } from './components/CategoryList';
import { QuotePopup } from './components/QuotePopup';

// Increment this version when logic changes to force client update
const DATA_VERSION = '15';

const RAW_BHAJAN_DATA = RAW_BHAJAN_DATA_1 + RAW_BHAJAN_DATA_2 + RAW_BHAJAN_DATA_3 + RAW_BHAJAN_DATA_4 + RAW_BHAJAN_DATA_5 + RAW_BHAJAN_DATA_6;

export const App: React.FC = () => {
  // --- STATE ---
  const [isLoading, setIsLoading] = useState(true);
  const [bhajans, setBhajans] = useState<Bhajan[]>([]);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<AppTab>('songs');
  
  // Separate Search States for each tab
  const [tabQueries, setTabQueries] = useState<Record<string, string>>({
    songs: '',
    authors: '',
    books: '',
    lectures: '',
    history: '',
    downloaded: ''
  });

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedBhajan, setSelectedBhajan] = useState<Bhajan | null>(null);
  const [isNewBhajan, setIsNewBhajan] = useState(false);
  
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDonateOpen, setIsDonateOpen] = useState(false);
  const [isDailyQuotesOpen, setIsDailyQuotesOpen] = useState(false);
  
  // Daily Quote Popup State
  const [showQuotePopup, setShowQuotePopup] = useState(false);

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
     return (localStorage.getItem('cpbs_settings_lang') as 'en' | 'hi') || 'en';
  });

  const [devMode, setDevMode] = useState<boolean>(false);

  // Sorting State
  const [indexMode, setIndexMode] = useState<'latin' | 'devanagari'>('devanagari');

  // History State - Migrated to Object Array
  const [historyItems, setHistoryItems] = useState<HistoryEntry[]>(() => {
     try {
       const stored = JSON.parse(localStorage.getItem('cpbs_history') || '[]');
       if (Array.isArray(stored) && stored.length > 0) {
           // Migration: If old format (string array), convert to objects
           if (typeof stored[0] === 'string') {
               return stored.map((id: string) => ({ id, type: 'song' }));
           }
       }
       return stored;
     } catch { return []; }
  });

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  
  // Scroll Management
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef(0);

  // Derived current search query
  const searchQuery = tabQueries[activeTab] || '';

  const setSearchQuery = (val: string) => {
      setTabQueries(prev => ({ ...prev, [activeTab]: val }));
  };

  // --- NAVIGATION & HISTORY HANDLING ---
  
  // This Ref keeps track of the current UI state for the event listener
  const stateRef = useRef({ 
    hasSelectedBhajan: !!selectedBhajan, 
    isSettingsOpen, 
    isAboutOpen,
    isDonateOpen, 
    isSideMenuOpen, 
    isSearchFocused, 
    isDailyQuotesOpen,
    showQuotePopup,
    activeTab
  });

  // Update Ref whenever state changes
  useEffect(() => {
    stateRef.current = { 
      hasSelectedBhajan: !!selectedBhajan, 
      isSettingsOpen, 
      isAboutOpen, 
      isDonateOpen, 
      isSideMenuOpen, 
      isSearchFocused, 
      isDailyQuotesOpen,
      showQuotePopup,
      activeTab
    };
  }, [selectedBhajan, isSettingsOpen, isAboutOpen, isDonateOpen, isSideMenuOpen, isSearchFocused, activeTab, isDailyQuotesOpen, showQuotePopup]);

  // Push a new entry to history stack
  const pushHistoryState = (viewName: string) => {
    try {
        window.history.pushState({ view: viewName }, '', `#${viewName}`);
    } catch (e) {
        console.warn('History pushState failed', e);
    }
  };

  // Central logic to close the topmost view
  const closeTopmostView = useCallback(() => {
      const { 
          hasSelectedBhajan, 
          isSettingsOpen, 
          isAboutOpen, 
          isDonateOpen, 
          isSideMenuOpen, 
          isSearchFocused, 
          isDailyQuotesOpen,
          showQuotePopup,
          activeTab
      } = stateRef.current;

      // Priority Order: Modals > Side Menu > Search > Tabs
      if (showQuotePopup) {
        setShowQuotePopup(false);
        return true;
      }
      if (hasSelectedBhajan) {
        setSelectedBhajan(null);
        setIsNewBhajan(false);
        return true;
      } 
      if (isDailyQuotesOpen) {
        setIsDailyQuotesOpen(false);
        return true;
      }
      if (isDonateOpen) {
        setIsDonateOpen(false);
        return true;
      } 
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
        return true;
      } 
      if (isAboutOpen) {
        setIsAboutOpen(false);
        return true;
      } 
      if (isSideMenuOpen) {
        setIsSideMenuOpen(false);
        return true;
      } 
      if (isSearchFocused) {
        setIsSearchFocused(false);
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        return true;
      } 
      if (activeTab === 'downloaded') {
         setActiveTab('songs');
         return true;
      }
      if (activeTab !== 'songs') {
         setActiveTab('songs');
         return true;
      }
      return false;
  }, []);

  // Handle Hardware Back Button (via popstate)
  useEffect(() => {
    // Ensure we have a base state
    try {
        window.history.replaceState({ view: 'root' }, '');
    } catch (e) {}

    const handlePopState = (event: PopStateEvent) => {
      closeTopmostView();
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [closeTopmostView]);

  // Handle UI Back Buttons (Explicit Click)
  const goBack = useCallback(() => {
    const handled = closeTopmostView();
    if (handled) {
        try {
            window.history.back();
        } catch (e) {
            console.warn(e);
        }
    }
  }, [closeTopmostView]);

  // --- VIEW OPENING HELPERS ---

  const handleTabChange = (tab: AppTab) => {
      if (tab === activeTab) return;
      pushHistoryState(tab);
      setActiveTab(tab);
      if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
  };

  const addToHistory = (id: string, type: 'song' | 'book' | 'lecture') => {
    setHistoryItems(prev => {
      const filtered = prev.filter(item => !(item.id === id && item.type === type));
      const newEntry: HistoryEntry = { id, type, timestamp: Date.now() };
      return [newEntry, ...filtered].slice(0, 50);
    });
  };

  const handleOpenReader = (bhajan: Bhajan) => {
    if (mainScrollRef.current) {
        scrollPositionRef.current = mainScrollRef.current.scrollTop;
    }
    addToHistory(bhajan.id, 'song');
    setSelectedBhajan(bhajan);
    setIsNewBhajan(false);
    setIsSearchFocused(false);
    pushHistoryState('reader');
  };

  const handleOpenLecture = (lecture: LectureData) => {
      addToHistory(lecture.id, 'lecture');
      const lectureAsBhajan: Bhajan = {
          id: lecture.id,
          title: lecture.title,
          titleIAST: lecture.title,
          firstLine: lecture.description.substring(0, 30),
          firstLineIAST: lecture.description.substring(0, 30),
          content: lecture.description,
          contentIAST: lecture.description,
          searchIndex: '',
          searchTokens: [],
          audio: lecture.audio,
          author: lecture.date ? `Date: ${lecture.date}` : undefined,
          authorIAST: lecture.date ? `Date: ${lecture.date}` : undefined,
      };
      
      setSelectedBhajan(lectureAsBhajan);
      setIsNewBhajan(false);
      setIsSearchFocused(false);
      pushHistoryState('reader');
  };

  const handleOpenBook = (book: Book) => {
      addToHistory(book.id, 'book');
      setIsSearchFocused(false);
      if (book.url) {
          window.open(book.url, '_blank');
      } else {
          alert(`Opening ${book.title}...\n\n(No URL configured)`);
      }
  };

  const handleOpenSettings = () => {
    setIsSettingsOpen(true);
    pushHistoryState('settings');
  };

  const handleOpenAbout = () => {
    setIsSideMenuOpen(false); 
    setIsAboutOpen(true);
    pushHistoryState('about');
  };

  const handleOpenDonate = () => {
    setIsSideMenuOpen(false);
    setIsDonateOpen(true);
    pushHistoryState('donate');
  };

  const handleOpenDailyQuotes = () => {
    setIsSideMenuOpen(false);
    setIsDailyQuotesOpen(true);
    pushHistoryState('daily-quotes');
  };

  const handleOpenMenu = () => {
    setIsSideMenuOpen(true);
    pushHistoryState('menu');
  };

  const handleOpenDownloaded = () => {
    setIsSideMenuOpen(false);
    setActiveTab('downloaded');
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
    try {
       window.history.replaceState({ view: 'downloaded' }, '', '#downloaded');
    } catch(e) {}
  };

  const handleGoHome = () => {
    setIsSideMenuOpen(false);
    setActiveTab('songs');
    if (mainScrollRef.current) mainScrollRef.current.scrollTop = 0;
    pushHistoryState('songs');
  };

  const handleCreateBhajanWrapper = () => {
    handleCreateBhajan(); 
    pushHistoryState('reader');
  };


  // --- EFFECTS ---
  
  // Safety: Redirect from Authors tab if not in Dev Mode
  useEffect(() => {
    if (!devMode && activeTab === 'authors') {
      setActiveTab('songs');
    }
  }, [devMode, activeTab]);

  useEffect(() => {
      const handler = setTimeout(() => {
          setDebouncedQuery(searchQuery);
      }, 300);
      return () => clearTimeout(handler);
  }, [searchQuery]);

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

    // DAILY QUOTE POPUP CHECK LOGIC
    const checkDailyQuote = (delay: number) => {
        const lastDate = localStorage.getItem('cpbs_last_quote_date');
        const today = new Date().toDateString(); // e.g. "Wed Jan 29 2025"
        
        if (lastDate !== today) {
            setTimeout(() => {
                setShowQuotePopup(true);
                localStorage.setItem('cpbs_last_quote_date', today);
            }, delay); 
        }
    };

    // Check on Initial Mount (2.5s delay for splash)
    checkDailyQuote(2500);

    // Check on App Resume (1s delay)
    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            checkDailyQuote(1000);
        }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const MIN_SPLASH_DURATION = 1000; 
    const elapsed = Date.now() - startTime;
    const remainingTime = Math.max(0, MIN_SPLASH_DURATION - elapsed);
    const timer = setTimeout(() => setIsLoading(false), remainingTime);
    
    return () => {
        clearTimeout(timer);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
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
  useEffect(() => localStorage.setItem('cpbs_history', JSON.stringify(historyItems)), [historyItems]);
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
        const numberMatch = newTitle.trim().match(/^(\d+)[\s\.\-\)]/);
        const songNumber = numberMatch ? numberMatch[1] : b.songNumber;

        const searchIndex = `${songNumber || ''} ${combinedText.toLowerCase()} ${normalizedIndex}`;
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
          firstLine, firstLineIAST, searchIndex, searchTokens, songNumber
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
      setHistoryItems([]);
    }
  };

  // --- FILTERING LOGIC ---

  // 1. Songs Filter
  const filteredBhajans = useMemo(() => {
    if (!debouncedQuery.trim()) return bhajans;
    
    const scored = bhajans.map(b => ({
        bhajan: b,
        score: calculateSearchScore(b, debouncedQuery, script)
    }));

    const matches = scored.filter(item => item.score > 0);
    matches.sort((a, b) => b.score - a.score);

    return matches.map(m => m.bhajan);
  }, [bhajans, debouncedQuery, script]);

  // 2. Books Filter
  const filteredBooks = useMemo(() => {
    if (!debouncedQuery.trim()) return BOOKS_DATA;
    
    const scored = BOOKS_DATA.map(b => ({
      book: b,
      score: calculateBookScore(b, debouncedQuery)
    }));

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.book);
  }, [debouncedQuery]);

  // 3. Lectures Filter
  const filteredLectures = useMemo(() => {
    if (!debouncedQuery.trim()) return LECTURES_DATA;

    const scored = LECTURES_DATA.map(l => ({
      lecture: l,
      score: calculateLectureScore(l, debouncedQuery)
    }));

    return scored
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(item => item.lecture);
  }, [debouncedQuery]);

  // Dynamic Placeholder
  const searchPlaceholder = useMemo(() => {
      switch(activeTab) {
          case 'books': return "Search books...";
          case 'lectures': return "Search lectures...";
          case 'history': return "Search history..."; 
          case 'downloaded': return "Search downloads...";
          default: return "Search bhajans...";
      }
  }, [activeTab]);

  if (isLoading) return <SplashScreen />;

  return (
    <div className={`flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-900 ${selectedBhajan || activeTab === 'downloaded' ? 'overflow-hidden' : ''}`}>
      
      {/* --- OVERLAYS --- */}
      <SideMenu 
        isOpen={isSideMenuOpen} 
        onClose={goBack} 
        onOpenAbout={handleOpenAbout} 
        onOpenDonate={handleOpenDonate}
        onHome={handleGoHome}
        onOpenDownloaded={handleOpenDownloaded}
        onOpenDailyQuotes={handleOpenDailyQuotes}
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

      {isDailyQuotesOpen && (
        <DailyQuotes onBack={goBack} />
      )}

      {showQuotePopup && (
        <QuotePopup 
            onClose={() => setShowQuotePopup(false)} 
            onOpenFull={() => {
                setShowQuotePopup(false);
                handleOpenDailyQuotes();
            }}
        />
      )}

      {/* Full Screen Views that cover main */}
      {selectedBhajan && (
        <BhajanReader
          bhajan={selectedBhajan}
          onBack={goBack}
          fontSize={fontSize}
          onChangeFontSize={setFontSize}
          searchQuery={debouncedQuery}
          script={script}
          darkMode={darkMode}
          onToggleTheme={() => setDarkMode(!darkMode)}
          keepAwake={keepAwake}
          devMode={devMode}
          onSave={handleUpdateBhajan}
          onDelete={handleDeleteBhajan}
          autoEdit={isNewBhajan}
        />
      )}

      {activeTab === 'downloaded' && (
          <div className="fixed inset-0 z-40 bg-white dark:bg-slate-900">
              <DownloadedList 
                  allBhajans={bhajans} 
                  onSelect={handleOpenReader} 
                  onBack={() => setActiveTab('songs')}
                  script={script}
              />
          </div>
      )}

      {/* --- FIXED HEADER --- */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-saffron-500 shadow-md transition-all duration-300 pt-[env(safe-area-inset-top)]">
        <div className="flex items-center gap-2 p-2 h-16 max-w-3xl mx-auto">
           <button onClick={handleOpenMenu} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors shrink-0">
              <Menu className="w-6 h-6" />
           </button>
           
           <div className="flex-1 relative" ref={searchContainerRef}>
              <div className="relative group">
                 <input
                    type="text"
                    placeholder={searchPlaceholder}
                    className="w-full bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 border-none focus:ring-2 focus:ring-white/50 rounded-full py-2 pl-10 pr-10 shadow-inner h-10 outline-none"
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
           </div>

           <button onClick={handleOpenSettings} className="p-2 text-white hover:bg-white/20 rounded-full transition-colors shrink-0">
              <Settings className="w-6 h-6" />
           </button>
        </div>
      </header>

      {/* --- SCROLLABLE MAIN CONTENT --- */}
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

         {activeTab === 'authors' && devMode && (
            <CategoryList 
               bhajans={filteredBhajans}
               onSelect={handleOpenReader}
               script={script}
            />
         )}

         {activeTab === 'books' && (
            <BookList 
                books={filteredBooks} 
                onSelect={handleOpenBook} 
                searchQuery={debouncedQuery}
            />
         )}

         {activeTab === 'lectures' && (
            <LectureList 
               lectures={filteredLectures} 
               onSelect={handleOpenLecture}
               searchQuery={debouncedQuery}
            />
         )}

         {activeTab === 'history' && (
            <div className="min-h-full bg-white dark:bg-slate-900">
               {historyItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-slate-400">
                     <History size={48} strokeWidth={1} className="mb-4 opacity-50" />
                     <p>No recently viewed items</p>
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
                        {historyItems.map((item, idx) => {
                           // Render Item based on type
                           if (item.type === 'song') {
                               const bhajan = bhajans.find(b => b.id === item.id);
                               if (!bhajan) return null;
                               return (
                                   <li key={`${item.type}-${item.id}-${idx}`}>
                                      <button
                                         onClick={() => handleOpenReader(bhajan)}
                                         className="w-full text-left py-4 px-4 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                                      >
                                         <div className="shrink-0 w-10 h-10 rounded-full bg-saffron-100 dark:bg-saffron-900/20 flex items-center justify-center text-saffron-600 dark:text-saffron-400">
                                            <Music size={18} />
                                         </div>
                                         <div className="min-w-0 flex-1">
                                            <div className="font-hindi text-slate-800 dark:text-slate-200 font-bold text-lg leading-tight truncate">
                                                {script === 'iast' ? bhajan.titleIAST : bhajan.title}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1 truncate font-hindi">
                                                {script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine}
                                            </div>
                                         </div>
                                      </button>
                                   </li>
                               );
                           } else if (item.type === 'book') {
                               const book = BOOKS_DATA.find(b => b.id === item.id);
                               if (!book) return null;
                               return (
                                   <li key={`${item.type}-${item.id}-${idx}`}>
                                      <button
                                         onClick={() => handleOpenBook(book)}
                                         className="w-full text-left py-4 px-4 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                                      >
                                         <div className="shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                            <BookOpen size={18} />
                                         </div>
                                         <div className="min-w-0 flex-1">
                                            <div className="font-hindi text-slate-800 dark:text-slate-200 font-bold text-lg leading-tight truncate">
                                                {book.title}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1 truncate">
                                                PDF • {book.fileName}
                                            </div>
                                         </div>
                                      </button>
                                   </li>
                               );
                           } else if (item.type === 'lecture') {
                               const lecture = LECTURES_DATA.find(l => l.id === item.id);
                               if (!lecture) return null;
                               return (
                                   <li key={`${item.type}-${item.id}-${idx}`}>
                                      <button
                                         onClick={() => handleOpenLecture(lecture)}
                                         className="w-full text-left py-4 px-4 hover:bg-saffron-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3"
                                      >
                                         <div className="shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
                                            <Mic size={18} />
                                         </div>
                                         <div className="min-w-0 flex-1">
                                            <div className="font-hindi text-slate-800 dark:text-slate-200 font-bold text-lg leading-tight truncate">
                                                {lecture.title}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1 truncate">
                                                Lecture {lecture.date ? `• ${lecture.date}` : ''}
                                            </div>
                                         </div>
                                      </button>
                                   </li>
                               );
                           }
                           return null;
                        })}
                     </ul>
                  </>
               )}
            </div>
         )}
      </main>

      <BottomNav 
        activeTab={activeTab === 'downloaded' ? 'songs' : activeTab} 
        onTabChange={handleTabChange} 
        devMode={devMode}
      />
    </div>
  );
};
