
import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, Check, Plus, Database, RotateCcw, Copy, Lock, RefreshCcw, MessageCircle, Languages, Trash2 } from 'lucide-react';
import { FontSize, ScriptType, Bhajan } from '../types';
import { RAW_BHAJAN_DATA_1 } from '../data/rawBhajans1';
import { RAW_BHAJAN_DATA_2 } from '../data/rawBhajans2';
import { RAW_BHAJAN_DATA_3 } from '../data/rawBhajans3';
import { RAW_BHAJAN_DATA_4 } from '../data/rawBhajans4';
import { RAW_BHAJAN_DATA_5 } from '../data/rawBhajans5';
import { RAW_BHAJAN_DATA_6 } from '../data/rawBhajans6';
import { parseRawBhajanText } from '../utils/textProcessor';

const RAW_BHAJAN_DATA = RAW_BHAJAN_DATA_1 + RAW_BHAJAN_DATA_2 + RAW_BHAJAN_DATA_3 + RAW_BHAJAN_DATA_4 + RAW_BHAJAN_DATA_5 + RAW_BHAJAN_DATA_6;

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
  settingsLanguage: 'en' | 'hi';
  onSettingsLanguageChange: (lang: 'en' | 'hi') => void;
  devMode: boolean;
  onDevModeChange: (val: boolean) => void;
  onResetData: () => void;
  onRestoreDeleted?: () => void;
  onAddBhajan: () => void;
  allBhajans: Bhajan[];
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOpen, onClose, fontSize, onFontSizeChange, script, onScriptChange, 
  darkMode, onThemeChange, keepAwake, onKeepAwakeChange, 
  settingsLanguage, onSettingsLanguageChange,
  devMode, onDevModeChange,
  onResetData, onRestoreDeleted, onAddBhajan, allBhajans
}) => {
  // Use Ref for click counting to avoid re-renders and ensure reliability during rapid clicking
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authAction, setAuthAction] = useState<'ENABLE' | 'DISABLE'>('ENABLE');
  const [showDisabledMsg, setShowDisabledMsg] = useState(false);

  // Translations
  const t = {
    en: {
      title: "Settings",
      fontSize: "Font Size of the Songs",
      contentLang: "Song Language",
      theme: "Theme of the App",
      themeLight: "Light Mode (Gauranga)",
      themeDark: "Dark Mode (Shyam)",
      other: "Other Settings",
      keepAwake: "Keep the song screen awake",
      feedback: "Feedback",
      sendFeedback: "Send Feedback on WhatsApp",
      workInProgress: "This app is a work in progress. If found any problems pls send feedback.",
      settingsLang: "Settings Language",
      devOptions: "Developer Options (Do not Touch)",
      adminPanel: "Admin Panel",
      devEnabled: "Developer Mode Enabled (Tap 10x to Disable)",
      devDisabled: "Developer Mode Disabled",
      devSectionTitle: "Developer Options",
      devSectionDesc: "You can now Add, Edit and Delete songs. Changes are saved locally.",
      addBhajan: "Add New Bhajan",
      exportChanges: "Export Changes Only",
      restoreSongs: "Restore Deleted Songs",
      resetFactory: "Reset to Factory Data",
      enterPass: "Enter Developer Password",
      passDisable: "Password to Disable",
      cancel: "Cancel",
      submit: "Submit",
      clearCache: "Clear App Cache & Restart"
    },
    hi: {
      title: "सेटिंग्स",
      fontSize: "भजन के अक्षरों का आकार",
      contentLang: "भजन की भाषा",
      theme: "ऐप का थीम",
      themeLight: "लाइट मोड (गौरांग)",
      themeDark: "डार्क मोड (श्याम)",
      other: "अन्य सेटिंग्स",
      keepAwake: "स्क्रीन को जगाए रखें",
      feedback: "सुझाव",
      sendFeedback: "व्हाट्सएप पर सुझाव भेजें",
      workInProgress: "यह ऐप निर्माणाधीन है। यदि कोई समस्या मिले तो कृपया सुझाव भेजें।",
      settingsLang: "सेटिंग्स की भाषा",
      devOptions: "डेवलपर विकल्प (कृपया छेड़छाड़ न करें)",
      adminPanel: "एडमिन पैनल",
      devEnabled: "डेवलपर मोड सक्षम है (अक्षम करने के लिए 10 बार टैप करें)",
      devDisabled: "डेवलपर मोड अक्षम है",
      devSectionTitle: "डेवलपर विकल्प",
      devSectionDesc: "अब आप भजन जोड़, संपादित और हटा सकते हैं। परिवर्तन स्थानीय रूप से सहेजे जाते हैं।",
      addBhajan: "नया भजन जोड़ें",
      exportChanges: "केवल परिवर्तन निर्यात करें",
      restoreSongs: "हटाए गए भजन पुनर्स्थापित करें",
      resetFactory: "फैक्ट्री डेटा रीसेट करें",
      enterPass: "डेवलपर पासवर्ड दर्ज करें",
      passDisable: "अक्षम करने के लिए पासवर्ड",
      cancel: "रद्द करें",
      submit: "जमा करें",
      clearCache: "ऐप कैश मिटाएं और रीस्टार्ट करें"
    }
  }[settingsLanguage];

  // Reset click count when closing settings
  useEffect(() => {
    if (!isOpen) {
      clickCountRef.current = 0;
      setShowPasswordModal(false);
      setShowDisabledMsg(false);
      setPasswordInput('');
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    }
  }, [isOpen]);

  // --- Logic to Toggle Dev Mode (10 Continuous Taps) ---
  const handleSecretClick = () => {
    // Clear the reset timer on every click to keep the sequence alive
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    clickCountRef.current += 1;

    // Reset count if user stops clicking for 1 second
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    if (clickCountRef.current >= 10) {
      clickCountRef.current = 0;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      
      if (devMode) {
          // If enabled, 10 taps disables it
          setAuthAction('DISABLE');
      } else {
          // If disabled, 10 taps enables it
          setAuthAction('ENABLE');
      }
      setShowPasswordModal(true);
    }
  };

  const handlePasswordSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (passwordInput === "413541") {
        setShowPasswordModal(false);
        setPasswordInput('');
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate([100, 50, 100]); } catch (e) { /* safe fail */ }
        }

        if (authAction === 'ENABLE') {
             onDevModeChange(true);
             alert("Developer Mode Enabled!");
        } else {
             // Disable Flow
             setShowDisabledMsg(true);
             // Wait 2 seconds before actually reverting state to show the disabled message
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

  const handleFeedback = () => {
    // Feedback combined with WhatsApp
    window.open('https://wa.me/917049304733', '_blank');
  };

  const handleClearCache = async () => {
    if (window.confirm(settingsLanguage === 'en' ? "This will clear all app data, settings, and cached files. The app will restart. Continue?" : "यह सभी ऐप डेटा, सेटिंग्स और कैश को मिटा देगा। ऐप रीस्टार्ट होगा। जारी रखें?")) {
       try {
         // Clear LocalStorage
         localStorage.clear();
         
         // Clear Cache API
         if ('caches' in window) {
            const keys = await caches.keys();
            await Promise.all(keys.map(key => caches.delete(key)));
         }
         
         // Reload
         window.location.reload();
       } catch (e) {
         console.error(e);
         alert("Failed to clear cache completely.");
       }
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
    
    // Safe clipboard copy
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(dataStr).then(() => {
            const stats = [];
            if (changes.modified.length) stats.push(`${changes.modified.length} Modified`);
            if (changes.added.length) stats.push(`${changes.added.length} Added`);
            if (changes.deleted.length) stats.push(`${changes.deleted.length} Deleted`);
            
            alert(`Export Successful!\n\nChanges Detected: ${stats.join(', ')}\n\nThe patch data has been copied to your clipboard.`);
        }).catch((err) => {
            console.error(err);
            alert("Failed to copy automatically. Data logged to console.");
            console.log(dataStr);
        });
    } else {
        alert("Clipboard access not available. Data logged to console.");
        console.log(dataStr);
    }
  };

  if (!isOpen) return null;

  // Determine Button Appearance
  let buttonContent = t.adminPanel;
  let buttonClass = "bg-blue-600 hover:bg-blue-700";
  
  if (showDisabledMsg) {
      buttonContent = t.devDisabled;
      buttonClass = "bg-slate-500 cursor-default";
  } else if (devMode) {
      buttonContent = t.devEnabled;
      buttonClass = "bg-green-600 hover:bg-green-700 active:bg-green-800 cursor-pointer select-none";
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header - added pt for safe area */}
      <div className="flex-none bg-saffron-500 text-white p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 shadow-md">
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full" type="button">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">{t.title}</h2>
      </div>

      {/* Content - added pb for safe area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 relative pb-[calc(2rem+env(safe-area-inset-bottom))]">
        
        {/* Font Size Section */}
        <section>
          <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-4 px-2">{t.fontSize}</h3>
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

        {/* Settings Language Section */}
        <section>
           <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">{t.settingsLang}</h3>
           <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
              <RadioItem 
                 label="हिन्दी"
                 checked={settingsLanguage === 'hi'} 
                 onChange={() => onSettingsLanguageChange('hi')}
                 icon={<Languages className="w-4 h-4 text-slate-500" />}
              />
              <RadioItem 
                 label="English"
                 checked={settingsLanguage === 'en'} 
                 onChange={() => onSettingsLanguageChange('en')}
                 icon={<Languages className="w-4 h-4 text-slate-500" />}
              />
           </div>
        </section>

        {/* Theme Section */}
        <section>
           <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">{t.theme}</h3>
           <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
              <RadioItem 
                 label={t.themeLight}
                 checked={!darkMode} 
                 onChange={() => onThemeChange(false)} 
                 icon={<Sun className="w-4 h-4 text-orange-500" />}
              />
              <RadioItem 
                 label={t.themeDark}
                 checked={darkMode} 
                 onChange={() => onThemeChange(true)}
                 icon={<Moon className="w-4 h-4 text-blue-400" />}
              />
           </div>
        </section>

        {/* Other Settings */}
        <section>
           <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">{t.other}</h3>
           <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
             <CheckboxItem 
                label={t.keepAwake} 
                checked={keepAwake} 
                onChange={() => onKeepAwakeChange(!keepAwake)}
             />
           </div>
        </section>

         {/* Feedback Section */}
         <section>
            <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">{t.feedback}</h3>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm">
                <button 
                    type="button"
                    onClick={handleFeedback}
                    className="w-full flex items-center gap-3 p-4 hover:bg-saffron-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-200 font-medium"
                >
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center border border-green-200 dark:border-green-800">
                        <MessageCircle size={18} />
                    </div>
                    <span>{t.sendFeedback}</span>
                </button>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 text-center mt-3 px-2 leading-relaxed">
              {t.workInProgress}
            </p>
         </section>

         {/* Troubleshooting Section (Added for Clear Cache) */}
         <section>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden shadow-sm mt-6">
                <button 
                    type="button"
                    onClick={handleClearCache}
                    className="w-full flex items-center gap-3 p-4 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-700 dark:text-slate-200 font-medium"
                >
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center border border-red-200 dark:border-red-800">
                        <Trash2 size={18} />
                    </div>
                    <span>{t.clearCache}</span>
                </button>
            </div>
         </section>

        {/* Song Language Section (Moved to Bottom) */}
        <section>
          <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">{t.contentLang}</h3>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl overflow-hidden divide-y divide-slate-200 dark:divide-slate-700">
            <RadioItem 
              label="हिन्दी" 
              checked={script === 'devanagari'} 
              onChange={() => onScriptChange('devanagari')} 
            />
            <RadioItem 
              label="English" 
              checked={script === 'iast'} 
              onChange={() => onScriptChange('iast')} 
            />
          </div>
        </section>

         {/* Backup */}
         <section>
           <h3 className="text-saffron-600 dark:text-saffron-400 font-semibold mb-2 px-2">{t.devOptions}</h3>
           <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-center">
              
              <button 
                type="button"
                onClick={handleSecretClick}
                className={`font-medium py-2 px-6 rounded shadow-sm transition-all w-full mb-2 text-white ${buttonClass}`}
              >
                 {buttonContent}
              </button>
           </div>
        </section>

        {devMode && (
          <section className="animate-fade-in-up pb-10">
             <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl p-4">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-red-600 dark:text-red-400 font-bold flex items-center gap-2">
                   <Database size={18} /> {t.devSectionTitle}
                 </h3>
               </div>
               
               <p className="text-xs text-red-500 dark:text-red-300 mb-4">
                 {t.devSectionDesc}
               </p>

               <div className="space-y-2">
                 <button 
                   type="button"
                   onClick={onAddBhajan}
                   className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 active:bg-red-800 transition-colors"
                 >
                   <Plus size={18} /> {t.addBhajan}
                 </button>

                 <button 
                   type="button"
                   onClick={handleExportChanges}
                   className="w-full flex items-center justify-center gap-2 bg-slate-700 text-white py-2 rounded-lg font-medium hover:bg-slate-800 active:bg-slate-900 transition-colors"
                 >
                   <Copy size={18} /> {t.exportChanges}
                 </button>

                 {onRestoreDeleted && (
                    <button 
                    type="button"
                    onClick={onRestoreDeleted}
                    className="w-full flex items-center justify-center gap-2 bg-saffron-600 text-white py-2 rounded-lg font-medium hover:bg-saffron-700 active:bg-saffron-800 transition-colors"
                    >
                    <RefreshCcw size={18} /> {t.restoreSongs}
                    </button>
                 )}

                 <button 
                   type="button"
                   onClick={onResetData}
                   className="w-full flex items-center justify-center gap-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-400 py-2 rounded-lg font-medium hover:bg-red-50 dark:hover:bg-red-900/40 transition-colors"
                 >
                   <RotateCcw size={18} /> {t.resetFactory}
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
                    {authAction === 'ENABLE' ? t.enterPass : t.passDisable}
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
                            {t.cancel}
                        </button>
                        <button 
                            type="submit"
                            className="flex-1 py-2 bg-saffron-500 hover:bg-saffron-600 text-white font-medium rounded-lg shadow-sm transition-colors"
                        >
                            {t.submit}
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
    type="button"
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
         type="button"
         onClick={onChange}
         className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-saffron-500 border-saffron-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'}`}
       >
          {checked && <Check className="w-4 h-4 text-white" />} 
       </button>
     )}
  </div>
);
