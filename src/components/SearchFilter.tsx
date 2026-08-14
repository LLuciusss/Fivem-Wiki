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
    
      {/* Arama Alanı */}
      
        
         setSearchQuery(e.target.value)}
          placeholder="Karakter adı veya oyuncu ara..."
          className="w-full bg-black/60 border border-blue-900/60 rounded-xl pl-12 pr-4 py-3 text-white placeholder-blue-300/40 focus:border-blue-500 outline-none text-sm transition"
        />
      

      {/* Filtreleme Butonları */}
      
        
        {factions.map((f) => (
           setSelectedFaction(f === 'Hepsini Göster' ? '' : f)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              (f === 'Hepsini Göster' && selectedFaction === '') || selectedFaction === f
                ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.5)]'
                : 'bg-black/40 text-blue-200/70 border border-blue-900/40 hover:bg-blue-950/40'
            }`}
          >
            {f}
          
        ))}
      
    
  );
}