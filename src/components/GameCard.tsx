import { useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Swords, Shield, Zap, Heart, Flame } from "lucide-react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export type CardRarity = "common" | "rare" | "epic" | "legendary" | "mythical" | "divine";

export interface GameCardData {
  id: number;
  name: string;
  rarity: CardRarity;
  image: string;
  thumbnail?: string; // <-- Added thumbnail property
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
}

/* ─────────────────────────────────────────────────────────────────────────── */
/* RARITY CONFIG — ink-on-paper luxury meets supernatural                     */
/* ─────────────────────────────────────────────────────────────────────────── */
const rarityConfig: Record<CardRarity, {
  border: string; glow: string; badge: string; text: string; bgGradient: string;
  metal: string; metalDark: string; metalLight: string; accent: string;
  cardTint: string; nameColor: string; waxSeal: string; typeLabel: string;
  divider: string; frameBorder: string;
}> = {
  common: {
    border: "border-stone-600/60", glow: "group-hover:shadow-stone-400/20",
    badge: "bg-stone-600 text-stone-100", text: "text-stone-300",
    bgGradient: "from-stone-500/15 to-transparent",
    metal: "#a8a29e", metalDark: "#57534e", metalLight: "#d6d3d1",
    accent: "#a8a29e", cardTint: "rgba(28,25,23,0.96)",
    nameColor: "#d6d3d1", waxSeal: "#78716c", typeLabel: "#78716c",
    divider: "rgba(168,162,158,0.2)", frameBorder: "rgba(168,162,158,0.25)",
  },
  rare: {
    border: "border-sky-500/50", glow: "group-hover:shadow-sky-400/30",
    badge: "bg-sky-600 text-white", text: "text-sky-200",
    bgGradient: "from-sky-600/20 to-transparent",
    metal: "#38bdf8", metalDark: "#0369a1", metalLight: "#7dd3fc",
    accent: "#38bdf8", cardTint: "rgba(7,18,32,0.97)",
    nameColor: "#bae6fd", waxSeal: "#0284c7", typeLabel: "#38bdf8",
    divider: "rgba(56,189,248,0.2)", frameBorder: "rgba(56,189,248,0.25)",
  },
  epic: {
    border: "border-violet-500", glow: "group-hover:shadow-violet-500/40",
    badge: "bg-violet-700 text-white", text: "text-violet-200",
    bgGradient: "from-violet-600/20 to-transparent",
    metal: "#8b5cf6", metalDark: "#5b21b6", metalLight: "#c4b5fd",
    accent: "#8b5cf6", cardTint: "rgba(13,8,28,0.97)",
    nameColor: "#ddd6fe", waxSeal: "#7c3aed", typeLabel: "#8b5cf6",
    divider: "rgba(139,92,246,0.25)", frameBorder: "rgba(139,92,246,0.3)",
  },
  legendary: {
    border: "border-yellow-500", glow: "group-hover:shadow-yellow-400/50",
    badge: "bg-gradient-to-r from-yellow-700 to-amber-400 text-white", text: "text-yellow-200",
    bgGradient: "from-yellow-500/20 to-transparent",
    metal: "#eab308", metalDark: "#92400e", metalLight: "#fde68a",
    accent: "#f59e0b", cardTint: "rgba(20,14,4,0.97)",
    nameColor: "#fde68a", waxSeal: "#d97706", typeLabel: "#eab308",
    divider: "rgba(234,179,8,0.3)", frameBorder: "rgba(234,179,8,0.35)",
  },
  mythical: {
    border: "border-rose-500/70", glow: "group-hover:shadow-rose-500/50",
    badge: "bg-gradient-to-r from-rose-600 to-red-500 text-white", text: "text-rose-200",
    bgGradient: "from-rose-600/25 to-transparent",
    metal: "#f43f5e", metalDark: "#9f1239", metalLight: "#fda4af",
    accent: "#f43f5e", cardTint: "rgba(22,4,8,0.98)",
    nameColor: "#fecdd3", waxSeal: "#e11d48", typeLabel: "#f43f5e",
    divider: "rgba(244,63,94,0.3)", frameBorder: "rgba(244,63,94,0.35)",
  },
  divine: {
    border: "border-teal-400/70", glow: "group-hover:shadow-teal-400/50",
    badge: "bg-gradient-to-r from-teal-400 to-emerald-400 text-black font-bold", text: "text-teal-200",
    bgGradient: "from-teal-400/20 to-transparent",
    metal: "#2dd4bf", metalDark: "#0f766e", metalLight: "#99f6e4",
    accent: "#2dd4bf", cardTint: "rgba(4,20,18,0.97)",
    nameColor: "#ccfbf1", waxSeal: "#0d9488", typeLabel: "#2dd4bf",
    divider: "rgba(45,212,191,0.25)", frameBorder: "rgba(45,212,191,0.3)",
  },
};

/* ─── ORNATE FRAME BORDER SVG ─── */
const OrnateFrame = ({ color, hovered }: { color: string; hovered: boolean }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none z-20"
    style={{ opacity: hovered ? 1 : 0.45, transition: "opacity 0.4s ease" }}
    preserveAspectRatio="none"
  >
    {/* Outer rect */}
    <rect x="4" y="4" width="calc(100% - 8px)" height="calc(100% - 8px)"
      rx="14" fill="none" stroke={color} strokeWidth="0.75" strokeOpacity="0.5" />
    {/* Inner rect */}
    <rect x="8" y="8" width="calc(100% - 16px)" height="calc(100% - 16px)"
      rx="11" fill="none" stroke={color} strokeWidth="0.4" strokeOpacity="0.3" />
    {/* Corner diamonds TL */}
    <polygon points="4,14 10,8 16,14 10,20" fill={color} opacity="0.7" />
    {/* Corner diamonds TR */}
    <polygon points="calc(100% - 4px),14 calc(100% - 10px),8 calc(100% - 16px),14 calc(100% - 10px),20" fill={color} opacity="0.7" />
    {/* Corner diamonds BL */}
    <polygon points="4,calc(100% - 14px) 10,calc(100% - 8px) 16,calc(100% - 14px) 10,calc(100% - 20px)" fill={color} opacity="0.7" />
    {/* Corner diamonds BR */}
    <polygon points="calc(100% - 4px),calc(100% - 14px) calc(100% - 10px),calc(100% - 8px) calc(100% - 16px),calc(100% - 14px) calc(100% - 10px),calc(100% - 20px)" fill={color} opacity="0.7" />
  </svg>
);

/* ─── WAX SEAL badge ─── */
const WaxSeal = ({ rarity, color, badge }: { rarity: string; color: string; badge: string }) => (
  <div className="relative flex items-center">
    <div
      className={cn(
        "relative px-2.5 py-0.5 text-[9px] font-black uppercase tracking-[0.25em] rounded-sm overflow-hidden",
        badge
      )}
      style={{ boxShadow: `0 2px 12px ${color}55, inset 0 1px 0 rgba(255,255,255,0.15)` }}
    >
      {/* Foil-stamp sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)" }}
      />
      {rarity}
    </div>
  </div>
);

/* ─── STAT PLAQUE ─── */
const StatBadge = ({
  icon, value, label, highlight, accent,
}: { icon: any; value: number; label: string; highlight?: boolean; accent: string }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.04 }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    className="relative flex flex-col items-center justify-center py-1.5 px-1 overflow-hidden"
    style={{
      background: highlight
        ? `linear-gradient(160deg, ${accent}22, ${accent}0a)`
        : "rgba(0,0,0,0.35)",
      border: `1px solid ${highlight ? accent + "44" : "rgba(255,255,255,0.07)"}`,
      borderRadius: "10px",
      boxShadow: highlight ? `0 0 18px ${accent}22, inset 0 1px 0 ${accent}33` : "none",
    }}
  >
    {/* Top micro-line on highlight */}
    {highlight && (
      <div
        className="absolute top-0 inset-x-0 h-px"
        style={{ background: `linear-gradient(to right, transparent, ${accent}bb, transparent)` }}
      />
    )}
    {/* Engraved look */}
    <div className="flex items-center gap-0.5 mb-0.5">
      <span className="opacity-80">{icon}</span>
      <span
        className="text-[7px] font-black uppercase tracking-[0.2em] leading-none"
        style={{ color: highlight ? accent : "rgba(255,255,255,0.35)" }}
      >
        {label}
      </span>
    </div>
    <span
      className="text-[11px] sm:text-xs font-mono font-black leading-none"
      style={{
        color: highlight ? accent : "rgba(255,255,255,0.75)",
        textShadow: highlight ? `0 0 12px ${accent}` : "none",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {value.toLocaleString()}
    </span>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/* MAIN EXPORT  — logic identical                                             */
/* ─────────────────────────────────────────────────────────────────────────── */
export const GameCard = ({ card, onCardClick }: GameCardProps) => {
  const theme = rarityConfig[card.rarity] ?? rarityConfig.common;
  const [isFavorite, setIsFavorite] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [shimmerX, setShimmerX] = useState(50);

  const cardRef = useRef<HTMLDivElement>(null);
  const mvx = useMotionValue(0);
  const mvy = useMotionValue(0);
  const smx = useSpring(mvx, { stiffness: 150, damping: 25 });
  const smy = useSpring(mvy, { stiffness: 150, damping: 25 });
  const rotateX = useTransform(smy, [-0.5, 0.5], [5, -5]);
  const rotateY = useTransform(smx, [-0.5, 0.5], [-5, 5]);

  const onMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const nx = (e.clientX - r.left) / r.width - 0.5;
    const ny = (e.clientY - r.top) / r.height - 0.5;
    mvx.set(nx);
    mvy.set(ny);
    setShimmerX(((nx + 0.5) * 100));
  }, [mvx, mvy]);

  const onLeave = useCallback(() => {
    mvx.set(0); mvy.set(0);
    setShimmerX(50);
    setHovered(false);
  }, [mvx, mvy]);

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={onLeave}
      whileTap={{ scale: 0.97 }}
      onClick={() => onCardClick(card)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 1000 }}
      className={cn(
        "group relative w-full aspect-[3/3.8] rounded-2xl cursor-pointer overflow-hidden flex flex-col border",
        theme.border
      )}
    >
      {/* Base card material — very dark, textured */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 0%, ${theme.accent}0e 0%, transparent 60%),
            linear-gradient(175deg, rgba(22,20,18,0.98) 0%, rgba(8,7,6,1) 100%)
          `,
        }}
      />
      {/* Paper grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "150px",
          mixBlendMode: "overlay",
        }}
      />

      {/* Hover elevation glow */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{ boxShadow: `0 0 40px ${theme.accent}35, 0 20px 60px rgba(0,0,0,0.7), 0 0 0 1px ${theme.accent}22` }}
      />

      {/* Ornate frame */}
      <OrnateFrame color={theme.accent} hovered={hovered} />

      {/* ── IMAGE ZONE ── */}
      <div className="relative flex-grow overflow-hidden" style={{ borderRadius: "12px 12px 0 0" }}>
        {/* Rarity tint */}
        <div className={cn("absolute inset-0 bg-gradient-to-b opacity-25 z-10 pointer-events-none", theme.bgGradient)} />

        {/* Image darken at bottom */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
          style={{
            height: "55%",
            background: `linear-gradient(to top, ${theme.cardTint} 0%, rgba(0,0,0,0.5) 50%, transparent 100%)`,
          }}
        />

        {/* Using the thumbnail as the main display, falling back to original image if missing */}
        <motion.img
          src={card.thumbnail || card.image}
          alt={card.name}
          animate={{ scale: hovered ? 1.12 : 1.08 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover object-center"
          style={{
            filter: hovered ? "saturate(1.15) contrast(1.05)" : "saturate(0.9) contrast(1.0)",
            transition: "filter 0.5s ease",
          }}
        />

        {/* Light refraction on hover — moves with cursor */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: `radial-gradient(ellipse 50% 30% at ${shimmerX}% 40%, rgba(255,255,255,0.06) 0%, transparent 70%)`,
          }}
        />

        {/* Slow diagonal gloss on hover */}
        <motion.div
          className="absolute pointer-events-none z-10"
          style={{
            inset: "-20%",
            background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)",
          }}
          animate={hovered ? { x: ["−60%", "160%"] } : { x: "-60%" }}
          transition={{ duration: 1.8, ease: "easeInOut", repeat: hovered ? Infinity : 0, repeatDelay: 1 }}
        />

        {/* ── TOP ROW ── */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-20">
          <WaxSeal rarity={card.rarity} color={theme.accent} badge={theme.badge} />

          <button
            onClick={(e) => { e.stopPropagation(); setIsFavorite(!isFavorite); }}
            className="p-1.5 rounded-full backdrop-blur-md hover:scale-110 active:scale-95 transition-all duration-200"
            style={{
              background: "rgba(0,0,0,0.55)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.4)",
            }}
          >
            <motion.div animate={isFavorite ? { scale: [1, 1.5, 1] } : {}} transition={{ duration: 0.3 }}>
              <Heart
                className={cn("w-3.5 h-3.5 transition-all duration-300", isFavorite ? "fill-rose-500 text-rose-500" : "text-white/50")}
              />
            </motion.div>
          </button>
        </div>

        {/* Name overlaid on image bottom */}
        <div className="absolute bottom-0 inset-x-0 z-20 px-3 pb-2">
          <div
            className="h-px w-full mb-1"
            style={{ background: `linear-gradient(to right, transparent, ${theme.accent}60, transparent)` }}
          />
          <h3
            className="font-black uppercase leading-none  truncate"
            style={{
              fontFamily: "mono",
              fontSize: "clamp(12px, 2.9vw, 13px)",
              color: "white",
              letterSpacing: "0.06em",
              textShadow: `0 2px 20px rgba(0,0,0,0.9), 0 0 30px ${theme.accent}55`,
            }}
          >
            {card.name}
          </h3>
        </div>
      </div>

      {/* ── STATS PANEL ── */}
      <div
        className="relative flex-none z-20"
        style={{
          background: `linear-gradient(180deg, ${theme.cardTint} 0%, rgba(4,3,2,1) 100%)`,
          borderTop: `1px solid ${theme.frameBorder}`,
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Horizontal rule at top */}
        <div
          className="absolute top-0 inset-x-3 h-px"
          style={{ background: `linear-gradient(to right, transparent, ${theme.accent}50, transparent)` }}
        />

        {/* Ambient glow from above */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          style={{ background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${theme.accent}0e, transparent)` }}
        />

        <div className="relative z-10 px-2.5 pt-1.5 pb-2">
          {/* Divider with center diamond */}
          <div className="relative flex items-center justify-center mb-1.5">
            <div className="flex-1 h-px" style={{ background: theme.divider }} />
            <div
              className="mx-2 w-1.5 h-1.5 rotate-45"
              style={{ background: theme.accent, boxShadow: `0 0 6px ${theme.accent}` }}
            />
            <div className="flex-1 h-px" style={{ background: theme.divider }} />
          </div>

          <div className="grid grid-cols-3 gap-1">
            <StatBadge icon={<Swords className="w-3 h-3 text-rose-400" />} value={card.stats.attack} label="ATK" accent={theme.accent} />
            <StatBadge icon={<Shield className="w-3 h-3 text-sky-400" />} value={card.stats.defense} label="DEF" accent={theme.accent} />
            <StatBadge icon={<Zap className="w-3 h-3 text-amber-400" />} value={card.stats.total} label="PWR" highlight accent={theme.accent} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default GameCard;