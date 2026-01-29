
import React, { useState, useEffect } from 'react';
import { X, Languages, Heart, Info, History, Sparkles } from 'lucide-react';

interface AboutScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDonate: () => void;
  scrollBarSide?: 'left' | 'right';
  settingsLanguage: 'en' | 'hi';
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ isOpen, onClose, onOpenDonate, scrollBarSide = 'left', settingsLanguage }) => {
  const [lang, setLang] = useState<'hi' | 'en'>(settingsLanguage);

  useEffect(() => {
    setLang(settingsLanguage);
  }, [settingsLanguage, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-saffron-200/20 dark:bg-saffron-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

      {/* Header */}
      <div className="flex-none bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
            <button 
                onClick={onClose} 
                className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-600 dark:text-slate-300"
                type="button"
            >
                <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Info className="w-5 h-5 text-saffron-500" />
                {lang === 'hi' ? 'परिचय' : 'About CPBS'}
            </h2>
        </div>

        <button 
            onClick={() => setLang(prev => prev === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 bg-saffron-50 dark:bg-slate-800 border border-saffron-200 dark:border-slate-700 hover:bg-saffron-100 dark:hover:bg-slate-700 px-3 py-1.5 rounded-full transition-colors text-sm font-medium text-saffron-700 dark:text-saffron-400"
        >
            <Languages size={16} />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      {/* Content - Scrollbar Applied */}
      <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
        <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="max-w-3xl mx-auto p-5 pb-[calc(2rem+env(safe-area-inset-bottom))] space-y-8">
            
            {/* Hero Logo Section */}
            <div className="flex flex-col items-center justify-center pt-4 pb-2 animate-fade-in-up">
                 <div className="w-20 h-20 bg-gradient-to-br from-saffron-400 to-saffron-600 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform rotate-3">
                    <svg viewBox="0 0 100 200" className="h-12 w-auto text-white fill-current drop-shadow-sm transform -rotate-3">
                        <path d="M25 10 L 25 90 Q 25 125 50 125 Q 75 125 75 90 L 75 10" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
                        <path d="M50 115 Q 20 155 50 195 Q 80 155 50 115" fill="currentColor" />
                    </svg>
                 </div>
                 <h1 className="text-2xl font-bold text-slate-800 dark:text-white text-center leading-tight">
                    Shree Chaitanya<br/>
                    <span className="text-saffron-600 dark:text-saffron-400">Prem Bhakti Sangh</span>
                 </h1>
            </div>

            {/* Support Button (Top) */}
            <button 
                onClick={onOpenDonate}
                className="w-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm group"
            >
                <Heart size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
                <span>{lang === 'en' ? 'Support Seva / Donate' : 'सेवा सहयोग / दान करें'}</span>
            </button>

            {/* Main Text Content */}
            <div className="space-y-6 text-slate-600 dark:text-slate-300 leading-relaxed text-[15px] sm:text-base">
                
                {/* Introduction Section */}
                {lang === 'en' ? (
                    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                        <p>
                          <strong className="text-saffron-600 dark:text-saffron-400 font-bold text-lg block mb-1">Shree Chaitanya Prem Bhakti Sangh</strong>
                          is basically a Gaudiya Vaishnav Community which was formed with the purpose of preaching the Holy names of the Lord in north-western and Central Parts of the country.
                        </p>
                        <p>
                          Gaudiya Vaishnavism is based on the life and teachings of Lord Chaitanya, who is also Known by the name, <span className="font-semibold text-slate-800 dark:text-slate-100">Gourang Mahaprabhu</span>.
                        </p>
                        <div className="flex gap-4 items-start bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm">
                                Vaishnavism means 'worship of Lord Vishnu' & His Incarnations, while Gaud refers to the region of West Bengal from Where Vaishnavism originated.
                            </p>
                        </div>
                        <p>
                          Shri Chaitanya Mahaprabhu rejuvenated the culture of Shri Krishna bhakti in India in the fifteenth century.
                        </p>
                        <p>
                          This movement is originally referred to as <span className="italic font-medium">Brahma-Madhva-Gaudiya vaishnav sampradaya</span>.
                        </p>
                        <p>
                          The ultimate goal of this movement is to develop a loving relationship with the Supreme Lord ‘Krishna’.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                         <p>
                          <strong className="text-saffron-600 dark:text-saffron-400 font-bold text-lg block mb-1 font-hindi">श्री चैतन्य प्रेम भक्ति संघ</strong>
                          मूल रूप से एक गौड़ीय वैष्णव समुदाय है जिसका गठन देश के उत्तर-पश्चिमी और मध्य भागों में भगवान के पवित्र नामों का प्रचार करने के उद्देश्य से किया गया था।
                        </p>
                        <p>
                          गौड़ीय वैष्णववाद भगवान चैतन्य के जीवन और शिक्षाओं पर आधारित है, जिन्हें <span className="font-semibold text-slate-800 dark:text-slate-100">गौरांग महाप्रभु</span> के नाम से भी जाना जाता है।
                        </p>
                        <div className="flex gap-4 items-start bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                            <Sparkles className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-sm">
                              वैष्णववाद का अर्थ है 'भगवान विष्णु और उनके अवतारों की पूजा', जबकि गौड़ पश्चिम बंगाल के उस क्षेत्र को संदर्भित करता है जहाँ से वैष्णववाद की उत्पत्ति हुई।
                            </p>
                        </div>
                        <p>
                          श्री चैतन्य महाप्रभु ने पंद्रहवीं शताब्दी में भारत में श्रीकृष्ण भक्ति की संस्कृति को पुनर्जीवित किया।
                        </p>
                        <p>
                          इस आंदोलन को मूल रूप से <span className="italic font-medium">ब्रह्म-माध्व-गौड़ीय वैष्णव संप्रदाय</span> कहा जाता है।
                        </p>
                        <p>
                          इस आंदोलन का अंतिम लक्ष्य सर्वोच्च भगवान 'कृष्ण' के साथ प्रेमपूर्ण संबंध विकसित करना है।
                        </p>
                    </div>
                )}

                {/* Mahamantra Card */}
                <div className="my-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                    <div className="relative bg-gradient-to-br from-saffron-50 to-orange-50 dark:from-slate-800 dark:to-slate-800 p-6 rounded-2xl border border-saffron-200 dark:border-slate-700 text-center shadow-sm overflow-hidden group">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-saffron-500/10 rounded-full blur-2xl group-hover:bg-saffron-500/20 transition-colors"></div>
                      <div className="relative z-10">
                          <p className="mb-3 text-xs font-bold text-saffron-600 dark:text-saffron-400 uppercase tracking-widest">
                            {lang === 'en' ? 'Mahamantra' : 'महामंत्र'}
                          </p>
                          <p className="text-lg sm:text-2xl font-hindi font-bold text-slate-800 dark:text-white leading-relaxed">
                            हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे<br/>
                            हरे राम हरे राम राम राम हरे हरे
                          </p>
                      </div>
                    </div>
                    <div className="mt-4 text-center px-4">
                        <p className="text-sm italic text-slate-500 dark:text-slate-400">
                             {lang === 'en' 
                             ? "Sri Chaitanya Mahaprabhu promoted Mahamantra as the most effective means of self-purification in this kaliyug."
                             : "श्री चैतन्य महाप्रभु ने इस कलियुग में आत्म-शुद्धि के सबसे प्रभावी साधन के रूप में महामंत्र का प्रचार किया।"
                             }
                        </p>
                        <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">
                            {lang === 'en' 
                             ? "Srimad Bhagavad Gita and Sri Bhagwat Purana, are the prime scriptures followed by Gaudiya Vaishnavas."
                             : "श्रीमद्भगवद्गीता और श्री भागवत पुराण, गौड़ीय वैष्णवों द्वारा पालन किए जाने वाले प्रमुख ग्रंथ हैं।"
                             }
                        </p>
                    </div>
                </div>

                {/* Timeline / History Section */}
                <div className="relative pt-4 pb-2 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
                    <div className="absolute left-3.5 top-6 bottom-6 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                    
                    <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 pl-10 flex items-center gap-2">
                        <History size={16} /> {lang === 'en' ? 'Our Lineage' : 'गुरु परंपरा'}
                    </h3>

                    <div className="space-y-8">
                         {lang === 'en' ? (
                            <>
                                <TimelineItem 
                                    year="1920"
                                    title="Gaudiya Math Established"
                                    content="The First ever Preaching centre was formed on 6 September 1920 by Sri Srimad Bhaktisiddhanta Saraswati Goswami “Prabhupāda” which was named as “Gaudiya math”."
                                />
                                <TimelineItem 
                                    title="Srila Prabhupada"
                                    content={<>
                                        <p className="mb-2">“Prabhupāda” appeared in Sri Kshetra Dham (Jagannatha Puri) on 6 February 1874 as the son of Srila Sachchidananda Bhaktivinoda Thakkura. He preached convincingly against casteism and philosophical deviations from Gaudiya Vaisnavism.</p>
                                        <p className="mb-2">He preached Sri Caitanya Mahaprabhu’s message of Divine Love widely throughout India with great vigour. Following Srila Thakura Bhaktivinoda's principles, he opposed varnashrama to harmonize society and provide spiritual fulfillment for all.</p>
                                        <p>He established Gaudiya Math in Mayapur, West Bengal which later recognised as the parent body of all Gaudiya Math branches. It soon developed into a dynamic missionary with sixty-four branches across India. The mission was further propogated by his disciples in several parts of the country.</p>
                                    </>}
                                />
                                <TimelineItem 
                                    year="1904"
                                    title="Bhakti Dayit Madhav Goswami"
                                    content={<>
                                        <p className="mb-2">Before entering into ‘nitya lila’, Srila Bhaktisiddhānta Saraswatī Goswami “Prabhupāda” appointed his dearmost disciple “Sri Srimad Bhakti Dayit Madhav Goswami ji Maharaj” as his successor.</p>
                                        <p className="mb-2">Srila Bhakti Dayita Madhav Goswami Maharaj appeared in this world on November 18, 1904 A.D. (on Holy Utthan Ekadashi tithi) at Kanchanpara.</p>
                                        <p className="mb-2">He accepted the renounced order of His Gurudev Srila ‘Prabhupada’ and started preaching. He established many large preaching centers in various parts of India. One of his most significant contributions was to re-establish the appearance site of His Pujya Gurudeva “ Srila Prabhupāda” in Śhrī Jagannātha Puri. Also He was known to be the founder of All India Shri Chaitanya Gaudiya Math in Kolkata in 1953.</p>
                                        <p>Before his disappearance in 1979, Shri Shrimad Bhakti Dayit Madhav Goswami ji Maharaj asked his disciples to further propogate the mission all together.</p>
                                    </>}
                                />
                                <TimelineItem 
                                    title="Virahi Ji Maharaj"
                                    isLast
                                    content={<>
                                        <p className="mb-2">Following the orders of his spiritual master, his disciple, <strong className="text-saffron-600 dark:text-saffron-400">Sri Sri 108 Sri Vasudev Sharan “Virahi” Ji Maharaj</strong> expanded the mission and started preaching in the north-western and central regions of the country.</p>
                                        <p>Later, he established an organization named <strong>“Shree Chaitanya Prem Bhakti Sangh”</strong>, which comprises spiritual practices entirely based on the teachings of Lord Chaitanya.</p>
                                    </>}
                                />
                            </>
                         ) : (
                            <>
                                <TimelineItem 
                                    year="1920"
                                    title="गौड़ीय मठ की स्थापना"
                                    content="पहला प्रचार केंद्र 6 सितंबर 1920 को श्री श्रीमद् भक्तिसिद्धांत सरस्वती गोस्वामी “प्रभुपाद” द्वारा बनाया गया था, जिसे “गौड़ीय मठ” नाम दिया गया था।"
                                />
                                <TimelineItem 
                                    title="श्रील प्रभुपाद"
                                    content={<>
                                        <p className="mb-2">“प्रभुपाद” 6 फरवरी 1874 को श्रील सच्चिदानंद भक्तिविनोद ठाकुर के पुत्र के रूप में श्री क्षेत्र धाम (जगन्नाथ पुरी) में प्रकट हुए। उन्होंने जातिवाद और गौड़ीय वैष्णववाद से दार्शनिक विचलन के खिलाफ दृढ़ता से प्रचार किया।</p>
                                        <p className="mb-2">उन्होंने पूरे भारत में श्री चैतन्य महाप्रभु के भगवद प्रेम के संदेश का बड़े जोश के साथ प्रचार किया। श्रील ठाकुर भक्तिविनोद के सिद्धांतों का पालन करते हुए, उन्होंने समाज में सामंजस्य स्थापित करने और सभी के लिए आध्यात्मिक पूर्ति प्रदान करने के लिए वर्णाश्रम का विरोध किया।</p>
                                        <p>उन्होंने मायापुर, पश्चिम बंगाल में गौड़ीय मठ की स्थापना की, जिसे बाद में सभी गौड़ीय मठ शाखाओं के मूल निकाय के रूप में मान्यता दी गई। यह जल्द ही पूरे भारत में चौंसठ शाखाओं के साथ एक गतिशील मिशनरी में विकसित हो गया। इस मिशन को उनके शिष्यों द्वारा देश के कई हिस्सों में आगे बढ़ाया गया।</p>
                                    </>}
                                />
                                <TimelineItem 
                                    year="1904"
                                    title="भक्ति दयित माधव गोस्वामी"
                                    content={<>
                                        <p className="mb-2">‘नित्य लीला’ में प्रवेश करने से पहले, श्रील भक्तिसिद्धांत सरस्वती गोस्वामी “प्रभुपाद” ने अपने सबसे प्रिय शिष्य “श्री श्रीमद् भक्ति दयित माधव गोस्वामी जी महाराज” को अपना उत्तराधिकारी नियुक्त किया।</p>
                                        <p className="mb-2">श्रील भक्ति दयित माधव गोस्वामी महाराज इस दुनिया में 18 नवंबर, 1904 ईस्वी (पवित्र उत्थान एकादशी तिथि पर) को कंचनपाड़ा में प्रकट हुए।</p>
                                        <p className="mb-2">उन्होंने अपने गुरुदेव श्रील ‘प्रभुपाद’ के संन्यास आदेश को स्वीकार किया और प्रचार करना शुरू कर दिया। उन्होंने भारत के विभिन्न हिस्सों में कई बड़े प्रचार केंद्र स्थापित किए। उनके सबसे महत्वपूर्ण योगदानों में से एक श्री जगन्नाथ पुरी में उनके पूज्य गुरुदेव “श्रील प्रभुपाद” के प्रककट्य स्थल को फिर से स्थापित करना था। उन्हें 1953 में कोलकाता में अखिल भारतीय श्री चैतन्य गौड़ीय मठ के संस्थापक के रूप में भी जाना जाता था।</p>
                                        <p>1979 में अपने तिरोभाव से पहले, श्री श्रीमद् भक्ति दयित माधव गोस्वामी जी महाराज ने अपने शिष्यों को मिशन को एक साथ आगे बढ़ाने के लिए कहा।</p>
                                    </>}
                                />
                                <TimelineItem 
                                    title="विरही जी महाराज"
                                    isLast
                                    content={<>
                                        <p className="mb-2">अपने आध्यात्मिक गुरु के आदेशों का पालन करते हुए, उनके शिष्य, <strong className="text-saffron-600 dark:text-saffron-400">श्री श्री 108 श्री वासुदेव शरण “विरही” जी महाराज</strong> ने मिशन का विस्तार किया और देश के उत्तर-पश्चिम और मध्य क्षेत्रों में प्रचार करना शुरू कर दिया।</p>
                                        <p>बाद में उन्होंने <strong>“श्री चैतन्य प्रेम भक्ति संघ”</strong> नामक एक संस्था की स्थापना की, जो पूरी तरह से भगवान चैतन्य की शिक्षाओं पर आधारित आध्यात्मिक प्रथाओं को शामिल करती है।</p>
                                    </>}
                                />
                            </>
                         )}
                    </div>
                </div>

            </div>
            
            {/* Bottom Actions */}
            <div className="pt-8">
                <button 
                    onClick={onOpenDonate}
                    className="w-full bg-saffron-500 hover:bg-saffron-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-saffron-500/30 flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02]"
                >
                    <Heart size={22} className="fill-current" />
                    <span>{lang === 'en' ? 'Support Seva / Donate' : 'सेवा सहयोग / दान करें'}</span>
                </button>

                <div className="mt-8 text-center opacity-60">
                    <div className="w-16 h-1 bg-gradient-to-r from-saffron-300 to-saffron-500 dark:from-slate-700 dark:to-slate-600 rounded-full mx-auto mb-3"></div>
                    <span className="text-saffron-600 dark:text-saffron-400 font-logo text-2xl tracking-wide">RadheShyam</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper Component for Timeline
const TimelineItem: React.FC<{ year?: string, title: string, content: React.ReactNode, isLast?: boolean }> = ({ year, title, content, isLast }) => (
    <div className="relative pl-10">
        {/* Dot */}
        <div className="absolute left-0 top-1 w-7 h-7 bg-white dark:bg-slate-900 border-4 border-saffron-200 dark:border-slate-600 rounded-full flex items-center justify-center z-10">
            <div className="w-2.5 h-2.5 bg-saffron-500 rounded-full"></div>
        </div>
        
        {/* Content */}
        <div className={`pb-8 ${isLast ? '' : 'border-b border-slate-100 dark:border-slate-800'}`}>
            {year && (
                <span className="text-xs font-bold text-saffron-500 dark:text-saffron-400 bg-saffron-50 dark:bg-slate-800 px-2 py-0.5 rounded mb-1 inline-block">
                    {year}
                </span>
            )}
            <h4 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h4>
            <div className="text-slate-600 dark:text-slate-300">
                {content}
            </div>
        </div>
    </div>
);
