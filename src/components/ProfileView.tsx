'use client';
import { useState } from 'react';

export default function ProfileView({ profile, character }: { profile: any, character: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const bannerBg = profile?.banner_url ? `url(${profile.banner_url})` : 'linear-gradient(to right, #000000, #0f172a, #000000)';

  return (
    <div className="relative min-h-screen bg-black text-white pb-12">
      {/* Banner Bölümü */}
      <div 
        className="h-64 w-full bg-cover bg-center border-b border-blue-900/40 relative"
        style={{ backgroundImage: bannerBg }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-20 relative z-10">
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 pb-6 border-b border-blue-900/40">
          <div className="w-32 h-32 rounded-2xl bg-blue-600 border-4 border-black overflow-hidden shadow-2xl flex items-center justify-center text-3xl font-bold">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <span>{profile?.username?.[0] || 'O'}</span>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-1">
            <h1 className="text-3xl font-black text-white">
              {character?.name || 'Karakter Adı Yok'}
            </h1>
            <p className="text-blue-400 font-medium text-sm">@{profile?.username || 'Kullanıcı'}</p>
          </div>
        </div>

        {/* İçerik Detayları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-black/60 border border-blue-900/40 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Dosya Bilgileri</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Meslek:</span>
                <span className="font-medium text-white">{character?.job || 'Bilinmiyor'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Organizasyon:</span>
                <span className="font-medium text-white">{character?.gang || 'Bağımsız'}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 bg-black/60 border border-blue-900/40 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider">Karakter Hikayesi</h3>
            <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {character?.story || 'Hikaye henüz girilmemiş.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}