import { useState, useMemo, useEffect, useRef } from "react";
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
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  RARITY CONFIG  (extended for god-tier look)                                */
/* ─────────────────────────────────────────────────────────────────────────── */
const rarityConfig = {
  common: {
    text: "text-slate-300",
    border: "border-slate-400/40",
    bg: "bg-slate-500/10",
    shadow: "shadow-slate-500/10",
    gradient: "from-slate-500/10 to-transparent",
    accent: "bg-slate-400",
    accentHex: "#94a3b8",
    glowColor: "rgba(148,163,184,0.35)",
    badgeBg: "bg-slate-400",
    badgeText: "text-slate-950",
    orb: "#94a3b8",
    bar: "bg-gradient-to-r from-slate-400 to-slate-300",
  },
  rare: {
    text: "text-blue-300",
    border: "border-blue-400/50",
    bg: "bg-blue-500/10",
    shadow: "shadow-blue-500/20",
    gradient: "from-blue-600/20 to-transparent",
    accent: "bg-blue-500",
    accentHex: "#3b82f6",
    glowColor: "rgba(59,130,246,0.45)",
    badgeBg: "bg-blue-500",
    badgeText: "text-white",
    orb: "#3b82f6",
    bar: "bg-gradient-to-r from-blue-600 to-cyan-400",
  },
  epic: {
    text: "text-purple-300",
    border: "border-purple-400/50",
    bg: "bg-purple-500/10",
    shadow: "shadow-purple-500/25",
    gradient: "from-purple-600/25 to-transparent",
    accent: "bg-purple-500",
    accentHex: "#a855f7",
    glowColor: "rgba(168,85,247,0.45)",
    badgeBg: "bg-purple-500",
    badgeText: "text-white",
    orb: "#a855f7",
    bar: "bg-gradient-to-r from-purple-600 to-pink-400",
  },
  legendary: {
    text: "text-amber-300",
    border: "border-amber-400/50",
    bg: "bg-amber-500/10",
    shadow: "shadow-amber-500/25",
    gradient: "from-amber-500/20 to-transparent",
    accent: "bg-amber-400",
    accentHex: "#f59e0b",
    glowColor: "rgba(245,158,11,0.5)",
    badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-300",
    badgeText: "text-amber-950",
    orb: "#f59e0b",
    bar: "bg-gradient-to-r from-amber-500 to-yellow-300",
  },
  mythical: {
    text: "text-red-400",
    border: "border-red-500/50",
    bg: "bg-red-500/10",
    shadow: "shadow-red-500/25",
    gradient: "from-red-600/25 to-transparent",
    accent: "bg-red-500",
    accentHex: "#ef4444",
    glowColor: "rgba(239,68,68,0.5)",
    badgeBg: "bg-gradient-to-r from-red-600 to-rose-400",
    badgeText: "text-white",
    orb: "#ef4444",
    bar: "bg-gradient-to-r from-red-600 to-orange-400",
  },
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  PARTICLE SYSTEM                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
const ParticleField = ({ color }) => {
  const particles = useMemo(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 6 + 5,
      delay: Math.random() * 4,
    })), []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: color,
            boxShadow: `0 0 ${p.size * 3}px ${color}`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CORNER DECORATION                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
const CornerDecor = ({ color, position }) => {
  const posMap = {
    tl: "top-0 left-0",
    tr: "top-0 right-0 rotate-90",
    bl: "bottom-0 left-0 -rotate-90",
    br: "bottom-0 right-0 rotate-180",
  };
  return (
    <div className={cn("absolute w-12 h-12 pointer-events-none", posMap[position])}>
      <svg viewBox="0 0 48 48" fill="none" className="w-full h-full">
        <path d="M2 46 L2 2 L46 2" stroke={color} strokeWidth="1.5" strokeOpacity="0.6" />
        <path d="M2 18 L2 2 L18 2" stroke={color} strokeWidth="3" strokeOpacity="0.9" strokeLinecap="round" />
      </svg>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  SCAN LINE OVERLAY                                                          */
/* ─────────────────────────────────────────────────────────────────────────── */
const ScanLines = () => (
  <div
    className="absolute inset-0 pointer-events-none z-10 opacity-[0.025]"
    style={{
      backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 4px)",
    }}
  />
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TILT IMAGE CARD                                                            */
/* ─────────────────────────────────────────────────────────────────────────── */
const TiltImage = ({ src, alt, color, onFullscreen }) => {
  const ref = useRef(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 20 });
  const springY = useSpring(y, { stiffness: 150, damping: 20 });
  const rotateX = useTransform(springY, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onFullscreen}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className="relative w-full h-full flex items-center justify-center cursor-zoom-in group"
    >
      {/* Holographic shimmer ring */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${color}22 0%, transparent 70%)`,
          boxShadow: `0 0 80px ${color}33, inset 0 0 40px ${color}11`,
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      <img
        src={src}
        alt={alt}
        className="max-w-full max-h-full object-contain relative z-10"
        style={{
          filter: `drop-shadow(0 0 40px ${color}66) drop-shadow(0 20px 40px rgba(0,0,0,0.8))`,
          transition: "filter 0.3s ease",
        }}
      />
      {/* Zoom hint */}
      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="text-[10px] font-mono uppercase tracking-widest text-white/40 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">
          click to expand
        </div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  QUICK STAT                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const QuickStat = ({ label, value, icon, isHighlight, color }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    className={cn(
      "relative px-5 py-3.5 rounded-xl flex items-center justify-between border overflow-hidden transition-all duration-300 group hover:scale-[1.02]",
      isHighlight
        ? "bg-white/5 border-white/15 shadow-lg"
        : "bg-white/[0.03] border-white/8 hover:bg-white/5"
    )}
    style={isHighlight ? { boxShadow: `0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)` } : {}}
  >
    {isHighlight && (
      <div
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-xl"
        style={{ background: color, boxShadow: `0 0 12px ${color}` }}
      />
    )}
    <div className="flex items-center gap-3">
      <div
        className="p-2 rounded-lg text-white/70 group-hover:text-white transition-colors"
        style={{ background: `${color}18` }}
      >
        {icon}
      </div>
      <span className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">{label}</span>
    </div>
    <span
      className="text-2xl font-black font-mono tracking-tight"
      style={{ color: isHighlight ? color : "white", textShadow: isHighlight ? `0 0 20px ${color}99` : "none" }}
    >
      {typeof value === "number" ? value.toLocaleString() : value}
    </span>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  STAT ROW                                                                   */
/* ─────────────────────────────────────────────────────────────────────────── */
const StatRow = ({ label, value, icon, max, color, barClass, delay = 0 }) => {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="space-y-2 group"
    >
      <div className="flex justify-between items-center px-0.5">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-500 group-hover:text-slate-300 transition-colors duration-200">
          <span style={{ color: color }}>{icon}</span>
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-mono font-bold text-white">{value.toLocaleString()}</span>
          <span className="text-[9px] text-slate-600 font-mono">/{max.toLocaleString()}</span>
        </div>
      </div>
      <div className="h-[5px] w-full bg-slate-900/80 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full absolute left-0 top-0 rounded-full", barClass)}
          style={{ boxShadow: `0 0 10px ${color}` }}
        />
        {/* Gloss */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/25 to-transparent rounded-full pointer-events-none" />
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN MODAL                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
export const CardModal = ({ isOpen, onClose, card }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  useEffect(() => {
    if (!isOpen) { setCurrentSlide(0); setFullscreenImage(false); }
  }, [isOpen]);

  const totalPower = useMemo(() => {
    if (!card) return 0;
    const { hp, attack, defense, mana, intelligence, speed } = card.stats;
    return hp + attack + defense + mana + intelligence + speed;
  }, [card]);

  if (!card) return null;

  const rarityKey = card.rarity.toLowerCase();
  const theme = rarityConfig[rarityKey] ?? rarityConfig.common;

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % 2);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + 2) % 2);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 border-none bg-transparent shadow-none max-w-5xl w-full md:w-[95vw] overflow-hidden focus:outline-none"
        onInteractOutside={(e) => { if (fullscreenImage) e.preventDefault(); }}
      >
        <DialogTitle className="sr-only">{card.name} Details</DialogTitle>

        {/* ── OUTER SHELL ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "relative w-full rounded-[1.75rem] border bg-[#080c14] backdrop-blur-2xl overflow-hidden",
            theme.border
          )}
          style={{
            boxShadow: `0 0 0 1px ${theme.accentHex}18, 0 25px 80px rgba(0,0,0,0.8), 0 0 60px ${theme.glowColor}`,
          }}
        >
          {/* Ambient gradient */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 80% 60% at 50% -10%, ${theme.accentHex}14 0%, transparent 70%)`,
            }}
          />

          {/* Scanlines */}
          <ScanLines />

          {/* Corner ornaments */}
          <CornerDecor color={theme.accentHex} position="tl" />
          <CornerDecor color={theme.accentHex} position="tr" />
          <CornerDecor color={theme.accentHex} position="bl" />
          <CornerDecor color={theme.accentHex} position="br" />

          {/* Animated noise overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04] mix-blend-overlay"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "128px 128px",
            }}
          />

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-[70] text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
            style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(12px)" }}
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Nav arrows */}
          {[
            { dir: "prev", icon: ChevronLeft, fn: prevSlide, cls: "left-3" },
            { dir: "next", icon: ChevronRight, fn: nextSlide, cls: "right-3" },
          ].map(({ dir, icon: Icon, fn, cls }) => (
            <Button
              key={dir}
              variant="ghost"
              size="icon"
              onClick={fn}
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-[60] h-10 w-10 rounded-full text-white/20 hover:text-white transition-all duration-200",
                cls
              )}
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Icon className="h-6 w-6" />
            </Button>
          ))}

          {/* ── CONTENT AREA ── */}
          <div className="relative w-full h-[90vh] md:h-[640px] max-h-[90vh] flex flex-col">
            <AnimatePresence mode="wait">

              {/* ════ SLIDE 0 – HERO ════ */}
              {currentSlide === 0 && (
                <motion.div
                  key="slide-info"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex flex-col md:flex-row h-full"
                >
                  {/* LEFT – image */}
                  <div className="w-full md:w-[52%] h-[45vh] md:h-full relative flex items-center justify-center p-8 md:p-12">
                    <ParticleField color={theme.glowColor} />

                    {/* Deep glow blob */}
                    <div
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full pointer-events-none"
                      style={{
                        background: `radial-gradient(ellipse, ${theme.accentHex}28 0%, transparent 70%)`,
                        filter: "blur(30px)",
                      }}
                    />

                    <TiltImage
                      src={card.image}
                      alt={card.name}
                      color={theme.accentHex}
                      onFullscreen={() => setFullscreenImage(true)}
                    />
                  </div>

                  {/* Divider line */}
                  <div
                    className="hidden md:block absolute left-[52%] top-8 bottom-8 w-px"
                    style={{ background: `linear-gradient(to bottom, transparent, ${theme.accentHex}40 30%, ${theme.accentHex}40 70%, transparent)` }}
                  />

                  {/* RIGHT – info */}
                  <div className="w-full md:w-[48%] h-full flex flex-col justify-center p-6 md:p-10 md:pl-8 space-y-6 relative z-20">
                    {/* Rarity + type row */}
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <span
                        className={cn(
                          "px-3 py-1 rounded-sm text-[10px] font-black uppercase tracking-[0.22em] skew-x-[-10deg] select-none",
                          theme.badgeBg, theme.badgeText
                        )}
                        style={{ boxShadow: `0 0 16px ${theme.glowColor}` }}
                      >
                        {card.rarity}
                      </span>
                      <div
                        className="h-px flex-1"
                        style={{ background: `linear-gradient(to right, ${theme.accentHex}50, transparent)` }}
                      />
                      <span
                        className="text-[10px] font-mono uppercase tracking-[0.2em]"
                        style={{ color: `${theme.accentHex}88` }}
                      >
                        {card.stats.type}
                      </span>
                    </motion.div>

                    {/* Name */}
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.15 }}
                    >
                      <h2
                        className="text-3xl md:text-5xl font-black uppercase text-white leading-[0.88] tracking-tighter"
                        style={{
                          textShadow: `0 0 60px ${theme.accentHex}44, 0 4px 30px rgba(0,0,0,0.9)`,
                          fontFamily: "'Bebas Neue', sans-serif",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {card.name}
                      </h2>
                    </motion.div>

                    {/* Quick stats */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="space-y-2.5"
                    >
                      <QuickStat label="Range" value={card.stats.range} icon={<Move className="w-3.5 h-3.5" />} isHighlight={false} color={theme.accentHex} />
                      <QuickStat label="Total Power" value={totalPower} icon={<Zap className="w-3.5 h-3.5" />} isHighlight color={theme.accentHex} />
                    </motion.div>

                    {/* Divider + slide indicator */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="pt-2 flex items-center gap-2"
                    >
                      <div
                        className="h-[3px] w-10 rounded-full"
                        style={{ background: theme.accentHex, boxShadow: `0 0 8px ${theme.accentHex}` }}
                      />
                      <button
                        onClick={nextSlide}
                        className="h-[3px] w-4 rounded-full transition-all duration-300 hover:opacity-100"
                        style={{ background: `${theme.accentHex}33` }}
                      />
                    </motion.div>

                    {/* View stats hint */}
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      onClick={nextSlide}
                      className="self-start flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-200 group"
                      style={{ color: `${theme.accentHex}66` }}
                    >
                      <span className="group-hover:text-white transition-colors">View Attributes</span>
                      <ChevronRight
                        className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                        style={{ color: theme.accentHex }}
                      />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ════ SLIDE 1 – STATS ════ */}
              {currentSlide === 1 && (
                <motion.div
                  key="slide-stats"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full h-full p-5 md:p-10 overflow-y-auto"
                  style={{ scrollbarWidth: "thin", scrollbarColor: `${theme.accentHex}44 transparent` }}
                >
                  <div className="max-w-3xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="text-center space-y-3">
                      <motion.h3
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xl md:text-2xl font-black text-white uppercase tracking-[0.25em]"
                        style={{ fontFamily: "'Bebas Neue'", letterSpacing: "0.2em" }}
                      >
                        Attributes & Lore
                      </motion.h3>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{ delay: 0.1, duration: 0.5 }}
                        className="h-[2px] w-24 mx-auto rounded-full"
                        style={{ background: `linear-gradient(to right, transparent, ${theme.accentHex}, transparent)` }}
                      />
                    </div>

                    {/* Two columns */}
                    <div className="grid md:grid-cols-2 gap-8 md:gap-10">

                      {/* Lore column */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="space-y-4"
                      >
                        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.22em]" style={{ color: `${theme.accentHex}99` }}>
                          <Brain className="w-3.5 h-3.5" /> Lore
                        </div>

                        <div
                          className="relative p-5 rounded-xl"
                          style={{
                            background: `linear-gradient(135deg, ${theme.accentHex}09, transparent)`,
                            border: `1px solid ${theme.accentHex}20`,
                            boxShadow: `inset 0 1px 0 ${theme.accentHex}15`,
                          }}
                        >
                          {/* Quote mark */}
                          <div
                            className="absolute top-3 left-4 text-5xl leading-none font-serif pointer-events-none select-none"
                            style={{ color: `${theme.accentHex}20`, fontFamily: "Georgia, serif" }}
                          >
                            "
                          </div>
                          <p
                            className="text-slate-300 text-sm md:text-[15px] leading-relaxed relative z-10 pt-3"
                            style={{ fontFamily: "'Courier New', monospace", fontStyle: "italic" }}
                          >
                            {card.lore}
                          </p>
                        </div>
                      </motion.div>

                      {/* Stats column */}
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-[0.22em]" style={{ color: `${theme.accentHex}99` }}>
                          <Activity className="w-3.5 h-3.5" /> Combat Stats
                        </div>
                        <div className="space-y-3">
                          <StatRow label="Health"       value={card.stats.hp}           icon={<Activity className="w-3 h-3"/>}  max={10000} color={theme.accentHex} barClass={theme.bar} delay={0.1} />
                          <StatRow label="Attack"       value={card.stats.attack}       icon={<Swords className="w-3 h-3"/>}    max={2000}  color={theme.accentHex} barClass={theme.bar} delay={0.15} />
                          <StatRow label="Defense"      value={card.stats.defense}      icon={<Shield className="w-3 h-3"/>}    max={2000}  color={theme.accentHex} barClass={theme.bar} delay={0.2} />
                          <StatRow label="Mana"         value={card.stats.mana}         icon={<Sun className="w-3 h-3"/>}       max={1000}  color={theme.accentHex} barClass={theme.bar} delay={0.25} />
                          <StatRow label="Intelligence" value={card.stats.intelligence} icon={<Brain className="w-3 h-3"/>}     max={1000}  color={theme.accentHex} barClass={theme.bar} delay={0.3} />
                          <StatRow label="Speed"        value={card.stats.speed}        icon={<Zap className="w-3 h-3"/>}       max={500}   color={theme.accentHex} barClass={theme.bar} delay={0.35} />
                        </div>
                      </div>
                    </div>

                    {/* Total power banner */}
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="relative overflow-hidden rounded-xl px-6 py-4 flex items-center justify-between"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accentHex}14, ${theme.accentHex}06)`,
                        border: `1px solid ${theme.accentHex}30`,
                        boxShadow: `0 0 30px ${theme.accentHex}14`,
                      }}
                    >
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl"
                        style={{ background: theme.accentHex, boxShadow: `0 0 14px ${theme.accentHex}` }}
                      />
                      <span className="text-xs font-black uppercase tracking-[0.25em] text-slate-400">Total Power</span>
                      <span
                        className="text-3xl font-black font-mono"
                        style={{ color: theme.accentHex, textShadow: `0 0 20px ${theme.accentHex}99`, letterSpacing: "-0.04em" }}
                      >
                        {totalPower.toLocaleString()}
                      </span>
                    </motion.div>

                    {/* Back button */}
                    <div className="flex justify-center pb-2">
                      <button
                        onClick={prevSlide}
                        className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-[0.2em] flex items-center gap-1.5 transition-colors duration-200"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" /> Back to Card
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── FULLSCREEN OVERLAY ── */}
        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-6 cursor-zoom-out"
              style={{ background: "rgba(0,0,0,0.97)", backdropFilter: "blur(20px)" }}
              onClick={() => setFullscreenImage(false)}
            >
              {/* Glow behind fullscreen img */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse 60% 60% at 50% 50%, ${theme.accentHex}18, transparent)`,
                }}
              />
              <motion.img
                initial={{ scale: 0.88, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                src={card.image}
                alt={card.name}
                className="max-w-full max-h-[88vh] object-contain relative z-10"
                style={{ filter: `drop-shadow(0 0 80px ${theme.accentHex}55)` }}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-5 right-5 text-white rounded-full hover:bg-white/10 transition-all duration-200"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                onClick={(e) => { e.stopPropagation(); setFullscreenImage(false); }}
              >
                <X className="w-5 h-5" />
              </Button>

              {/* Card name watermark */}
              <div
                className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.4em] select-none pointer-events-none"
                style={{ color: `${theme.accentHex}44`, fontFamily: "'Bebas Neue', 'Impact', sans-serif", letterSpacing: "0.5em" }}
              >
                {card.name}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;