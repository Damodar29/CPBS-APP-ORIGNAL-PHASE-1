
import React, { useEffect, useRef, useState } from 'react';
import { Bhajan, FontSize, ScriptType } from '../types';
import { ArrowLeft, ZoomIn, ZoomOut, Edit2, Save, Trash2, Copy, Check } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface BhajanReaderProps {
  bhajan: Bhajan;
  onBack: () => void;
  fontSize: FontSize;
  onChangeFontSize: (size: FontSize) => void;
  searchQuery: string;
  script: ScriptType;
  onToggleScript: () => void;
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
  onToggleScript,
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

  // Sync state when bhajan or script changes (unless editing)
  useEffect(() => {
    if (!isEditing) {
      setEditedTitle(script === 'iast' ? bhajan.titleIAST : bhajan.title);
      setEditedContent(script === 'iast' ? bhajan.contentIAST : bhajan.content);
    }
  }, [bhajan, script, isEditing]);

  // Reset scroll on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [bhajan]);

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
              // Fallback or just ignore if clipboard access denied
          });
      } else {
          // Fallback logic for older browsers or insecure context if needed, or just warn
          alert("Clipboard access not supported in this environment");
      }
  };

  const displayTitle = isEditing ? editedTitle : (script === 'iast' ? bhajan.titleIAST : bhajan.title);
  const displayContent = isEditing ? editedContent : (script === 'iast' ? bhajan.contentIAST : bhajan.content);

  return (
    <div className="fixed inset-0 bg-saffron-50 dark:bg-slate-950 z-50 flex flex-col h-full w-full animate-in slide-in-from-bottom duration-300">
      {/* Reader Header */}
      <div className="flex-none bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-saffron-100 dark:border-slate-800 p-2 flex items-center justify-between z-10 pt-[env(safe-area-inset-top)]">
        <button 
          onClick={onBack}
          className="p-3 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
        </button>

        <div className="flex-1 mx-2 flex flex-col items-center">
             {isEditing ? (
                <input 
                type="text" 
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="w-full text-center font-hindi font-bold text-lg bg-transparent border-b border-slate-300 focus:border-saffron-500 focus:outline-none dark:text-white"
                placeholder="Bhajan Title"
                />
            ) : (
                <h2 className="font-hindi font-bold text-lg text-slate-800 dark:text-slate-100 text-center leading-tight line-clamp-2">
                    {displayTitle}
                </h2>
            )}
        </div>
        
        <div className="flex items-center gap-1.5">
            {/* Copy Button */}
            {!isEditing && (
                <button 
                    onClick={handleCopy}
                    className="p-2 text-slate-500 hover:text-saffron-600 dark:text-slate-400 dark:hover:text-saffron-400 transition-colors rounded-full hover:bg-saffron-50 dark:hover:bg-slate-800"
                    title="Copy Lyrics"
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

            {/* Script Toggle */}
            <button 
              onClick={onToggleScript} 
              className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-saffron-100 dark:hover:bg-slate-700 flex items-center justify-center transition-colors border border-slate-200 dark:border-slate-700"
            >
              <span className="text-xs font-bold font-sans">
                  {script === 'devanagari' ? 'EN' : 'अ'}
              </span>
            </button>

            {/* Font Controls */}
            <div className="flex flex-col gap-0.5 ml-1">
               <button onClick={increaseFont} disabled={fontSize >= 40} className="w-8 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-t hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <ZoomIn className="w-3 h-3" />
              </button>
              <button onClick={decreaseFont} disabled={fontSize <= 12} className="w-8 h-5 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-b hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                  <ZoomOut className="w-3 h-3" />
              </button>
            </div>
        </div>
      </div>

      {/* Reader Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-4 pb-[calc(8rem+env(safe-area-inset-bottom))] scroll-smooth">
        {isEditing ? (
           <textarea
             value={editedContent}
             onChange={(e) => setEditedContent(e.target.value)}
             className="w-full h-full min-h-[500px] p-4 font-hindi border border-slate-300 rounded-lg focus:ring-2 focus:ring-saffron-400 focus:outline-none dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700"
             style={{ fontSize: `${fontSize}px`, lineHeight: '1.6' }}
           />
        ) : (
           <div 
             className="font-hindi text-slate-800 dark:text-slate-200 whitespace-pre-wrap max-w-2xl mx-auto text-center px-1"
             style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
           >
             <HighlightText text={displayContent} highlight={searchQuery} />
           </div>
        )}
        
        {!isEditing && (
          <div className="mt-16 mb-8 text-center opacity-40">
             <div className="w-16 h-1 bg-saffron-300 dark:bg-slate-700 rounded-full mx-auto mb-2"></div>
             <span className="text-saffron-600 dark:text-saffron-400 font-logo text-xl">Jay Gauranga</span>
          </div>
        )}
      </div>
    </div>
  );
};
