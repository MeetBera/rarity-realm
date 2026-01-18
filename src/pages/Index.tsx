import { useState } from "react";
import { motion } from "framer-motion"; // Make sure to npm install framer-motion
import { GameCard, GameCardData } from "@/components/GameCard";
import { CardModal } from "@/components/CardModal";
import cardsData from "@/data/cards.json";
import { Sparkles, Coins, Gem, Menu, Search } from "lucide-react";

const Index = () => {
  const [selectedCard, setSelectedCard] = useState<GameCardData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCardClick = (card: GameCardData) => {
    setSelectedCard(card);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
  };

  // Stagger animation for the grid
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-x-hidden font-sans selection:bg-amber-500/30">
      
      {/* --- BACKGROUND FX --- */}
      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20" 
           style={{ backgroundImage: 'linear-gradient(to right, #334155 1px, transparent 1px), linear-gradient(to bottom, #334155 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />
      {/* Radial Vignette */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950" />

      
      {/* --- GAME HUD (HEADS UP DISPLAY) --- */}
      <nav className="relative z-50 border-b border-white/10 bg-slate-950/50 backdrop-blur-md sticky top-0">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            {/* Left: Menu Icon */}
            <div className="p-2 hover:bg-white/10 rounded-md cursor-pointer transition-colors">
                <Menu className="text-slate-400 w-6 h-6" />
            </div>

            {/* Center: Search Bar (Visual Only) */}
            <div className="hidden md:flex items-center gap-2 bg-slate-900/50 border border-white/5 rounded-full px-4 py-1.5 w-64 text-slate-400">
                <Search className="w-4 h-4" />
                <span className="text-sm">Search Collection...</span>
            </div>

            {/* Right: Player Stats */}
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="bg-amber-500/20 p-1.5 rounded-lg border border-amber-500/50">
                        <Coins className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gold</span>
                        <span className="text-sm text-slate-200 font-mono font-bold">24,500</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <div className="bg-cyan-500/20 p-1.5 rounded-lg border border-cyan-500/50">
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
        <div className="text-center mb-16 relative">
            {/* Glow behind text */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] bg-amber-500/20 blur-[100px] rounded-full pointer-events-none" />
            
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <div className="flex items-center justify-center gap-3 mb-4 text-amber-500">
                    <Sparkles className="w-5 h-5" />
                    <span className="text-sm font-bold tracking-[0.3em] uppercase opacity-80">New Genesis</span>
                    <Sparkles className="w-5 h-5" />
                </div>
                
                <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
                    <span className="bg-gradient-to-b from-white via-slate-200 to-slate-500 bg-clip-text text-transparent drop-shadow-2xl">
                        CONQUEROR'S
                    </span>
                    <span className="block text-transparent bg-clip-text bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 drop-shadow-sm">
                        ODYSSEY
                    </span>
                </h1>
                
                <p className="text-lg text-slate-400 max-w-lg mx-auto leading-relaxed">
                    Assemble your deck. Discover legendary warriors and mythical creatures in the ultimate battle for glory.
                </p>
            </motion.div>
        </div>

        {/* Filters (Visual Only) */}
        <div className="flex justify-center gap-4 mb-12">
            {['All', 'Heroes', 'Creatures', 'Spells'].map((filter, i) => (
                <button 
                    key={filter} 
                    className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                        i === 0 
                        ? 'bg-amber-500 text-black shadow-[0_0_20px_-5px_rgba(245,158,11,0.5)]' 
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-600 hover:text-white'
                    }`}
                >
                    {filter}
                </button>
            ))}
        </div>

        {/* Card Grid */}
        <motion.div 
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
          {cardsData.map((card) => (
            <motion.div key={card.id} variants={itemVariants} className="w-full">
                <GameCard
                  card={card as GameCardData}
                  onCardClick={handleCardClick}
                />
            </motion.div>
          ))}
        </motion.div>

      </main>

      {/* Footer / Decorative Bottom */}
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