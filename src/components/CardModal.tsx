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
        className="p-2 border-none bg-transparent shadow-none max-w-4xl w-full md:w-[95vw] overflow-hidden"
        onInteractOutside={(e) => {
          if (fullscreenImage) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">{card.name} Details</DialogTitle>

        <div className={cn(
          "relative w-full rounded-[2rem] border-2 bg-slate-950/95 backdrop-blur-2xl transition-all duration-500 max-h-[92vh] overflow-y-auto scrollbar-hide",
          theme.border,
          theme.shadow
        )}>
          {/* Animated Background Gradients */}
          <div className={cn(
            "absolute inset-0 opacity-20 bg-gradient-to-br pointer-events-none animate-pulse",
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
          <div className="hidden md:block">
            <Button 
              variant="ghost" size="icon" onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-[60] text-white/20 hover:text-white h-12 w-12"
            >
              <ChevronLeft className="h-10 w-10" />
            </Button>
            <Button 
              variant="ghost" size="icon" onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-[60] text-white/20 hover:text-white h-12 w-12"
            >
              <ChevronRight className="h-10 w-10" />
            </Button>
          </div>

          <div className="relative p-5 md:p-10">
            <AnimatePresence mode="wait">
              {currentSlide === 0 ? (
                <motion.div
                  key="slide-info"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="flex flex-col md:flex-row gap-6 md:gap-10 items-center"
                >
                  {/* Image Container */}
                  <div 
                    onClick={() => setFullscreenImage(true)}
                    className="group relative w-full md:w-2/5 cursor-zoom-in aspect-[4/5] md:aspect-[3/4] max-h-[45vh] md:max-h-none"
                  >
                    <div className={cn(
                      "absolute -inset-1 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-opacity",
                      theme.accent
                    )} />
                    <div className={cn(
                      "relative h-full w-full rounded-2xl overflow-hidden border bg-slate-900/50",
                      theme.border
                    )}>
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-contain p-4 transition-transform duration-700 md:group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Header Info */}
                  <div className="w-full md:w-3/5 space-y-6">
                    <div>
                      <h2 className="text-3xl md:text-6xl font-black uppercase text-white leading-none">
                        {card.name}
                      </h2>
                      <div className="flex flex-wrap gap-2 mt-3 items-center">
                        <span className={cn(
                          "px-3 py-0.5 rounded-sm text-[10px] md:text-xs font-black uppercase skew-x-[-12deg]",
                          theme.accent, "text-black"
                        )}>
                          {card.rarity}
                        </span>
                        <span className="text-slate-500 font-mono text-[10px] md:text-xs tracking-widest uppercase">
                          // {card.stats.type} CLASS
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <QuickStat label="Type" value={card.stats.range} icon={<Move className="w-4 h-4" />} />
                      <QuickStat label="Combat Rating" value={totalPower} icon={<Zap className="w-4 h-4" />} isHighlight />
                    </div>
                    
                    {/* Mobile Only Hint */}
                    <p className="md:hidden text-center text-slate-500 text-[10px] uppercase tracking-widest animate-pulse">
                      Tap dots below for stats
                    </p>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="slide-stats"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="grid md:grid-cols-2 gap-8"
                >
                  <div className="space-y-4">
                    <div className="inline-block px-3 py-1 bg-white/5 border-l-4 border-white/20">
                       <h3 className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Lore</h3>
                    </div>
                    <p className="text-sm md:text-lg text-slate-300 font-mono italic leading-relaxed">
                      "{card.lore}"
                    </p>
                  </div>

                  <div className=" grid grid-cols-1 gap-3 md:gap-4">
                    <StatRow label="Health" value={card.stats.hp} icon={<Activity className="w-3 h-3"/>} max={10000} />
                    <StatRow label="Attack" value={card.stats.attack} icon={<Swords className="w-3 h-3"/>} max={2000} />
                    <StatRow label="Defense" value={card.stats.defense} icon={<Shield className="w-3 h-3"/>} max={2000} />
                    <StatRow label="Mana" value={card.stats.mana} icon={<Sun className="w-3 h-3"/>} max={1000} />
                    <StatRow label="Intelligence" value={card.stats.intelligence} icon={<Brain className="w-3 h-3"/>} max={500} />
                    <StatRow label="Speed" value={card.stats.speed} icon={<Zap className="w-3 h-3"/>} max={1000} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pagination dots - Made larger for touch */}
            <div className="mt-8 md:mt-10 flex justify-center gap-4">
              {[0, 1].map((i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={cn(
                    "h-2 transition-all duration-300 rounded-full",
                    currentSlide === i ? cn("w-10", theme.accent) : "w-5 bg-slate-800"
                  )}
                />
              ))}
            </div>
          </div>
        </div>

        {/* FULLSCREEN OVERLAY */}
        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
              onClick={() => setFullscreenImage(false)}
            >
              <motion.img
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                src={card.image}
                className="max-w-full max-h-[80vh] object-contain"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6 text-white bg-white/10 rounded-full"
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
  common: { text: "text-slate-300", border: "border-slate-500", bg: "bg-slate-500/10", shadow: "shadow-slate-500/20", gradient: "from-slate-500/20 to-slate-900/40", accent: "bg-slate-500" },
  rare: { text: "text-blue-400", border: "border-blue-500", bg: "bg-blue-500/10", shadow: "shadow-blue-500/30", gradient: "from-blue-500/20 to-blue-900/40", accent: "bg-blue-500" },
  epic: { text: "text-purple-400", border: "border-purple-500", bg: "bg-purple-500/10", shadow: "shadow-purple-500/30", gradient: "from-purple-500/20 to-purple-900/40", accent: "bg-purple-500" },
  legendary: { text: "text-amber-400", border: "border-amber-500", bg: "bg-amber-500/10", shadow: "shadow-amber-500/40", gradient: "from-amber-500/20 to-amber-900/40", accent: "bg-amber-500" },
  mythical: { text: "text-red-500", border: "border-red-500", bg: "bg-red-500/10", shadow: "shadow-red-500/50", gradient: "from-red-500/20 to-red-900/40", accent: "bg-red-500" },
} as const;

const QuickStat = ({ label, value, icon, isHighlight }: any) => (
  <div className={cn(
    "p-3 md:p-4 rounded-xl flex items-center justify-between border transition-colors",
    isHighlight ? "bg-white/10 border-white/20" : "bg-black/20 border-white/5"
  )}>
    <div className="flex items-center gap-2 md:gap-3 text-slate-400 text-[10px] md:text-xs uppercase font-black tracking-widest">
      <div className="p-1.5 md:p-2 rounded-lg bg-white/5">{icon}</div> {label}
    </div>
    <span className="text-xl md:text-2xl font-black font-mono text-white">{value}</span>
  </div>
);

const StatRow = ({ label, value, icon, max }: any) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-end px-1">
      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500 tracking-tighter">
        {icon} {label}
      </div>
      <span className="text-xs md:text-sm font-mono font-bold text-white">{value}</span>
    </div>
    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${(value / max) * 100}%` }}
        className="h-full bg-gradient-to-r from-white/20 to-white/60"
      />
    </div>
  </div>
);