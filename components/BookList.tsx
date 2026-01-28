
import React from 'react';
import { Book } from '../types';
import { FileText, Download, ExternalLink, SearchX } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface BookListProps {
  books: Book[];
  onSelect: (book: Book) => void;
  searchQuery?: string;
}

export const BookList: React.FC<BookListProps> = ({ books, onSelect, searchQuery = '' }) => {
  
  if (books.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400 p-8 text-center animate-fade-in-up">
              <SearchX className="w-16 h-16 opacity-30 mb-4" />
              <p className="text-lg font-medium">No books found</p>
              {searchQuery && <p className="text-sm opacity-70 mt-2">Try a different search term</p>}
          </div>
      );
  }

  return (
    <div className="pb-24 pt-2 px-2">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-saffron-50 dark:bg-slate-800/50">
           <h2 className="text-lg font-bold text-saffron-700 dark:text-saffron-400 font-hindi flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Books & Literature
           </h2>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
             Tap to read or download PDFs
           </p>
        </div>
        
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {books.map((book) => (
                <li key={book.id}>
                    <button 
                        onClick={() => onSelect(book)}
                        className="w-full text-left p-4 hover:bg-saffron-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-saffron-100 dark:bg-saffron-900/20 text-saffron-600 dark:text-saffron-400 flex items-center justify-center shrink-0 border border-saffron-200 dark:border-saffron-900/30">
                            <span className="text-[10px] font-bold">PDF</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-hindi font-bold text-slate-800 dark:text-slate-200 text-base leading-snug group-hover:text-saffron-700 dark:group-hover:text-saffron-400 transition-colors">
                                <HighlightText text={book.title} highlight={searchQuery} />
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                <HighlightText text={book.fileName} highlight={searchQuery} />
                            </p>
                        </div>

                        <div className="text-slate-300 dark:text-slate-600 group-hover:text-saffron-500 dark:group-hover:text-saffron-400 transition-colors">
                             {book.url ? <ExternalLink size={18} /> : <Download size={18} />}
                        </div>
                    </button>
                </li>
            ))}
        </ul>
      </div>
      
      <div className="mt-4 text-center px-4">
         <p className="text-xs text-slate-400 dark:text-slate-500 italic">
            Note: An internet connection may be required to view or download these files initially.
         </p>
      </div>
    </div>
  );
};
