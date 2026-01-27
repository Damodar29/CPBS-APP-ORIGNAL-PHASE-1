
import { Bhajan, ScriptType, BhajanAudio } from '../types';

// ----------------------------------------------------------------------
// 1. Search Normalization Maps (Devanagari -> Plain English)
// ----------------------------------------------------------------------

// Map for Devanagari to Plain Latin (for fuzzy search index)
const devanagariSearchMap: Record<string, string> = {
  // Vowels
  'अ': 'a', 'आ': 'a', 'इ': 'i', 'ई': 'i', 'उ': 'u', 'ऊ': 'u', 'ऋ': 'ri',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'n', 'अः': 'h',
  // Consonants
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'n',
  'च': 'ch', 'छ': 'chh', 'ज': 'j', 'झ': 'jh', 'ञ': 'n',
  'ट': 't', 'ठ': 'th', 'ड': 'd', 'ढ': 'dh', 'ण': 'n',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'sh', 'ष': 'sh', 'स': 's', 'ह': 'h',
  'क्ष': 'ksh', 'त्र': 'tr', 'ज्ञ': 'gy', 'श्र': 'shr',
  // Matras
  'ा': 'a', 'ि': 'i', 'ी': 'i', 'ु': 'u', 'ू': 'u', 'ृ': 'ri',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'n', 'ः': 'h', 
  // Modifiers
  '्': '', '़': '', 'ँ': 'n'
};

// Map for IAST to Plain Latin (Normalization for search input)
const iastNormalizationMap: Record<string, string> = {
  'ā': 'a', 'Ā': 'a', 'ī': 'i', 'Ī': 'i', 'ū': 'u', 'Ū': 'u',
  'ṛ': 'ri', 'Ṛ': 'ri', 'ṝ': 'ri', 'Ṝ': 'ri', 'ḷ': 'l', 'Ḷ': 'l', 'ḹ': 'l', 'Ḹ': 'l',
  'e': 'e', 'E': 'e', 'ai': 'ai', 'Ai': 'ai', 'o': 'o', 'O': 'o', 'au': 'au', 'Au': 'au',
  'ś': 'sh', 'Ś': 'sh', 'ṣ': 'sh', 'Ṣ': 'sh', 'ñ': 'n', 'Ñ': 'n',
  'ṅ': 'n', 'Ṅ': 'n', 'ṇ': 'n', 'Ṇ': 'n', 'ṭ': 't', 'Ṭ': 't',
  'ṭh': 'th', 'Ṭh': 'th', 'ḍ': 'd', 'Ḍ': 'd', 'ḍh': 'dh', 'Ḍh': 'dh',
  'ṃ': 'm', 'Ṃ': 'm', 'ḥ': 'h', 'Ḥ': 'h',
  'c': 'ch', 'C': 'ch' 
};

// ----------------------------------------------------------------------
// 2. Display Transliteration Maps (Devanagari -> Full IAST)
// ----------------------------------------------------------------------

const devanagariDisplayMap: Record<string, string> = {
  // Vowels
  'अ': 'a', 'आ': 'ā', 'इ': 'i', 'ई': 'ī', 'उ': 'u', 'ऊ': 'ū', 'ऋ': 'ṛ',
  'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au', 'अं': 'ṃ', 'अः': 'ḥ',
  // Consonants
  'क': 'k', 'ख': 'kh', 'ग': 'g', 'घ': 'gh', 'ङ': 'ṅ',
  'च': 'c', 'छ': 'ch', 'ज': 'j', 'झ': 'jh', 'ञ': 'ñ',
  'ट': 't', 'ठ': 'ṭh', 'ड': 'ḍ', 'ढ': 'ḍh', 'ण': 'ṇ',
  'त': 't', 'थ': 'th', 'द': 'd', 'ध': 'dh', 'न': 'n',
  'प': 'p', 'फ': 'ph', 'ब': 'b', 'भ': 'bh', 'म': 'm',
  'य': 'y', 'र': 'r', 'ल': 'l', 'व': 'v', 'श': 'ś', 'ष': 'ṣ', 'स': 's', 'ह': 'h',
  'क्ष': 'kṣ', 'त्र': 'tr', 'ज्ञ': 'jñ', 'श्र': 'śr',
  // Matras
  'ा': 'ā', 'ि': 'i', 'ी': 'ī', 'ु': 'u', 'ू': 'ū', 'ृ': 'ṛ',
  'े': 'e', 'ै': 'ai', 'ो': 'o', 'ौ': 'au', 'ं': 'ṃ', 'ः': 'ḥ', 
  // Modifiers
  '्': '', '़': '', 'ँ': 'm̐', 'ऽ': "'"
};

// ----------------------------------------------------------------------
// 3. Helper Functions
// ----------------------------------------------------------------------

const isConsonant = (char: string) => {
  const code = char.charCodeAt(0);
  return (code >= 0x0915 && code <= 0x0939) || (code >= 0x0958 && code <= 0x095F);
};

const isVowelSignOrVirama = (char: string) => {
  const code = char.charCodeAt(0);
  return (code >= 0x093E && code <= 0x094D) || code === 0x0962 || code === 0x0963;
};

export const smartNormalize = (text: string) => {
  return text.toLowerCase()
    // Vowels - Hinglish Standardization
    .replace(/aa/g, 'a')
    .replace(/ae/g, 'e')  // Aese -> Ese
    .replace(/ai/g, 'e')  // Aisi -> Esi
    .replace(/ee/g, 'i')
    .replace(/oo/g, 'u')
    .replace(/au/g, 'o')  // Aur -> Or
    .replace(/ou/g, 'o')  // Koun -> Kon
    // Consonants - Common Substitutions
    .replace(/[vw]/g, 'b') 
    .replace(/sh/g, 's')
    .replace(/z/g, 'j')
    .replace(/ph/g, 'f')
    .replace(/ri/g, 'r')
    .replace(/ru/g, 'r')
    .replace(/([a-z])\1/g, '$1') // Remove double letters (tt -> t)
    .replace(/a$/, '') // Remove trailing 'a' (Ram -> Rama handling)
    .replace(/\s+/g, ' ')
    .trim();
};

const getEditDistance = (a: string, b: string): number => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Optimization: If length difference is too big, don't bother
  if (Math.abs(a.length - b.length) > 2) return 100;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

export const isFuzzyMatch = (normToken: string, normQuery: string): boolean => {
  if (normToken.includes(normQuery)) return true;
  if (normQuery.length >= 3) {
    const allowedErrors = normQuery.length > 5 ? 2 : 1;
    if (Math.abs(normToken.length - normQuery.length) <= allowedErrors) {
       const dist = getEditDistance(normToken, normQuery);
       if (dist <= allowedErrors) return true;
    }
    // Check start matching for prefix search
    if (normToken.length > normQuery.length) {
        const p1 = normToken.substring(0, normQuery.length);
        if (getEditDistance(p1, normQuery) <= allowedErrors) return true;
    }
  }
  return false;
};

// ----------------------------------------------------------------------
// 4. Exported Functions
// ----------------------------------------------------------------------

export const transliterateForSearch = (text: string): string => {
  let result = '';
  const chars = text.split('');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const devaMapped = devanagariSearchMap[char];
    if (devaMapped !== undefined) {
      result += devaMapped;
      if (isConsonant(char)) {
        if (i + 1 < chars.length) {
           const nextChar = chars[i+1];
           if (!isVowelSignOrVirama(nextChar)) {
             result += 'a';
           }
        } else {
           result += 'a';
        }
      }
    } else if (iastNormalizationMap[char] !== undefined) {
      result += iastNormalizationMap[char];
    } else {
      result += char;
    }
  }
  return result;
};

export const convertToIAST = (text: string): string => {
  let result = '';
  const chars = text.split('');
  
  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const mapped = devanagariDisplayMap[char];
    if (mapped !== undefined) {
      result += mapped;
      if (isConsonant(char)) {
        if (i + 1 < chars.length) {
           const nextChar = chars[i+1];
           if (!isVowelSignOrVirama(nextChar)) {
             result += 'a';
           }
        } else {
           result += 'a';
        }
      }
    } else {
      result += char;
    }
  }
  return result;
};

// Helper: Get Base Devanagari Character for Indexing
export const getDevanagariBaseChar = (text: string): string => {
  if (!text) return '#';
  for (let i = 0; i < text.length; i++) {
    const char = text.charAt(i);
    const code = char.charCodeAt(0);
    if (code >= 0x0900 && code <= 0x097F) {
       if (code >= 0x0966 && code <= 0x096F) continue; 
       if (isVowelSignOrVirama(char)) continue; 
       return char;
    }
    if (/[a-zA-Z]/.test(char)) {
        return char.toUpperCase();
    }
  }
  return '#';
};

// Heuristic to extract author
const extractAuthor = (content: string): { deva: string, iast: string } | undefined => {
  const lines = content.trim().split('\n');
  const lastLines = lines.slice(-2).join(' '); 
  
  const knownAuthors: Record<string, { deva: string, iast: string }> = {
    'सूरदास': { deva: 'सूरदास जी', iast: 'Sūradās Jī' },
    'तुलसी': { deva: 'तुलसीदास जी', iast: 'Tulasīdās Jī' },
    'मीरा': { deva: 'मीराबाई जी', iast: 'Mīrābāī Jī' },
    'कबीर': { deva: 'कबीरदास जी', iast: 'Kabīrdās Jī' },
    'नरोत्तम': { deva: 'नरोत्तम दास ठाकुर', iast: 'Narottama Dāsa Ṭhākura' },
    'रसखान': { deva: 'रसखान जी', iast: 'Rasakhān Jī' },
    'चन्द्रसखी': { deva: 'चन्द्रसखी जी', iast: 'Candrasakhī Jī' },
    'चंद्रसखी': { deva: 'चन्द्रसखी जी', iast: 'Candrasakhī Jī' },
    'चंद्र सखी': { deva: 'चन्द्रसखी जी', iast: 'Candrasakhī Jī' },
    'व्यास': { deva: 'व्यासदास जी', iast: 'Vyāsadās Jī' },
    'विरही': { deva: 'श्री विरही महाराज जी', iast: 'Śrī Virahī Mahārāja Jī' },
    'बिरही': { deva: 'श्री विरही महाराज जी', iast: 'Śrī Virahī Mahārāja Jī' },
    'भक्तिविनोद': { deva: 'भक्तिविनोद ठाकुर', iast: 'Bhaktivinoda Ṭhākura' },
    'विद्यापति': { deva: 'विद्यापति जी', iast: 'Vidyāpati Jī' },
    'जयदेव': { deva: 'जयदेव गोस्वामी जी', iast: 'Jayadeva Gosvāmī Jī' },
    'मधुसूदन': { deva: 'मधुसूदन दास', iast: 'Madhusūdana Dās' },
    'नारायण': { deva: 'नारायणदास जी', iast: 'Nārāyaṇadās Jī' },
    'परमानन्द': { deva: 'परमानन्ददास जी', iast: 'Paramānandadās Jī' },
    'कुम्भन': { deva: 'कुम्भनदास जी', iast: 'Kumbhanadās Jī' },
    'कृष्णदास': { deva: 'कृष्णदास कविराज गोस्वामी', iast: 'Kṛṣṇadāsa Kavirāja Gosvāmī' },
    'रूप गोस्वामी': { deva: 'रूप गोस्वामी जी', iast: 'Rūpa Gosvāmī Jī' },
    'सनातन': { deva: 'सनातन गोस्वामीजी', iast: 'Sanātana Gosvāmījī' },
    'जीव': { deva: 'जीव गोस्वामी जी', iast: 'Jīva Gosvāmī Jī' },
    'विश्वनाथ': { deva: 'विश्वनाथ चक्रवर्ती ठाकुर', iast: 'Viśvanātha Cakravartī Ṭhākura' },
    'बलदेव': { deva: 'बलदेव विद्याभूषण', iast: 'Baladeva Vidyābhūṣaṇa' },
    'जगन्नाथ': { deva: 'जगन्नाथ दास बाबाजी महाराज', iast: 'Jagannātha Dāsa Bābājī Mahārāja' },
    'गौर किशोर': { deva: 'गौर किशोर दास बाबाजी महाराज', iast: 'Gaura Kiśora Dāsa Bābājī Mahārāja' },
    'भक्ति सिद्धान्त': { deva: 'भक्तिसिद्धान्त सरस्वती गोस्वामी महाराज', iast: 'Bhaktisiddhānta Sarasvatī Gosvāmī Mahārāja' },
    'लोचन': { deva: 'लोचनदास जी', iast: 'Locanadās Jī' },
    'वासुदेव': { deva: 'वासुदेव घोष जी', iast: 'Vāsudeva Ghoṣa Jī' },
    'मुरारी': { deva: 'मुरारीगुप्त जी', iast: 'Murārigupta Jī' },
    'गोविन्द': { deva: 'गोविन्ददास जी', iast: 'Govindadās Jī' },
    'घासीराम': { deva: 'घासीरामदास जी', iast: 'Ghāsīrāmadās Jī' },
    'सूरज': { deva: 'सूरजदास जी', iast: 'Sūrajadās Jī' },
    'अभयराम': { deva: 'अभयराम दास जी', iast: 'Abhayarāma Dās Jī' },
    'कमल नैन': { deva: 'कमलनैनदास जी', iast: 'Kamalanainadās Jī' },
    'बृज निधि': { deva: 'बृज निधि जी', iast: 'Bṛja Nidhi Jī' },
    'बनवारी': { deva: 'बनवारीदास जी', iast: 'Banavārīdās Jī' },
    'लोकनाथ': { deva: 'लोकनाथ दास गोस्वामीजी', iast: 'Lokanātha Dāsa Gosvāmījī' },
    'देवकीनंदन': { deva: 'देवकीनंदनदास जी', iast: 'Devakīnandanadās Jī' },
    'श्यामा': { deva: 'श्यामा जी', iast: 'Śyāmā Jī' }
  };

  const quoteMatch = lastLines.match(/['‘’]([^'‘’]+)['‘’]/);
  
  if (quoteMatch) {
    let rawName = quoteMatch[1]; 
    rawName = rawName.replace(/[\u200B-\u200D\uFEFF]/g, '');

    for (const [key, val] of Object.entries(knownAuthors)) {
        if (rawName.includes(key)) {
            return { deva: val.deva, iast: val.iast };
        }
    }
    return { deva: rawName, iast: convertToIAST(rawName) };
  }

  for (const [key, val] of Object.entries(knownAuthors)) {
    if (lastLines.includes(key)) {
      return { deva: val.deva, iast: val.iast };
    }
  }

  return undefined;
};

// ----------------------------------------------------------------------
// Advanced Search Logic: Scoring and Snippets
// ----------------------------------------------------------------------

export const calculateSearchScore = (bhajan: Bhajan, query: string, script: ScriptType): number => {
    if (!query || query.trim().length === 0) return 0;
    
    // 0. Exact Song Number Match (Highest Priority)
    if (bhajan.songNumber && query.trim() === bhajan.songNumber) {
        return 2000;
    }

    const rawQuery = query.toLowerCase().trim();
    const phoneticQuery = transliterateForSearch(rawQuery);
    const normalizedQuery = smartNormalize(phoneticQuery);
    const queryTerms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

    let score = 0;

    // 1. Title Analysis
    const title = script === 'iast' ? bhajan.titleIAST : bhajan.title;
    const titleRaw = title.toLowerCase();
    const titlePhonetic = transliterateForSearch(titleRaw);
    const titleNorm = smartNormalize(titlePhonetic);

    // Exact Title Match
    if (titleRaw === rawQuery || titleNorm === normalizedQuery) {
        return 1000;
    }
    // Starts With Title
    if (titleRaw.startsWith(rawQuery) || titleNorm.startsWith(normalizedQuery)) {
        score += 500;
    }
    // Contains Title
    if (titleRaw.includes(rawQuery) || titleNorm.includes(normalizedQuery)) {
        score += 200;
    }
    // Fuzzy Title Words
    let titleMatches = 0;
    const titleTokens = titleNorm.split(/\s+/);
    queryTerms.forEach(qt => {
        if (titleTokens.some(tt => isFuzzyMatch(tt, qt))) {
            titleMatches++;
        }
    });
    score += (titleMatches * 50);

    // 2. Content Analysis
    const content = script === 'iast' ? bhajan.contentIAST : bhajan.content;
    
    // Quick Check: Does the content or index contain the query?
    // Note: searchIndex now includes songNumber so partial number matches work too
    if (bhajan.searchIndex.includes(normalizedQuery) || content.toLowerCase().includes(rawQuery)) {
        score += 100; // Boost for existence in content
    }
    
    // Add token matches score (searchTokens are pre-computed in bhajan object)
    let tokenMatches = 0;
    queryTerms.forEach(qt => {
        if (bhajan.searchTokens.some(st => isFuzzyMatch(st, qt))) {
            tokenMatches++;
        }
    });
    score += (tokenMatches * 10);

    return score;
};

export const getMatchingSnippet = (bhajan: Bhajan, query: string, script: ScriptType): string | null => {
  if (!query || query.trim().length < 2) return null;
  
  const content = script === 'iast' ? bhajan.contentIAST : bhajan.content;
  const lines = content.split('\n');
  
  const rawQuery = query.toLowerCase();
  const phoneticQuery = transliterateForSearch(rawQuery);
  const normalizedQuery = smartNormalize(phoneticQuery);
  const queryTerms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

  // Helper to score a line match
  const scoreLine = (line: string): number => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return 0;
    
    // 1. Exact substring match (Highest Priority)
    if (trimmedLine.toLowerCase().includes(rawQuery)) return 100;
    
    // 2. Phonetic/Fuzzy substring match (Medium Priority)
    const lineStr = transliterateForSearch(trimmedLine);
    const normalizedLine = smartNormalize(lineStr);
    
    if (normalizedLine.includes(normalizedQuery)) return 80;

    // 3. Token-based match (Lower Priority)
    const lineTokens = normalizedLine.split(/[\s,।॥!?-]+/).filter(t => t.length > 0);
    let matchCount = 0;
    for (const qTerm of queryTerms) {
       if (lineTokens.some(lToken => isFuzzyMatch(lToken, qTerm))) {
          matchCount++;
       }
    }
    
    if (matchCount > 0) {
        return 50 + Math.min((matchCount / queryTerms.length) * 20, 20); 
    }
    return 0;
  };

  let bestLine: string | null = null;
  let bestScore = 0;

  for (const line of lines) {
    const score = scoreLine(line);
    if (score > bestScore) {
      bestScore = score;
      bestLine = line.trim();
    }
  }

  return bestScore > 0 ? bestLine : null;
};

// ----------------------------------------------------------------------
// 5. AUDIO MAP (Cloudinary Support)
// ----------------------------------------------------------------------

// You can add your audio links here. 
// Keys can be the Song Number (e.g. '246') OR the Exact Hindi Title.
// Mapping by number is recommended as it's more stable.
const BHAJAN_AUDIO_MAP: Record<string, BhajanAudio[]> = {
   // Example 1: Mapping by Song Number (Recommended)
   '28': [
      { 
         id: '28-v1', 
         singer: 'Bablu Prabhuji', 
         url: 'https://res.cloudinary.com/drlnfmqrh/video/upload/v1769477596/3.%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A4%B5%E0%A4%A3_%E0%A4%B8%E0%A4%95%E0%A4%B2_%E0%A4%B8%E0%A5%81%E0%A4%96%E0%A4%A6%E0%A4%BE%E0%A4%AF%E0%A4%95_%E0%A4%B9%E0%A5%87_pzo0uf.mp3' 
      },
      { 
         id: '28-v2', 
         singer: 'HH BhaktiShastriJi Maharaj', 
         url: 'https://res.cloudinary.com/drlnfmqrh/video/upload/v1769477104/%E0%A4%B6%E0%A5%8D%E0%A4%B0%E0%A4%B5%E0%A4%A3_%E0%A4%B8%E0%A4%95%E0%A4%B2_%E0%A4%B8%E0%A5%81%E0%A4%96%E0%A4%A6%E0%A4%BE%E0%A4%AF%E0%A4%95_%E0%A4%B9%E0%A5%87_e4pl66.mp3' 
      }
   ],

   // Example 2: Mapping by Title
   /*
   'श्री गुरु चरण वंदना': [
      { id: 'g1', singer: 'Default', url: 'https://...' }
   ]
   */
};

export const parseRawBhajanText = (rawText: string): Bhajan[] => {
  const parts = rawText.split('###');
  const bhajans: Bhajan[] = [];
  
  for (let i = 1; i < parts.length; i += 2) {
    const titlePart = parts[i];
    const contentPart = parts[i + 1];

    if (titlePart && contentPart !== undefined) {
        let cleanTitle = titlePart.replace(/[\u200B-\u200D\uFEFF]/g, '');
        
        // Extract song number if present (at start of title part)
        const numberMatch = cleanTitle.trim().match(/^(\d+)[\s\.\-\)]/);
        const songNumber = numberMatch ? numberMatch[1] : undefined;

        cleanTitle = cleanTitle.replace(/^[\s\d\u0966-\u096F\.\,\-\(\)\[\]\#\*]+/, '').trim();
        const cleanContent = contentPart.trim().replace(/बिरही/g, 'विरही');

        if (cleanTitle) {
            const titleIAST = convertToIAST(cleanTitle);
            const contentIAST = convertToIAST(cleanContent);
            const contentLines = cleanContent.split('\n');
            const firstLine = contentLines.find(line => line.trim().length > 0)?.trim() || cleanTitle;
            const firstLineIAST = convertToIAST(firstLine);
            const combinedText = `${cleanTitle} ${cleanContent}`;
            const transliteratedText = transliterateForSearch(combinedText);
            const normalizedIndex = smartNormalize(transliteratedText);
            
            // Add songNumber to search index to allow partial number matching
            const searchIndex = `${songNumber || ''} ${combinedText.toLowerCase()} ${normalizedIndex}`;
            
            const rawTokens = transliteratedText.toLowerCase().split(/[\s,।॥!?-]+/);
            const searchTokens = rawTokens.filter(t => t.length > 2).map(t => smartNormalize(t));
            const uniqueTokens = Array.from(new Set(searchTokens));
            const authorData = extractAuthor(cleanContent);

            // Check for audio mapping
            // Priority: 1. By Song Number, 2. By Clean Title
            let audioTracks: BhajanAudio[] | undefined = undefined;
            if (songNumber && BHAJAN_AUDIO_MAP[songNumber]) {
                audioTracks = BHAJAN_AUDIO_MAP[songNumber];
            } else if (BHAJAN_AUDIO_MAP[cleanTitle]) {
                audioTracks = BHAJAN_AUDIO_MAP[cleanTitle];
            }

            bhajans.push({
                id: `bhajan-${Math.floor(i / 2)}`,
                title: cleanTitle,
                titleIAST,
                firstLine,
                firstLineIAST,
                content: cleanContent,
                contentIAST,
                searchIndex,
                searchTokens: uniqueTokens,
                author: authorData?.deva,
                authorIAST: authorData?.iast,
                audio: audioTracks,
                songNumber
            });
        }
    }
  }
  return bhajans;
};
