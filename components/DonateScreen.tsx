
import React, { useState, useEffect } from 'react';
import { X, Heart, MessageCircle, Languages, Copy, Phone, Check, ExternalLink } from 'lucide-react';

interface DonateScreenProps {
  isOpen: boolean;
  onClose: () => void;
  settingsLanguage: 'en' | 'hi';
}

export const DonateScreen: React.FC<DonateScreenProps> = ({ isOpen, onClose, settingsLanguage }) => {
  const [lang, setLang] = useState<'en' | 'hi'>(settingsLanguage);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    setLang(settingsLanguage);
  }, [settingsLanguage, isOpen]);

  if (!isOpen) return null;

  const contacts = [
    {
      nameEn: 'Narayan Das (Naman)',
      nameHi: 'नारायण दास (नमन)',
      phone: '+91 98878 80429',
      cleanNumber: '919887880429'
    },
    {
      nameEn: 'Lalit Krishna Das (Lucky)',
      nameHi: 'ललित कृष्ण दास (लकी)',
      phone: '+91 90394 84855',
      cleanNumber: '919039484855'
    }
  ];

  const handleDonateClick = (cleanNumber: string) => {
    const message = encodeURIComponent("RadheShyam, I would like to donate to Shree Chaitanya Prem Bhakti Sangh");
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const handleCopy = (text: string, index: number) => {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const handleCall = (cleanNumber: string) => {
      window.open(`tel:${cleanNumber}`);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden transform scale-100 transition-all animate-in zoom-in-95 duration-200 border border-white/20 max-h-[90vh] flex flex-col">
        
        {/* Header Section */}
        <div className="relative bg-gradient-to-br from-saffron-500 to-red-500 p-6 pb-12 shrink-0">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-400/20 rounded-full blur-xl -ml-5 -mb-5"></div>

            {/* Top Controls */}
            <div className="flex justify-between items-center relative z-10 mb-4">
                <button 
                    onClick={() => setLang(prev => prev === 'en' ? 'hi' : 'en')}
                    className="bg-black/20 hover:bg-black/30 text-white px-3 py-1 rounded-full text-xs font-bold transition-colors flex items-center gap-1.5 backdrop-blur-md"
                >
                    <Languages size={14} />
                    {lang === 'en' ? 'हिन्दी' : 'English'}
                </button>
                <button 
                    onClick={onClose}
                    className="bg-black/20 hover:bg-black/30 text-white p-1.5 rounded-full transition-colors backdrop-blur-md"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Center Icon & Title */}
            <div className="flex flex-col items-center text-center relative z-10">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 shadow-lg border border-white/30 transform rotate-3">
                    <Heart size={40} className="text-white fill-white/20 animate-pulse-slow" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-md">
                    {lang === 'en' ? 'Support Our Seva' : 'सेवा सहयोग'}
                </h2>
                <p className="text-saffron-100 text-sm font-medium opacity-90 max-w-[200px] leading-tight">
                    Shree Chaitanya Prem Bhakti Sangh
                </p>
            </div>
        </div>

        {/* Content Section - Overlapping Card Effect */}
        <div className="relative -mt-6 px-4 pb-6 flex-1 overflow-y-auto no-scrollbar">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-slate-100 dark:border-slate-700">
                
                {/* Description */}
                <p className="text-slate-600 dark:text-slate-300 text-center text-sm leading-relaxed mb-6 font-medium">
                    {lang === 'en' ? (
                        <>
                        Your loving contribution helps us maintain our Organization and propagate the Holy Names.
                        </>
                    ) : (
                        <>
                        आपका प्रेमपूर्ण योगदान हमें इस संस्था को सुचारू रूप से चलाने और हरिनाम प्रचार में सहायता करता है।
                        </>
                    )}
                </p>

                {/* Divider */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {lang === 'en' ? 'Contact Seva Prabandhak' : 'सेवा प्रबंधक से संपर्क करें'}
                    </span>
                    <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1"></div>
                </div>

                {/* Contact Cards */}
                <div className="space-y-3">
                    {contacts.map((contact, index) => (
                        <div key={index} className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700 transition-all hover:border-saffron-200 dark:hover:border-saffron-900">
                            <div className="flex flex-col mb-3">
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                                    {lang === 'en' ? contact.nameEn : contact.nameHi}
                                </span>
                                <span className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                    {contact.phone}
                                </span>
                            </div>
                            
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => handleDonateClick(contact.cleanNumber)}
                                    className="flex-1 py-2 bg-[#25D366] hover:bg-[#20bd5a] text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <MessageCircle size={16} className="fill-current" />
                                    <span>{lang === 'en' ? 'WhatsApp' : 'व्हाट्सएप'}</span>
                                </button>
                                <button 
                                    onClick={() => handleCall(contact.cleanNumber)}
                                    className="flex-1 py-2 bg-saffron-500 hover:bg-saffron-600 text-white rounded-lg font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <Phone size={16} />
                                    <span>{lang === 'en' ? 'Call' : 'कॉल'}</span>
                                </button>
                                <button 
                                    onClick={() => handleCopy(contact.phone, index)}
                                    className="p-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-saffron-500 dark:hover:text-saffron-400 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                                    title="Copy Number"
                                >
                                    {copiedIndex === index ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
            
            {/* Footer Text */}
            <div className="mt-6 text-center opacity-50 pb-2">
                <div className="flex justify-center items-center gap-2 text-xs font-hindi text-slate-400 dark:text-slate-500">
                    <span className="h-px w-8 bg-slate-300 dark:bg-slate-700"></span>
                    राधे श्याम
                    <span className="h-px w-8 bg-slate-300 dark:bg-slate-700"></span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
