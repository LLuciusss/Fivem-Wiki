'use client';
import { useState } from 'react';
import { Camera, Maximize2, X } from 'lucide-react';

export default function CharacterGallery({ gallery }: { gallery: any[] }) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (!gallery || gallery.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-xl font-bold text-white">
        <Camera className="w-6 h-6 text-blue-500" />
        <span>Fotoğraf Galerisi ve IC Kayıtlar</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {gallery.map((item, index) => (
          <div
            key={index}
            onClick={() => setSelectedImage(item.image_url)}
            className="group relative h-48 rounded-xl overflow-hidden border border-blue-900/40 cursor-pointer bg-black/40"
          >
            <img 
              src={item.image_url} 
              alt={item.caption || 'Galeri görseli'} 
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
              <p className="text-sm text-white font-medium flex items-center justify-between w-full">
                <span>{item.caption || 'Detaylar'}</span>
                <Maximize2 className="w-4 h-4 text-blue-400" />
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Modal Görünümü */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-3 bg-blue-950/80 border border-blue-500/30 rounded-full text-white hover:bg-blue-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={selectedImage} alt="Büyük Görsel" className="max-w-full max-h-[90vh] object-contain rounded-lg" />
        </div>
      )}
    </div>
  );
}