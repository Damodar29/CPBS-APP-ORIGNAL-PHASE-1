
import React, { useState } from 'react';
import { X, Heart, MessageCircle, Languages } from 'lucide-react';

interface DonateScreenProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonateScreen: React.FC<DonateScreenProps> = ({ isOpen, onClose }) => {
  const [lang, setLang] = useState<'en' | 'hi'>('en');

  if (!isOpen) return null;

  const handleDonateClick = () => {
    const message = encodeURIComponent("RadheShyam , I would like to donate to Shree Chaitanaya Prem Bhakti Sangh");
    window.open(`https://wa.me/919887880429?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-800 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden transform scale-100 transition-all animate-in zoom-in-95 duration-200">
        {/* Header with Visual */}
        <div className="bg-gradient-to-br from-red-500 to-pink-600 p-8 text-center relative">
            {/* Language Toggle */}
            <button 
                onClick={() => setLang(prev => prev === 'en' ? 'hi' : 'en')}
                className="absolute top-3 left-3 p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors flex items-center gap-1"
                type="button"
                title="Switch Language"
            >
                <Languages size={20} />
                <span className="text-xs font-medium uppercase">{lang === 'en' ? 'HI' : 'EN'}</span>
            </button>

            <button 
                onClick={onClose}
                className="absolute top-3 right-3 p-1 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors"
                type="button"
            >
                <X size={24} />
            </button>
            <div className="bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border-2 border-white/30 shadow-inner">
                <Heart size={40} className="text-white fill-current animate-pulse-slow" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
                {lang === 'en' ? 'Support Seva' : 'सेवा सहयोग'}
            </h2>
            <p className="text-red-100 text-sm font-medium">
                {lang === 'en' ? 'Shree Chaitanya Prem Bhakti Sangh' : 'श्री चैतन्य प्रेम भक्ति संघ'}
            </p>
        </div>

        {/* Content */}
        <div className="p-6 text-center">
            <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed font-medium">
                {lang === 'en' ? (
                    <>
                    Your loving contribution helps us maintain our Organization and propagate the Holy Names.
                    <br/><br/>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Please contact us on WhatsApp to proceed with your donation.</span>
                    </>
                ) : (
                    <>
                    आपका प्रेमपूर्ण योगदान हमें इस संस्था को सुचारू रूप से चलाने और हरिनाम प्रचार में सहायता करता है।
                    <br/><br/>
                    <span className="text-sm text-slate-500 dark:text-slate-400">दान हेतु कृपया हमसे व्हाट्सएप पर संपर्क करें।</span>
                    </>
                )}
            </p>

            <button 
                onClick={handleDonateClick}
                className="w-full py-3.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/30 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
                <MessageCircle size={24} />
                <span>{lang === 'en' ? 'Donate via WhatsApp' : 'व्हाट्सएप द्वारा दान करें'}</span>
            </button>
            
            <p className="mt-4 text-xs text-slate-400 font-mono tracking-wider">
                {lang === 'en' ? 'Narayan Das (Naman)' : 'नारायण दास (नमन)'}
                <br/>
                +91 98878 80429
            </p>
        </div>
      </div>
    </div>
  );
};
