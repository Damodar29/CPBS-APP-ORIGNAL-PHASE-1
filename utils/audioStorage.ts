
import { BhajanAudio } from '../types';

const CACHE_NAME = 'cpbs-audio-cache-v1';
const STORAGE_KEY = 'cpbs_downloaded_tracks';

export const getDownloadedTrackIds = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

export const isTrackDownloaded = (audioId: string): boolean => {
  const downloaded = getDownloadedTrackIds();
  return downloaded.includes(audioId);
};

export const saveTrack = async (audio: BhajanAudio): Promise<boolean> => {
  try {
    // 1. Fetch the audio file
    const response = await fetch(audio.url);
    if (!response.ok) throw new Error('Network response was not ok');
    
    // 2. Open Cache
    const cache = await caches.open(CACHE_NAME);
    
    // 3. Store in Cache Storage for Offline Playback
    await cache.put(audio.url, response.clone());
    
    // 4. Update LocalStorage Tracking
    const current = getDownloadedTrackIds();
    if (!current.includes(audio.id)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...current, audio.id]));
    }
    
    // 5. Trigger File Download (Save to Device/Downloads)
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    // Clean filename
    const cleanName = audio.singer.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    a.download = `cpbs_bhajan_${cleanName}_${audio.id}.mp3`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return true;
  } catch (error) {
    console.error('Download failed:', error);
    return false;
  }
};

export const getCachedAudioUrl = async (url: string): Promise<string | null> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(url);
    if (response) {
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch {
    return null;
  }
};

export const deleteTrack = async (audioId: string, url: string): Promise<void> => {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete(url);
    
    const current = getDownloadedTrackIds();
    const updated = current.filter(id => id !== audioId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Delete failed:', error);
  }
};
