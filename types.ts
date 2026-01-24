
export interface Bhajan {
  id: string;
  title: string;
  titleIAST: string; // IAST Transliteration
  firstLine: string; // First line of content (Devanagari)
  firstLineIAST: string; // First line of content (IAST)
  content: string;
  contentIAST: string; // IAST Transliteration
  searchIndex: string; // Transliterated content for search (normalized)
  searchTokens: string[]; // Array of normalized words for fuzzy matching
  author?: string; // Hindi/Devanagari Name
  authorIAST?: string; // English/IAST Name
}

export type FontSize = number;
export type ScriptType = 'devanagari' | 'iast';
export type AppTab = 'songs' | 'authors' | 'history';

export interface AppSettings {
  darkMode: boolean;
  fontSize: FontSize;
  script: ScriptType;
  keepAwake: boolean;
}
