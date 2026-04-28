import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Point, Direction } from '../types';

interface SnakeGameProps {
  accentColor: string;
  isOverdrive?: boolean;
  initialSpeed: number;
  speedIncrement: number;
  onScoreChange: (score: number) => void;
}

const GRID_SIZE = 20;

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
}

export function SnakeGame({ accentColor, isOverdrive, initialSpeed, speedIncrement, onScoreChange }: SnakeGameProps) {
  const [snake, setSnake] = useState<Point[]>([{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }]);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [boostFood, setBoostFood] = useState<Point | null>(null);
  const [obstacles, setObstacles] = useState<Point[]>([]);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [direction, setDirection] = useState<Direction>('UP');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);
  const nextDirectionRef = useRef<Direction>('UP');
  const particleIdRef = useRef(0);

  const generateFood = useCallback((currentSnake: Point[], currentObstacles: Point[]) => {
    let newFood: Point;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (
      currentSnake.some(s => s.x === newFood.x && s.y === newFood.y) ||
      currentObstacles.some(o => o.x === newFood.x && o.y === newFood.y)
    );
    return newFood;
  }, []);

  const generateObstacles = useCallback((count: number, currentSnake: Point[]) => {
    const newObstacles: Point[] = [];
    while (newObstacles.length < count) {
      const obs = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      if (
        !currentSnake.some(s => Math.abs(s.x - obs.x) < 2 && Math.abs(s.y - obs.y) < 2) &&
        !newObstacles.some(o => o.x === obs.x && o.y === obs.y)
      ) {
        newObstacles.push(obs);
      }
    }
    return newObstacles;
  }, []);

  const createParticles = (x: number, y: number, color: string) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 6; i++) {
      newParticles.push({
        id: particleIdRef.current++,
        x,
        y,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        life: 1,
        color,
      });
    }
    setParticles(prev => [...prev, ...newParticles]);
  };

  const resetGame = () => {
    const initialSnake = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];
    setSnake(initialSnake);
    const initialObstacles = generateObstacles(5, initialSnake);
    setObstacles(initialObstacles);
    setFood(generateFood(initialSnake, initialObstacles));
    setBoostFood(null);
    setDirection('UP');
    nextDirectionRef.current = 'UP';
    setGameOver(false);
    setScore(0);
    setIsPaused(false);
  };

  const moveSnake = useCallback(() => {
    if (gameOver || isPaused) return;

    const currentNextDir = nextDirectionRef.current;
    const head = snake[0];
    const newHead = { ...head };

    setDirection(currentNextDir);

    switch (currentNextDir) {
      case 'UP': newHead.y -= 1; break;
      case 'DOWN': newHead.y += 1; break;
      case 'LEFT': newHead.x -= 1; break;
      case 'RIGHT': newHead.x += 1; break;
    }

    if (
      newHead.x < 0 || newHead.x >= GRID_SIZE ||
      newHead.y < 0 || newHead.y >= GRID_SIZE ||
      snake.some(segment => segment.x === newHead.x && segment.y === newHead.y) ||
      obstacles.some(obs => obs.x === newHead.x && obs.y === newHead.y)
    ) {
      setGameOver(true);
      return;
    }

    const newSnake = [newHead, ...snake];
    if (newHead.x === food.x && newHead.y === food.y) {
      const nextScore = score + 10;
      setScore(nextScore);
      setSnake(newSnake);
      createParticles(food.x, food.y, '#FF00FF');
      if (nextScore % 50 === 0) {
        setObstacles(generateObstacles(5 + Math.floor(nextScore / 50), newSnake));
      }
      if (Math.random() > 0.8) {
        setBoostFood(generateFood(newSnake, obstacles));
      }
      setFood(generateFood(newSnake, obstacles));
    } else if (boostFood && newHead.x === boostFood.x && newHead.y === boostFood.y) {
      setScore(s => s + 30);
      setSnake(newSnake);
      createParticles(boostFood.x, boostFood.y, '#00FFFF');
      setBoostFood(null);
    } else {
      newSnake.pop();
      setSnake(newSnake);
    }
  }, [snake, food, boostFood, obstacles, gameOver, isPaused, generateFood, generateObstacles, score]);

  useEffect(() => {
    onScoreChange(score);
  }, [score, onScoreChange]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'DOWN') nextDirectionRef.current = 'UP'; break;
        case 'ArrowDown': if (direction !== 'UP') nextDirectionRef.current = 'DOWN'; break;
        case 'ArrowLeft': if (direction !== 'RIGHT') nextDirectionRef.current = 'LEFT'; break;
        case 'ArrowRight': if (direction !== 'LEFT') nextDirectionRef.current = 'RIGHT'; break;
        case ' ': setIsPaused(p => !p); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction]);

  useEffect(() => {
    const baseSpeed = Math.max(40, initialSpeed - (score / 10) * speedIncrement);
    const speed = isOverdrive ? baseSpeed * 0.75 : baseSpeed;
    gameLoopRef.current = setInterval(moveSnake, speed);
    return () => { if (gameLoopRef.current) clearInterval(gameLoopRef.current); };
  }, [moveSnake, score, isOverdrive, initialSpeed, speedIncrement]);

  useEffect(() => {
    if (particles.length === 0 || isPaused || gameOver) return;
    const interval = setInterval(() => {
      setParticles(prev => 
        prev.map(p => ({ ...p, x: p.x + p.vx, y: p.y + p.vy, life: p.life - 0.1 }))
            .filter(p => p.life > 0)
      );
    }, 50);
    return () => clearInterval(interval);
  }, [particles.length, isPaused, gameOver]);

  return (
    <div className="relative flex flex-col items-center perspective-[1000px]">
      <motion.div 
        animate={{ 
          rotateX: isPaused ? 0 : 25,
          rotateY: isPaused ? 0 : (direction === 'LEFT' ? -8 : direction === 'RIGHT' ? 8 : 0),
          translateZ: isPaused ? 0 : 20,
        }}
        transition={{ type: 'spring', stiffness: 50, damping: 20 }}
        className={`relative bg-black overflow-hidden border transition-all duration-500 shadow-[20px_20px_50px_rgba(0,0,0,0.8)] ${
          isOverdrive ? 'border-[#FF00FF] shadow-[0_0_30px_rgba(255,0,255,0.2)]' : 'border-[#00FFFF]/50'
        }`}
        style={{ 
          width: 'min(90vw, 400px)',
          height: 'min(90vw, 400px)',
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="absolute inset-0 grid grid-cols-20 grid-rows-20 pointer-events-none opacity-[0.05]">
           {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
             <div key={i} className="border-[0.5px] border-white" />
           ))}
        </div>

        {obstacles.map((obs) => (
          <div
            key={`obs-${obs.x}-${obs.y}`}
            className="absolute bg-[#111] border border-[#00FFFF]/20"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(obs.x * 100) / GRID_SIZE}%`,
              top: `${(obs.y * 100) / GRID_SIZE}%`,
            }}
          />
        ))}

        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute pointer-events-none"
            style={{
              width: '2px',
              height: '2px',
              left: `${(p.x * 100) / GRID_SIZE}%`,
              top: `${(p.y * 100) / GRID_SIZE}%`,
              backgroundColor: p.color,
              opacity: p.life,
              transform: `scale(${p.life * 2})`,
            }}
          />
        ))}

        {snake.map((segment, i) => (
          <div
            key={`${segment.x}-${segment.y}-${i}`}
            className="absolute"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(segment.x * 100) / GRID_SIZE}%`,
              top: `${(segment.y * 100) / GRID_SIZE}%`,
              backgroundColor: i === 0 ? '#00FFFF' : '#00FFFFCC',
              boxShadow: i === 0 ? '0 0 10px #00FFFF' : 'none',
              zIndex: 10 - i,
            }}
          />
        ))}

        <div
          className="absolute"
          style={{
            width: `${100 / GRID_SIZE}%`,
            height: `${100 / GRID_SIZE}%`,
            left: `${(food.x * 100) / GRID_SIZE}%`,
            top: `${(food.y * 100) / GRID_SIZE}%`,
            backgroundColor: '#FF00FF',
            boxShadow: '0 0 10px #FF00FF',
          }}
        />

        {boostFood && (
          <div
            className="absolute animate-pulse"
            style={{
              width: `${100 / GRID_SIZE}%`,
              height: `${100 / GRID_SIZE}%`,
              left: `${(boostFood.x * 100) / GRID_SIZE}%`,
              top: `${(boostFood.y * 100) / GRID_SIZE}%`,
              backgroundColor: '#00FFFF',
              border: '2px solid #FF00FF',
            }}
          />
        )}

        <AnimatePresence>
          {(gameOver || isPaused) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            >
              <div className="text-center p-4 border-2 border-[#FF00FF] bg-black shadow-[4px_4px_0_#00FFFF]">
                <h2 className="text-lg font-pixel text-[#FF00FF] mb-4">
                  {gameOver ? 'KERNEL_PANIC' : 'PROT_SUSPEND'}
                </h2>
                {gameOver && (
                  <p className="text-[10px] text-[#00FFFF]/50 mb-6 font-mono tracking-widest leading-relaxed">
                    ID: {Math.random().toString(16).slice(2, 10).toUpperCase()}<br />
                    ADDR: 0x011A_B2<br />
                    SCORE: <span className="text-[#00FFFF]">{score}</span>
                  </p>
                )}
                <button
                  onClick={gameOver ? resetGame : () => setIsPaused(false)}
                  className="w-full py-3 bg-[#00FFFF] text-black font-pixel text-[8px] hover:bg-[#FF00FF] transition-colors"
                >
                  {gameOver ? '> RE_INIT_SYSTEM' : '> RESTORE_LINK'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="grid grid-cols-3 gap-2 mt-8 md:hidden">
        <div />
        <ControlButton onClick={() => { if (direction !== 'DOWN') nextDirectionRef.current = 'UP'; }}>↑</ControlButton>
        <div />
        <ControlButton onClick={() => { if (direction !== 'RIGHT') nextDirectionRef.current = 'LEFT'; }}>←</ControlButton>
        <ControlButton onClick={() => setIsPaused(!isPaused)}>!!</ControlButton>
        <ControlButton onClick={() => { if (direction !== 'LEFT') nextDirectionRef.current = 'RIGHT'; }}>→</ControlButton>
        <div />
        <ControlButton onClick={() => { if (direction !== 'UP') nextDirectionRef.current = 'DOWN'; }}>↓</ControlButton>
        <div />
      </div>
    </div>
  );
}

function ControlButton({ children, onClick }: { children: React.ReactNode, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-12 h-12 flex items-center justify-center border border-[#00FFFF]/30 bg-black text-[#00FFFF] active:bg-[#FF00FF] active:text-black font-pixel text-xs"
    >
      {children}
    </button>
  );
}
