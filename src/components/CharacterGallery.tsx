'use client';
import { useState } from 'react';
import { Camera, Maximize2, X } from 'lucide-react';

export default function CharacterGallery({ gallery }: { gallery: any[] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!gallery || gallery.length === 0) return null;

  return (
    
      
        
        <span>Fotoğraf</span> Galerisi ve IC Kayıtlar
      

      
        {gallery.map((item) => (
           setSelectedImage(item.image_url)}
            className="group relative h-48 rounded-xl overflow-hidden border border-blue-900/40 cursor-pointer bg-black/40"
          >
            
            
              
                {item.caption || 'Detaylar'}
                
              
            
          
        ))}
      

      {/* Lightbox / Modal Görünümü */}
      {selectedImage && (
        
           setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-blue-950/80 border border-blue-500/30 rounded-full text-white hover:bg-blue-600 transition"
          >
            
          
          
        
      )}
    
  );
}