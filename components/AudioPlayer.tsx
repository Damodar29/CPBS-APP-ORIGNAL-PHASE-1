
import React, { useState, useRef, useEffect } from 'react';
import { BhajanAudio } from '../types';
import { Play, Pause, Music, AlertCircle, Loader2, X, Check, Mic2, ChevronsUpDown, RotateCcw, RotateCw, Download, WifiOff } from 'lucide-react';
import { isTrackDownloaded, saveTrack, getCachedAudioUrl } from '../utils/audioStorage';

interface AudioPlayerProps {
  audioTracks: BhajanAudio[];
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioTracks }) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Ensure we have valid tracks, otherwise default to empty
  const validTracks = audioTracks || [];
  const currentTrack = validTracks[currentTrackIndex];

  // Check download status on track change
  useEffect(() => {
    if (currentTrack) {
        setIsDownloaded(isTrackDownloaded(currentTrack.id));
    }
  }, [currentTrack]);

  // Reset state when tracks change
  useEffect(() => {
    setCurrentTrackIndex(0);
    setIsPlaying(false);
    setProgress(0);
    setHasError(false);
    setIsPlaylistOpen(false);
  }, [validTracks]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !currentTrack) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        setHasError(false);
        
        // Logic: 
        // 1. If Downloaded -> Play from Cache (Offline capable)
        // 2. If Not Downloaded -> Check Internet -> Play Online
        
        if (isDownloaded) {
             const cachedUrl = await getCachedAudioUrl(currentTrack.url);
             if (cachedUrl && audio.src !== cachedUrl) {
                 const currentTime = audio.currentTime;
                 audio.src = cachedUrl;
                 audio.currentTime = currentTime;
             }
             await audio.play();
             setIsPlaying(true);
        } else {
             if (!navigator.onLine) {
                 alert("Turn on your internet to play this bhajan.");
                 return;
             }
             // Ensure we are playing online URL
             if (audio.src !== currentTrack.url) {
                 audio.src = currentTrack.url;
             }
             await audio.play();
             setIsPlaying(true);
        }
      }
    } catch (err) {
      console.error("Playback error:", err);
      setIsPlaying(false);
    }
  };

  const handleDownload = async () => {
      if (!currentTrack) return;
      
      if (!navigator.onLine) {
          alert("Turn on your internet to download.");
          return;
      }

      if (window.confirm(`Download "${currentTrack.singer}" version?\nIt will be saved to your device Downloads folder and available for offline play.`)) {
          setIsDownloading(true);
          const success = await saveTrack(currentTrack);
          setIsDownloading(false);
          if (success) {
              setIsDownloaded(true);
              alert("Download Complete!");
          } else {
              alert("Download Failed. Please check your connection.");
          }
      }
  };

  const skipForward = () => {
      if (audioRef.current) {
          audioRef.current.currentTime = Math.min(audioRef.current.duration, audioRef.current.currentTime + 10);
      }
  };

  const skipBackward = () => {
      if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      }
  };

  const handleTrackSelect = async (index: number) => {
    if (index === currentTrackIndex) return;
    
    setCurrentTrackIndex(index);
    setIsPlaying(false);
    setIsLoading(true);
    setHasError(false);
    setIsPlaylistOpen(false);

    // Allow state to update before playing new track
    setTimeout(async () => {
      const audio = audioRef.current;
      if (audio) {
        try {
          // Check download status for new track
          const track = validTracks[index];
          const downloaded = isTrackDownloaded(track.id);
          setIsDownloaded(downloaded);

          if (!downloaded && !navigator.onLine) {
              alert("Turn on your internet to play this bhajan.");
              setIsLoading(false);
              return;
          }

          if (downloaded) {
              const url = await getCachedAudioUrl(track.url);
              if (url) audio.src = url;
              else audio.src = track.url; // Fallback
          } else {
              audio.src = track.url;
          }

          audio.load();
          await audio.play();
          setIsPlaying(true);
        } catch (err) {
          console.error("Track switch error:", err);
          setHasError(true);
        }
        setIsLoading(false);
      }
    }, 100);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setProgress(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const onSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setProgress(time);
    }
  };

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!currentTrack) return null;

  return (
    <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-saffron-200 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] pb-[env(safe-area-inset-bottom)] z-50">
      
      {/* Progress Bar (Full Width Top) */}
      <div className="relative h-1 w-full bg-slate-200 dark:bg-slate-800 cursor-pointer group">
        <div 
          className="absolute top-0 left-0 h-full bg-saffron-500 transition-all duration-100" 
          style={{ width: `${(progress / (duration || 1)) * 100}%` }}
        />
        <input 
          type="range"
          min="0"
          max={duration || 100}
          value={progress}
          onChange={onSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      <div className="p-2 flex items-center justify-between gap-2">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
            {/* Skip Back */}
            <button onClick={skipBackward} className="text-slate-500 hover:text-saffron-600 dark:text-slate-400">
                <RotateCcw size={20} />
            </button>

            {/* Play/Pause Button */}
            <button 
            onClick={togglePlay}
            disabled={hasError}
            className={`w-10 h-10 sm:w-12 sm:h-12 flex-none flex items-center justify-center rounded-full shadow-md transition-all active:scale-95 ${
                hasError ? 'bg-red-100 text-red-500' : 'bg-saffron-500 text-white hover:bg-saffron-600'
            }`}
            >
            {hasError ? (
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            ) : isLoading ? (
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            ) : isPlaying ? (
                <Pause className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            ) : (
                <Play className="w-5 h-5 sm:w-6 sm:h-6 fill-current ml-1" />
            )}
            </button>

            {/* Skip Forward */}
            <button onClick={skipForward} className="text-slate-500 hover:text-saffron-600 dark:text-slate-400">
                <RotateCw size={20} />
            </button>
        </div>

        {/* Track Info & Controls */}
        <div className="flex-1 min-w-0 flex flex-col justify-center px-2">
            <div className="flex items-center justify-between mb-1">
               <div className="flex items-center gap-2">
                   <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${hasError ? 'text-red-600 bg-red-50' : 'text-saffron-600 dark:text-saffron-400 bg-saffron-50 dark:bg-slate-800'}`}>
                     {hasError ? 'Error' : isPlaying ? 'Playing' : 'Paused'}
                   </span>
                   {isDownloaded && (
                       <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-900/20">
                           Offline
                       </span>
                   )}
               </div>
               <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
                 {formatTime(progress)} / {formatTime(duration)}
               </span>
            </div>

            {/* Singer Selection Logic */}
            {validTracks.length > 1 ? (
                <button 
                  onClick={() => setIsPlaylistOpen(true)}
                  className="flex items-center justify-between w-full group bg-slate-100 dark:bg-slate-800 hover:bg-saffron-50 dark:hover:bg-slate-700/50 rounded-lg px-2 py-1.5 transition-colors border border-transparent hover:border-saffron-200 dark:hover:border-slate-600"
                >
                   <div className="flex items-center gap-2 min-w-0">
                      <Mic2 className="w-3 h-3 text-slate-400 group-hover:text-saffron-500 transition-colors shrink-0" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate text-left">
                         {currentTrack.singer}
                      </span>
                   </div>
                   <div className="flex items-center gap-1 pl-2 text-[10px] font-bold text-slate-400 group-hover:text-saffron-600 dark:text-slate-500 dark:group-hover:text-saffron-400 whitespace-nowrap shrink-0">
                      <span>{currentTrackIndex + 1}/{validTracks.length}</span>
                      <ChevronsUpDown className="w-3 h-3" />
                   </div>
                </button>
            ) : (
                <div className="px-1 py-1 flex items-center gap-2">
                   <Mic2 className="w-3 h-3 text-slate-400 shrink-0" />
                   <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                      {currentTrack.singer}
                   </span>
                </div>
            )}
        </div>

        {/* Download Button */}
        <button 
            onClick={handleDownload} 
            disabled={isDownloaded || isDownloading}
            className={`p-2.5 rounded-full transition-colors ${
                isDownloaded 
                ? 'text-green-500 bg-green-50 dark:bg-green-900/20' 
                : isDownloading 
                    ? 'text-saffron-500 bg-saffron-50'
                    : 'text-slate-400 hover:text-saffron-600 hover:bg-saffron-50 dark:hover:bg-slate-800'
            }`}
            title={isDownloaded ? "Downloaded" : "Download Song"}
        >
            {isDownloading ? <Loader2 className="w-5 h-5 animate-spin" /> : isDownloaded ? <Check className="w-5 h-5" /> : <Download className="w-5 h-5" />}
        </button>

      </div>

      {/* Playlist Drawer (Slide Up) */}
      {isPlaylistOpen && (
        <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-slate-900 shadow-2xl rounded-t-2xl border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-bottom duration-300 z-50 overflow-hidden flex flex-col max-h-[60vh]">
           <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
              <h3 className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                 <Music className="w-4 h-4 text-saffron-500" /> Select Version / Singer
              </h3>
              <button onClick={() => setIsPlaylistOpen(false)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full">
                 <X className="w-5 h-5 text-slate-500" />
              </button>
           </div>
           
           <div className="overflow-y-auto p-2 pb-[env(safe-area-inset-bottom)]">
              {validTracks.map((track, idx) => (
                 <button
                   key={track.id || idx}
                   onClick={() => handleTrackSelect(idx)}
                   className={`w-full text-left p-3 rounded-xl flex items-center justify-between mb-1 transition-colors ${
                     currentTrackIndex === idx 
                       ? 'bg-saffron-50 dark:bg-slate-800 border border-saffron-200 dark:border-slate-700' 
                       : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                   }`}
                 >
                    <div className="flex items-center gap-3">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          currentTrackIndex === idx ? 'bg-saffron-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                       }`}>
                          {idx + 1}
                       </div>
                       <div className="flex flex-col min-w-0">
                          <span className={`text-sm font-bold truncate ${currentTrackIndex === idx ? 'text-saffron-700 dark:text-saffron-400' : 'text-slate-700 dark:text-slate-300'}`}>
                             {track.singer}
                          </span>
                       </div>
                    </div>
                    {currentTrackIndex === idx && <Check className="w-5 h-5 text-saffron-500 shrink-0" />}
                 </button>
              ))}
           </div>
        </div>
      )}

      <audio
        ref={audioRef}
        src={isDownloaded ? undefined : currentTrack.url} // If downloaded, handled in effect/toggle
        crossOrigin="anonymous"
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onLoadStart={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onError={() => {
            setHasError(true);
            setIsLoading(false);
            setIsPlaying(false);
        }}
        preload="metadata"
      />
    </div>
  );
};
