import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/Nav";
import { GameCard, GameCardData } from "@/components/GameCard";
import cardsData from "@/data/cards.json";
import { Play, Trophy, RefreshCw, Zap, Clock, ShieldAlert } from "lucide-react";

type ElementType = 'Water' | 'Earth' | 'Air';

const getElement = (type?: string): ElementType => {
  const t = (type || '').toLowerCase();
  if (t.includes('aquatic') || t.includes('amphibian')) return 'Water';
  if (t.includes('terrest') || t.includes('organic')) return 'Earth';
  return 'Air'; // Aerial, A
};

// Returns the element that BEATS the target element
const getCounterElement = (target: ElementType): ElementType => {
  // Water beats Earth, Earth beats Air, Air beats Water
  if (target === 'Earth') return 'Water';
  if (target === 'Air') return 'Earth';
  if (target === 'Water') return 'Air';
  return 'Water';
};

const getElementColor = (el: ElementType) => {
  if (el === 'Water') return { border: 'border-blue-500', shadow: 'shadow-[0_0_20px_rgba(59,130,246,0.6)]', text: 'text-blue-400', bg: 'bg-blue-500/20' };
  if (el === 'Earth') return { border: 'border-green-500', shadow: 'shadow-[0_0_20px_rgba(34,197,94,0.6)]', text: 'text-green-400', bg: 'bg-green-500/20' };
  return { border: 'border-amber-300', shadow: 'shadow-[0_0_20px_rgba(252,211,77,0.6)]', text: 'text-amber-300', bg: 'bg-amber-300/20' }; // Air
};

export default function Gauntlet() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  
  const [enemy, setEnemy] = useState<GameCardData | null>(null);
  const [hand, setHand] = useState<GameCardData[]>([]);
  
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [slashEnemy, setSlashEnemy] = useState(false);
  const [timeDelta, setTimeDelta] = useState<{ value: number, id: number } | null>(null);

  const spawnRound = useCallback(() => {
    const randomCard = () => cardsData[Math.floor(Math.random() * cardsData.length)] as GameCardData;
    
    let newEnemy = randomCard();
    let enemyEl = getElement(newEnemy.stats.type);
    let neededEl = getCounterElement(enemyEl);
    
    // Generate hand
    let newHand: GameCardData[] = [];
    let hasCounter = false;
    
    while (newHand.length < 4) {
      let c = randomCard();
      if (getElement(c.stats.type) === neededEl) hasCounter = true;
      newHand.push(c);
    }
    
    // Force a counter if none exist
    if (!hasCounter) {
      const counters = cardsData.filter(c => getElement((c as GameCardData).stats.type) === neededEl) as GameCardData[];
      if (counters.length > 0) {
        newHand[Math.floor(Math.random() * 4)] = counters[Math.floor(Math.random() * counters.length)];
      }
    }
    
    setEnemy(newEnemy);
    setHand(newHand);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setIsGameOver(false);
    spawnRound();
  };

  // Timer loop
  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsPlaying(false);
          setIsGameOver(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handleCardPlay = (card: GameCardData) => {
    if (!isPlaying || slashEnemy || shakeEnemy || !enemy) return;
    
    const playedEl = getElement(card.stats.type);
    const enemyEl = getElement(enemy.stats.type);
    
    if (playedEl === getCounterElement(enemyEl)) {
      // Success!
      setSlashEnemy(true);
      setTimeLeft(prev => prev + 3);
      setTimeDelta({ value: +3, id: Date.now() });
      setScore(s => s + 1);
      
      setTimeout(() => {
        setSlashEnemy(false);
        spawnRound();
      }, 400);
    } else {
      // Penalty!
      setShakeEnemy(true);
      setTimeLeft(prev => Math.max(0, prev - 5));
      setTimeDelta({ value: -5, id: Date.now() });
      
      if (timeLeft - 5 <= 0) {
        setIsPlaying(false);
        setIsGameOver(true);
      }
      
      setTimeout(() => {
        setShakeEnemy(false);
      }, 400);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: "rgb(4,3,8)", fontFamily: "'DM Sans','system-ui',sans-serif" }}>
      <Nav />
      
      {/* Timer Bar */}
      <div className="w-full h-2 bg-slate-900 absolute top-[60px] left-0 z-40">
        <motion.div 
          className={`h-full ${timeLeft < 10 ? 'bg-red-500' : 'bg-amber-500'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${Math.min(100, (timeLeft / 30) * 100)}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        
        {!isPlaying && !isGameOver && (
          <div className="text-center max-w-lg animate-in fade-in slide-in-from-bottom-4">
            <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h1 className="text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-700 mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
              Elemental Gauntlet
            </h1>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-left text-sm text-slate-300">
              <p className="mb-4 text-center font-bold text-white uppercase tracking-widest">Rock - Paper - Scissors</p>
              <ul className="space-y-3 font-mono">
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span> <strong>WATER</strong> beats <strong>EARTH</strong></li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> <strong>EARTH</strong> beats <strong>AIR</strong></li>
                <li className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-amber-300"></span> <strong>AIR</strong> beats <strong>WATER</strong></li>
              </ul>
              <p className="mt-4 text-amber-500/80 italic text-center">Defeat as many enemies as possible before time runs out!</p>
            </div>
            
            <button 
              onClick={startGame}
              className="px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#1c1008", boxShadow: "0 0 40px rgba(245,158,11,0.4)" }}
            >
              <Play className="w-6 h-6 fill-current" /> Start Gauntlet
            </button>
          </div>
        )}
        
        {isGameOver && (
          <div className="text-center animate-in zoom-in duration-500">
            <Trophy className="w-24 h-24 text-amber-500 mx-auto mb-6 drop-shadow-[0_0_40px_rgba(245,158,11,0.8)]" />
            <h2 className="text-3xl font-bold text-slate-300 mb-2 font-mono uppercase tracking-widest">Time's Up!</h2>
            <h1 className="text-7xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-700 mb-8" style={{ fontFamily: "'Cinzel', serif" }}>
              Score: {score}
            </h1>
            <button 
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3 mx-auto transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
            >
              <RefreshCw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
        
        {isPlaying && enemy && (
          <div className="w-full max-w-5xl flex flex-col items-center justify-between flex-1 py-2 md:py-4">
            
            {/* Header HUD */}
            <div className="w-full flex justify-between items-center px-2 sm:px-8 mb-4">
              <div className="flex flex-col items-center bg-black/40 px-4 sm:px-6 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">Score</span>
                <span className="text-3xl font-black text-white font-mono leading-none">{score}</span>
              </div>
              
              <div className="flex flex-col items-center bg-black/40 px-4 sm:px-6 py-2 rounded-xl border border-white/10 backdrop-blur-md relative">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Time</span>
                <span className={`text-3xl font-black font-mono leading-none ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {timeLeft}s
                </span>
                
                <AnimatePresence>
                  {timeDelta && (
                    <motion.div
                      key={timeDelta.id}
                      initial={{ opacity: 0, y: 0 }}
                      animate={{ opacity: 1, y: -30 }}
                      exit={{ opacity: 0 }}
                      className={`absolute -top-4 right-[-20px] font-black text-xl ${timeDelta.value > 0 ? 'text-green-400' : 'text-red-500'}`}
                    >
                      {timeDelta.value > 0 ? `+${timeDelta.value}` : timeDelta.value}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Enemy Area */}
            <div className="flex-1 flex items-center justify-center relative w-full my-4">
              <motion.div
                animate={{
                  x: shakeEnemy ? [-10, 10, -10, 10, 0] : 0,
                  rotate: slashEnemy ? [0, -15, 15, 0] : 0,
                  opacity: slashEnemy ? [1, 0, 1] : 1,
                  scale: slashEnemy ? [0.9, 1.1, 0] : 0.9
                }}
                transition={{ duration: 0.3 }}
                className="relative w-full max-w-[150px] sm:max-w-[220px] md:max-w-[260px] flex items-center justify-center"
              >
                <div className={`absolute -inset-4 rounded-2xl opacity-50 blur-xl ${getElementColor(getElement(enemy.stats.type)).bg}`} />
                <div className="pointer-events-none w-full">
                  <GameCard card={enemy} onCardClick={() => {}} />
                </div>
                
                {/* Element Badge */}
                <div className={`absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center font-black text-sm uppercase tracking-wider border-2 bg-black ${getElementColor(getElement(enemy.stats.type)).border} ${getElementColor(getElement(enemy.stats.type)).text} ${getElementColor(getElement(enemy.stats.type)).shadow}`}>
                  {getElement(enemy.stats.type).substring(0, 3)}
                </div>
                
                {slashEnemy && (
                  <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                    <div className="w-[150%] h-2 bg-white rotate-45 shadow-[0_0_20px_white]" />
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Player Hand */}
            <div className="w-full pb-4">
              <div className="flex items-center justify-center gap-2 md:gap-4 text-slate-400 mb-2 md:mb-4 text-[10px] md:text-xs font-mono uppercase tracking-widest">
                <Zap className="w-4 h-4 text-amber-500" /> Select Counter <Zap className="w-4 h-4 text-amber-500" />
              </div>
              
              <div className="grid grid-cols-2 sm:flex sm:flex-row items-center justify-center gap-2 md:gap-4 px-2 md:px-4 w-full max-w-4xl mx-auto">
                {hand.map((card, idx) => {
                  const el = getElement(card.stats.type);
                  const colors = getElementColor(el);
                  return (
                    <motion.div 
                      key={`${card.id}-${idx}`}
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleCardPlay(card)}
                      className={`relative cursor-pointer transition-transform hover:-translate-y-2 md:hover:-translate-y-4 group flex-1 min-w-0 w-full sm:max-w-[160px] md:max-w-[200px]`}
                    >
                      <div className={`absolute -inset-1 md:-inset-2 rounded-xl border-2 opacity-0 group-hover:opacity-100 transition-opacity ${colors.border} ${colors.shadow}`} />
                      <div className="pointer-events-none w-full">
                        <GameCard card={card} onCardClick={() => {}} />
                      </div>
                      <div className={`absolute -bottom-2 md:bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 md:px-4 md:py-1 rounded-full font-black text-[9px] md:text-xs uppercase tracking-widest border bg-black/80 backdrop-blur-sm ${colors.border} ${colors.text}`}>
                        {el}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
}
