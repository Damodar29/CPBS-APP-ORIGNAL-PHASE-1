
import React, { useMemo } from 'react';
import { Bhajan, ScriptType } from '../types';
import { getDownloadedTrackIds, deleteTrack } from '../utils/audioStorage';
import { ArrowLeft, Trash2, Download, PlayCircle } from 'lucide-react';

interface DownloadedListProps {
  allBhajans: Bhajan[];
  onSelect: (bhajan: Bhajan) => void;
  onBack: () => void;
  script: ScriptType;
  scrollBarSide?: 'left' | 'right';
}

export const DownloadedList: React.FC<DownloadedListProps> = ({ allBhajans, onSelect, onBack, script, scrollBarSide = 'left' }) => {
  const [downloadedIds, setDownloadedIds] = React.useState<string[]>([]);

  React.useEffect(() => {
    setDownloadedIds(getDownloadedTrackIds());
  }, []);

  const downloadedBhajans = useMemo(() => {
    // Filter bhajans that have at least one audio track ID in the downloaded list
    return allBhajans.filter(b => 
        b.audio && b.audio.some(track => downloadedIds.includes(track.id))
    );
  }, [allBhajans, downloadedIds]);

  const handleDelete = async (e: React.MouseEvent, trackId: string, trackUrl: string) => {
      e.stopPropagation();
      if (confirm("Delete this download?")) {
          await deleteTrack(trackId, trackUrl);
          setDownloadedIds(getDownloadedTrackIds());
      }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
        {/* Header */}
        <div className="flex-none bg-white/95 dark:bg-slate-900/95 backdrop-blur shadow-sm border-b border-saffron-100 dark:border-slate-800 p-4 pt-[calc(1rem+env(safe-area-inset-top))] flex items-center gap-4 z-10 sticky top-0">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-6 h-6 text-slate-700 dark:text-slate-200" />
            </button>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Download className="w-6 h-6 text-green-600" /> Downloaded Songs
            </h2>
        </div>

        {/* List - Scrollbar Applied */}
        <div className={`flex-1 overflow-y-auto ${scrollBarSide === 'left' ? 'left-scrollbar' : ''}`}>
            <div dir={scrollBarSide === 'left' ? 'ltr' : undefined} className="p-2 pb-[calc(5rem+env(safe-area-inset-bottom))]">
                {downloadedBhajans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 p-8 text-center min-h-[60vh]">
                        <Download className="w-16 h-16 opacity-20 mb-4" />
                        <p className="text-lg font-medium">No downloads yet</p>
                        <p className="text-sm opacity-70 mt-2">Download songs from the player to listen offline.</p>
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {downloadedBhajans.map(bhajan => (
                            <li key={bhajan.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <button 
                                    onClick={() => onSelect(bhajan)}
                                    className="w-full text-left p-4 hover:bg-saffron-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-hindi font-bold text-slate-800 dark:text-slate-200 text-lg leading-tight mb-1">
                                                {script === 'iast' ? bhajan.titleIAST : bhajan.title}
                                            </h3>
                                            <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium mt-1">
                                                <PlayCircle size={14} /> Available Offline
                                            </div>
                                        </div>
                                    </div>
                                </button>
                                
                                {/* Track List inside the card */}
                                <div className="bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 px-4 py-2">
                                    {bhajan.audio?.filter(t => downloadedIds.includes(t.id)).map(track => (
                                        <div key={track.id} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                                            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate pr-4">
                                                {track.singer}
                                            </span>
                                            <button 
                                                onClick={(e) => handleDelete(e, track.id, track.url)}
                                                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                                title="Delete Download"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    </div>
  );
};
