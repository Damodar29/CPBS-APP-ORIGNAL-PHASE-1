
import React, { useState } from 'react';
import { X, Languages, Heart } from 'lucide-react';

interface AboutScreenProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDonate: () => void;
}

export const AboutScreen: React.FC<AboutScreenProps> = ({ isOpen, onClose, onOpenDonate }) => {
  const [lang, setLang] = useState<'hi' | 'en'>('en');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-slate-900 flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header - added pt for safe area */}
      <div className="flex-none bg-saffron-500 text-white p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full" type="button">
                <X className="w-6 h-6" />
            </button>
            <h2 className="text-xl font-bold">{lang === 'hi' ? 'परिचय' : 'About CPBS'}</h2>
        </div>

        <button 
            onClick={() => setLang(prev => prev === 'hi' ? 'en' : 'hi')}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full transition-colors text-sm font-medium backdrop-blur-sm"
        >
            <Languages size={16} />
            <span>{lang === 'hi' ? 'English' : 'हिंदी'}</span>
        </button>
      </div>

      {/* Content - added pb for safe area */}
      <div className="flex-1 overflow-y-auto p-6 pb-[calc(2rem+env(safe-area-inset-bottom))] text-slate-700 dark:text-slate-300 leading-relaxed font-sans text-base space-y-4">
        
        {/* Top Donate Button */}
        <button 
            onClick={onOpenDonate}
            className="w-full mb-4 bg-saffron-50 dark:bg-slate-800 text-saffron-700 dark:text-saffron-400 border border-saffron-200 dark:border-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-saffron-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
            <Heart size={20} className="fill-current text-saffron-500" />
            <span>{lang === 'en' ? 'Support Seva / Donate' : 'सेवा सहयोग / दान करें'}</span>
        </button>

        {lang === 'en' ? (
            <>
                <p>
                  <strong className="text-saffron-600 dark:text-saffron-400">Shree Chaitanya Prem Bhakti Sangh</strong> is basically a Gaudiya Vaishnav Community which was formed with the purpose of preaching the Holy names of the Lord in north-western and Central Parts of the country.
                </p>

                <p>
                  Gaudiya Vaishnavism is based on the life and teachings of Lord Chaitanya, who is also Known by the name, <span className="font-semibold">Gourang Mahaprabhu</span>.
                </p>

                <p>
                  Vaishnavism means 'worship of Lord Vishnu' & His Incarnations, while Gaud refers to the region of West Bengal from Where Vaishnavism originated.
                </p>

                <p>
                  Shri Chaitanya Mahaprabhu rejuvenated the culture of Shri Krishna bhakti in India in the fifteenth century.
                </p>

                <p>
                  This movement is originally referred to as <span className="italic">Brahma-Madhva-Gaudiya vaishnav sampradaya</span>.
                </p>

                <p>
                  The ultimate goal of this movement is to develop a loving relationship with the Supreme Lord ‘Krishna’.
                </p>

                <div className="bg-saffron-50 dark:bg-slate-800 p-6 rounded-xl border border-saffron-100 dark:border-slate-700 my-6 text-center shadow-sm">
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Mahamantra</p>
                  <p className="text-lg sm:text-xl font-sans font-bold text-saffron-700 dark:text-saffron-400 leading-loose">
                    Hare Krishna Hare Krishna Krishna Krishna Hare Hare<br/>
                    Hare Rama Hare Rama Rama Rama Hare Hare
                  </p>
                </div>

                <p>
                  Sri Chaitanya Mahaprabhu promoted Mahamantra as the most effective means of self-purification in this kaliyug.
                </p>

                <p>
                  Srimad Bhagavad Gita and Sri Bhagwat Purana, are the prime scriptures followed by Gaudiya Vaishnavas.
                </p>

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />

                <p>
                  The First ever Preaching centre was formed on 6 September 1920 by <strong className="text-slate-800 dark:text-slate-200">Sri Srimad Bhaktisiddhanta Saraswati Goswami “Prabhupāda”</strong> which was named as “Gaudiya math”.
                </p>

                <p>
                  “Prabhupāda” appeared in Sri Kshetra Dham (Jagannatha Puri) on 6 February 1874 as the son of Srila Sachchidananda Bhaktivinoda Thakkura. He preached convincingly against casteism and philosophical deviations from Gaudiya Vaisnavism.
                </p>

                <p>
                  He preached Sri Caitanya Mahaprabhu’s message of Divine Love widely throughout India with great vigour. Following Srila Thakura Bhaktivinoda's principles, he opposed varnashrama to harmonize society and provide spiritual fulfillment for all.
                </p>

                <p>
                  He established Gaudiya Math in Mayapur, West Bengal which later recognised as the parent body of all Gaudiya Math branches. It soon developed into a dynamic missionary with sixty-four branches across India. The mission was further propogated by his disciples in several parts of the country.
                </p>

                <p>
                  Before entering into ‘nitya lila’, Srila Bhaktisiddhānta Saraswatī Goswami “Prabhupāda” appointed his dearmost disciple <strong className="text-slate-800 dark:text-slate-200">“Sri Srimad Bhakti Dayit Madhav Goswami ji Maharaj”</strong> as his successor.
                </p>

                <p>
                  Srila Bhakti Dayita Madhav Goswami Maharaj appeared in this world on November 18, 1904 A.D. (on Holy Utthan Ekadashi tithi) at Kanchanpara.
                </p>

                <p>
                  He accepted the renounced order of His Gurudev Srila ‘Prabhupada’ and started preaching. He established many large preaching centers in various parts of India. One of his most significant contributions was to re-establish the appearance site of His Pujya Gurudeva “ Srila Prabhupāda” in Śhrī Jagannātha Puri. Also He was known to be the founder of All India Shri Chaitanya Gaudiya Math in Kolkata in 1953.
                </p>

                <p>
                  Before his disappearance in 1979, Shri Shrimad Bhakti Dayit Madhav Goswami ji Maharaj asked his disciples to further propogate the mission all together.
                </p>

                <p>
                  Following the orders of his spiritual master, his disciple, <strong className="text-saffron-600 dark:text-saffron-400">Sri Sri 108 Sri Vasudev Sharan “Virahi” Ji Maharaj</strong> expanded the mission and started preaching in the north-western and central regions of the country.
                </p>

                <p>
                  Later, he established an organization named <strong>“Shree Chaitanya Prem Bhakti Sangh”</strong>, which comprises spiritual practices entirely based on the teachings of Lord Chaitanya.
                </p>
            </>
        ) : (
            <>
                <p>
                  <strong className="text-saffron-600 dark:text-saffron-400">श्री चैतन्य प्रेम भक्ति संघ</strong> मूल रूप से एक गौड़ीय वैष्णव समुदाय है जिसका गठन देश के उत्तर-पश्चिमी और मध्य भागों में भगवान के पवित्र नामों का प्रचार करने के उद्देश्य से किया गया था।
                </p>

                <p>
                  गौड़ीय वैष्णववाद भगवान चैतन्य के जीवन और शिक्षाओं पर आधारित है, जिन्हें <span className="font-semibold">गौरांग महाप्रभु</span> के नाम से भी जाना जाता है।
                </p>

                <p>
                  वैष्णववाद का अर्थ है 'भगवान विष्णु और उनके अवतारों की पूजा', जबकि गौड़ पश्चिम बंगाल के उस क्षेत्र को संदर्भित करता है जहाँ से वैष्णववाद की उत्पत्ति हुई।
                </p>

                <p>
                  श्री चैतन्य महाप्रभु ने पंद्रहवीं शताब्दी में भारत में श्रीकृष्ण भक्ति की संस्कृति को पुनर्जीवित किया।
                </p>

                <p>
                  इस आंदोलन को मूल रूप से <span className="italic">ब्रह्म-माध्व-गौड़ीय वैष्णव संप्रदाय</span> कहा जाता है।
                </p>

                <p>
                  इस आंदोलन का अंतिम लक्ष्य सर्वोच्च भगवान 'कृष्ण' के साथ प्रेमपूर्ण संबंध विकसित करना है।
                </p>

                <div className="bg-saffron-50 dark:bg-slate-800 p-6 rounded-xl border border-saffron-100 dark:border-slate-700 my-6 text-center shadow-sm">
                  <p className="mb-2 text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">महामंत्र</p>
                  <p className="text-lg sm:text-xl font-hindi font-bold text-saffron-700 dark:text-saffron-400 leading-loose">
                    हरे कृष्ण हरे कृष्ण कृष्ण कृष्ण हरे हरे<br/>
                    हरे राम हरे राम राम राम हरे हरे
                  </p>
                </div>

                <p>
                  श्री चैतन्य महाप्रभु ने इस कलियुग में आत्म-शुद्धि के सबसे प्रभावी साधन के रूप में महामंत्र का प्रचार किया।
                </p>

                <p>
                  श्रीमद्भगवद्गीता और श्री भागवत पुराण, गौड़ीय वैष्णवों द्वारा पालन किए जाने वाले प्रमुख ग्रंथ हैं।
                </p>

                <div className="h-px bg-slate-200 dark:bg-slate-700 my-4" />

                <p>
                  पहला प्रचार केंद्र 6 सितंबर 1920 को <strong className="text-slate-800 dark:text-slate-200">श्री श्रीमद् भक्तिसिद्धांत सरस्वती गोस्वामी “प्रभुपाद”</strong> द्वारा बनाया गया था, जिसे “गौड़ीय मठ” नाम दिया गया था।
                </p>

                <p>
                  “प्रभुपाद” 6 फरवरी 1874 को श्रील सच्चिदानंद भक्तिविनोद ठाकुर के पुत्र के रूप में श्री क्षेत्र धाम (जगन्नाथ पुरी) में प्रकट हुए। उन्होंने जातिवाद और गौड़ीय वैष्णववाद से दार्शनिक विचलन के खिलाफ दृढ़ता से प्रचार किया।
                </p>

                <p>
                  उन्होंने पूरे भारत में श्री चैतन्य महाप्रभु के भगवद प्रेम के संदेश का बड़े जोश के साथ प्रचार किया। श्रील ठाकुर भक्तिविनोद के सिद्धांतों का पालन करते हुए, उन्होंने समाज में सामंजस्य स्थापित करने और सभी के लिए आध्यात्मिक पूर्ति प्रदान करने के लिए वर्णाश्रम का विरोध किया।
                </p>

                <p>
                  उन्होंने मायापुर, पश्चिम बंगाल में गौड़ीय मठ की स्थापना की, जिसे बाद में सभी गौड़ीय मठ शाखाओं के मूल निकाय के रूप में मान्यता दी गई। यह जल्द ही पूरे भारत में चौंसठ शाखाओं के साथ एक गतिशील मिशनरी में विकसित हो गया। इस मिशन को उनके शिष्यों द्वारा देश के कई हिस्सों में आगे बढ़ाया गया।
                </p>

                <p>
                  ‘नित्य लीला’ में प्रवेश करने से पहले, श्रील भक्तिसिद्धांत सरस्वती गोस्वामी “प्रभुपाद” ने अपने सबसे प्रिय शिष्य <strong className="text-slate-800 dark:text-slate-200">“श्री श्रीमद् भक्ति दयित माधव गोस्वामी जी महाराज”</strong> को अपना उत्तराधिकारी नियुक्त किया।
                </p>

                <p>
                  श्रील भक्ति दयित माधव गोस्वामी महाराज इस दुनिया में 18 नवंबर, 1904 ईस्वी (पवित्र उत्थान एकादशी तिथि पर) को कंचनपाड़ा में प्रकट हुए।
                </p>

                <p>
                  उन्होंने अपने गुरुदेव श्रील ‘प्रभुपाद’ के संन्यास आदेश को स्वीकार किया और प्रचार करना शुरू कर दिया। उन्होंने भारत के विभिन्न हिस्सों में कई बड़े प्रचार केंद्र स्थापित किए। उनके सबसे महत्वपूर्ण योगदानों में से एक श्री जगन्नाथ पुरी में उनके पूज्य गुरुदेव “श्रील प्रभुपाद” के प्रककट्य स्थल को फिर से स्थापित करना था। उन्हें 1953 में कोलकाता में अखिल भारतीय श्री चैतन्य गौड़ीय मठ के संस्थापक के रूप में भी जाना जाता था।
                </p>

                <p>
                  1979 में अपने तिरोभाव से पहले, श्री श्रीमद् भक्ति दयित माधव गोस्वामी जी महाराज ने अपने शिष्यों को मिशन को एक साथ आगे बढ़ाने के लिए कहा।
                </p>

                <p>
                  अपने आध्यात्मिक गुरु के आदेशों का पालन करते हुए, उनके शिष्य, <strong className="text-saffron-600 dark:text-saffron-400">श्री श्री 108 श्री वासुदेव शरण “विरही” जी महाराज</strong> ने मिशन का विस्तार किया और देश के उत्तर-पश्चिम और मध्य क्षेत्रों में प्रचार करना शुरू कर दिया।
                </p>

                <p>
                  बाद में उन्होंने <strong>“श्री चैतन्य प्रेम भक्ति संघ”</strong> नामक एक संस्था की स्थापना की, जो पूरी तरह से भगवान चैतन्य की शिक्षाओं पर आधारित आध्यात्मिक प्रथाओं को शामिल करती है।
                </p>
            </>
        )}
        
        {/* Bottom Donate Button */}
        <button 
            onClick={onOpenDonate}
            className="w-full mt-4 bg-saffron-50 dark:bg-slate-800 text-saffron-700 dark:text-saffron-400 border border-saffron-200 dark:border-slate-700 py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-saffron-100 dark:hover:bg-slate-700 transition-colors shadow-sm"
        >
            <Heart size={20} className="fill-current text-saffron-500" />
            <span>{lang === 'en' ? 'Support Seva / Donate' : 'सेवा सहयोग / दान करें'}</span>
        </button>

        <div className="pt-8 text-center opacity-60">
             <div className="w-16 h-1 bg-saffron-300 dark:bg-slate-700 rounded-full mx-auto mb-2"></div>
             <span className="text-saffron-600 dark:text-saffron-400 font-logo text-xl">RadheShyam</span>
        </div>
      </div>
    </div>
  );
};
