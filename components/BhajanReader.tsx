
import React, { useEffect, useRef, useState } from 'react';
import { Bhajan, FontSize, ScriptType } from '../types';
import { ArrowLeft, Edit2, Save, Trash2, Copy, Check, Sun, Moon, Type, Minus, Plus, Share2 } from 'lucide-react';
import { HighlightText } from './HighlightText';
import { AudioPlayer } from './AudioPlayer';

interface BhajanReaderProps {
  bhajan: Bhajan;
  onBack: () => void;
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  searchQuery: string;
  script: ScriptType;
  darkMode: boolean;
  onToggleTheme: () => void;
  keepAwake: boolean;
  devMode: boolean;
  onSave?: (id: string, title: string, content: string) => void;
  onDelete?: (id: string) => void;
  autoEdit?: boolean;
}

export const BhajanReader: React.FC<BhajanReaderProps> = ({ 
  bhajan, 
  onBack, 
  fontSize,
  onChangeFontSize,
  searchQuery,
  script,
  darkMode,
  onToggleTheme,
  keepAwake,
  devMode,
  onSave,
  onDelete,
  autoEdit = false
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Edit Mode State
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [editedTitle, setEditedTitle] = useState(script === 'iast' ? bhajan.titleIAST : bhajan.title);
  const [editedContent, setEditedContent] = useState(script === 'iast' ? bhajan.contentIAST : bhajan.content);
  const [copied, setCopied] = useState(false);
  const [showSecretId, setShowSecretId] = useState(false);
  
  // Font Panel State
  const [showFontPanel, setShowFontPanel] = useState(false);
  
  // Scroll State for Header Title Visibility
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);

  // Sync state when bhajan or script changes (unless editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(script === 'iast' ? bhajan.titleIAST : bhajan.title);
      setEditedContent(script === 'iast' ? bhajan.contentIAST : bhajan.content);
      setShowSecretId(false);
    }
  }, [bhajan, script, isEditing]);

  // Reset scroll on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
    setShowFontPanel(false);
    setShowSecretId(false);
    setShowHeaderTitle(false);
  }, [bhajan]);

  // Handle Scroll for Header Title Transition & Font Panel
  useEffect(() => {
      const handleScroll = () => {
          if (contentRef.current) {
              // Show header title if scrolled past 60px
              const scrollTop = contentRef.current.scrollTop;
              setShowHeaderTitle(scrollTop > 60);
              
              if (showFontPanel) setShowFontPanel(false);
          }
      };
      
      const el = contentRef.current;
      if (el) {
          el.addEventListener('scroll', handleScroll, { passive: true });
      }
      return () => {
          if (el) el.removeEventListener('scroll', handleScroll);
      };
  }, [showFontPanel]);

  // --- SCREEN WAKE LOCK LOGIC ---
  useEffect(() => {
    let wakeLock: any = null;

    const requestWakeLock = async () => {
      try {
        if (keepAwake && 'wakeLock' in navigator) {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        }
      } catch (err) {
        console.warn('Wake Lock failed:', err);
      }
    };

    const handleVisibilityChange = () => {
       if (document.visibilityState === 'visible' && keepAwake) {
         requestWakeLock();
       }
    };

    if (keepAwake) {
      requestWakeLock();
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (wakeLock) {
        wakeLock.release().then(() => {
          wakeLock = null;
        });
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [keepAwake]);

  const increaseFont = () => {
    if (fontSize < 40) onChangeFontSize(fontSize + 2);
  }

  const decreaseFont = () => {
     if (fontSize > 12) onChangeFontSize(fontSize - 2);
  }

  const handleSaveEdit = () => {
    if (onSave) {
        onSave(bhajan.id, editedTitle, editedContent);
        setIsEditing(false);
    } else {
        setIsEditing(false);
    }
  };

  const handleCopy = () => {
      const textToCopy = `${displayTitle}\n\n${displayContent}`;
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(textToCopy).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
          }).catch(err => {
              console.warn('Copy failed', err);
          });
      } else {
          alert("Clipboard access not supported");
      }
  };

  const handleShare = async () => {
      const textToShare = `${displayTitle}\n\n${displayContent}\n\n- via CPBS App`;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: displayTitle,
                  text: textToShare,
              });
          } catch (err) {
              console.log('Share failed', err);
          }
      } else {
          handleCopy();
      }
  };

  const displayTitle = isEditing ? editedTitle : (script === 'iast' ? bhajan.titleIAST : bhajan.title);
  const displayContent = isEditing ? editedContent : (script === 'iast' ? bhajan.contentIAST : bhajan.content);
  const hasAudio = bhajan.audio && bhajan.audio.length > 0;
  
  // Dynamic line height calculation for better readability at larger font sizes
  const dynamicLineHeight = Math.max(1.6, 1.5 + (fontSize - 20) * 0.02);

  // Helper to render content with smart formatting (Subheadings)
  const renderFormattedContent = (content: string) => {
      const lines = content.split('\n');
      return lines.map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) {
              return <div key={index} className="h-4" />;
          }

          // Robust Subheading Detection Logic
          // Matches: ॥ (Double Danda), । (Single Danda), | (Pipe), ।। (Two Singles)
          const dandaPattern = /[॥\|।।\u0964\u0965]/;
          const startsWithDanda = /^[\s]*[॥\|।।\u0964\u0965]/.test(trimmed);
          const endsWithDanda = /[॥\|।।\u0964\u0965][\s]*$/.test(trimmed);
          
          // Keywords that indicate a section header
          const headerKeywords = /प्रणाम|वन्दना|महिमा|बधाई|कीर्तन|आरती|चालीसा|दोहे|अष्टक|मंगलाचरण|स्तुति|विलाप/;
          const hasKeyword = headerKeywords.test(trimmed);
          
          // Length check to avoid capturing long verses that happen to start/end with dandas
          const isShort = trimmed.length < 80; 
          
          // Decorative separators like ============ or -----------
          const isDecorative = /^[\s]*[=•*~-]{3,}.*[=•*~-]{3,}[\s]*$/.test(trimmed);

          let isSubheading = false;

          if (isDecorative) {
              isSubheading = true;
          } 
          // Case 1: Enclosed by dandas (e.g. ॥ Title ॥) - Most common
          else if (startsWithDanda && endsWithDanda) {
              isSubheading = true;
          }
          // Case 2: Starts with Danda + Short (e.g. ॥ Title)
          else if (startsWithDanda && isShort) {
              isSubheading = true;
          }
          // Case 3: Ends with Danda + Has Keyword + Short (e.g. श्री कृष्ण प्रणाम ॥)
          else if (endsWithDanda && hasKeyword && isShort) {
              isSubheading = true;
          }
          // Case 4: Has Keyword + Very Short (Fallback for lines missing standard delimiters)
          else if (hasKeyword && trimmed.length < 50 && !trimmed.includes(',')) {
              isSubheading = true;
          }

          if (isSubheading) {
              return (
                  <div key={index} className="flex justify-center my-6 animate-fade-in-up px-4">
                      <div className="text-center px-6 py-2 rounded-xl bg-saffron-50 dark:bg-saffron-900/20 border border-saffron-100 dark:border-saffron-800/50 shadow-sm relative overflow-hidden group">
                          {/* Decorative accent */}
                          <div className="absolute top-0 left-0 w-1 h-full bg-saffron-400/50"></div>
                          <div className="absolute top-0 right-0 w-1 h-full bg-saffron-400/50"></div>
                          
                          <span className="font-hindi font-bold text-saffron-700 dark:text-saffron-300 text-base tracking-wide leading-relaxed relative z-10">
                              {trimmed}
                          </span>
                      </div>
                  </div>
              );
          }

          return (
              <div 
                key={index} 
                className="text-center px-1 font-hindi text-slate-800 dark:text-slate-200"
                style={{ lineHeight: dynamicLineHeight.toString() }}
              >
                  {line}
              </div>
          );
      });
  };

  return (
    <div className="fixed inset-0 bg-[#fdfbf7] dark:bg-slate-950 z-50 flex flex-col h-full w-full animate-in slide-in-from-bottom duration-300">
      
      {/* Decorative Texture Overlay (Light Mode Only) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-0 bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] z-0"></div>

      {/* Reader Header */}
      <div className="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm border-b border-saffron-100 dark:border-slate-800 p-2 pt-[calc(0.5rem+env(safe-area-inset-top))] flex items-center justify-between z-20 relative transition-all duration-300">
        <button 
          onClick={onBack}
          className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>

        {/* Dynamic Title (Fades in on Scroll) */}
        <div className={`flex-1 mx-4 transition-opacity duration-300 ${showHeaderTitle || isEditing ? 'opacity-100' : 'opacity-0'}`}>
             {isEditing ? (
                <input 
                type="text" 
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-center font-hindi font-bold text-lg bg-transparent border-b border-slate-300 focus:border-saffron-500 focus:outline-none dark:text-white"
                placeholder="Bhajan Title"
                />
            ) : (
                <h2 className="font-hindi font-bold text-base text-slate-800 dark:text-slate-100 text-center leading-tight line-clamp-1">
                    {displayTitle}
                </h2>
            )}
        </div>
        
        <div className="flex items-center gap-1">
            {/* Share Button */}
            {!isEditing && (
                <button 
                    onClick={handleShare}
                    className="p-2.5 text-slate-500 hover:text-saffron-600 dark:text-slate-400 dark:hover:text-saffron-400 transition-colors rounded-full hover:bg-saffron-50 dark:hover:bg-slate-800"
                    title="Share"
                >
                    <Share2 className="w-5 h-5" />
                </button>
            )}

            {/* Copy Button (Hidden if Sharing supported or condensed) */}
            {!isEditing && !navigator.share && (
                <button 
                    onClick={handleCopy}
                    className="p-2.5 text-slate-500 hover:text-saffron-600 dark:text-slate-400 dark:hover:text-saffron-400 transition-colors rounded-full hover:bg-saffron-50 dark:hover:bg-slate-800"
                    title="Copy Text"
                >
                    {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                </button>
            )}

            {/* Developer Controls */}
            {devMode && (
              <>
                 <button 
                    onClick={isEditing ? handleSaveEdit : () => setIsEditing(true)}
                    className={`p-2 rounded-full transition-colors ${isEditing ? 'bg-green-100 text-green-700' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                  >
                    {isEditing ? <Save className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                  </button>
                  {isEditing && onDelete && (
                      <button 
                      onClick={() => onDelete(bhajan.id)}
                      className="p-2 rounded-full transition-colors bg-red-50 text-red-600 hover:bg-red-100"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
              </>
            )}

            {/* Theme Toggle */}
            <button 
              onClick={onToggleTheme} 
              className="w-10 h-10 rounded-full bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors"
            >
               {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Font Control Toggle */}
            <button 
               onClick={() => setShowFontPanel(!showFontPanel)}
               className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${showFontPanel ? 'bg-saffron-100 text-saffron-700 dark:bg-saffron-900/30 dark:text-saffron-400' : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
               <Type className="w-5 h-5" />
            </button>
        </div>
      </div>

      {/* Font Settings Panel Overlay */}
      {showFontPanel && (
          <div className="absolute top-[calc(4rem+env(safe-area-inset-top))] right-2 z-30 animate-in slide-in-from-top-2 fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-4 w-72">
                   <div className="flex items-center justify-between mb-4">
                       <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Text Size</span>
                       <span className="text-xs font-mono bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-300">{fontSize}px</span>
                   </div>
                   
                   <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-xl">
                       <button 
                           onClick={decreaseFont}
                           disabled={fontSize <= 12}
                           className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm disabled:opacity-40 active:scale-95 transition-all"
                       >
                           <Minus className="w-4 h-4" />
                       </button>
                       
                       <input 
                           type="range" 
                           min="12" 
                           max="40" 
                           step="2" 
                           value={fontSize}
                           onChange={(e) => onChangeFontSize(parseInt(e.target.value))}
                           className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-saffron-500"
                       />
                       
                       <button 
                           onClick={increaseFont}
                           disabled={fontSize >= 40}
                           className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm disabled:opacity-40 active:scale-95 transition-all"
                       >
                           <Plus className="w-4 h-4" />
                       </button>
                   </div>
              </div>
          </div>
      )}

      {/* Reader Content */}
      <div 
        ref={contentRef} 
        className={`flex-1 overflow-y-auto overflow-x-hidden scroll-smooth relative z-10 ${hasAudio ? 'pb-[calc(10rem+env(safe-area-inset-bottom))]' : 'pb-[calc(5rem+env(safe-area-inset-bottom))]'}`}
        onClick={() => { if(showFontPanel) setShowFontPanel(false); }}
      >
        <div className="max-w-2xl mx-auto min-h-full flex flex-col p-4 sm:p-6 lg:p-8">
            
            {/* Title Section (Visible initially) */}
            {!isEditing && (
                <div className="text-center mb-8 mt-4 animate-fade-in-up">
                    <h1 className="font-hindi font-bold text-2xl sm:text-3xl text-saffron-700 dark:text-saffron-400 leading-snug mb-4 drop-shadow-sm">
                        {displayTitle}
                    </h1>
                    <div className="flex items-center justify-center gap-3 opacity-60">
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-saffron-400 to-transparent"></div>
                        <div className="w-1.5 h-1.5 rotate-45 bg-saffron-400"></div>
                        <div className="h-px w-16 bg-gradient-to-r from-transparent via-saffron-400 to-transparent"></div>
                    </div>
                </div>
            )}

            {isEditing ? (
               <textarea
                 value={editedContent}
                 onChange={(e) => setEditedContent(e.target.value)}
                 className="w-full flex-1 p-4 font-hindi border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron-400 focus:outline-none dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 bg-white/50 min-h-[50vh]"
                 style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
               />
            ) : (
               <div style={{ fontSize: `${fontSize}px` }} className="transition-all duration-200">
                  {renderFormattedContent(displayContent)}
               </div>
            )}
            
            {!isEditing && (
              <div 
                 className="mt-20 mb-12 text-center opacity-60 hover:opacity-100 transition-opacity select-none cursor-pointer" 
                 onClick={() => setShowSecretId(!showSecretId)}
              >
                 <div className="w-16 h-1 bg-saffron-300 dark:bg-slate-700 rounded-full mx-auto mb-3"></div>
                 <span className="text-saffron-600 dark:text-saffron-400 font-logo text-2xl tracking-wide">
                     {showSecretId ? (bhajan.songNumber ? `ID #${bhajan.songNumber}` : bhajan.id) : 'RadheShyam'}
                 </span>
              </div>
            )}
        </div>
      </div>

      {/* Fixed Audio Player Bottom Bar */}
      {hasAudio && !isEditing && (
          <div className="flex-none z-30">
              <AudioPlayer audioTracks={bhajan.audio!} />
          </div>
      )}
    </div>
  );
};
