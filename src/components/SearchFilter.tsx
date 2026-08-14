'use client';
import { Search, Filter } from 'lucide-react';

interface SearchFilterProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedFaction: string;
  setSelectedFaction: (f: string) => void;
}

export default function SearchFilter({
  searchQuery,
  setSearchQuery,
  selectedFaction,
  setSelectedFaction
}: SearchFilterProps) {
  const factions = ['Hepsini Göster', 'Polis', 'Sağlık', 'Adalet', 'Çete / Mafya', 'Sivil'];

  return (
    <div className="space-y-4">
      {/* Arama Alanı */}
      <div className="relative">
        <Search className="absolute left-4 top-3.5 w-5 h-5 text-blue-400" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Karakter adı veya oyuncu ara..."
          className="w-full bg-black/60 border border-blue-900/60 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-300/40 focus:border-blue-500 outline-none text-sm transition"
        />
      </div>

      {/* Filtreleme Butonları */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <Filter className="w-4 h-4 text-blue-400 flex-shrink-0 mr-1" />
        {factions.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFaction(f === 'Hepsini Göster' ? '' : f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              (f === 'Hepsini Göster' && selectedFaction === '') || selectedFaction === f
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-black/40 text-blue-200/70 border border-blue-900/40 hover:bg-blue-950/40'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}