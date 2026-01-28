
export interface BhajanAudio {
  id: string;
  singer: string;
  url: string; // Direct URL (e.g., Cloudinary link ending in .mp3)
}

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
  audio?: BhajanAudio[]; // Array of audio tracks
  songNumber?: string; // Extracted number from the raw text title
}

export interface Book {
  id: string;
  title: string;
  fileName: string;
  url?: string; // Optional URL for online viewing
}

export interface LectureData {
  id: string;
  title: string;
  description: string; // Used as content
  date?: string;
  audio?: BhajanAudio[];
}

export interface HistoryEntry {
  id: string;
  type: 'song' | 'book' | 'lecture';
  timestamp?: number;
}

export interface DailyQuote {
  dateKey: string; // Format: "1 जनवरी"
  text: string;
  source: string;
}

export type FontSize = number;
export type ScriptType = 'devanagari' | 'iast';
export type AppTab = 'songs' | 'authors' | 'books' | 'history' | 'downloaded' | 'lectures';

export interface AppSettings {
  darkMode: boolean;
  fontSize: FontSize;
  script: ScriptType;
  keepAwake: boolean;
}
