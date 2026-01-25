
import React from 'react';
import { Book } from '../types';
import { FileText, Download, ExternalLink } from 'lucide-react';

interface BookListProps {
  books: Book[];
}

export const BookList: React.FC<BookListProps> = ({ books }) => {
  
  const handleBookClick = (book: Book) => {
    if (book.url) {
        window.open(book.url, '_blank');
    } else {
        alert(`Opening ${book.title}...\n\n(Note: To enable PDF viewing, please update data/books.ts with valid Google Drive or hosting URLs for these files.)`);
    }
  };

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
                        onClick={() => handleBookClick(book)}
                        className="w-full text-left p-4 hover:bg-saffron-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-900/30">
                            <span className="text-[10px] font-bold">PDF</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-hindi font-bold text-slate-800 dark:text-slate-200 text-base leading-snug group-hover:text-saffron-700 dark:group-hover:text-saffron-400 transition-colors">
                                {book.title}
                            </h3>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 truncate">
                                {book.fileName}
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
