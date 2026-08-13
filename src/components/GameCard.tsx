import { useState, useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Swords, Shield, Zap, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

export type CardRarity = "common" | "rare" | "epic" | "legendary" | "mythical" | "divine";

export interface GameCardData {
  id: number;
  name: string;
  rarity: CardRarity;
  image: string;
  lore: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    mana: number;
    speed: number;
    intelligence: number;
    total: number;
    class: string;
    type: string;
  };
}

interface GameCardProps {
  card: GameCardData;
  onCardClick: (card: GameCardData) => void;
  index?: number; // Used for staggered entrance animations
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* RARITY CONFIG — Ultra-premium supernatural color palettes                   */
/* ─────────────────────────────────────────────────────────────────────────── */
const rarityConfig: Record<
  CardRarity,
  {
    border: string;
    glow: string;
    badge: string;
    text: string;
    bgGradient: string;
    accent: string;
    cardTint: string;
    divider: string;
    frameBorder: string;
    foil: string;
  }
> = {
  common: {
    border: "border-stone-500/40",
    glow: "rgba(168,162,158,0.4)",
    badge: "from-stone-600 to-stone-800 text-stone-200",
    text: "text-stone-300",
    bgGradient: "from-stone-500/20 to-transparent",
    accent: "#a8a29e",
    cardTint: "rgba(24,24,27,0.85)",
    divider: "rgba(168,162,158,0.3)",
    frameBorder: "rgba(168,162,158,0.4)",
    foil: "linear-gradient(115deg, transparent 20%, rgba(168,162,158,0.1) 45%, rgba(255,255,255,0.2) 50%, rgba(168,162,158,0.1) 55%, transparent 80%)",
  },
  rare: {
    border: "border-sky-500/50",
    glow: "rgba(14,165,233,0.5)",
    badge: "from-sky-500 to-blue-700 text-sky-50",
    text: "text-sky-200",
    bgGradient: "from-sky-500/30 to-transparent",
    accent: "#38bdf8",
    cardTint: "rgba(15,23,42,0.85)",
    divider: "rgba(56,189,248,0.3)",
    frameBorder: "rgba(56,189,248,0.5)",
    foil: "linear-gradient(115deg, transparent 20%, rgba(56,189,248,0.2) 45%, rgba(255,255,255,0.3) 50%, rgba(56,189,248,0.2) 55%, transparent 80%)",
  },
  epic: {
    border: "border-violet-500/60",
    glow: "rgba(139,92,246,0.6)",
    badge: "from-violet-500 to-purple-800 text-violet-50",
    text: "text-violet-200",
    bgGradient: "from-violet-500/30 to-transparent",
    accent: "#a78bfa",
    cardTint: "rgba(23,15,35,0.85)",
    divider: "rgba(167,139,250,0.3)",
    frameBorder: "rgba(167,139,250,0.5)",
    foil: "linear-gradient(115deg, transparent 20%, rgba(167,139,250,0.3) 45%, rgba(255,255,255,0.4) 50%, rgba(167,139,250,0.3) 55%, transparent 80%)",
  },
  legendary: {
    border: "border-amber-400/70",
    glow: "rgba(251,191,36,0.7)",
    badge: "from-amber-300 via-yellow-500 to-orange-600 text-yellow-950 font-bold",
    text: "text-amber-200",
    bgGradient: "from-amber-400/30 to-transparent",
    accent: "#fbbf24",
    cardTint: "rgba(30,20,5,0.85)",
    divider: "rgba(251,191,36,0.4)",
    frameBorder: "rgba(251,191,36,0.6)",
    foil: "linear-gradient(115deg, transparent 20%, rgba(251,191,36,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(251,191,36,0.4) 55%, transparent 80%)",
  },
  mythical: {
    border: "border-rose-500/70",
    glow: "rgba(244,63,94,0.7)",
    badge: "from-rose-400 via-red-500 to-rose-800 text-white font-bold",
    text: "text-rose-200",
    bgGradient: "from-rose-500/30 to-transparent",
    accent: "#fb7185",
    cardTint: "rgba(35,10,15,0.85)",
    divider: "rgba(251,113,133,0.4)",
    frameBorder: "rgba(251,113,133,0.6)",
    foil: "linear-gradient(115deg, transparent 20%, rgba(251,113,133,0.4) 45%, rgba(255,255,255,0.6) 50%, rgba(251,113,133,0.4) 55%, transparent 80%)",
  },
  divine: {
    border: "border-teal-300/80",
    glow: "rgba(45,212,191,0.8)",
    badge: "from-teal-200 via-emerald-400 to-teal-700 text-teal-950 font-black",
    text: "text-teal-200",
    bgGradient: "from-teal-300/30 to-transparent",
    accent: "#5eead4",
    cardTint: "rgba(5,25,25,0.85)",
    divider: "rgba(94,234,212,0.5)",
    frameBorder: "rgba(94,234,212,0.7)",
    foil: "linear-gradient(115deg, transparent 15%, rgba(94,234,212,0.5) 40%, rgba(255,255,255,0.8) 50%, rgba(94,234,212,0.5) 60%, transparent 85%)",
  },
};

/* ─── ORNATE FRAME ─── */
const OrnateFrame = ({ color, hovered }: { color: string; hovered: boolean }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none z-20 transition-opacity duration-500"
    style={{ opacity: hovered ? 1 : 0.6 }}
    preserveAspectRatio="none"
  >
    <rect x="6" y="6" width="calc(100% - 12px)" height="calc(100% - 12px)" rx="12" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" />
    <rect x="10" y="10" width="calc(100% - 20px)" height="calc(100% - 20px)" rx="8" fill="none" stroke={color} strokeWidth="0.5" strokeOpacity="0.2" />
    
    {/* Corner Embellishments */}
    <g fill={color} opacity={hovered ? "0.9" : "0.5"} className="transition-opacity duration-500">
      <path d="M6,20 L6,12 A6,6 0 0,1 12,6 L20,6 L12,12 Z" />
      <path d="Mcalc(100% - 6px),20 Lcalc(100% - 6px),12 A6,6 0 0,0 calc(100% - 12px),6 Lcalc(100% - 20px),6 Lcalc(100% - 12px),12 Z" />
      <path d="M6,calc(100% - 20px) L6,calc(100% - 12px) A6,6 0 0,0 12,calc(100% - 6px) L20,calc(100% - 6px) L12,calc(100% - 12px) Z" />
      <path d="Mcalc(100% - 6px),calc(100% - 20px) Lcalc(100% - 6px),calc(100% - 12px) A6,6 0 0,1 calc(100% - 12px),calc(100% - 6px) Lcalc(100% - 20px),calc(100% - 6px) Lcalc(100% - 12px),calc(100% - 12px) Z" />
    </g>
  </svg>
);

/* ─── STAT PLAQUE ─── */
const StatBadge = ({ icon, value, label, highlight, accent }: { icon: React.ReactNode; value: number; label: string; highlight?: boolean; accent: string }) => (
  <motion.div
    whileHover={{ y: -3, scale: 1.05, filter: "brightness(1.2)" }}
    className="relative flex flex-col items-center justify-center py-2 px-1 rounded-lg overflow-hidden group"
    style={{
      background: highlight ? `linear-gradient(145deg, ${accent}25, rgba(0,0,0,0.5))` : "rgba(0,0,0,0.4)",
      border: `1px solid ${highlight ? accent + "66" : "rgba(255,255,255,0.08)"}`,
      boxShadow: highlight ? `0 4px 12px ${accent}20, inset 0 1px 0 ${accent}40` : "inset 0 1px 0 rgba(255,255,255,0.05)",
    }}
  >
    {highlight && (
      <div className="absolute top-0 inset-x-0 h-[1px] opacity-70 group-hover:opacity-100 transition-opacity"
           style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }} />
    )}
    <div className="flex items-center gap-1 mb-1">
      <span className="opacity-90">{icon}</span>
      <span className="text-[8px] font-black uppercase tracking-[0.2em]" style={{ color: highlight ? accent : "rgba(255,255,255,0.5)" }}>
        {label}
      </span>
    </div>
    <span className="text-xs sm:text-sm font-black tracking-tight"
          style={{
            color: highlight ? "#fff" : "rgba(255,255,255,0.85)",
            textShadow: highlight ? `0 0 10px ${accent}` : "none",
            fontFamily: "monospace"
          }}>
      {value.toLocaleString()}
    </span>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* MAIN EXPORT                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export const GameCard = ({ card, onCardClick, index = 0 }: GameCardProps) => {
  const theme = rarityConfig[card.rarity] ?? rarityConfig.common;
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, delay: index * 0.1, type: "spring", bounce: 0.4 }}
      className="perspective-[1200px] w-full max-w-[320px] mx-auto"
    >
      <motion.div
        ref={cardRef}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onCardClick(card)}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "group relative w-full aspect-[3/4.2] rounded-2xl cursor-pointer flex flex-col border backdrop-blur-sm",
          theme.border
        )}
      >
        {/* ── IMAGE ZONE (Parallax Layer) ── */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden bg-white" style={{ transform: "translateZ(0)" }}>
          <motion.img
            src={ card.image}
            alt={card.name}
            className="w-full h-full object-contain object-center -translate-y-10 opacity-100 transition-opacity duration-300 group-hover:opacity-90"
          />
          
          {/* Base Dark Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent pointer-events-none" />
        </div>

       

        {/* ── ORNATE FRAME ── */}
        <OrnateFrame color={theme.accent} hovered={hovered} />

        {/* ── FLOATING UI ELEMENTS (Z-translated layer) ── */}
        <div className="relative flex-grow p-4 flex flex-col justify-between z-30 pointer-events-none" style={{ transform: "translateZ(30px)" }}>
          
          {/* Top Row: Rarity Badge */}
          <div className="flex justify-between items-start">
            <div className={cn(
              "px-3 py-1 rounded-sm shadow-xl backdrop-blur-md bg-gradient-to-br flex items-center gap-1.5 border",
              theme.badge,
              card.rarity === "divine" || card.rarity === "mythical" ? "border-white/30" : "border-black/20"
            )}>
              {(card.rarity === "divine" || card.rarity === "mythical" || card.rarity === "legendary") && (
                <Sparkles className="w-3 h-3" />
              )}
              <span className="text-[10px] uppercase tracking-[0.25em] leading-none mt-0.5">{card.rarity}</span>
            </div>
          </div>

          {/* Bottom Section: Name & Stats Plaque */}
          <div className="mt-auto pointer-events-auto">
            {/* Title & Type */}
            <div className="mb-2 px-1">
              <h3 
                className="font-black uppercase text-xl tracking-wide text-white mb-1"
                style={{ 
                  fontFamily: "system-ui, -apple-system, sans-serif",
                  textShadow: `0 4px 20px rgba(0,0,0,0.9), 0 0 12px ${theme.accent}10` 
                }}
              >
                {card.name}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-sm text-white/90">
                  {card.stats.class}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
                  {card.stats.type}
                </span>
              </div>
            </div>

            {/* Glassmorphism Stat Panel */}
            <div 
              className="rounded-xl p-3 backdrop-blur-xl border border-white/10 relative overflow-hidden shadow-2xl"
              style={{ background: `linear-gradient(135deg, ${theme.cardTint} 0%, rgba(10,10,10,0.95) 100%)` }}
            >
              {/* Internal glowing accent line */}
              <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}80, transparent)` }} />
              
              {/* Stat Grid */}
              <div className="grid grid-cols-3 gap-2">
                <StatBadge icon={<Swords className="w-3.5 h-3.5 text-rose-400" />} value={card.stats.attack} label="ATK" accent={theme.accent} />
                <StatBadge icon={<Shield className="w-3.5 h-3.5 text-sky-400" />} value={card.stats.defense} label="DEF" accent={theme.accent} />
                <StatBadge icon={<Zap className="w-3.5 h-3.5 text-amber-400" />} value={card.stats.total} label="PWR" highlight accent={theme.accent} />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GameCard;