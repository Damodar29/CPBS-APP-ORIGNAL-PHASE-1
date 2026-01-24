
import React from 'react';

interface AzSliderProps {
  sortedKeys: string[];
  onSelect: (key: string) => void;
  indexMode: 'latin' | 'devanagari';
  onToggleMode: () => void;
}

export const AzSlider: React.FC<AzSliderProps> = ({ sortedKeys, onSelect, indexMode, onToggleMode }) => {
  if (sortedKeys.length === 0) return null;

  return (
    <div className="fixed top-[64px] bottom-[66px] right-0 z-35 flex flex-col items-end pointer-events-none">
      {/* Container: Narrower width (w-9 = 36px) for reduced horizontal footprint */}
      <div className="h-full w-9 bg-saffron-50/90 dark:bg-slate-800/90 backdrop-blur-md shadow-sm border-l border-saffron-200 dark:border-slate-700 flex flex-col pointer-events-auto rounded-l-lg overflow-hidden">
        
        {/* Toggle Button */}
        <button 
           onClick={(e) => {
             e.stopPropagation();
             onToggleMode();
           }}
           className="flex-none h-9 w-full flex items-center justify-center bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-lg shadow-sm z-10 transition-colors border-b border-saffron-600"
           title={indexMode === 'latin' ? "Switch to Hindi Index" : "Switch to English Index"}
        >
            <span className={indexMode === 'latin' ? 'mt-0.5' : ''}>
               {indexMode === 'latin' ? 'अ' : 'A'}
            </span>
        </button>

        {/* List Container */}
        {indexMode === 'latin' ? (
            // English: Fit vertically without slider
            <div className="flex-1 flex flex-col py-1 overflow-hidden">
                {sortedKeys.map(key => (
                    <button 
                      key={key} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(key);
                      }}
                      // Flex-1 allows items to fill available height evenly
                      // max-h restricts them from becoming too large if few items exist
                      className="flex-1 max-h-8 w-full flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-400 active:text-saffron-600 dark:active:text-saffron-400 transition-none select-none"
                    >
                        {key}
                    </button>
                ))}
            </div>
        ) : (
            // Hindi: Scrollable
            <div className="flex-1 overflow-y-auto no-scrollbar py-1 flex flex-col">
                {sortedKeys.map(key => (
                    <button 
                      key={key} 
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(key);
                      }}
                      // Fixed height for scrolling list
                      className="shrink-0 h-8 w-full flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-saffron-600 dark:hover:text-saffron-400 active:bg-saffron-100 dark:active:bg-slate-700 transition-colors select-none"
                    >
                        {key}
                    </button>
                ))}
                {/* Spacer at bottom */}
                <div className="h-8 shrink-0" />
            </div>
        )}
      </div>
    </div>
  );
};
