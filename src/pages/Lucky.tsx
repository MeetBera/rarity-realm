import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameCard, GameCardData } from "@/components/GameCard";
import { CardModal } from "@/components/CardModal";
import cardsData from "@/data/cards.json";
import { Nav } from "@/components/Nav";
import { Sparkles, Dices, Gift } from "lucide-react";

// Helper for weighted random selection
const getCardPower = (card: GameCardData) => {
  const { hp, attack, defense, mana, intelligence, speed } = card.stats;
  return hp + attack + defense + mana + intelligence + speed;
};

const getRandomCard = () => {
  const weights = cardsData.map((card) => {
    const power = getCardPower(card as GameCardData);
    return { card, weight: 100000 / (power || 1) }; // Higher power = lower weight
  });
  
  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const item of weights) {
    if (random < item.weight) {
      return item.card as GameCardData;
    }
    random -= item.weight;
  }
  return cardsData[0] as GameCardData;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  BACKGROUND CANVAS — similar to Index for consistency                       */
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

export default function Lucky() {
  const [spinning, setSpinning] = useState(false);
  const [resultCard, setResultCard] = useState<GameCardData | null>(null);
  const [displayCard, setDisplayCard] = useState<GameCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSpin = () => {
    if (spinning) return;
    setSpinning(true);
    setResultCard(null);
    
    // Animate fast swapping
    let spins = 0;
    const maxSpins = 20;
    const intervalTime = 100;
    
    const interval = setInterval(() => {
      setDisplayCard(cardsData[Math.floor(Math.random() * cardsData.length)] as GameCardData);
      spins++;
      
      if (spins >= maxSpins) {
        clearInterval(interval);
        const finalCard = getRandomCard();
        setDisplayCard(finalCard);
        setResultCard(finalCard);
        setSpinning(false);
      }
    }, intervalTime);
  };

  return (
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "rgb(4,3,8)", fontFamily: "'DM Sans','system-ui',sans-serif" }}>
      <AuroraBackground />
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "28px 28px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)" }} />
      <div className="fixed inset-0 z-0 pointer-events-none opacity-[0.018]" style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)" }} />
      
      <Nav />
      
      <main className="relative z-10 container mx-auto px-4 py-20 flex flex-col items-center">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700" style={{ fontFamily: "'Cinzel', serif" }}>
              The Lucky Tavern
            </h1>
            <Sparkles className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-slate-400 font-mono uppercase tracking-widest text-sm max-w-lg mx-auto">
            Spin to summon a random warrior. Stronger characters are rarer. Test your fate!
          </p>
        </motion.div>
        
        <div className="w-full max-w-sm mx-auto mb-12 flex flex-col items-center">
          <div className="h-[400px] w-full flex items-center justify-center mb-8 relative">
            <AnimatePresence mode="wait">
              {displayCard ? (
                <motion.div 
                  key={displayCard.id + (spinning ? '-spin' : '-final')}
                  initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                  exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                  transition={{ duration: spinning ? 0.1 : 0.5 }}
                >
                  <GameCard card={displayCard} onCardClick={() => !spinning && setIsModalOpen(true)} />
                </motion.div>
              ) : (
                <div className="w-full h-full border-2 border-dashed border-slate-700 rounded-xl flex flex-col items-center justify-center text-slate-500">
                  <Gift className="w-16 h-16 mb-4 opacity-50" />
                  <span className="font-mono uppercase tracking-widest">Awaiting Summon</span>
                </div>
              )}
            </AnimatePresence>
            
            {resultCard && !spinning && (
              <motion.div 
                className="absolute inset-0 pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ duration: 1 }}
              >
                <div className="w-full h-full shadow-[0_0_100px_rgba(245,158,11,0.5)] rounded-xl" />
              </motion.div>
            )}
          </div>
          
          <button 
            onClick={handleSpin}
            disabled={spinning}
            className="group relative px-12 py-4 rounded-xl font-black uppercase tracking-[0.2em] text-lg overflow-hidden transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            style={{
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#1c1008",
              boxShadow: "0 0 40px rgba(245,158,11,0.4), 0 4px 12px rgba(0,0,0,0.5)",
            }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <span className="relative z-10 flex items-center gap-3">
              <Dices className="w-6 h-6" /> {spinning ? 'Summoning...' : 'Spin Now'}
            </span>
          </button>
        </div>
      </main>
      
      <CardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} card={resultCard} />
    </div>
  );
}
