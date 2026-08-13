import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Swords,
  Shield,
  Zap,
  Brain,
  Activity,
  Sun,
  BookOpen,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  motion,
  AnimatePresence,
  animate,
} from "framer-motion";

/* ─────────────────────────────────────────────────────────────────────────── */
/* RARITY CONFIG (Enhanced Glow & Math)                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
const rarityConfig = {
  common: {
    accentHex: "#94a3b8",
    glowColor: "rgba(148,163,184,0.5)",
    badgeBg: "bg-slate-300",
    badgeText: "text-slate-900",
    bar: "from-slate-500 via-slate-300 to-slate-500",
  },
  rare: {
    accentHex: "#3b82f6",
    glowColor: "rgba(59,130,246,0.6)",
    badgeBg: "bg-blue-500",
    badgeText: "text-white",
    bar: "from-blue-700 via-cyan-400 to-blue-700",
  },
  epic: {
    accentHex: "#a855f7",
    glowColor: "rgba(168,85,247,0.6)",
    badgeBg: "bg-purple-500",
    badgeText: "text-white",
    bar: "from-purple-700 via-pink-400 to-purple-700",
  },
  legendary: {
    accentHex: "#f59e0b",
    glowColor: "rgba(245,158,11,0.6)",
    badgeBg: "bg-gradient-to-r from-amber-400 to-yellow-200",
    badgeText: "text-amber-950",
    bar: "from-amber-600 via-yellow-300 to-amber-600",
  },
  mythical: {
    accentHex: "#ef4444",
    glowColor: "rgba(239,68,68,0.7)",
    badgeBg: "bg-gradient-to-r from-red-600 to-rose-400",
    badgeText: "text-white",
    bar: "from-red-700 via-orange-400 to-red-700",
  },
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* ANIMATED COUNTER (Ticks numbers up dynamically - Added tabular-nums)        */
/* ─────────────────────────────────────────────────────────────────────────── */
const AnimatedCounter = ({ value, color, delay = 0 }) => {
  const nodeRef = useRef(null);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.5,
      delay: delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = Math.round(v).toLocaleString();
      },
    });

    return () => controls.stop();
  }, [value, delay]);

  return (
    <span
      ref={nodeRef}
      className="font-mono font-bold tabular-nums"
      style={{ color, textShadow: `0 0 15px ${color}80` }}
    />
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* ETHEREAL PARTICLE SYSTEM                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */
const ParticleField = ({ color }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 25 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        duration: Math.random() * 4 + 3,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none mix-blend-screen z-0">
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
            boxShadow: `0 0 ${p.size * 4}px ${color}`,
          }}
          animate={{
            y: [0, -60, -100],
            x: [0, Math.random() * 20 - 10, 0],
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
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
/* GOD-TIER STAT ROW                                                           */
/* ─────────────────────────────────────────────────────────────────────────── */
const StatRow = ({ label, value, icon, max, color, barClass, delay = 0 }) => {
  const pct = Math.min((value / max) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: "easeOut" }}
      className="space-y-2 group"
    >
      <div className="flex justify-between items-center px-1">
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-white transition-colors duration-300">
          <span style={{ color, textShadow: `0 0 10px ${color}` }}>{icon}</span>
          {label}
        </div>
        <div className="flex items-baseline gap-1">
          <AnimatedCounter value={value} color="#ffffff" delay={delay} />
          <span className="text-[10px] text-slate-600 font-mono">
            /{max.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="h-2 w-full bg-[#030712] rounded-full overflow-hidden border border-white/5 relative shadow-inner">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1.2, delay, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            "h-full absolute left-0 top-0 rounded-full bg-gradient-to-r",
            barClass
          )}
          style={{
            boxShadow: `0 0 15px ${color}, inset 0 0 8px rgba(255,255,255,0.5)`,
            backgroundSize: "200% 100%",
          }}
        >
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-20deg]"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* SLIDE TRANSITION CONFIG & SWIPE MATH                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 0.95,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

/* ─────────────────────────────────────────────────────────────────────────── */
/* MAIN MODAL COMPONENT                                                        */
/* ─────────────────────────────────────────────────────────────────────────── */
export const CardModal = ({ isOpen, onClose, card }) => {
  const [[page, direction], setPage] = useState([0, 0]);
  const [fullscreenImage, setFullscreenImage] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setPage([0, 0]);
      setFullscreenImage(false);
    }
  }, [isOpen]);

  const paginate = useCallback((newDirection) => {
    setPage(([prevPage]) => {
      const newPage = (prevPage + newDirection + 3) % 3;
      return [newPage, newDirection];
    });
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen || fullscreenImage) return;
      if (e.key === "ArrowRight") paginate(1);
      if (e.key === "ArrowLeft") paginate(-1);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, fullscreenImage, paginate]);

  const totalPower = useMemo(() => {
    if (!card) return 0;
    // Uses stats.total if provided by backend, otherwise fallbacks to computation
    if (card.stats.total) return card.stats.total;
    
    const { hp, attack, defense, mana, intelligence, speed } = card.stats;
    return hp + attack + defense + mana + intelligence + speed;
  }, [card]);

  if (!card) return null;

  const rarityKey = card.rarity.toLowerCase();
  const theme = rarityConfig[rarityKey] ?? rarityConfig.common;

  const dragProps = {
    drag: "x" as const,
    dragConstraints: { left: 0, right: 0 },
    dragElastic: 1,
    onDragEnd: (e, { offset, velocity }) => {
      const swipe = swipePower(offset.x, velocity.x);
      if (swipe < -swipeConfidenceThreshold) {
        paginate(1);
      } else if (swipe > swipeConfidenceThreshold) {
        paginate(-1);
      }
    },
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="p-0 border-none bg-transparent shadow-none max-w-5xl w-full md:w-[95vw] overflow-hidden focus:outline-none"
        onInteractOutside={(e) => {
          if (fullscreenImage) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">{card.name} Details</DialogTitle>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, scale: 0.9, y: 40, filter: "blur(20px)" }}
          transition={{ duration: 0.5, type: "spring", bounce: 0.2 }}
          className="relative w-full rounded-[2rem] bg-[#05070a]/90 backdrop-blur-3xl overflow-hidden border border-white/10"
          style={{
            boxShadow: `0 25px 80px rgba(0,0,0,0.9), 0 0 120px ${theme.glowColor}, inset 0 0 0 1px ${theme.accentHex}30`,
          }}
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] pointer-events-none z-0 mix-blend-color-dodge"
            style={{
              background: `radial-gradient(circle, ${theme.accentHex}15 0%, transparent 60%)`,
              filter: "blur(60px)",
            }}
          />

          <ParticleField color={theme.accentHex} />

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-5 right-5 z-[70] text-white/50 hover:text-white hover:bg-white/10 hover:scale-110 rounded-full transition-all duration-300 backdrop-blur-md select-none"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <X className="w-5 h-5" />
          </Button>

          <div className="relative w-full h-[90vh] md:h-[760px] max-h-[90vh] flex flex-col z-10 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {/* ════ SLIDE 0 – HERO ════ */}
              {page === 0 && (
                <motion.div
                  key="slide-hero"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex flex-col md:flex-row h-full touch-pan-y"
                  {...dragProps}
                >
                  <div className="w-full md:w-[55%] h-[50vh] md:h-full relative flex items-center justify-center p-8">
                    {/* Static Image Replacement */}
                    <div 
                      className="relative w-full h-full flex items-center justify-center cursor-zoom-in group z-10"
                      onClick={() => setFullscreenImage(true)}
                    >
                      <img
                        src={card.image}
                        alt={card.name}
                        draggable={false}
                        className="w-full h-full max-h-[85%] object-contain select-none drop-shadow-2xl relative z-10"
                        style={{
                          filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.8)) drop-shadow(0 0 20px ${theme.accentHex}40)`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="w-full md:w-[45%] h-full flex flex-col justify-center p-8 md:pr-16 space-y-8 select-none">
                    
                    {/* ── IDENTITY LINE: RARITY, CLASS & TYPE ── */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 flex-wrap"
                    >
                      <span
                        className={cn(
                          "px-4 py-1.5 rounded text-[11px] font-black uppercase tracking-[0.25em] relative overflow-hidden group shadow-lg",
                          theme.badgeBg,
                          theme.badgeText
                        )}
                        style={{ boxShadow: `0 0 20px ${theme.glowColor}` }}
                      >
                        <span className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1s_infinite] bg-gradient-to-r from-transparent via-white/50 to-transparent" />
                        {card.rarity}
                      </span>

                      {/* NEW: Class & Type Badges */}
                      <div className="flex gap-2">
                        {card.stats.class && (
                          <span 
                            className="px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                            style={{ 
                              color: theme.accentHex, 
                              borderColor: `${theme.accentHex}40`, 
                              backgroundColor: `${theme.accentHex}10` 
                            }}
                          >
                            {card.stats.class}
                          </span>
                        )}
                        {card.stats.type && (
                          <span 
                            className="px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                            style={{ 
                              color: theme.accentHex, 
                              borderColor: `${theme.accentHex}40`, 
                              backgroundColor: `${theme.accentHex}10` 
                            }}
                          >
                            {card.stats.type}
                          </span>
                        )}
                      </div>

                      <div className="h-[2px] flex-1 bg-gradient-to-r from-white/20 to-transparent rounded-full ml-1" />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, filter: "blur(10px)", y: 10 }}
                      animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                    >
                      <h2
                        className="text-4xl md:text-5xl font-black uppercase text-white leading-none tracking-relaxed select-none pointer-events-none"
                        style={{
                          textShadow: `0 0 80px ${theme.accentHex}66, 0 4px 20px rgba(0,0,0,0.8)`,
                        }}
                      >
                        {card.name}
                      </h2>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="flex gap-4 mt-8 pointer-events-auto"
                    >
                      <button
                        onClick={() => paginate(1)}
                        className="group relative overflow-hidden px-8 py-4 rounded-xl font-bold uppercase tracking-widest text-sm text-white transition-transform hover:scale-105 active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${theme.accentHex}40, transparent)`,
                          border: `1px solid ${theme.accentHex}50`,
                          boxShadow: `0 0 30px ${theme.accentHex}20`,
                        }}
                      >
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                          style={{
                            background: `radial-gradient(circle at center, ${theme.accentHex}80 0%, transparent 70%)`,
                          }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          Analyze Stats <ChevronRight className="w-4 h-4" />
                        </span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ════ SLIDE 1 – STATS ════ */}
              {page === 1 && (
                <motion.div
                  key="slide-stats"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-full p-8 md:p-16 flex flex-col justify-center touch-pan-y"
                  {...dragProps}
                >
                  <div className="max-w-3xl w-full mx-auto space-y-12">
                    <div className="text-center space-y-4 select-none">
                      <h3 className="text-3xl font-black text-white uppercase tracking-[0.3em] font-mono">
                        Combat Matrix
                      </h3>
                      <div
                        className="h-1 w-32 mx-auto rounded-full"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${theme.accentHex}, transparent)`,
                          boxShadow: `0 0 20px ${theme.accentHex}`,
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-8 select-none">
                      <StatRow label="Health" value={card.stats.hp} icon={<Activity className="w-5 h-5" />} max={10000} color={theme.accentHex} barClass={theme.bar} delay={0.1} />
                      <StatRow label="Attack" value={card.stats.attack} icon={<Swords className="w-5 h-5" />} max={3000} color={theme.accentHex} barClass={theme.bar} delay={0.2} />
                      <StatRow label="Defense" value={card.stats.defense} icon={<Shield className="w-5 h-5" />} max={3000} color={theme.accentHex} barClass={theme.bar} delay={0.3} />
                      <StatRow label="Mana" value={card.stats.mana} icon={<Sun className="w-5 h-5" />} max={2500} color={theme.accentHex} barClass={theme.bar} delay={0.4} />
                      <StatRow label="Intel" value={card.stats.intelligence} icon={<Brain className="w-5 h-5" />} max={1000} color={theme.accentHex} barClass={theme.bar} delay={0.5} />
                      <StatRow label="Speed" value={card.stats.speed} icon={<Zap className="w-5 h-5" />} max={500} color={theme.accentHex} barClass={theme.bar} delay={0.6} />
                    </div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.8 }}
                      className="mt-8 rounded-2xl p-6 border border-white/10 flex justify-between items-center bg-black/40 backdrop-blur-xl select-none"
                      style={{ boxShadow: `inset 0 0 50px ${theme.accentHex}20` }}
                    >
                      <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Net Power Level</span>
                      <div className="text-4xl font-black text-white">
                        <AnimatedCounter value={totalPower} color={theme.accentHex} delay={0.8} />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* ════ SLIDE 2 – LORE ════ */}
              {page === 2 && (
                <motion.div
                  key="slide-lore"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="w-full h-full p-8 md:p-16 flex flex-col justify-center items-center touch-pan-y"
                  {...dragProps}
                >
                  <div className="max-w-2xl w-full relative">
                    <BookOpen
                      className="absolute -top-12 -left-12 w-32 h-32 opacity-10 rotate-[-15deg] pointer-events-none"
                      style={{ color: theme.accentHex }}
                    />
                    <motion.p
                      className="text-lg md:text-xl leading-relaxed font-mono italic text-slate-300 relative z-10 pointer-events-none select-none"
                    >
                      {card.lore.split("").map((char, index) => (
                        <motion.span
                          key={index}
                          variants={{
                            hidden: { opacity: 0, filter: "blur(8px)" },
                            visible: { opacity: 1, filter: "blur(0px)" },
                          }}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </motion.p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── NAVIGATION CONTROLS ── */}
            <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-16 z-50 pointer-events-none select-none">
              <button
                onClick={() => paginate(-1)}
                className="pointer-events-auto p-3 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 border border-white/10 transition-all text-white/50 hover:text-white backdrop-blur-md"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-3 pointer-events-auto">
                {[0, 1, 2].map((idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (page !== idx) {
                        setPage([idx, idx > page ? 1 : -1]);
                      }
                    }}
                    className="relative h-2 rounded-full transition-all duration-500 hover:opacity-80"
                    style={{
                      width: page === idx ? "40px" : "8px",
                      background: page === idx ? theme.accentHex : "rgba(255,255,255,0.2)",
                      boxShadow: page === idx ? `0 0 15px ${theme.accentHex}` : "none",
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => paginate(1)}
                className="pointer-events-auto p-3 rounded-full bg-white/5 hover:bg-white/10 hover:scale-110 active:scale-95 border border-white/10 transition-all text-white/50 hover:text-white backdrop-blur-md"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* ── FULLSCREEN IMAGE OVERLAY ── */}
        <AnimatePresence>
          {fullscreenImage && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(40px)" }}
              exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-black/95 cursor-zoom-out select-none"
              onClick={() => setFullscreenImage(false)}
            >
              <motion.img
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                src={card.image}
                alt={card.name}
                draggable={false}
                className="max-w-full max-h-[90vh] object-contain drop-shadow-2xl"
                style={{ filter: `drop-shadow(0 0 100px ${theme.accentHex}40)` }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
};

export default CardModal;