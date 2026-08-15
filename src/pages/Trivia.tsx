import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Nav } from "@/components/Nav";
import { GameCard, GameCardData } from "@/components/GameCard";
import cardsData from "@/data/cards.json";
import { Play, Trophy, RefreshCw, Zap, Clock, ShieldAlert, Swords, Heart, Shield, Activity, Brain } from "lucide-react";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  BACKGROUND CANVAS                                                         */
/* ─────────────────────────────────────────────────────────────────────────── */
const AuroraBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    let raf: number;
    let t = 0;
    const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      t += 0.003;
      ctx.clearRect(0, 0, c.width, c.height);
      const blobs = [
        { x: Math.sin(t * 0.7) * 0.3 + 0.25, y: Math.cos(t * 0.5) * 0.2 + 0.3, r: 0.45, color: "rgba(180,120,30,0.055)" },
        { x: Math.cos(t * 0.4) * 0.25 + 0.72, y: Math.sin(t * 0.6) * 0.2 + 0.55, r: 0.4, color: "rgba(120,40,180,0.04)" },
        { x: Math.sin(t * 0.3 + 1) * 0.2 + 0.5, y: Math.cos(t * 0.8) * 0.15 + 0.75, r: 0.35, color: "rgba(30,100,200,0.045)" },
      ];
      blobs.forEach(({ x, y, r, color }) => {
        const grd = ctx.createRadialGradient(x * c.width, y * c.height, 0, x * c.width, y * c.height, r * Math.max(c.width, c.height));
        grd.addColorStop(0, color);
        grd.addColorStop(1, "transparent");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, c.width, c.height);
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

type StatType = 'hp' | 'attack' | 'defense' | 'mana' | 'speed' | 'intelligence';

const STAT_CONFIG: Record<StatType, { label: string, icon: any, color: string }> = {
  hp: { label: "HP", icon: Heart, color: "text-red-400" },
  attack: { label: "Attack", icon: Swords, color: "text-orange-400" },
  defense: { label: "Defense", icon: Shield, color: "text-sky-400" },
  mana: { label: "Mana", icon: Activity, color: "text-purple-400" },
  speed: { label: "Speed", icon: Zap, color: "text-yellow-400" },
  intelligence: { label: "Intelligence", icon: Brain, color: "text-emerald-400" }
};

export default function Trivia() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  // Timer is in milliseconds for smooth progress bar
  const [timeLeft, setTimeLeft] = useState(3000); 
  const [maxTime] = useState(3000);
  
  const [cardA, setCardA] = useState<GameCardData | null>(null);
  const [cardB, setCardB] = useState<GameCardData | null>(null);
  const [activeStat, setActiveStat] = useState<StatType>('attack');
  
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  const lastUpdateRef = useRef<number>(0);
  const reqRef = useRef<number>();

  useEffect(() => {
    const saved = localStorage.getItem('trivia-high-score');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const getNewRound = useCallback(() => {
    const stats: StatType[] = ['hp', 'attack', 'defense', 'mana', 'speed', 'intelligence'];
    const randomStat = stats[Math.floor(Math.random() * stats.length)];
    setActiveStat(randomStat);
    
    // Pick two distinct cards that don't have the EXACT same stat value if possible
    let a = cardsData[Math.floor(Math.random() * cardsData.length)] as GameCardData;
    let b = cardsData[Math.floor(Math.random() * cardsData.length)] as GameCardData;
    
    // Try to ensure they have different stat values so there is a clear winner
    let attempts = 0;
    while (a.stats[randomStat] === b.stats[randomStat] && attempts < 20) {
      b = cardsData[Math.floor(Math.random() * cardsData.length)] as GameCardData;
      attempts++;
    }
    
    setCardA(a);
    setCardB(b);
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(maxTime);
    setIsPlaying(true);
    setIsGameOver(false);
    setFeedback(null);
    getNewRound();
    lastUpdateRef.current = performance.now();
  };

  const handleGameOver = useCallback(() => {
    setIsPlaying(false);
    setIsGameOver(true);
    setFeedback('wrong');
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('trivia-high-score', score.toString());
    }
  }, [score, highScore]);

  // Timer loop
  useEffect(() => {
    if (!isPlaying || feedback) return;
    
    const updateTimer = (time: number) => {
      const delta = time - lastUpdateRef.current;
      lastUpdateRef.current = time;
      
      setTimeLeft(prev => {
        const next = prev - delta;
        if (next <= 0) {
          handleGameOver();
          return 0;
        }
        return next;
      });
      
      reqRef.current = requestAnimationFrame(updateTimer);
    };
    
    reqRef.current = requestAnimationFrame(updateTimer);
    
    return () => {
      if (reqRef.current) cancelAnimationFrame(reqRef.current);
    };
  }, [isPlaying, feedback, handleGameOver]);

  const handleChoice = (chosenCard: GameCardData, otherCard: GameCardData) => {
    if (!isPlaying || feedback) return;
    
    const chosenStat = chosenCard.stats[activeStat];
    const otherStat = otherCard.stats[activeStat];
    
    if (chosenStat >= otherStat) {
      // Correct!
      setFeedback('correct');
      setScore(s => s + 1);
      
      // Flash green and load next round
      setTimeout(() => {
        setFeedback(null);
        getNewRound();
        setTimeLeft(maxTime);
        lastUpdateRef.current = performance.now();
      }, 500);
    } else {
      // Wrong!
      handleGameOver();
    }
  };

  const StatIcon = STAT_CONFIG[activeStat].icon;

  return (
    <div className="min-h-screen relative flex flex-col overflow-x-hidden" style={{ background: "rgb(4,3,8)", fontFamily: "'DM Sans','system-ui',sans-serif" }}>
      <AuroraBackground />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)" }} />
      <Nav />
      
      {/* Timer Bar */}
      {(isPlaying || isGameOver) && (
        <div className="w-full h-1.5 bg-slate-900 absolute top-[60px] left-0 z-40">
          <motion.div 
            className={`h-full ${timeLeft < 1000 ? 'bg-red-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.max(0, (timeLeft / maxTime) * 100)}%` }}
            layout
          />
        </div>
      )}
      
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        
        {!isPlaying && !isGameOver && (
          <div className="text-center max-w-lg animate-in fade-in slide-in-from-bottom-4">
            <Brain className="w-16 h-16 text-amber-500 mx-auto mb-6" />
            <h1 className="text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-700 mb-6" style={{ fontFamily: "'Cinzel', serif" }}>
              Tavern Trivia
            </h1>
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-center text-sm text-slate-300">
              <p className="font-bold text-white uppercase tracking-widest mb-2">Stat Higher-or-Lower</p>
              <p>Two cards appear on screen. You have <strong className="text-amber-500">3 seconds</strong> to guess who has the higher stat!</p>
              <p className="mt-4 text-amber-500/80 italic text-xs uppercase tracking-widest">Build the longest correct streak!</p>
            </div>
            
            <button 
              onClick={startGame}
              className="px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-lg transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-3 mx-auto"
              style={{ background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "#1c1008", boxShadow: "0 0 40px rgba(245,158,11,0.4)" }}
            >
              <Play className="w-6 h-6 fill-current" /> Start Game
            </button>
          </div>
        )}
        
        {isGameOver && (
          <div className="text-center animate-in zoom-in duration-500 z-50 bg-black/60 backdrop-blur-xl p-12 rounded-3xl border border-white/10">
            <Trophy className="w-20 h-20 text-amber-500 mx-auto mb-4 drop-shadow-[0_0_40px_rgba(245,158,11,0.8)]" />
            <h2 className="text-2xl font-bold text-slate-300 mb-2 font-mono uppercase tracking-widest">Streak Broken!</h2>
            <h1 className="text-7xl font-black uppercase text-white mb-2" style={{ fontFamily: "'Cinzel', serif" }}>
              {score}
            </h1>
            <p className="text-amber-500/70 font-mono uppercase tracking-widest text-xs mb-8">High Score: {highScore}</p>
            <button 
              onClick={startGame}
              className="px-8 py-3 rounded-xl font-black uppercase tracking-[0.2em] text-sm flex items-center gap-3 mx-auto transition-all hover:scale-105"
              style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white" }}
            >
              <RefreshCw className="w-4 h-4" /> Play Again
            </button>
          </div>
        )}
        
        {isPlaying && cardA && cardB && (
          <div className="w-full max-w-5xl flex flex-col items-center flex-1 py-4">
            
            {/* Header HUD */}
            <div className="w-full flex justify-between items-center px-4 md:px-8 mb-6">
              <div className="flex flex-col items-center bg-black/40 px-6 py-2 rounded-xl border border-white/10 backdrop-blur-md">
                <span className="text-[10px] uppercase tracking-widest text-amber-500 font-bold mb-1">Streak</span>
                <span className="text-3xl font-black text-white font-mono leading-none">{score}</span>
              </div>
              
              <div className="flex flex-col items-center">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Time Left</span>
                <span className={`text-3xl font-black font-mono leading-none ${timeLeft < 1000 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                  {(timeLeft / 1000).toFixed(1)}s
                </span>
              </div>
            </div>
            
            {/* Question */}
            <motion.div 
              key={activeStat + score}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h2 className="text-lg md:text-2xl text-slate-300 font-mono uppercase tracking-widest">
                Who has higher <strong className={`font-black ${STAT_CONFIG[activeStat].color}`}>{STAT_CONFIG[activeStat].label}</strong>?
              </h2>
              <StatIcon className={`w-10 h-10 mx-auto mt-4 ${STAT_CONFIG[activeStat].color}`} />
            </motion.div>
            
            {/* Cards */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 w-full max-w-4xl mx-auto px-4 relative">
              
              {/* VS Badge */}
              <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-black border border-white/20 items-center justify-center z-20 shadow-2xl backdrop-blur-xl">
                <span className="font-black italic text-xl text-slate-400">VS</span>
              </div>
              
              <motion.div 
                key={cardA.id + "A"}
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => handleChoice(cardA, cardB)}
                className={`relative cursor-pointer transition-transform hover:scale-105 w-full sm:w-1/2 max-w-[280px] ${feedback ? 'pointer-events-none' : ''}`}
              >
                <GameCard card={cardA} onCardClick={() => {}} />
                {feedback && (
                  <div className={`absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm border-4 ${cardA.stats[activeStat] >= cardB.stats[activeStat] ? 'border-green-500' : 'border-red-500'}`}>
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-white mb-2">{STAT_CONFIG[activeStat].label}</span>
                      <span className={`text-5xl font-black ${cardA.stats[activeStat] >= cardB.stats[activeStat] ? 'text-green-500' : 'text-red-500'}`}>
                        {cardA.stats[activeStat]}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
              
              <motion.div 
                key={cardB.id + "B"}
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                onClick={() => handleChoice(cardB, cardA)}
                className={`relative cursor-pointer transition-transform hover:scale-105 w-full sm:w-1/2 max-w-[280px] ${feedback ? 'pointer-events-none' : ''}`}
              >
                <GameCard card={cardB} onCardClick={() => {}} />
                {feedback && (
                  <div className={`absolute inset-0 z-50 flex items-center justify-center rounded-2xl bg-black/60 backdrop-blur-sm border-4 ${cardB.stats[activeStat] >= cardA.stats[activeStat] ? 'border-green-500' : 'border-red-500'}`}>
                    <div className="flex flex-col items-center">
                      <span className="text-xl font-bold text-white mb-2">{STAT_CONFIG[activeStat].label}</span>
                      <span className={`text-5xl font-black ${cardB.stats[activeStat] >= cardA.stats[activeStat] ? 'text-green-500' : 'text-red-500'}`}>
                        {cardB.stats[activeStat]}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
              
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
}
