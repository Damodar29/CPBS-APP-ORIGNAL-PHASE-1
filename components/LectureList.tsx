
import React from 'react';
import { LectureData } from '../types';
import { Mic, Calendar, Headphones } from 'lucide-react';

interface LectureListProps {
  lectures: LectureData[];
  onSelect: (lecture: LectureData) => void;
}

export const LectureList: React.FC<LectureListProps> = ({ lectures, onSelect }) => {
  return (
    <div className="pb-24 pt-2 px-2">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-saffron-50 dark:bg-slate-800/50">
           <h2 className="text-lg font-bold text-saffron-700 dark:text-saffron-400 font-hindi flex items-center gap-2">
              <Mic className="w-5 h-5" />
              Lectures & Katha
           </h2>
           <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
             Listen to spiritual discourses
           </p>
        </div>
        
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
            {lectures.map((lecture) => (
                <li key={lecture.id}>
                    <button 
                        onClick={() => onSelect(lecture)}
                        className="w-full text-left p-4 hover:bg-saffron-50 dark:hover:bg-slate-700/50 transition-colors flex items-center gap-4 group"
                    >
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/30">
                            <Headphones size={20} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                            <h3 className="font-hindi font-bold text-slate-800 dark:text-slate-200 text-base leading-snug group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                                {lecture.title}
                            </h3>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400 dark:text-slate-500">
                                {lecture.date && (
                                    <span className="flex items-center gap-1">
                                        <Calendar size={10} /> {lecture.date}
                                    </span>
                                )}
                                <span className="truncate">
                                    {lecture.audio?.length || 0} Audio Tracks
                                </span>
                            </div>
                        </div>
                    </button>
                </li>
            ))}
            {lectures.length === 0 && (
                <li className="p-8 text-center text-slate-400 text-sm">
                    No lectures available at the moment.
                </li>
            )}
        </ul>
      </div>
    </div>
  );
};
