import React, { useState } from 'react';

// Define the shape of our data
interface CardStats {
  hp: number;
  attack: number;
  defense: number;
  mana: number;
  speed: number;
  intelligence: number;
  range: string;
  type: string;
}

interface CardData {
  name: string;
  rarity: string;
  image: string;
  lore: string;
  stats: CardStats;
}

const initialStats: CardStats = {
  hp: 0, attack: 0, defense: 0, mana: 0, speed: 0, intelligence: 0, range: 'Melee', type: 'organic'
};

const AddCard = () => {
  const [formData, setFormData] = useState<CardData>({
    name: '',
    rarity: 'common',
    image: '',
    lore: '',
    stats: initialStats
  });

  const [status, setStatus] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      stats: {
        ...prev.stats,
        // Convert numbers, keep strings as strings
        [name]: ['range', 'type'].includes(name) ? value : Number(value)
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Saving...');

    // Calculate total stats automatically
    const totalStats = 
      formData.stats.hp + formData.stats.attack + formData.stats.defense + 
      formData.stats.mana + formData.stats.speed + formData.stats.intelligence;

    const payload = {
      ...formData,
      stats: { ...formData.stats, total: totalStats }
    };

    try {
      const response = await fetch('http://localhost:3001/add-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatus('Success! Card added to JSON.');
        // Optional: Reset form here
      } else {
        setStatus('Error saving card.');
      }
    } catch (error) {
      console.error(error);
      setStatus('Error: Is the node server running?');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-2xl bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400">Add New Card</h2>

        {/* Basic Info */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Card Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Rarity</label>
            <select name="rarity" value={formData.rarity} onChange={handleChange} className="w-full bg-gray-700 rounded p-2">
              <option value="common">Common</option>
              <option value="rare">Rare</option>
              <option value="epic">Epic</option>
              <option value="legendary">Legendary</option>
              <option value="mythical">Mythical</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-400 mb-1">Image URL</label>
          <input type="text" name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="w-full bg-gray-700 rounded p-2" />
        </div>

        <div className="mb-6">
          <label className="block text-sm text-gray-400 mb-1">Lore</label>
          <textarea name="lore" value={formData.lore} onChange={handleChange} rows={3} className="w-full bg-gray-700 rounded p-2" />
        </div>

        {/* Stats Section */}
        <h3 className="text-xl font-semibold mb-4 text-emerald-400 border-b border-gray-600 pb-2">Stats</h3>
        <div className="grid grid-cols-3 gap-4 mb-4">
          {['hp', 'attack', 'defense', 'mana', 'speed', 'intelligence'].map((stat) => (
            <div key={stat}>
              <label className="block text-xs uppercase text-gray-500 mb-1">{stat}</label>
              <input 
                type="number" 
                name={stat} 
                // @ts-ignore
                value={formData.stats[stat]} 
                onChange={handleStatChange} 
                className="w-full bg-gray-700 rounded p-2" 
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div>
            <label className="block text-sm text-gray-400 mb-1">Monster Type</label>
            {/* UPDATED: Changed from Select to Input */}
            <input 
              type="text" 
              name="range" 
              value={formData.stats.range} 
              onChange={handleStatChange} 
              className="w-full bg-gray-700 rounded p-2" 
              placeholder="monster"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">environment Type</label>
            <input type="text" name="type" value={formData.stats.type} onChange={handleStatChange} className="w-full bg-gray-700 rounded p-2" />
          </div>
        </div>

        <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded transition-colors">
          Add Card to JSON
        </button>

        {status && <p className="mt-4 text-center text-yellow-400">{status}</p>}
      </form>
    </div>
  );
};

export default AddCard;