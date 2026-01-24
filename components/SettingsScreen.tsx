
import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, Check, Plus, Database, RotateCcw, Copy, Lock, RefreshCcw } from 'lucide-react';
import { FontSize, ScriptType, Bhajan } from '../types';
import { RAW_BHAJAN_DATA } from '../data/rawBhajans';
import { parseRawBhajanText } from '../utils/textProcessor';

interface SettingsScreenProps {
  isOpen: boolean;
  onClose: () => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  script: ScriptType;
  onScriptChange: (script: ScriptType) => void;
  darkMode: boolean;
  onThemeChange: (isDark: boolean) => void;
  keepAwake: boolean;
  onKeepAwakeChange: (val: boolean) => void;
  devMode: boolean;
  onDevModeChange: (val: boolean) => void;
  onResetData: () => void;
  onRestoreDeleted?: () => void;
  onAddBhajan: () => void;
  allBhajans: Bhajan[];
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOpen, onClose, fontSize, onFontSizeChange, script, onScriptChange, 
  darkMode, onThemeChange, keepAwake, onKeepAwakeChange, devMode, onDevModeChange,
  onResetData, onRestoreDeleted, onAddBhajan, allBhajans
}) => {
  // Use Ref for click counting to avoid re-renders and ensure reliability during rapid clicking
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Timer for long press disable
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authAction, setAuthAction] = useState<'ENABLE' | 'DISABLE'>('ENABLE');
  const [showDisabledMsg, setShowDisabledMsg] = useState(false);

  // Reset click count when closing settings
  useEffect(() => {
    if (!isOpen) {
      clickCountRef.current = 0;
      setShowPasswordModal(false);
      setShowDisabledMsg(false);
      setPasswordInput('');
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    }
  }, [isOpen]);

  // --- Logic to Enable (7 Taps) ---
  const handleSecretClick = () => {
    // Only allow enabling via tapping if currently disabled
    if (devMode) return; 

    // Clear the reset timer on every click
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    clickCountRef.current += 1;

    // Reset count if user stops clicking for 1 second
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (clickCountRef.current >= 7) {
      clickCountRef.current = 0;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      
      // Open Modal to Enable
      setAuthAction('ENABLE');
      setShowPasswordModal(true);
    }
  };

  // --- Logic to Disable (Long Press 3s) ---
  const handlePressStart = () => {
    if (!devMode) return; // Only for disabling

    longPressTimerRef.current = setTimeout(() => {
        // Trigger password modal for disable
        if (navigator.vibrate) navigator.vibrate(50);
        setAuthAction('DISABLE');
        setShowPasswordModal(true);
    }, 3000); // 3 seconds hold
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === "413541") {
        setShowPasswordModal(false);
        setPasswordInput('');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);

        if (authAction === 'ENABLE') {
             onDevModeChange(true);
             alert("Developer Mode Enabled!");
        } else {
             // Disable Flow
             setShowDisabledMsg(true);
             // Wait 2 seconds before actually reverting state
             setTimeout(() => {
                 onDevModeChange(false);
                 setShowDisabledMsg(false);
             }, 2000);
        }
    } else {
        alert("Incorrect Password");
        setPasswordInput('');
    }
  };

  const handleExportChanges = () => {
    // 1. Get Baseline Data
    const originalBhajans = parseRawBhajanText(RAW_BHAJAN_DATA);
    
    const changes: {
      added: Partial<Bhajan>[];
      modified: Partial<Bhajan>[];
      deleted: string[];
    } = {
      added: [],
      modified: [],
      deleted: []
    };

    // 2. Identify Added and Modified Bhajans
    allBhajans.forEach(current => {
      // Check if it is a custom (new) bhajan
      if (current.id.startsWith('custom-')) {
        changes.added.push({
          id: current.id,
          title: current.title,
          content: current.content,
          author: current.author
        });
      } else {
        // Check for modification against original
        const original = originalBhajans.find(b => b.id === current.id);
        if (original) {
          // Normalize line endings and trim for comparison
          const currentContent = current.content.trim();
          const originalContent = original.content.trim();
          const currentTitle = current.title.trim();
          const originalTitle = original.title.trim();

          if (currentContent !== originalContent || currentTitle !== originalTitle) {
            // Only export the fields needed to patch
            changes.modified.push({
              id: current.id,
              title: currentTitle,
              content: currentContent
            });
          }
        }
      }
    });

    // 3. Identify Deleted Bhajans
    originalBhajans.forEach(orig => {
      if (!allBhajans.find(b => b.id === orig.id)) {
        changes.deleted.push(orig.id);
      }
    });

    // 4. Construct Clean Export Object
    const exportObj: any = {};
    if (changes.added.length > 0) exportObj.added = changes.added;
    if (changes.modified.length > 0) exportObj.modified = changes.modified;
    if (changes.deleted.length > 0) exportObj.deleted = changes.deleted;

    if (Object.keys(exportObj).length === 0) {
      alert("No changes detected compared to factory data.");
      return;
    }

    const dataStr = JSON.stringify(exportObj, null, 2);
    
    navigator.clipboard.writeText(dataStr).then(() => {
        const stats = [];
        if (changes.modified.length) stats.push(`${changes.modified.length} Modified`);
        if (changes.added.length) stats.push(`${changes.added.length} Added`);
        if (changes.deleted.length) stats.push(`${changes.deleted.length} Deleted`);
        
        alert(`Export Successful!\n\nChanges Detected: ${stats.join(', ')}\n\nThe patch data has been copied to your clipboard.`);
     }).catch(() => {
        alert("Failed to copy data. Check console.");
        console.log(dataStr);
     });
  };

  if (!isOpen) return null;

  // Determine Button Appearance
  let buttonContent = "Google Login";
  let buttonClass = "bg-blue-600 hover:bg-blue-700";
  
  if (showDisabledMsg) {
      buttonContent = "Developer Mode Disabled";
      buttonClass = "bg-slate-500 cursor-default";
  } else if (devMode) {
      buttonContent = "Developer Mode Enabled (Hold 3s to Disable)";
      buttonClass = "bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer select-none";
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex-none bg-saffron-500 text-white p-4 flex items-center gap-4 shadow-md">
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">Settings</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative">
        
        {/* Font Size Section */}
        <section>
          <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-4 px-2">Font Size of the Songs</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
               <span className="text-sm text-slate-500 dark:text-slate-400">12px</span>
               <span className="text-lg font-bold text-saffron-600">{fontSize}px</span>
               <span className="text-xl text-slate-500 dark:text-slate-400">40px</span>
            </div>
            <input 
              type="range" 
              min="12" 
              max="40" 
              step="2"
              value={fontSize}
              onChange={(e) => {
                onFontSizeChange(parseInt(e.target.value, 10));
              }}
              className="w-full h-2 bg-saffron-200 rounded-lg appearance-none cursor-pointer accent-saffron-600"
            />
          </div>
        </section>

        {/* Language Section */}
        <section>
          <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">Language / भाषा</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
            <RadioItem 
              label="English" 
              checked={script === 'iast'} 
              onChange={() => onScriptChange('iast')} 
            />
            <RadioItem 
              label="हिन्दी" 
              checked={script === 'devanagari'} 
              onChange={() => onScriptChange('devanagari')} 
            />
          </div>
        </section>

        {/* Theme Section */}
        <section>
           <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">Theme of the App</h3>
           <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
              <RadioItem 
                 label="Light Mode (Gauranga)" 
                 checked={!darkMode} 
                 onChange={() => onThemeChange(false)} 
                 icon={<Sun className="w-4 h-4 text-orange-500" />}
              />
              <RadioItem 
                 label="Dark Mode (Shyam)" 
                 checked={darkMode} 
                 onChange={() => onThemeChange(true)}
                 icon={<Moon className="w-4 h-4 text-blue-400" />}
              />
           </div>
        </section>

        {/* Other Settings */}
        <section>
           <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">Other Settings</h3>
           <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
             <CheckboxItem 
                label="Keep the song screen awake" 
                checked={keepAwake} 
                onChange={() => onKeepAwakeChange(!keepAwake)}
             />
             <CheckboxItem label="" checked={false} />
             <CheckboxItem label="" checked={true} />
           </div>
        </section>

         {/* Backup */}
         <section>
           <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">Backup: Bookmarks & History</h3>
           <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              
              <button 
                onClick={devMode ? undefined : handleSecretClick}
                onMouseDown={devMode ? handlePressStart : undefined}
                onMouseUp={devMode ? handlePressEnd : undefined}
                onMouseLeave={devMode ? handlePressEnd : undefined}
                onTouchStart={devMode ? handlePressStart : undefined}
                onTouchEnd={devMode ? handlePressEnd : undefined}
                className={`font-medium py-2 px-6 rounded shadow-sm transition-all w-full mb-2 text-white ${buttonClass}`}
              >
                 {buttonContent}
              </button>

              <div className="flex gap-2">
                 <button className="flex-1 bg-saffron-500 text-white font-medium py-2 rounded shadow-sm hover:bg-saffron-600 transition-colors opacity-50 cursor-default"></button>
                 <button className="flex-1 bg-saffron-500 text-white font-medium py-2 rounded shadow-sm hover:bg-saffron-600 transition-colors opacity-50 cursor-default"></button>
              </div>
           </div>
        </section>

        {devMode && (
          <section className="animate-fade-in-up pb-10">
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                   <Database size={18} /> Developer Options
                 </h3>
               </div>
               
               <p className="text-xs text-red-500 dark:text-red-300 mb-4">
                 You can now Add, Edit and Delete songs. Changes are saved locally.
               </p>

               <div className="space-y-2">
                 <button 
                   onClick={onAddBhajan}
                   className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-colors"
                 >
                   <Plus size={18} /> Add New Bhajan
                 </button>

                 <button 
                   onClick={handleExportChanges}
                   className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white py-2 rounded-lg font-medium hover:bg-slate-800 active:bg-slate-900 transition-colors"
                 >
                   <Copy size={18} /> Export Changes Only
                 </button>

                 {onRestoreDeleted && (
                    <button 
                    onClick={onRestoreDeleted}
                    className="w-full flex items-center justify-center gap-2 bg-saffron-600 text-white py-2 rounded-lg font-medium hover:bg-saffron-700 active:bg-saffron-800 transition-colors"
                    >
                    <RefreshCcw size={18} /> Restore Deleted Songs
                    </button>
                 )}

                 <button 
                   onClick={onResetData}
                   className="w-full flex items-center justify-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                 >
                   <RotateCcw size={18} /> Reset to Factory Data
                 </button>
               </div>
             </div>
          </section>
        )}

      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-xs shadow-2xl transform transition-all animate-fade-in-up">
                <div className="flex items-center justify-center mb-4 text-saffron-500 dark:text-saffron-400">
                    <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-center mb-4 text-slate-800 dark:text-white">
                    {authAction === 'ENABLE' ? 'Enter Developer Password' : 'Password to Disable'}
                </h3>
                <form onSubmit={handlePasswordSubmit}>
                    <input 
                        type="password" 
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoFocus
                        value={passwordInput}
                        onChange={(e) => setPasswordInput(e.target.value)}
                        className="w-full px-4 py-2 text-center text-lg tracking-widest border border-slate-300 dark:border-slate-600 rounded-lg mb-4 bg-slate-50 dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-saffron-500"
                        placeholder="******"
                    />
                    <div className="flex gap-2">
                        <button 
                            type="button" 
                            onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }}
                            className="flex-1 py-2 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2 bg-saffron-500 hover:bg-saffron-600 text-white font-medium rounded-lg shadow-sm transition-colors"
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

    </div>
  );
};

const RadioItem: React.FC<{ label: string; checked: boolean; onChange: () => void; icon?: React.ReactNode }> = ({ label, checked, onChange, icon }) => (
  <button 
    onClick={onChange}
    className="w-full flex items-center justify-between p-4 hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors"
  >
     <div className="flex items-center gap-3">
        {icon}
        <span className="text-slate-700 dark:text-slate-200 font-medium">{label}</span>
     </div>
     <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${checked ? 'border-saffron-500' : 'border-slate-300 dark:border-slate-600'}`}>
        {checked && <div className="w-3 h-3 rounded-full bg-saffron-500" />}
     </div>
  </button>
);

const CheckboxItem: React.FC<{ label: string; checked: boolean; onChange?: () => void }> = ({ label, checked, onChange }) => (
  <div className={`w-full flex items-center justify-between p-4 ${!label ? 'opacity-30 pointer-events-none' : ''}`}>
     <span className="text-slate-700 dark:text-slate-200 font-medium min-h-[1.5rem]">{label}</span>
     {label && (
       <button 
         onClick={onChange}
         className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-saffron-500 border-saffron-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}
       >
          {checked && <Check className="w-4 h-4 text-white" />} 
       </button>
     )}
  </div>
);
