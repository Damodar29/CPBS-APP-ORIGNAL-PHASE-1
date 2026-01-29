
import React, { useState, useEffect, useRef } from 'react';
import { X, Moon, Sun, Check, Plus, Database, RotateCcw, Copy, Lock, RefreshCcw, MessageCircle, Languages, Trash2, Download, Upload, FileJson, AlertTriangle, ExternalLink, Layout, ArrowLeftRight, Smartphone, Type, Monitor, Settings as SettingsIcon, HardDrive, Info } from 'lucide-react';
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
  
  // New Settings Props
  scrollBarSide: 'left' | 'right';
  onScrollBarSideChange: (side: 'left' | 'right') => void;
  azSliderSide: 'left' | 'right';
  onAzSliderSideChange: (side: 'left' | 'right') => void;
  indexMode?: 'latin' | 'devanagari'; // Passed to show correct label for slider

  devMode: boolean;
  onDevModeChange: (val: boolean) => void;
  onResetData: () => void;
  onRestoreDeleted?: () => void;
  onAddBhajan: () => void;
  onImportData: (json: string) => boolean;
  allBhajans: Bhajan[];
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  isOpen, onClose, fontSize, onFontSizeChange, script, onScriptChange, 
  darkMode, onThemeChange, keepAwake, onKeepAwakeChange, 
  settingsLanguage, onSettingsLanguageChange,
  scrollBarSide, onScrollBarSideChange,
  azSliderSide, onAzSliderSideChange,
  indexMode,
  devMode, onDevModeChange,
  onResetData, onRestoreDeleted, onAddBhajan, onImportData, allBhajans
}) => {
  // Use Ref for click counting to avoid re-renders and ensure reliability during rapid clicking
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authAction, setAuthAction] = useState<'ENABLE' | 'DISABLE'>('ENABLE');
  const [showDisabledMsg, setShowDisabledMsg] = useState(false);
  const [pendingLink, setPendingLink] = useState<{ url: string; title: string; icon?: React.ReactNode } | null>(null);

  // Translations
  const t = {
    en: {
      title: "Settings",
      sectionDisplay: "Display & Text",
      descDisplay: "Adjust text size and app theme (Light/Dark mode).",
      sectionContent: "Content & Language",
      descContent: "Choose App language and Bhajan script (Hindi/English).",
      sectionInterface: "Interface Layout",
      descInterface: "Customize layout for left/right handed use.",
      sectionSystem: "System & Support",
      descSystem: "Screen wake lock and support options.",
      sectionStorage: "Storage & Maintenance",
      descStorage: "Manage app data and cache.",
      
      fontSize: "Font Size",
      theme: "App Theme",
      themeLight: "Light",
      themeDark: "Dark",
      
      scrollBarPos: "Scrollbar",
      azSliderPos: "Slider", // Base label, dynamic part handled in render
      left: "Left",
      right: "Right",
      
      bhajanLang: "Bhajan Script",
      appLang: "App Language",
      
      keepAwake: "Keep Screen Awake",
      keepAwakeDesc: "Prevents screen from turning off while reading",
      
      feedback: "Send Feedback",
      feedbackDesc: "Contact us on WhatsApp",
      
      clearCache: "Clear App Cache",
      clearCacheDesc: "Fix issues by resetting local data",
      
      devOptions: "Developer Mode",
      adminPanel: "Admin Panel",
      devEnabled: "Active (Tap 3x to Disable)",
      devDisabled: "Inactive",
      
      devSectionTitle: "Data Management",
      devSectionDesc: "Manage application data, add new bhajans, or sync with external backups.",
      addBhajan: "Add New",
      exportChanges: "Export Patch",
      exportFull: "Backup All",
      importData: "Import Data",
      restoreBhajans: "Restore Bhajans",
      resetFactory: "Factory Reset",
      
      enterPass: "Enter Developer Password",
      passDisable: "Password to Disable",
      cancel: "Cancel",
      submit: "Submit",
      pasteJson: "Paste JSON Data Here"
    },
    hi: {
      title: "सेटिंग्स",
      sectionDisplay: "दिखावट और अक्षर",
      descDisplay: "अक्षर का आकार और ऐप का थीम (लाइट/डार्क) बदलें।",
      sectionContent: "भाषा और सामग्री",
      descContent: "ऐप की भाषा और भजन की लिपि (हिंदी/अंग्रेजी) चुनें।",
      sectionInterface: "इंटरफ़ेस लेआउट",
      descInterface: "बाएं/दाएं हाथ के उपयोग के लिए लेआउट बदलें।",
      sectionSystem: "सिस्टम और सहायता",
      descSystem: "स्क्रीन ऑन रखने और सहायता के विकल्प।",
      sectionStorage: "स्टोरेज और रखरखाव",
      descStorage: "ऐप डेटा और कैश प्रबंधित करें।",
      
      fontSize: "अक्षरों का आकार",
      theme: "ऐप का थीम",
      themeLight: "लाइट",
      themeDark: "डार्क",
      
      scrollBarPos: "स्क्रोलबार",
      azSliderPos: "स्लाइडर",
      left: "बायाँ",
      right: "दायाँ",
      
      bhajanLang: "भजन की लिपि",
      appLang: "ऐप की भाषा",
      
      keepAwake: "स्क्रीन को जगाए रखें",
      keepAwakeDesc: "पढ़ते समय स्क्रीन बंद नहीं होगी",
      
      feedback: "सुझाव भेजें",
      feedbackDesc: "व्हाट्सएप पर संपर्क करें",
      
      clearCache: "ऐप कैश मिटाएं",
      clearCacheDesc: "डेटा रीसेट करके समस्याएं ठीक करें",
      
      devOptions: "डेवलपर मोड",
      adminPanel: "एडमिन पैनल",
      devEnabled: "सक्रिय (बंद करने के लिए 3 बार टैप करें)",
      devDisabled: "निष्क्रिय",
      
      devSectionTitle: "डेटा प्रबंधन",
      devSectionDesc: "एप्लिकेशन डेटा प्रबंधित करें, नए भजन जोड़ें, या बाहरी बैकअप के साथ सिंक करें।",
      addBhajan: "नया जोड़ें",
      exportChanges: "पैच निर्यात",
      exportFull: "पूर्ण बैकअप",
      importData: "डेटा आयात",
      restoreBhajans: "मूल भजन लाएं",
      resetFactory: "फैक्ट्री रीसेट",
      
      enterPass: "डेवलपर पासवर्ड दर्ज करें",
      passDisable: "अक्षम करने के लिए पासवर्ड",
      cancel: "रद्द करें",
      submit: "जमा करें",
      pasteJson: "यहाँ JSON डेटा पेस्ट करें"
    }
  }[settingsLanguage];

  // Reset click count when closing settings
  useEffect(() => {
    if (!isOpen) {
      clickCountRef.current = 0;
      setShowPasswordModal(false);
      setShowDisabledMsg(false);
      setShowImportModal(false);
      setPendingLink(null);
      setPasswordInput('');
      setImportText('');
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
    }
  }, [isOpen]);

  // --- Logic to Toggle Dev Mode (3 Continuous Taps) ---
  const handleSecretClick = () => {
    // Clear the reset timer on every click to keep the sequence alive
    if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);

    clickCountRef.current += 1;

    // Reset count if user stops clicking for 1 second
    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 1000);

    // Threshold from 10 to 3
    if (clickCountRef.current >= 3) {
      clickCountRef.current = 0;
      if (clickTimeoutRef.current) clearTimeout(clickTimeoutRef.current);
      
      if (devMode) {
          // Disable immediately without password
          onDevModeChange(false);
          alert(settingsLanguage === 'en' ? "Developer Mode Disabled" : "डेवलपर मोड अक्षम किया गया");
      } else {
          // If disabled, 3 taps enables it (Requires Password)
          setAuthAction('ENABLE');
          setShowPasswordModal(true);
      }
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
        } 
        // Disabling is now handled directly in handleSecretClick
    } else {
        alert("Incorrect Password");
        setPasswordInput('');
    }
  };

  const handleFeedback = () => {
    setPendingLink({
        url: 'https://wa.me/917049304733',
        title: settingsLanguage === 'en' ? 'Feedback (WhatsApp)' : 'सुझाव (व्हाट्सएप)',
        icon: <MessageCircle size={24} />
    });
  };

  const confirmNavigation = () => {
      if (pendingLink) {
          window.open(pendingLink.url, '_blank');
          setPendingLink(null);
      }
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

  const copyToClipboard = (data: string, message: string) => {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(data).then(() => {
              alert(message);
          }).catch((err) => {
              console.error(err);
              alert("Failed to copy. Data logged to console.");
              console.log(data);
          });
      } else {
          alert("Clipboard access not available. Data logged to console.");
          console.log(data);
      }
  };

  const handleExportFull = () => {
      const dataStr = JSON.stringify(allBhajans, null, 2);
      copyToClipboard(dataStr, "Full Backup Copied to Clipboard!");
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
              content: currentContent,
              author: current.author
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
    
    const stats = [];
    if (changes.modified.length) stats.push(`${changes.modified.length} Modified`);
    if (changes.added.length) stats.push(`${changes.added.length} Added`);
    if (changes.deleted.length) stats.push(`${changes.deleted.length} Deleted`);
    
    copyToClipboard(dataStr, `Patch Data Copied!\n\nChanges: ${stats.join(', ')}`);
  };

  const handleImportSubmit = () => {
      if (!importText.trim()) return;
      if (onImportData(importText)) {
          setShowImportModal(false);
          setImportText('');
          onClose(); // Close settings to refresh/show changes
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

  // Dynamic Label for Az Slider based on current index mode
  const sliderLabel = indexMode === 'latin' ? "A-Z Slider" : "अ-ज्ञ Slider";

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 flex flex-col animate-in slide-in-from-left duration-300">
      
      {/* Header */}
      <div dir="ltr" className="flex-none bg-saffron-500 text-white p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 shadow-md z-10">
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors" type="button">
          <X className="w-6 h-6" />
        </button>
        <h2 className="text-xl font-bold">{t.title}</h2>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-4 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-6 max-w-2xl mx-auto">
          
          {/* Card 1: Display & Appearance */}
          <SectionCard title={t.sectionDisplay} icon={<Monitor size={18} />} description={t.descDisplay}>
             
             {/* Font Size */}
             <div className="mb-6">
                <div className="flex justify-between items-center mb-2 px-1">
                   <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{t.fontSize}</span>
                   <span className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">{fontSize}px</span>
                </div>
                <div className="flex items-center gap-3">
                   <Type size={14} className="text-slate-400" />
                   <input 
                      type="range" 
                      min="12" 
                      max="40" 
                      step="2"
                      value={fontSize}
                      onChange={(e) => onFontSizeChange(parseInt(e.target.value, 10))}
                      className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-saffron-500"
                   />
                   <Type size={20} className="text-slate-600 dark:text-slate-300" />
                </div>
             </div>

             {/* Theme Toggle (Segmented Control) */}
             <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.theme}</span>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                   <SegmentedButton 
                      active={!darkMode} 
                      onClick={() => onThemeChange(false)} 
                      icon={<Sun size={16} />} 
                      label={t.themeLight} 
                   />
                   <SegmentedButton 
                      active={darkMode} 
                      onClick={() => onThemeChange(true)} 
                      icon={<Moon size={16} />} 
                      label={t.themeDark} 
                   />
                </div>
             </div>
          </SectionCard>

          {/* Card 2: Content & Language */}
          <SectionCard title={t.sectionContent} icon={<Languages size={18} />} description={t.descContent}>
             
             {/* App Language (Moved to Top) */}
             <div className="mb-5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.appLang}</span>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                   <SegmentedButton 
                      active={settingsLanguage === 'hi'} 
                      onClick={() => onSettingsLanguageChange('hi')} 
                      label="हिन्दी" 
                   />
                   <SegmentedButton 
                      active={settingsLanguage === 'en'} 
                      onClick={() => onSettingsLanguageChange('en')} 
                      label="English" 
                   />
                </div>
             </div>

             {/* Bhajan Script */}
             <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.bhajanLang}</span>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                   <SegmentedButton 
                      active={script === 'devanagari'} 
                      onClick={() => onScriptChange('devanagari')} 
                      label="हिन्दी" 
                   />
                   <SegmentedButton 
                      active={script === 'iast'} 
                      onClick={() => onScriptChange('iast')} 
                      label="English" 
                   />
                </div>
             </div>
          </SectionCard>

          {/* Card 3: Interface Layout */}
          <SectionCard title={t.sectionInterface} icon={<Layout size={18} />} description={t.descInterface}>
             
             {/* Scrollbar Position */}
             <div className="mb-5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{t.scrollBarPos}</span>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                   <SegmentedButton 
                      active={scrollBarSide === 'left'} 
                      onClick={() => onScrollBarSideChange('left')} 
                      label={t.left} 
                   />
                   <SegmentedButton 
                      active={scrollBarSide === 'right'} 
                      onClick={() => onScrollBarSideChange('right')} 
                      label={t.right} 
                   />
                </div>
             </div>

             {/* AZ Slider Position */}
             <div>
                <span className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-2 px-1">{sliderLabel}</span>
                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl">
                   <SegmentedButton 
                      active={azSliderSide === 'left'} 
                      onClick={() => onAzSliderSideChange('left')} 
                      label={t.left} 
                   />
                   <SegmentedButton 
                      active={azSliderSide === 'right'} 
                      onClick={() => onAzSliderSideChange('right')} 
                      label={t.right} 
                   />
                </div>
             </div>
          </SectionCard>

          {/* Card 4: System & Support */}
          <SectionCard title={t.sectionSystem} icon={<Smartphone size={18} />} description={t.descSystem}>
             
             {/* Keep Awake */}
             <ActionRow 
                icon={<Smartphone size={20} className="text-blue-500" />}
                label={t.keepAwake}
                desc={t.keepAwakeDesc}
                action={
                   <div 
                      onClick={() => onKeepAwakeChange(!keepAwake)}
                      className={`w-12 h-7 rounded-full transition-colors relative cursor-pointer ${keepAwake ? 'bg-saffron-500' : 'bg-slate-200 dark:bg-slate-600'}`}
                   >
                      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${keepAwake ? 'left-6' : 'left-1'}`} />
                   </div>
                }
             />

             <div className="h-px bg-slate-100 dark:bg-slate-700 my-1" />

             {/* Feedback */}
             <ActionRow 
                icon={<MessageCircle size={20} className="text-green-500" />}
                label={t.feedback}
                desc={t.feedbackDesc}
                onClick={handleFeedback}
                showChevron
             />
          </SectionCard>

          {/* Card 5: Storage & Maintenance */}
          <SectionCard title={t.sectionStorage} icon={<HardDrive size={18} />} description={t.descStorage}>
              <ActionRow 
                icon={<Trash2 size={20} className="text-red-500" />}
                label={t.clearCache}
                desc={t.clearCacheDesc}
                onClick={handleClearCache}
                className="text-red-600 dark:text-red-400"
             />
          </SectionCard>

          {/* Card 6: Developer Options */}
          <div className="pt-4">
             <button 
               type="button"
               onClick={handleSecretClick}
               className={`w-full py-3 px-4 rounded-xl shadow-sm text-sm font-bold text-white transition-all ${buttonClass}`}
             >
                {t.devOptions}: {buttonContent}
             </button>

             {devMode && (
                <div className="mt-4 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-saffron-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
                   <div className="bg-saffron-50 dark:bg-slate-800/80 p-3 border-b border-saffron-100 dark:border-slate-700">
                      <h3 className="text-xs font-bold text-saffron-700 dark:text-saffron-400 uppercase tracking-wider flex items-center gap-2">
                         <Database size={14} /> {t.devSectionTitle}
                      </h3>
                   </div>
                   <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-xs text-slate-600 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
                      {t.devSectionDesc}
                   </div>
                   <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-700 border-b border-slate-100 dark:border-slate-700">
                      <DevActionButton icon={<Plus size={18} className="text-green-500" />} label={t.addBhajan} onClick={onAddBhajan} />
                      <DevActionButton icon={<Upload size={18} className="text-blue-500" />} label={t.importData} onClick={() => setShowImportModal(true)} />
                      <DevActionButton icon={<FileJson size={18} className="text-orange-500" />} label={t.exportChanges} onClick={handleExportChanges} />
                      <DevActionButton icon={<Download size={18} className="text-purple-500" />} label={t.exportFull} onClick={handleExportFull} />
                   </div>
                   <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-slate-700">
                      {onRestoreDeleted && (
                         <DevActionButton icon={<RotateCcw size={18} className="text-teal-500" />} label={t.restoreBhajans} onClick={onRestoreDeleted} />
                      )}
                      <DevActionButton icon={<AlertTriangle size={18} className="text-red-500" />} label={t.resetFactory} onClick={onResetData} />
                   </div>
                </div>
             )}
          </div>

        </div>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
               <form onSubmit={handlePasswordSubmit} className="bg-white dark:bg-slate-800 w-full max-w-xs p-6 rounded-2xl shadow-xl transform scale-100 transition-all">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 text-center">
                       {authAction === 'DISABLE' ? t.passDisable : t.enterPass}
                   </h3>
                   <input 
                      type="password" 
                      autoFocus
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full p-3 bg-slate-100 dark:bg-slate-700 rounded-lg text-center font-mono text-lg tracking-widest mb-4 focus:ring-2 focus:ring-saffron-500 focus:outline-none dark:text-white"
                      placeholder="••••••"
                   />
                   <div className="flex gap-3">
                       <button 
                          type="button" 
                          onClick={() => { setShowPasswordModal(false); setPasswordInput(''); }}
                          className="flex-1 py-2 text-slate-500 font-medium"
                       >
                          {t.cancel}
                       </button>
                       <button 
                          type="submit"
                          className="flex-1 py-2 bg-saffron-500 text-white rounded-lg font-bold shadow-sm"
                       >
                          {t.submit}
                       </button>
                   </div>
               </form>
          </div>
      )}

      {/* Import Data Modal */}
      {showImportModal && (
          <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
               <div className="bg-white dark:bg-slate-800 w-full max-w-sm p-6 rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                       <Upload size={20} className="text-saffron-500" /> {t.importData}
                   </h3>
                   <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                       Paste the JSON data you exported previously. This will merge or replace songs based on the data format.
                   </p>
                   <textarea
                      value={importText}
                      onChange={(e) => setImportText(e.target.value)}
                      className="flex-1 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-xs mb-4 focus:ring-2 focus:ring-saffron-500 focus:outline-none dark:text-white resize-none"
                      placeholder={t.pasteJson}
                   />
                   <div className="flex gap-3">
                       <button 
                          type="button" 
                          onClick={() => { setShowImportModal(false); setImportText(''); }}
                          className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 rounded-xl"
                       >
                          {t.cancel}
                       </button>
                       <button 
                          onClick={handleImportSubmit}
                          disabled={!importText.trim()}
                          className="flex-1 py-2.5 bg-blue-600 disabled:bg-blue-400 text-white rounded-xl font-bold shadow-sm"
                       >
                          {t.importData}
                       </button>
                   </div>
               </div>
          </div>
      )}

      {/* Confirmation Modal (Pending Link) */}
      {pendingLink && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-2xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                          {pendingLink.icon || <ExternalLink size={24} />}
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                          {settingsLanguage === 'en' ? 'Open WhatsApp?' : 'व्हाट्सएप खोलें?'}
                      </h3>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                          {settingsLanguage === 'en' ? 'You are leaving the app to open' : 'आप ऐप छोड़कर जा रहे हैं'}: <strong>WhatsApp</strong>
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setPendingLink(null)}
                              className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors"
                          >
                              {t.cancel}
                          </button>
                          <button 
                              onClick={confirmNavigation}
                              className="flex-1 py-2.5 text-white font-bold bg-green-500 hover:bg-green-600 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                          >
                              Open
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

// --- Helper Components ---

const SectionCard: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; description?: string }> = ({ title, icon, children, description }) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
   <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-all">
      <div className="px-4 py-3 border-b border-slate-50 dark:border-slate-700/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800">
         <div className="flex items-center gap-2">
             <span className="text-saffron-500 dark:text-saffron-400">{icon}</span>
             <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</h3>
         </div>
         {description && (
             <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-1 rounded-full transition-colors ${showInfo ? 'bg-saffron-100 text-saffron-600 dark:bg-slate-700 dark:text-saffron-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                aria-label="Show description"
             >
                 <Info size={16} />
             </button>
         )}
      </div>
      
      {showInfo && description && (
          <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 text-xs text-slate-600 dark:text-slate-300 border-b border-blue-100 dark:border-blue-800/30 animate-fade-in leading-relaxed">
              {description}
          </div>
      )}

      <div className="p-4">
         {children}
      </div>
   </div>
  );
};

const SegmentedButton: React.FC<{ active: boolean; onClick: () => void; icon?: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
   <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-bold transition-all duration-200 ${
         active 
         ? 'bg-white dark:bg-slate-700 text-saffron-600 dark:text-saffron-400 shadow-sm' 
         : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'
      }`}
   >
      {icon} {label}
   </button>
);

const ActionRow: React.FC<{ icon: React.ReactNode; label: string; desc?: string; action?: React.ReactNode; onClick?: () => void; showChevron?: boolean; className?: string }> = ({ icon, label, desc, action, onClick, showChevron, className }) => (
   <div 
      onClick={onClick}
      className={`flex items-center justify-between py-2 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
   >
      <div className="flex items-center gap-3">
         <div className="w-9 h-9 rounded-full bg-slate-50 dark:bg-slate-700/50 flex items-center justify-center shrink-0">
            {icon}
         </div>
         <div>
            <div className={`text-sm font-bold text-slate-800 dark:text-white ${className}`}>{label}</div>
            {desc && <div className="text-xs text-slate-400 dark:text-slate-500">{desc}</div>}
         </div>
      </div>
      {action}
      {showChevron && <SettingsIcon size={16} className="text-slate-300 dark:text-slate-600 rotate-90" />}
   </div>
);

const DevActionButton: React.FC<{ icon: React.ReactNode; label: string; onClick: () => void }> = ({ icon, label, onClick }) => (
   <button 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 p-3 flex flex-col items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
   >
      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center">
         {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 text-center leading-tight">{label}</span>
   </button>
);
