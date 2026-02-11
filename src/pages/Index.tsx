import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion"; 
import { GameCard, GameCardData } from "@/components/GameCard";
import { CardModal } from "@/components/CardModal";
import cardsData from "@/data/cards.json";
import { 
  Sparkles, 
  Coins, 
  Gem, 
  Menu, 
  Search, 
  Filter, 
  ArrowUpDown, 
  Swords, 
  ShieldAlert 
} from "lucide-react";
import { cn } from "@/lib/utils";

// Helper to calculate total power for sorting
const getCardPower = (card: GameCardData) => {
  const { hp, attack, defense, mana, intelligence, speed } = card.stats;
  return hp + attack + defense + mana + intelligence + speed;
};

// Rarity weight for sorting
const rarityWeight = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
  mythical: 5,
} as Record<string, number>;

const Index = () => {
  const [selectedCard, setSelectedCard] = useState<GameCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // --- FILTER & SORT STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortOption, setSortOption] = useState("power-desc");

  // --- CORE LOGIC ENGINE ---
  const filteredAndSortedCards = useMemo(() => {
    let result = [...cardsData] as GameCardData[];

    // 1. Search Logic
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(card => 
        card.name.toLowerCase().includes(query) || 
        card.stats.type.toLowerCase().includes(query)
      );
    }

    // 2. Category Filter Logic
    if (activeFilter !== "All") {
      result = result.filter(card => 
        // Assumes your JSON has 'Hero', 'Creature', etc. in card.stats.type
        // We normalize to lowercase for safer comparison
        card.stats.type.toLowerCase() === activeFilter.toLowerCase().slice(0, -1) || // e.g. "Heroes" -> "hero"
        card.stats.type.toLowerCase() === activeFilter.toLowerCase() // Direct match
      );
    }

    // 3. Sorting Logic
    result.sort((a, b) => {
      switch (sortOption) {
        case "power-desc":
          return getCardPower(b) - getCardPower(a);
        case "power-asc":
          return getCardPower(a) - getCardPower(b);
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "rarity-desc":
          return (rarityWeight[b.rarity.toLowerCase()] || 0) - (rarityWeight[a.rarity.toLowerCase()] || 0);
        default:
          return 0;
      }
    });

    return result;
  }, [searchQuery, activeFilter, sortOption]);

  // Handlers
  const handleCardClick = (card: GameCardData) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  // Categories defined manually for control, or you could derive from data
  const filters = ['All', 'Heroes', 'Creatures', 'Spells'];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden font-sans selection:bg-amber-500/30">
      
      {/* --- BACKGROUND FX --- */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950" />

      
      {/* --- GAME HUD --- */}
      <nav className="relative z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 shadow-2xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Left: Menu */}
            <div className="p-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors group">
                <Menu className="text-slate-400 group-hover:text-white w-6 h-6 transition-colors" />
            </div>

            {/* Center: Functional Search Bar */}
            <div className="hidden md:flex items-center gap-3 bg-slate-900/80 border border-white/10 focus-within:border-amber-500/50 focus-within:ring-2 focus-within:ring-amber-500/20 rounded-full px-4 py-2 w-80 transition-all shadow-inner">
                <Search className="w-4 h-4 text-slate-500" />
                <input 
                  type="text" 
                  placeholder="Search Collection..." 
                  className="bg-transparent border-none outline-none text-sm text-slate-200 placeholder:text-slate-600 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Right: Player Stats */}
            <div className="flex items-center gap-4 md:gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                        <Coins className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gold</span>
                        <span className="text-sm text-slate-200 font-mono font-bold">24,500</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-cyan-500/20 p-1.5 rounded-lg border border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                        <Gem className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gems</span>
                        <span className="text-sm text-slate-200 font-mono font-bold">1,200</span>
                    </div>
                </div>
            </div>
        </div>
      </nav>


      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 container mx-auto px-4 py-12">
        
        {/* Title Section */}
        <div className="text-center mb-12 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex items-center justify-center gap-3 mb-4 text-amber-500">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="text-sm font-bold tracking-[0.3em] uppercase opacity-80">New Genesis</span>
                    <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                    <span className="bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-2xl">
                        CONQUEROR'S
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 drop-shadow-sm">
                        ODYSSEY
                    </span>
                </h1>
            </motion.div>
        </div>

        {/* --- CONTROLS BAR --- */}
        <div className="sticky top-20 z-40 mb-10 mx-auto max-w-5xl backdrop-blur-xl bg-slate-900/60 border border-white/10 rounded-2xl p-2 md:p-3 shadow-2xl flex flex-col md:flex-row gap-4 justify-between items-center">
             
             {/* Filter Tabs */}
             <div className="flex gap-1 md:gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                {filters.map((filter) => (
                  <button 
                    key={filter} 
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-4 md:px-6 py-2 rounded-xl text-xs md:text-sm font-bold uppercase tracking-wide transition-all whitespace-nowrap border",
                      activeFilter === filter
                        ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)] scale-105" 
                        : "bg-slate-800/50 border-transparent text-slate-400 hover:bg-slate-800 hover:text-white hover:border-white/10"
                    )}
                  >
                    {filter}
                  </button>
                ))}
             </div>

             {/* Sort Dropdown */}
             <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-wider pl-2">
                  <Filter className="w-3 h-3" /> Sort By
                </div>
                <div className="relative flex-1 md:flex-none">
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full md:w-48 appearance-none bg-slate-950 border border-slate-700 rounded-lg py-2 pl-4 pr-10 text-sm text-slate-200 font-medium focus:outline-none focus:border-amber-500/50 cursor-pointer hover:bg-slate-900 transition-colors"
                  >
                    <option value="power-desc">Highest Power</option>
                    <option value="power-asc">Lowest Power</option>
                    <option value="name-asc">Name (A-Z)</option>
                    <option value="rarity-desc">Rarity (Highest)</option>
                  </select>
                  <ArrowUpDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
             </div>
        </div>

        {/* --- GRID --- */}
        <motion.div 
            layout
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 md:gap-8 min-h-[400px]"
        >
          <AnimatePresence mode="popLayout">
            {filteredAndSortedCards.length > 0 ? (
              filteredAndSortedCards.map((card) => (
                <motion.div 
                  layout
                  key={card.id} 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <GameCard
                    card={card}
                    onCardClick={handleCardClick}
                  />
                </motion.div>
              ))
            ) : (
              /* Empty State */
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 space-y-4"
              >
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <ShieldAlert className="w-8 h-8 opacity-50" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-slate-300">No Warriors Found</h3>
                  <p className="text-sm">Try adjusting your filters or search query.</p>
                </div>
                <button 
                  onClick={() => {setActiveFilter('All'); setSearchQuery('');}}
                  className="text-amber-500 text-sm font-bold uppercase tracking-widest hover:text-amber-400 underline underline-offset-4"
                >
                  Clear Filters
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Results Count Footer */}
        <div className="mt-8 text-center">
           <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-slate-900 border border-white/5 text-xs font-mono text-slate-500">
             <Swords className="w-3 h-3" />
             Showing {filteredAndSortedCards.length} / {cardsData.length} Cards
           </span>
        </div>

      </main>

      <footer className="relative z-10 py-12 text-center text-slate-600 text-sm border-t border-white/5 bg-slate-950/50 mt-20">
            <p className="uppercase tracking-widest font-bold opacity-50">Odyssey Clash • v1.0.4 • server: Asia-1</p>
      </footer>

      <CardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        card={selectedCard}
      />
    </div>
  );
};

export default Index;