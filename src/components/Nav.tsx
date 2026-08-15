import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Coins, Gem, Menu, Swords } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

/* ─── TICKER items ─── */
const TICKER_ITEMS = [
  "⚔️   SEASON IV UNDERWAY", "✦   NEW MYTHICAL CARDS RELEASED",
  "🔥   LEGENDARY DROP RATE +25%", "💎   ARENA SEASON FINALS THIS WEEKEND",
  "⚡   DOUBLE XP EVENT ACTIVE", "🏆   MONSTERDEX CUP OPEN REGISTRATION",
];

/* ─────────────────────────────────────────────────────────────────────────── */
/*  TICKER TAPE                                                               */
/* ─────────────────────────────────────────────────────────────────────────── */
export const TickerTape = () => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden border-b border-amber-500/15 bg-black/40 backdrop-blur-sm" style={{ height: 28 }}>
      <motion.div
        className="flex gap-0 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 32, ease: "linear", repeat: Infinity }}
      >
        {items.map((item, i) => (
          <span key={i} className="inline-flex items-center gap-6 px-8 text-[10px] font-black uppercase tracking-[0.22em]"
            style={{ color: "rgba(245,158,11,0.65)", lineHeight: "28px" }}>
            {item}
            <span style={{ color: "rgba(245,158,11,0.2)" }}>◆</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export const CurrencyChip = ({ icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div
    className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border"
    style={{
      background: `${color}0e`,
      borderColor: `${color}28`,
      shadowColor: `0 0 12px ${color}10`,
    }}
  >
    {icon}
    <div className="flex flex-col leading-none">
      <span className="text-[8px] uppercase tracking-[0.25em] font-black" style={{ color: `${color}80` }}>{label}</span>
      <span className="text-xs font-mono font-black text-white">{value}</span>
    </div>
  </div>
);

export const Nav = ({ searchQuery, setSearchQuery }: { searchQuery?: string; setSearchQuery?: (v: string) => void }) => {
  const [mobileSearch, setMobileSearch] = useState(false);
  const location = useLocation();

  return (
    <nav className="relative z-50 top-0">
      <TickerTape />
      <div
        className="border-b border-white/[0.07] backdrop-blur-xl shadow-[0_1px_0_rgba(245,158,11,0.08)]"
        style={{ background: "rgba(4,3,8,0.92)" }}
      >
        <div className="container mx-auto px-4 h-[60px] flex items-center justify-between gap-4">

          {/* LEFT — logo */}
          <Link to="/" className="flex items-center gap-3 flex-shrink-0">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", boxShadow: "0 0 18px rgba(245,158,11,0.4)" }}
            >
              <Swords className="w-4 h-4 text-black" />
            </div>
            <div className="hidden sm:block">
              <div
                className="text-base font-black uppercase leading-none tracking-[0.1em]"
                style={{ fontFamily: "'Cinzel','Georgia',serif", color: "#fde68a" }}
              >
                Monsterdex
              </div>
            </div>
          </Link>

          {/* CENTER — search or links */}
          <div className="hidden md:flex items-center gap-6 flex-1 max-w-lg mx-auto pl-8">
            <Link to="/" className={`text-[11px] font-black uppercase tracking-wider transition-colors ${location.pathname === '/' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              List
            </Link>
            <Link to="/lucky" className={`text-[11px] font-black uppercase tracking-wider transition-colors ${location.pathname === '/lucky' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Tavern (Lucky)
            </Link>
            <Link to="/gauntlet" className={`text-[11px] font-black uppercase tracking-wider transition-colors ${location.pathname === '/gauntlet' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Gauntlet
            </Link>
            <Link to="/trivia" className={`text-[11px] font-black uppercase tracking-wider transition-colors ${location.pathname === '/trivia' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}>
              Trivia
            </Link>

            {setSearchQuery && (
              <div className="flex items-center gap-2.5 flex-1 max-w-xs ml-auto rounded-xl px-4 py-2 border transition-all duration-300 focus-within:border-amber-500/50 focus-within:shadow-[0_0_20px_rgba(245,158,11,0.12)]"
                style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.08)" }}
              >
                <Search className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(245,158,11,0.5)" }} />
                <input
                  type="text"
                  placeholder="Search warriors…"
                  value={searchQuery || ''}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full"
                  style={{ fontFamily: "inherit" }}
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}>
                    <X className="w-3 h-3 text-slate-500 hover:text-white transition-colors" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* RIGHT — currency + menu */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <CurrencyChip icon={<Coins className="w-3.5 h-3.5 text-amber-400" />} label="Gold" value="24,500" color="#f59e0b" />
            <CurrencyChip icon={<Gem className="w-3.5 h-3.5 text-cyan-400" />} label="Gems" value="1,200" color="#22d3ee" />
            <button
              className="p-2 rounded-lg transition-all duration-200 hover:bg-white/8 border border-transparent hover:border-white/10"
              onClick={() => setMobileSearch(!mobileSearch)}
            >
              <Menu className="w-5 h-5 text-slate-400 hover:text-white transition-colors" />
            </button>
          </div>
        </div>

        {/* Mobile search / links */}
        <AnimatePresence>
          {mobileSearch && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden border-t border-white/[0.06] overflow-hidden"
            >
              <div className="px-4 py-3 flex flex-col gap-3">
                <Link to="/" className={`text-sm font-black uppercase tracking-wider transition-colors ${location.pathname === '/' ? 'text-amber-400' : 'text-slate-400'}`}>
                  Roster
                </Link>
                <Link to="/lucky" className={`text-sm font-black uppercase tracking-wider transition-colors ${location.pathname === '/lucky' ? 'text-amber-400' : 'text-slate-400'}`}>
                  Tavern (Lucky)
                </Link>
                <Link to="/gauntlet" className={`text-sm font-black uppercase tracking-wider transition-colors ${location.pathname === '/gauntlet' ? 'text-amber-400' : 'text-slate-400'}`}>
                  Gauntlet
                </Link>
                <Link to="/trivia" className={`text-sm font-black uppercase tracking-wider transition-colors ${location.pathname === '/trivia' ? 'text-amber-400' : 'text-slate-400'}`}>
                  Trivia
                </Link>
                
                {setSearchQuery && (
                  <div className="flex items-center gap-2.5 mt-2">
                    <Search className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search warriors…"
                      value={searchQuery || ''}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
