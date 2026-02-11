import { useState, useMemo, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Swords,
  Shield,
  Zap,
  Brain,
  Activity,
  Move,
  Sun,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Update the path to your actual GameCardData type
// import { GameCardData } from "./GameCard"; 

export const CardModal = ({ isOpen, onClose, card }: any) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentSlide(0);
      setFullscreenImage(false);
    }
  }, [isOpen]);

  const totalPower = useMemo(() => {
    if (!card) return 0;
    const { hp, attack, defense, mana, intelligence, speed } = card.stats;
    return hp + attack + defense + mana + intelligence + speed;
  }, [card]);

  if (!card) return null;

  const rarityKey = card.rarity.toLowerCase() as keyof typeof rarityConfig;
  const theme = rarityConfig[rarityKey] ?? rarityConfig.common;

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % 2);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + 2) % 2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="p-0 border-none bg-transparent shadow-none max-w-5xl w-full md:w-[95vw] overflow-hidden focus:outline-none"
        onInteractOutside={(e) => {
          if (fullscreenImage) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">{card.name} Details</DialogTitle>

        <div className={cn(
          "relative w-full rounded-[2rem] border bg-slate-950/95 backdrop-blur-2xl transition-all duration-500 overflow-hidden shadow-2xl",
          theme.border,
          theme.shadow
        )}>
          {/* Animated Background Gradients */}
          <div className={cn(
            "absolute inset-0 opacity-10 bg-gradient-to-br pointer-events-none animate-pulse mix-blend-screen",
            theme.gradient
          )} />
          
          {/* MAIN CLOSE BUTTON */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-[70] text-white/50 hover:text-white hover:bg-white/10 rounded-full bg-slate-900/50 backdrop-blur-md"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </Button>

          {/* Desktop Navigation Arrows */}
          <div className="md:block">
            <Button 
              variant="ghost" size="icon" onClick={prevSlide}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-[60] text-white/20 hover:text-white hover:bg-white/5 h-12 w-12 rounded-full"
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button 
              variant="ghost" size="icon" onClick={nextSlide}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-[60] text-white/20 hover:text-white hover:bg-white/5 h-12 w-12 rounded-full"
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </div>

          <div className="relative w-full h-[90vh] md:h-[650px] max-h-[90vh] flex flex-col">
            <AnimatePresence mode="wait">
              {currentSlide === 0 ? (
                <motion.div
                  key="slide-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col md:flex-row h-full"
                >
                  {/* --- LEFT SIDE: IMAGE HERO --- */}
                  <div className="w-full md:w-[55%] h-[45vh] md:h-full relative flex items-center justify-center p-6 md:p-10">
                     {/* Glow behind image */}
                     <div className={cn(
                        "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full blur-[100px] opacity-30 pointer-events-none",
                        theme.accent
                      )} />
                      
                      <div 
                        onClick={() => setFullscreenImage(true)}
                        className="relative w-full h-full flex items-center justify-center cursor-zoom-in group z-10"
                      >
                         <img
                          src={card.image}
                          alt={card.name}
                          className="max-w-full max-h-full object-contain drop-shadow-2xl transition-transform duration-500 md:group-hover:scale-110"
                        />
                      </div>
                  </div>

                  {/* --- RIGHT SIDE: INFO --- */}
                  <div className="w-full md:w-[45%] h-full flex flex-col justify-center p-6 md:p-12 md:pl-0 space-y-6 md:space-y-8 relative z-20 bg-gradient-to-t md:bg-gradient-to-l from-slate-950/80 to-transparent">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={cn(
                          "px-3 py-1 rounded-sm text-xs font-black uppercase tracking-widest skew-x-[-12deg]",
                          theme.accent, "text-black"
                        )}>
                          {card.rarity}
                        </span>
                        <div className="h-px flex-1 bg-white/10" />
                        <span className="text-slate-500 font-mono text-xs tracking-widest uppercase">
                          {card.stats.type}
                        </span>
                      </div>

                      <h2 className="text-4xl md:text-6xl font-black uppercase text-white leading-[0.9] tracking-tighter drop-shadow-lg">
                        {card.name}
                      </h2>
                    </div>

                    <div className="space-y-3">
                      <QuickStat label="Range" value={card.stats.range} icon={<Move className="w-4 h-4" />} />
                      <QuickStat label="Power" value={totalPower} icon={<Zap className="w-4 h-4" />} isHighlight />
                    </div>
                    
                    {/* Pagination Indicator */}
                    <div className="pt-4 flex gap-2">
                       <div className={cn("h-1 w-12 rounded-full", theme.accent)} />
                       <button onClick={nextSlide} className="h-1 w-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors" />
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="slide-stats"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full h-full p-4 md:p-8 overflow-y-auto"
                >
                  <div className="max-w-3xl mx-auto space-y-10">
                     <div className="text-center space-y-4">
                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight">Attributes & Lore</h3>
                        <div className={cn("h-1 w-20 mx-auto rounded-full", theme.accent)} />
                     </div>

                     <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                        <div className="space-y-5">
                           <div className="flex items-center gap-2 text-slate-400 uppercase text-xs font-bold tracking-widest mb-4">
                              <Brain className="w-4 h-4" /> Story
                           </div>
                           <p className="text-slate-300 font-mono italic text-sm md:text-base leading-relaxed border-l-2 border-white/10 pl-4">
                            "{card.lore}"
                           </p>
                        </div>

                        <div className="space-y-4">
                          <StatRow label="Health" value={card.stats.hp} icon={<Activity className="w-3 h-3"/>} max={10000} color={theme.accent} />
                          <StatRow label="Attack" value={card.stats.attack} icon={<Swords className="w-3 h-3"/>} max={2000} color={theme.accent} />
                          <StatRow label="Defense" value={card.stats.defense} icon={<Shield className="w-3 h-3"/>} max={2000} color={theme.accent} />
                          <StatRow label="Mana" value={card.stats.mana} icon={<Sun className="w-3 h-3"/>} max={1000} color={theme.accent} />
                          <StatRow label="Intelligence" value={card.stats.intelligence} icon={<Brain className="w-3 h-3"/>} max={1000} color={theme.accent} />
                          <StatRow label="Speed" value={card.stats.speed} icon={<Zap className="w-3 h-3"/>} max={500} color={theme.accent} />
                        </div>
                     </div>
                     
                     <div className="flex justify-center pt-8">
                        <button onClick={prevSlide} className="text-xs font-bold text-slate-500 hover:text-white uppercase tracking-widest flex items-center gap-2">
                           <ChevronLeft className="w-4 h-4" /> Back to Card
                        </button>
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* FULLSCREEN OVERLAY */}
        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out backdrop-blur-sm"
              onClick={() => setFullscreenImage(false)}
            >
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                src={card.image}
                className="max-w-full max-h-[90vh] object-contain drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-white bg-white/10 rounded-full hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenImage(false);
                }}
              >
                <X className="w-8 h-8" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

const rarityConfig = {
  common: { text: "text-slate-300", border: "border-slate-500/50", bg: "bg-slate-500/10", shadow: "shadow-slate-500/10", gradient: "from-slate-500/10 to-transparent", accent: "bg-slate-400" },
  rare: { text: "text-blue-400", border: "border-blue-500/50", bg: "bg-blue-500/10", shadow: "shadow-blue-500/20", gradient: "from-blue-500/20 to-transparent", accent: "bg-blue-500" },
  epic: { text: "text-purple-400", border: "border-purple-500/50", bg: "bg-purple-500/10", shadow: "shadow-purple-500/20", gradient: "from-purple-500/20 to-transparent", accent: "bg-purple-500" },
  legendary: { text: "text-amber-400", border: "border-amber-500/50", bg: "bg-amber-500/10", shadow: "shadow-amber-500/20", gradient: "from-amber-500/20 to-transparent", accent: "bg-amber-500" },
  mythical: { text: "text-red-500", border: "border-red-500/50", bg: "bg-red-500/10", shadow: "shadow-red-500/20", gradient: "from-red-500/20 to-transparent", accent: "bg-red-500" },
} as const;

const QuickStat = ({ label, value, icon, isHighlight }: any) => (
  <div className={cn(
    "p-4 rounded-xl flex items-center justify-between border transition-all hover:bg-white/5",
    isHighlight ? "bg-white/5 border-white/20 shadow-lg" : "bg-transparent border-white/10"
  )}>
    <div className="flex items-center gap-3 text-slate-400 text-[10px] uppercase font-black tracking-widest">
      <div className="p-1.5 rounded-md bg-white/5">{icon}</div> {label}
    </div>
    <span className="text-xl md:text-2xl font-black font-mono text-white tracking-tighter">{value}</span>
  </div>
);

const StatRow = ({ label, value, icon, max, color }: any) => (
  <div className="space-y-2 group">
    <div className="flex justify-between items-end px-1">
      <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-500 tracking-wider group-hover:text-slate-300 transition-colors">
        {icon} {label}
      </div>
      <span className="text-sm font-mono font-bold text-white">{value}</span>
    </div>
    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-white/5 relative">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        transition={{ duration: 1, ease: "circOut" }}
        className={cn("h-full absolute left-0 top-0", color)}
      />
      {/* Glossy overlay on bar */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
    </div>
  </div>
);