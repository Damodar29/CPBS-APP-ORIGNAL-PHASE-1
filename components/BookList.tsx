
import React, { useState } from 'react';
import { Book } from '../types';
import { FileText, Download, ExternalLink, SearchX, BookOpen } from 'lucide-react';
import { HighlightText } from './HighlightText';

interface BookListProps {
  books: Book[];
  onSelect: (book: Book) => void;
  searchQuery?: string;
}

export const BookList: React.FC<BookListProps> = ({ books, onSelect, searchQuery = '' }) => {
  const [pendingBook, setPendingBook] = useState<Book | null>(null);
  
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
    <>
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
              {books.map((book, index) => {
                  const delayStyle = { animationDelay: `${index * 40}ms` };
                  return (
                    <li key={book.id} className="animate-fade-in-up opacity-0 fill-mode-forwards" style={delayStyle}>
                        <button 
                            onClick={() => setPendingBook(book)}
                            className="w-full text-left p-4 hover:bg-saffron-50 dark:hover:bg-slate-700/50 active:bg-saffron-100 dark:active:bg-slate-700 transition-colors flex items-center gap-4 group"
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
                  );
              })}
          </ul>
        </div>
        
        <div className="mt-4 text-center px-4 animate-fade-in delay-300">
           <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              Note: An internet connection may be required to view or download these files initially.
           </p>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingBook && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-white dark:bg-slate-800 w-full max-w-xs rounded-2xl shadow-2xl p-6 transform scale-100 transition-all animate-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mb-4 animate-pop">
                          <BookOpen size={24} />
                      </div>
                      
                      <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                          Open Book?
                      </h3>
                      
                      <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
                          You are about to open <strong>{pendingBook.title}</strong>. This may require an external PDF viewer or internet connection.
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setPendingBook(null)}
                              className="flex-1 py-2.5 text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors active:scale-95"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={() => {
                                  onSelect(pendingBook);
                                  setPendingBook(null);
                              }}
                              className="flex-1 py-2.5 text-white font-bold bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 active:scale-95"
                          >
                              Open <ExternalLink size={14} />
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </>
  );
};
