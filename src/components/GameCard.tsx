import { useState } from "react";
import { cn } from "@/lib/utils";
import { Swords, Shield, Zap, Heart, Flame } from "lucide-react";
import { motion } from "framer-motion";

export type CardRarity = "common" | "rare" | "epic" | "legendary" | "mythical" | "hero";

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
    range: string;
    type: string;
  };
}

interface GameCardProps {
  card: GameCardData;
  onCardClick: (card: GameCardData) => void;
}

const rarityConfig: Record<CardRarity, {
  border: string;
  glow: string;
  badge: string;
  text: string;
  bgGradient: string;
}> = {
  common: {
    border: "border-slate-500/50",
    glow: "group-hover:shadow-slate-500/20",
    badge: "bg-slate-600 text-slate-100",
    text: "text-slate-300",
    bgGradient: "from-slate-500/10 to-transparent",
  },
  rare: {
    border: "border-blue-500/50",
    glow: "group-hover:shadow-blue-500/30",
    badge: "bg-blue-600 text-white",
    text: "text-blue-200",
    bgGradient: "from-blue-500/20 to-transparent",
  },
  epic: {
    border: "border-purple-500/60",
    glow: "group-hover:shadow-purple-500/40",
    badge: "bg-purple-600 text-white",
    text: "text-purple-200",
    bgGradient: "from-purple-500/20 to-transparent",
  },
  legendary: {
    border: "border-amber-500",
    glow: "group-hover:shadow-amber-500/50",
    badge: "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    text: "text-amber-200",
    bgGradient: "from-amber-500/20 to-transparent",
  },
  mythical: {
    border: "border-red-500",
    glow: "group-hover:shadow-red-500/60",
    badge: "bg-gradient-to-r from-red-600 to-rose-500 text-white animate-pulse",
    text: "text-red-200",
    bgGradient: "from-red-500/20 to-transparent",
  },
  hero: {
    border: "border-emerald-400",
    glow: "group-hover:shadow-emerald-400/50",
    badge: "bg-gradient-to-r from-emerald-400 to-cyan-400 text-black font-bold",
    text: "text-emerald-300",
    bgGradient: "from-emerald-400/20 to-transparent",
  }
};

export const GameCard = ({ card, onCardClick }: GameCardProps) => {
  const theme = rarityConfig[card.rarity];
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onCardClick(card)}
      className={cn(
        "group relative w-full aspect-[3/4.5] rounded-2xl cursor-pointer overflow-hidden transition-all duration-300",
        "bg-slate-950 border-[1px] flex flex-col", 
        theme.border,
        theme.glow,
        "hover:shadow-2xl"
      )}
    >
      <div className="relative flex-grow overflow-hidden bg-white"> 
        {/* Background Thematic Gradient Overlay */}
        <div className={cn("absolute inset-0 bg-gradient-to-b opacity-20 z-10 pointer-events-none", theme.bgGradient)} />
        
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 blur-[0.4px]"
        />

        {/* Top Actions & Badges - Layered over image */}
        <div className="absolute top-2 left-2 right-2 flex justify-between items-center z-20">
          <div className={cn(
            "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest shadow-lg",
            theme.badge
          )}>
            {card.rarity}
          </div>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
            className="p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
          >
            <Heart 
              className={cn(
                "w-3.5 h-3.5 transition-colors", 
                isFavorite ? "fill-red-500 text-red-500" : "text-white"
              )} 
            />
          </button>
        </div>

        {/* Desktop Shine Effect */}
        <div className="hidden sm:block absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shine_1.5s_ease-in-out] pointer-events-none z-10" />
      </div>

      {/* 2. INFO & STATS AREA */}
      <div className="relative flex-none bg-slate-900/95 backdrop-blur-xl border-t border-white/10 p-3 sm:p-4">
        {/* Subtle Noise Texture */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />

        {/* Name & Class */}
        <div className="relative z-10 mb-3">
          <h3 className={cn(
            "font-black uppercase leading-tight truncate text-sm sm:text-base tracking-tight",
            theme.text
          )}>
            {card.name}
          </h3>
          <div className="flex items-center gap-1 mt-0.5">
            <Flame className="w-2.5 h-2.5 text-slate-500" />
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider">
              {card.stats.type} Class
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-3 gap-1 sm:gap-2">
          <StatBadge
            icon={<Swords className="w-3 h-3 text-red-500" />}
            value={card.stats.attack}
            label="ATK"
          />
          <StatBadge
            icon={<Shield className="w-3 h-3 text-blue-400" />}
            value={card.stats.defense}
            label="DEF"
          />
          <StatBadge
            icon={<Zap className="w-3 h-3 text-yellow-400" />}
            value={card.stats.total}
            label="PWR"
            highlight
          />
        </div>
      </div>
    </motion.div>
  );
};

const StatBadge = ({ icon, value, label, highlight }: { icon: any, value: number, label: string, highlight?: boolean }) => (
  <div className={cn(
    "flex flex-col items-center justify-center rounded-lg py-1 px-0.5 border transition-all",
    highlight 
      ? "bg-white/10 border-white/20 text-white shadow-inner" 
      : "bg-black/40 border-white/5 text-slate-300"
  )}>
    <div className="flex items-center gap-0.5 sm:gap-1 mb-0.5">
      {icon}
      <span className="text-[7px] sm:text-[8px] font-black opacity-60 leading-none">{label}</span>
    </div>
    <span className="text-[10px] sm:text-xs font-mono font-black leading-none">{value}</span>
  </div>
);