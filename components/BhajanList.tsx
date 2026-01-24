
import React, { useMemo } from 'react';
import { Bhajan, ScriptType } from '../types';
import { ChevronRight, Music } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { AzSlider } from './AzSlider';
import { getMatchingSnippet, getDevanagariBaseChar } from '../utils/textProcessor';

interface BhajanListProps {
  bhajans: Bhajan[];
  onSelect: (bhajan: Bhajan) => void;
  searchQuery: string;
  script: ScriptType;
  indexMode: 'latin' | 'devanagari';
  onIndexModeChange: (mode: 'latin' | 'devanagari') => void;
}

export const BhajanList: React.FC<BhajanListProps> = ({ 
  bhajans, onSelect, searchQuery, script, indexMode, onIndexModeChange 
}) => {
  
  // Group bhajans based on Index Mode
  const groupedBhajans = useMemo(() => {
    const groups: Record<string, Bhajan[]> = {};
    
    // Sort logic depends on index mode
    const sorted = [...bhajans].sort((a, b) => {
        if (indexMode === 'devanagari') {
            return a.title.localeCompare(b.title, 'hi');
        }
        return a.titleIAST.localeCompare(b.titleIAST);
    });

    sorted.forEach(bhajan => {
      const targetKeys: string[] = [];

      if (indexMode === 'latin') {
         // Get underlying Devanagari first char to detect ambiguity
         const devaChar = getDevanagariBaseChar(bhajan.title);
         
         // Custom Hinglish Mappings for Indexing
         const hinglishMap: Record<string, string[]> = {
            'ऐ': ['A', 'E'], // Aisi / Esi
            'ए': ['E'],      // Ek
            'औ': ['A', 'O'], // Aur / Or
            'ओ': ['O'],      // Okhli
            'ज्ञ': ['G', 'J'], // Gyan / Jnan
            'क्ष': ['K'],      // Ksh -> K
            'ऋ': ['R'],      // Rishi -> R
         };

         if (hinglishMap[devaChar]) {
             targetKeys.push(...hinglishMap[devaChar]);
         } else {
             // Fallback to IAST first char
             const rawChar = bhajan.titleIAST.charAt(0).toUpperCase();
             const normalizedChar = rawChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
             const key = /^[A-Z]/.test(normalizedChar) ? normalizedChar : '#';
             targetKeys.push(key);
         }
      } else {
         // Devanagari Mode
         targetKeys.push(getDevanagariBaseChar(bhajan.title));
      }
      
      // Add to all identified groups
      targetKeys.forEach(k => {
          if (!groups[k]) groups[k] = [];
          if (!groups[k].includes(bhajan)) { 
             groups[k].push(bhajan);
          }
      });
    });
    return groups;
  }, [bhajans, indexMode]);

  const sortedKeys = useMemo(() => {
    return Object.keys(groupedBhajans).sort((a, b) => {
      if (a === '#') return 1;
      if (b === '#') return -1;
      return a.localeCompare(b, indexMode === 'devanagari' ? 'hi' : 'en');
    });
  }, [groupedBhajans, indexMode]);

  const scrollToSection = (key: string) => {
    const element = document.getElementById(`section-${key}`);
    if (element) {
      // Offset for header
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  // Helper to get author string based on script
  const getAuthorName = (bhajan: Bhajan) => {
    if (!bhajan.author) return null;
    return script === 'iast' ? (bhajan.authorIAST || bhajan.author) : bhajan.author;
  };

  if (bhajans.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 dark:text-slate-400 animate-fade-in-up">
        <Music className="w-16 h-16 opacity-20 mb-4" />
        <p className="text-lg font-medium">No bhajans found.</p>
        <p className="text-sm opacity-70">Try searching with different terms.</p>
      </div>
    );
  }

  // --- SEARCH RESULTS VIEW (Flat List) ---
  if (searchQuery.trim()) {
    return (
      <div className="pb-24 pt-2 px-2">
        <div className="space-y-2">
          {bhajans.map((bhajan) => {
            const displayTitle = script === 'iast' ? bhajan.titleIAST : bhajan.title;
            const matchedSnippet = getMatchingSnippet(bhajan, searchQuery, script);
            // If we have a snippet, that means the match was primarily in the content
            const isContentMatch = !!matchedSnippet;
            
            const subtitle = matchedSnippet || (script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine);
            const authorName = getAuthorName(bhajan);
            
            return (
              <div key={bhajan.id} className="animate-fade-in-up">
                <button
                  onClick={() => onSelect(bhajan)}
                  className="w-full text-left p-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:border-saffron-300 dark:hover:border-saffron-500/50 hover:shadow-md transition-all group relative overflow-hidden"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-hindi font-bold text-slate-800 dark:text-slate-100 truncate pr-6 leading-tight mb-1">
                      <HighlightText text={displayTitle} highlight={searchQuery} />
                    </h3>
                    
                    <div className="flex flex-col gap-1.5">
                      {/* Subtitle / Snippet */}
                      <div className="flex items-start gap-2">
                          {isContentMatch && (
                              <span className="flex-none text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded mt-0.5">
                                 Lyrics
                              </span>
                          )}
                          <p className={`text-sm font-hindi leading-snug line-clamp-2 ${isContentMatch ? 'text-slate-600 dark:text-slate-300 italic' : 'text-slate-500 dark:text-slate-400'}`}>
                            <HighlightText text={subtitle} highlight={searchQuery} />
                          </p>
                      </div>

                      {/* Author Tag */}
                      {authorName && (
                        <div className="flex">
                           <span className="text-[11px] text-saffron-700 dark:text-saffron-300 font-semibold bg-saffron-50 dark:bg-saffron-900/30 px-2 py-0.5 rounded-md border border-saffron-100 dark:border-saffron-900/50">
                              {authorName}
                           </span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 group-hover:text-saffron-500 group-hover:translate-x-1 transition-all">
                      <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // --- DEFAULT ALPHABETICAL VIEW ---
  return (
    <div className="pb-24 relative">
      <div className="px-0 sm:px-2">
        {sortedKeys.map((key) => (
          <div key={key} id={`section-${key}`} className="mb-2">
            {/* Sticky Section Header */}
            <div className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-2 border-y border-slate-200 dark:border-slate-800 text-saffron-600 dark:text-saffron-400 text-sm font-black font-sans shadow-sm flex items-center">
              <span className="bg-saffron-100 dark:bg-slate-800 w-8 h-8 flex items-center justify-center rounded-lg shadow-sm border border-saffron-200 dark:border-slate-700">
                {key}
              </span>
              <div className="ml-4 flex-1 h-px bg-gradient-to-r from-slate-200 dark:from-slate-700 to-transparent"></div>
            </div>
            
            <ul className="bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700/50">
              {groupedBhajans[key].map((bhajan) => {
                const displayTitle = script === 'iast' ? bhajan.titleIAST : bhajan.title;
                const subtitle = script === 'iast' ? bhajan.firstLineIAST : bhajan.firstLine;
                const authorName = getAuthorName(bhajan);

                return (
                  <li key={bhajan.id}>
                    <button
                      onClick={() => onSelect(bhajan)}
                      className="w-full text-left py-4 px-4 pl-5 hover:bg-saffron-50 dark:hover:bg-slate-700/50 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1 min-w-0 pr-6">
                        <h3 className="text-lg font-hindi font-medium text-slate-800 dark:text-slate-200 truncate leading-snug mb-1 group-hover:text-saffron-700 dark:group-hover:text-saffron-400 transition-colors">
                          {displayTitle}
                        </h3>
                         <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            {authorName && (
                              <span className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-600">
                                {authorName}
                              </span>
                            )}
                            <p className="text-xs text-slate-500 dark:text-slate-500 truncate font-hindi flex-1">
                              {subtitle}
                            </p>
                         </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <AzSlider 
        sortedKeys={sortedKeys} 
        onSelect={scrollToSection} 
        indexMode={indexMode}
        onToggleMode={() => onIndexModeChange(indexMode === 'latin' ? 'devanagari' : 'latin')}
      />
    </div>
  );
};
