import { useState, useMemo, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { GameCard, GameCardData } from "@/components/GameCard";
import { CardModal } from "@/components/CardModal";
import cardsData from "@/data/cards.json";
import {
  Sparkles, Coins, Gem, Menu, Search, Filter,
  ArrowUpDown, Swords, ShieldAlert, X, ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* ─── helpers (unchanged) ─── */
const getCardPower = (card: GameCardData) => {
  const { hp, attack, defense, mana, intelligence, speed } = card.stats;
  return hp + attack + defense + mana + intelligence + speed;
};
const rarityWeight = { common: 1, rare: 2, epic: 3, legendary: 4, mythical: 5 } as Record<string, number>;


/* ─────────────────────────────────────────────────────────────────────────── */
/*  BACKGROUND CANVAS — slow-moving aurora mesh                               */
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

import { Nav } from "@/components/Nav";

/* ─────────────────────────────────────────────────────────────────────────── */
/*  HERO SECTION                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
const HeroSection = ({ total, showing }: { total: number; showing: number }) => {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 400], [0, 80]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <motion.div style={{ y, opacity }} className="relative text-center pt-16 pb-10 px-4 pointer-events-none select-none">
      {/* Big atmospheric glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)", filter: "blur(40px)" }}
      />

      {/* Eyebrow */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-3 mb-5"
      >
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
        
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
      </motion.div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <h1
          className="leading-none uppercase mb-2"
          style={{
            fontFamily: "'Cinzel','Trajan Pro','Georgia',serif",
            fontSize: "clamp(42px, 10vw, 100px)",
            fontWeight: 900,
            letterSpacing: "-0.01em",
            background: "linear-gradient(175deg, #ffffff 0%, #e2d5b0 35%, #a07830 65%, #5a3e18 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: "none",
            filter: "drop-shadow(0 4px 40px rgba(200,140,40,0.25))",
          }}
        >
          Monsterdex
        </h1>
      </motion.div>

      {/* Sub rule */}
      <motion.div
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="flex items-center justify-center gap-4 mt-6"
      >
        <div className="h-px flex-1 max-w-[100px]" style={{ background: "linear-gradient(to right, transparent, rgba(245,158,11,0.4))" }} />
        <div className="flex items-center gap-2">
          <div className="w-1 h-1 rounded-full bg-amber-500/60" />
          <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-slate-500">
            {showing} of {total} Characters
          </span>
          <div className="w-1 h-1 rounded-full bg-amber-500/60" />
        </div>
        <div className="h-px flex-1 max-w-[100px]" style={{ background: "linear-gradient(to left, transparent, rgba(245,158,11,0.4))" }} />
      </motion.div>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────── */
/*  CONTROLS BAR                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
const ControlsBar = ({
  filters, activeFilter, setActiveFilter, sortOption, setSortOption,
}: {
  filters: string[]; activeFilter: string; setActiveFilter: (v: string) => void;
  sortOption: string; setSortOption: (v: string) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.35 }}
    className="sticky top-[89px] z-40 mb-8"
  >
    <div
      className="max-w-4xl mx-auto rounded-2xl border px-3 py-2.5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between"
      style={{
        background: "rgba(6,5,12,0.88)",
        backdropFilter: "blur(24px)",
        borderColor: "rgba(255,255,255,0.07)",
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), 0 1px 0 rgba(245,158,11,0.06) inset",
      }}
    >
      {/* Filter pills */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5 sm:pb-0">
        {filters.map((f) => (
          <motion.button
            key={f}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveFilter(f)}
            className="flex-shrink-0 relative px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-[0.18em] transition-all duration-200 overflow-hidden"
            style={
              activeFilter === f
                ? {
                    background: "linear-gradient(135deg,#f59e0b,#d97706)",
                    color: "#1c1008",
                    boxShadow: "0 0 20px rgba(245,158,11,0.35), 0 4px 12px rgba(0,0,0,0.4)",
                    border: "1px solid rgba(253,230,138,0.3)",
                  }
                : {
                    background: "rgba(255,255,255,0.03)",
                    color: "rgba(255,255,255,0.35)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }
            }
          >
            {activeFilter === f && (
              <motion.div
                layoutId="filterActive"
                className="absolute inset-0 rounded-xl"
                style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)" }}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f}</span>
          </motion.button>
        ))}
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-6 self-center" style={{ background: "rgba(255,255,255,0.07)" }} />

      {/* Sort */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.22em]" style={{ color: "rgba(255,255,255,0.2)" }}>
          <ArrowUpDown className="w-3 h-3" /> Sort
        </div>
        <div className="relative">
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="appearance-none pl-3 pr-8 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider text-slate-300 outline-none cursor-pointer transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <option value="power-desc">Highest Power</option>
            <option value="power-asc">Lowest Power</option>
            <option value="name-asc">Name A–Z</option>
            <option value="class-asc">Class A-Z</option>
            <option value="rarity-desc">Rarity</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
        </div>
      </div>
    </div>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  EMPTY STATE                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
const EmptyState = ({ onClear }: { onClear: () => void }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="col-span-full flex flex-col items-center justify-center py-24 gap-5"
  >
    <div
      className="w-20 h-20 rounded-2xl flex items-center justify-center"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      <ShieldAlert className="w-9 h-9 text-slate-600" />
    </div>
    <div className="text-center space-y-1">
      <h3
        className="text-2xl font-black uppercase text-white tracking-tight"
        style={{ fontFamily: "'Cinzel','Georgia',serif" }}
      >
        No Characters Found
      </h3>
      <p className="text-xs text-slate-600 font-mono uppercase tracking-widest">Adjust your filters or search</p>
    </div>
    <button
      onClick={onClear}
      className="px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-200 hover:scale-105"
      style={{
        background: "linear-gradient(135deg,#f59e0b22,#d9770611)",
        border: "1px solid rgba(245,158,11,0.3)",
        color: "#f59e0b",
        boxShadow: "0 0 20px rgba(245,158,11,0.1)",
      }}
    >
      Clear All Filters
    </button>
  </motion.div>
);

/* ─────────────────────────────────────────────────────────────────────────── */
/*  MAIN PAGE                                                                 */
/* ─────────────────────────────────────────────────────────────────────────── */
const Index = () => {
  const [selectedCard, setSelectedCard] = useState<GameCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortOption, setSortOption] = useState("power-desc");

  const filteredAndSortedCards = useMemo(() => {
    let result = [...cardsData] as GameCardData[];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.stats.type.toLowerCase().includes(q));
    }
    if (activeFilter !== "All") {
      result = result.filter((c) =>
        c.stats.type.toLowerCase() === activeFilter.toLowerCase().slice(0, -1) ||
        c.stats.type.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    result.sort((a, b) => {
      switch (sortOption) {
        case "power-desc": return getCardPower(b) - getCardPower(a);
        case "power-asc": return getCardPower(a) - getCardPower(b);
        case "name-asc": return a.name.localeCompare(b.name);
        case "class-asc": {
          // Fallback to empty string if c.class or c.stats.class doesn't exist on specific JSON objects
          const classA = (a as any).class || a.stats?.['class'] || "";
          const classB = (b as any).class || b.stats?.['class'] || "";
          return classA.localeCompare(classB);
        }
        case "rarity-desc": return (rarityWeight[b.rarity.toLowerCase()] || 0) - (rarityWeight[a.rarity.toLowerCase()] || 0);
        default: return 0;
      }
    });
    return result;
  }, [searchQuery, activeFilter, sortOption]);

  const handleCardClick = (card: GameCardData) => { setSelectedCard(card); setIsModalOpen(true); };
  const handleCloseModal = () => { setIsModalOpen(false); setSelectedCard(null); };
  const filters = ["All", "Heroes", "Creatures", "Spells"];

  return (
    <div
      className="min-h-screen relative overflow-x-hidden"
      style={{
        background: "rgb(4,3,8)",
        fontFamily: "'DM Sans','system-ui',sans-serif",
      }}
    >
      {/* Animated aurora */}
      <AuroraBackground />

      {/* Fine dot grid */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 40%, transparent 100%)",
        }}
      />

      {/* Horizontal scan line overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.018]"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)" }}
      />

      {/* NAV */}
      <Nav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* MAIN */}
      <main className="relative z-10 container mx-auto px-4 pb-20">

        {/* Hero */}
        <HeroSection total={cardsData.length} showing={filteredAndSortedCards.length} />

        {/* Controls */}
        <ControlsBar
          filters={filters}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          sortOption={sortOption}
          setSortOption={setSortOption}
        />

        {/* GRID */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-6 min-h-[400px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedCards.length > 0 ? (
              filteredAndSortedCards.map((card, i) => (
                <motion.div
                  layout
                  key={card.id}
                  initial={{ opacity: 0, y: 20, scale: 0.94 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4), ease: [0.16, 1, 0.3, 1] }}
                >
                  <GameCard card={card} onCardClick={handleCardClick} />
                </motion.div>
              ))
            ) : (
              <EmptyState onClear={() => { setActiveFilter("All"); setSearchQuery(""); }} />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Footer count */}
        {filteredAndSortedCards.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 flex items-center justify-center gap-3"
          >
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, rgba(245,158,11,0.3))" }} />
            <span
              className="px-4 py-1.5 rounded-full text-[10px] font-mono font-black uppercase tracking-[0.25em]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(245,158,11,0.55)",
              }}
            >
              Â⚔ {filteredAndSortedCards.length} / {cardsData.length} Characters
            </span>
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, rgba(245,158,11,0.3))" }} />
          </motion.div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        className="relative z-10 py-10 text-center border-t"
        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.4)" }}
      >
        <div className="flex items-center justify-center gap-3 mb-2">
          <div className="h-px w-10 bg-amber-500/20" />
          <Sparkles className="w-3 h-3 text-amber-500/40" />
          <div className="h-px w-10 bg-amber-500/20" />
        </div>
        <p
          className="text-[9px] uppercase tracking-[0.35em] font-black"
          style={{ color: "rgba(255,255,255,0.15)" }}
        >
          Odyssey Clash  ◆  v1.0.4  ◆  Server: Asia-1
        </p>
      </footer>

      <CardModal isOpen={isModalOpen} onClose={handleCloseModal} card={selectedCard} />
    </div>
  );
};

export default Index;
