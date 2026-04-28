import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MusicPlayer } from './components/MusicPlayer';
import { SnakeGame } from './components/SnakeGame';
import { Difficulty, DIFFICULTY_SETTINGS, PLAYLIST } from './types';
import { Terminal, Cpu, Activity, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isOverdrive, setIsOverdrive] = useState(false);
  const [difficulty, setDifficulty] = useState<Difficulty>('MEDIUM');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) {
      setHighScore(newScore);
    }
  };

  const currentSettings = DIFFICULTY_SETTINGS[difficulty];

  return (
    <div className={`h-screen w-screen flex flex-col md:flex-row bg-black text-[#00FFFF] font-mono overflow-hidden relative`}>
      {/* Visual Artifacts */}
      <div className="scanline z-50 px-0!" />
      <div className="noise z-50 px-0!" />
      
      {/* Sidebar - Control Interface */}
      <aside className="w-full md:w-[350px] border-b md:border-b-0 md:border-r border-[#00FFFF]/20 p-6 flex flex-col gap-8 bg-black/80 backdrop-blur-md z-20">
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="p-2 border border-[#FF00FF] bg-[#FF00FF]/10">
              <Cpu className="text-[#FF00FF] w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tighter leading-none font-pixel text-[#FF00FF]">
                TERMINAL_S
              </h1>
              <p className="text-[9px] text-[#00FFFF]/50 mt-1 tracking-widest uppercase">
                Hardware: A-S_NODE_07
              </p>
            </div>
          </div>
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#FF00FF]" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00FFFF]" />
        </div>

        <section className="flex-1 flex flex-col gap-6 overflow-y-auto pr-2 no-scrollbar">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-[#FF00FF]/80">
              <span>Security.Flux</span>
              <span>{isOverdrive ? 'CRITICAL' : 'STABLE'}</span>
            </div>
            
            {/* OVERDRIVE TOGGLE */}
            <button 
              onClick={() => setIsOverdrive(!isOverdrive)}
              className={`w-full p-4 border flex items-center justify-between group transition-all font-pixel text-[8px] ${
                isOverdrive 
                ? 'bg-[#FF00FF] text-black border-[#FF00FF] animate-pulse' 
                : 'bg-black text-[#FF00FF] border-[#00FFFF]/50 hover:bg-[#00FFFF]/5'
              }`}
            >
              <span>{isOverdrive ? '> OVERDRIVE_ON' : '> OVERDRIVE_OFF'}</span>
              <AlertTriangle className={isOverdrive ? 'animate-bounce' : 'opacity-20'} size={14} />
            </button>

            {/* DIFFICULTY MODES */}
            <div className="space-y-2">
              <p className="text-[9px] font-bold text-[#00FFFF]/40 uppercase tracking-[0.2em] mb-1">Threat Level</p>
              <div className="grid grid-cols-3 gap-2">
                {(['EASY', 'MEDIUM', 'HARD'] as Difficulty[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDifficulty(mode)}
                    className={`py-2 border text-[8px] font-pixel transition-all ${
                      difficulty === mode 
                        ? 'bg-[#00FFFF] text-black border-[#00FFFF]' 
                        : 'bg-black text-[#00FFFF]/40 border-[#00FFFF]/20 hover:border-[#00FFFF]/60'
                    }`}
                  >
                    {mode === 'EASY' ? 'LVL_1' : mode === 'MEDIUM' ? 'LVL_2' : 'LVL_3'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 border border-[#00FFFF]/20 bg-[#00FFFF]/5">
            <MusicPlayer 
              songs={PLAYLIST}
              currentSongIndex={currentSongIndex}
              setCurrentSongIndex={setCurrentSongIndex}
              isPlaying={isPlaying}
              setIsPlaying={setIsPlaying}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-[8px] uppercase tracking-tighter text-[#00FFFF]/50">
              <span>Encryption entropy</span>
              <span>{difficulty}</span>
            </div>
            <div className="h-[2px] bg-[#00FFFF]/10 w-full relative">
              <motion.div 
                animate={{ width: difficulty === 'EASY' ? '33%' : difficulty === 'MEDIUM' ? '66%' : '100%' }}
                className="h-full bg-[#FF00FF]"
              />
            </div>
          </div>
        </section>

        <footer className="pt-6 border-t border-[#00FFFF]/10 text-[9px] font-mono leading-relaxed text-[#00FFFF]/40">
           <p className="flex justify-between">
             <span>MEM_STACK:</span>
             <span className="text-[#FF00FF]">{Math.floor(Math.random()*900)+100}KB</span>
           </p>
           <p className="flex justify-between mt-1">
             <span>CPU_CYCLE:</span>
             <span className="text-[#00FFFF]">0.0004s</span>
           </p>
        </footer>
      </aside>

      {/* Main Grid Viewport */}
      <main className="flex-1 flex flex-col relative z-10 bg-black">
        {/* Status Bar */}
        <div className="border-b border-[#00FFFF]/20 p-4 flex justify-between items-center bg-black/50 backdrop-blur-sm">
          <div className="flex gap-6">
            <div className="flex flex-col">
              <span className="text-[8px] text-[#FF00FF] font-bold">DATA_PULSE</span>
              <span className="text-xl font-bold font-pixel tracking-tighter leading-none mt-1">
                {score.toString().padStart(6, '0')}
              </span>
            </div>
            <div className="flex flex-col border-l border-[#00FFFF]/20 pl-6">
              <span className="text-[8px] text-[#00FFFF]/50 font-bold">MAX_RECORDS</span>
              <span className="text-xl font-bold font-pixel tracking-tighter leading-none mt-1 text-[#00FFFF]/40">
                {highScore.toString().padStart(6, '0')}
              </span>
            </div>
          </div>
          <div className="hidden md:flex gap-4">
            <Activity className="text-[#00FFFF]/30 animate-pulse" size={24} />
            <Terminal className="text-[#FF00FF]/30" size={24} />
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex items-center justify-center p-8 relative overflow-hidden">
          {/* Jarring Grid Background */}
          <div className="absolute inset-0 opacity-10 pointer-events-none" 
               style={{ 
                 backgroundImage: `linear-gradient(#00FFFF 1px, transparent 1px), linear-gradient(90deg, #00FFFF 1px, transparent 1px)`,
                 backgroundSize: '40px 40px'
               }} />

          <section className={`relative z-10 border-2 bg-black transition-all duration-500 ${
            isOverdrive ? 'border-[#FF00FF] shadow-[10px_10px_0px_#00FFFF]' : 'border-[#00FFFF] shadow-[10px_10px_0px_#FF00FF]'
          }`}>
             <SnakeGame 
               isOverdrive={isOverdrive}
               initialSpeed={currentSettings.initialSpeed}
               speedIncrement={currentSettings.increment}
               accentColor={isOverdrive ? '#FF00FF' : '#00FFFF'} 
               onScoreChange={handleScoreChange}
             />
          </section>
        </div>

        {/* Cryptic Footer */}
        <div className="border-t border-[#00FFFF]/20 p-2 text-[8px] font-mono text-[#00FFFF]/20 flex justify-between uppercase tracking-[0.2em]">
          <span>ERR: DATA_LEAK_DETECTED // AUTO_PURGE_ENABLED</span>
          <span>PROTOCOL_X_09</span>
        </div>
      </main>
    </div>
  );
}
