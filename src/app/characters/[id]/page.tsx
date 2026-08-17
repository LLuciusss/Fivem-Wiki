'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';

export default function CharacterDetailPage() {
  const params = useParams();
  const characterId = params.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [character, setCharacter] = useState<any>(null);
  const [characterRelations, setCharacterRelations] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Oturum açan kullanıcıyı ve karakter verilerini çekme
  useEffect(() => {
    async function fetchData() {
      // 1. Aktif oturum kontrolü
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUserId(session.user.id);
      }

      // 2. Karakter verisini çekme
      const { data: charData, error } = await supabase
        .from('characters')
        .select('*, profiles(id, username, avatar_url)')
        .eq('id', characterId)
        .single();

      if (error || !charData) {
        setLoading(false);
        return;
      }

      setCharacter(charData);

      // Resimleri birleştirme ve dizi haline getirme mantığı
      let imgs: string[] = [];
      if (Array.isArray(charData.image_urls) && charData.image_urls.length > 0) {
        imgs = [...charData.image_urls];
      }
      const singleImg = charData.image_url || charData.image || charData.photo_url;
      if (singleImg && !imgs.includes(singleImg)) {
        imgs.unshift(singleImg);
      }
      setImages(imgs);

      // İlişkileri çek (Doğru FK hint ile güncellendi)
      const { data: relData } = await supabase
        .from('character_relations')
        .select('*, target_character:characters!target_character_id(id, name, image_url, job)')
        .eq('character_id', charData.id);

      if (relData) {
        setCharacterRelations(relData);
      }

      setLoading(false);
    }

    if (characterId) {
      fetchData();
    }
  }, [characterId]);

  // 5 saniyede bir otomatik fotoğraf değiştirme
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setActiveImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Sadece karakterin sahibi ise sürükleyip sıralayabilir ve veritabanına kaydedebilir
  const isOwner = character && currentUserId && character.user_id === currentUserId;

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isOwner) return;
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isOwner) return;
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetIndex: number) => {
    if (!isOwner) return;
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    if (!sourceIndexStr) return;

    const sourceIndex = parseInt(sourceIndexStr, 10);
    if (sourceIndex === targetIndex) return;

    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(sourceIndex, 1);
    updatedImages.splice(targetIndex, 0, movedImage);

    setImages(updatedImages);
    setActiveImageIndex(targetIndex);

    // Yeni sıralamayı Supabase veritabanına kalıcı olarak kaydedelim
    await supabase
      .from('characters')
      .update({ image_urls: updatedImages })
      .eq('id', character.id);
  };

  // Biyografideki **kalın** yazıları JSX olarak biçimlendiren yardımcı fonksiyon
  const renderFormattedText = (text: string) => {
    if (!text) return 'Hikaye eklenmemiş.';
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-bold text-slate-100">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Karakter dosyası yükleniyor...
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Karakter bulunamadı.
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Üst Navigasyon / Geri Dön */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <Link
            href="/"
            className="text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-indigo-500/50 px-4 py-2 rounded-xl text-slate-300 transition flex items-center gap-2"
          >
            ← Arşive Geri Dön
          </Link>
        </div>

        {/* Ana İçerik */}
        <div className="bg-[#0e1322] border border-slate-800/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          {/* Görsel Alanı & Otomatik/İnteraktif Galeri */}
          {images.length > 0 ? (
            <div className="space-y-3">
              {/* Ana Görsel Alanı */}
              <div className="w-full h-72 md:h-96 rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/50 shadow-lg relative flex items-center justify-center">
                <img
                  src={images[activeImageIndex]}
                  alt={character.name}
                  className="max-h-full max-w-full object-contain transition-all duration-500"
                />

                {/* Fotoğraf Sayacı Rozeti */}
                {images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-[11px] font-semibold px-3 py-1 rounded-xl border border-slate-700/60 z-10">
                    📷 {activeImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Küçük Resim Şeridi */}
              {images.length > 1 && (
                <div className="space-y-1.5">
                  {isOwner && (
                    <p className="text-[10px] text-slate-400 font-medium px-1">
                      💡 İpucu: Fotoğrafların sırasını değiştirmek için küçük resimleri sürükleyip bırakabilirsiniz.
                    </p>
                  )}
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-800">
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        draggable={isOwner}
                        onDragStart={(e) => handleDragStart(e, idx)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, idx)}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all bg-slate-950 flex items-center justify-center ${
                          isOwner ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                        } ${
                          activeImageIndex === idx
                            ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/20'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="max-h-full max-w-full object-contain pointer-events-none" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-48 rounded-2xl bg-slate-900 border border-slate-800/50 flex items-center justify-center text-slate-600 text-xs font-mono">
              Görsel Bulunmuyor
            </div>
          )}

          {/* İsim ve Genişletilmiş Rozetler */}
          <div className="space-y-3">
            <h1 className="text-3xl md:text-4xl font-black text-white">{character.name}</h1>
            
            <div className="flex flex-wrap gap-2">
              {character.job && (
                <span className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700/60 px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1.5">
                  💼 Meslek: {character.job}
                </span>
              )}
              {character.gang && (
                <span className="text-xs bg-indigo-950/90 text-indigo-300 border border-indigo-800/60 px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1.5">
                  🗡️ Oluşum: {character.gang}
                </span>
              )}
              {character.birth_date && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  📅 Doğum Tarihi: {character.birth_date}
                </span>
              )}
              {character.birth_place && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  📍 Doğum Yeri: {character.birth_place}
                </span>
              )}
              {character.current_city && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  🏙️ Şehir: {character.current_city}
                </span>
              )}
              {character.height && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  📏 Boy: {character.height}
                </span>
              )}
              {character.weight && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  ⚖️ Kilo: {character.weight}
                </span>
              )}
              {character.hair_color && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  💈 Saç: {character.hair_color}
                </span>
              )}
              {character.eye_color && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  👁️ Göz: {character.eye_color}
                </span>
              )}
              {character.physical_build && (
                <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                  💪 Yapı: {character.physical_build}
                </span>
              )}
            </div>
          </div>

          {/* Karakter İlişkileri Bölümü */}
          <div className="space-y-2 pt-4 border-t border-slate-800/60">
            <span className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase block px-1">
              🔗 KARAKTER İLİŞKİLERİ & BAĞLARI
            </span>

            <div className="bg-[#080d19] border border-slate-800/80 rounded-2xl p-4 space-y-2">
              {characterRelations && characterRelations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {characterRelations.map((rel: any) => (
                    <Link
                      key={rel.id}
                      href={`/characters/${rel.target_character?.id}`}
                      className="bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-2.5 rounded-xl flex items-center justify-between transition group"
                    >
                      <div className="flex items-center gap-2">
                        {rel.target_character?.image_url && (
                          <img src={rel.target_character.image_url} alt="" className="w-8 h-8 rounded-lg object-contain bg-slate-950" />
                        )}
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition">
                            {rel.target_character?.name || 'Bilinmeyen Karakter'}
                          </p>
                          <p className="text-[10px] text-indigo-400 capitalize font-medium">{rel.relation_type}</p>
                        </div>
                      </div>
                      {rel.description && (
                        <span className="text-[10px] text-slate-300 bg-slate-800 px-2 py-1 rounded-md max-w-[120px] truncate" title={rel.description}>
                          {rel.description}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic">Bu karakterin kayıtlı bir ilişkisi bulunmuyor.</p>
              )}
            </div>
          </div>

          {/* Hikaye Alanı ve Biçimlendirilmiş Metin Desteği */}
          <div className="space-y-2 pt-4 border-t border-slate-800/60">
            <h2 className="text-xs font-bold text-indigo-400 tracking-wider uppercase">
              Karakter Dosyası & Biyografi
            </h2>
            <div className="bg-[#080d19] border border-slate-800/80 rounded-2xl p-5 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
              {renderFormattedText(character.story)}
            </div>
          </div>

          {/* Oluşturan Profil Bilgisi */}
          {character.profiles && (
            <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
              <span className="text-xs text-slate-500">Dosya Sahibi:</span>
              <Link
                href={`/profile/${character.profiles.id}`}
                className="flex items-center gap-2 text-xs text-slate-300 hover:text-indigo-400 font-medium transition"
              >
                {character.profiles.avatar_url && (
                  <img src={character.profiles.avatar_url} alt="" className="w-5 h-5 rounded-full object-cover" />
                )}
                @{character.profiles.username || 'Vatandaş'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}