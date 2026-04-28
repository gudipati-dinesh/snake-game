import { AnimatePresence, motion } from 'motion/react';
import { Pause, Play, SkipBack, SkipForward, Music, Zap } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Song } from '../types';

interface MusicPlayerProps {
  songs: Song[];
  currentSongIndex: number;
  setCurrentSongIndex: (index: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
}

export function MusicPlayer({ songs, currentSongIndex, setCurrentSongIndex, isPlaying, setIsPlaying }: MusicPlayerProps) {
  const currentSong = songs[currentSongIndex];
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + (1 / currentSong.duration) * 100;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentSongIndex]);

  const handleNext = () => {
    setCurrentSongIndex((currentSongIndex + 1) % songs.length);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentSongIndex((currentSongIndex - 1 + songs.length) % songs.length);
    setProgress(0);
  };

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between px-1 border-b border-[#00FFFF]/20 pb-2">
        <span className="text-[7px] font-pixel text-[#00FFFF]">AUDIO_LINK_0.9</span>
        <Zap size={10} className="text-[#FF00FF] animate-pulse" />
      </div>

      <div className="flex items-center gap-4 bg-black border border-[#00FFFF]/30 p-2 relative group overflow-hidden">
        <div className="absolute inset-0 bg-[#FF00FF]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        
        <div className="relative w-14 h-14 flex-shrink-0 border border-[#00FFFF]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSong.id}
              initial={{ opacity: 0, filter: 'grayscale(1) contrast(2)' }}
              animate={{ opacity: 1, filter: 'grayscale(0) contrast(1.5)' }}
              exit={{ opacity: 0 }}
              src={currentSong.cover}
              alt={currentSong.title}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>
          <div className="absolute top-0 left-0 w-full h-[1px] bg-[#00FFFF] animate-scanline" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-[8px] font-pixel text-[#00FFFF] truncate mb-1">
            {currentSong.title}
          </h3>
          <p className="text-[7px] text-[#FF00FF]/60 font-mono tracking-widest uppercase truncate">
            {currentSong.artist}
          </p>
        </div>
        
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center bg-[#00FFFF] text-black hover:bg-[#FF00FF] transition-all"
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
        </button>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-[7px] font-mono text-[#00FFFF]/50 uppercase tracking-[0.2em]">
          <span>{Math.floor((progress / 100) * currentSong.duration / 60)}:{(Math.floor((progress / 100) * currentSong.duration % 60)).toString().padStart(2, '0')}</span>
          <span>{Math.floor(currentSong.duration / 60)}:{Math.floor(currentSong.duration % 60).toString().padStart(2, '0')}</span>
        </div>
        <div className="h-[2px] w-full bg-[#00FFFF]/10 relative">
          <motion.div
            className="h-full absolute top-0 left-0 bg-[#FF00FF]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex gap-4">
          <button onClick={handlePrev} className="text-[#00FFFF]/40 hover:text-[#FF00FF] transition-colors"><SkipBack size={14} /></button>
          <button onClick={handleNext} className="text-[#00FFFF]/40 hover:text-[#FF00FF] transition-colors"><SkipForward size={14} /></button>
        </div>
        <div className="flex items-center gap-2 opacity-30">
          <Music size={10} className="animate-pulse" />
          <span className="text-[7px] font-mono">B_RATE: 128K</span>
        </div>
      </div>
    </div>
  );
}
