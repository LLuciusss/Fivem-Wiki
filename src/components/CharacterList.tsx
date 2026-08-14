'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CharacterListProps {
  characters: any[];
  currentUserId?: string; // Giriş yapmış kullanıcının ID'si
}

export default function CharacterList({ characters, currentUserId }: CharacterListProps) {
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Karakterin tüm resimlerini dizi olarak alan yardımcı fonksiyon
  const getAllCharacterImages = (char: any): string[] => {
    if (!char) return [];
    let imgs: string[] = [];

    if (Array.isArray(char.image_urls) && char.image_urls.length > 0) {
      imgs = [...char.image_urls];
    }

    const singleImg =
      char.image_url ||
      char.image ||
      char.photo_url ||
      char.photo ||
      char.imageUrl ||
      char.avatar_url;

    if (singleImg && !imgs.includes(singleImg)) {
      imgs.unshift(singleImg);
    }

    return imgs;
  };

  const renderFormattedText = (text: string) => {
    if (!text) return 'Hikaye girilmemiş.';
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

  const modalImages = getAllCharacterImages(selectedCharacter);

  const openModal = (char: any) => {
    setSelectedCharacter(char);
    setActiveImageIndex(0);
  };

  // Kullanıcının bu karakterin sahibi olup olmadığını doğrulayan fonksiyon
  const isOwner = (char: any) => {
    if (!currentUserId || !char) return false;
    const charOwnerId = char.user_id || char.user || char.created_by || char.author_id;
    return charOwnerId === currentUserId;
  };

  return (
    <>
      {/* KARAKTER KARTLARI IZGARASI */}
      {characters.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {characters.map((char) => {
            const charImages = getAllCharacterImages(char);
            const coverImage = charImages[0] || null;
            const canEdit = isOwner(char); // Sahib kontrolü

            return (
              <div
                key={char.id}
                className="bg-[#0e1322] border border-slate-800/90 hover:border-indigo-500/50 rounded-3xl p-4 flex flex-col justify-between space-y-4 hover:scale-[1.01] transition duration-200 group shadow-xl relative"
              >
                <div className="space-y-3 cursor-pointer" onClick={() => openModal(char)}>
                  {/* Fotoğraf */}
                  {coverImage ? (
                    <div className="overflow-hidden rounded-2xl h-48 bg-slate-950 border border-slate-800/50 relative">
                      <img
                        src={coverImage}
                        alt={char.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                      {charImages.length > 1 && (
                        <span className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-semibold px-2 py-1 rounded-lg border border-slate-700/60">
                          📷 +{charImages.length - 1} foto
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="h-48 rounded-2xl bg-slate-900 border border-slate-800/50 flex items-center justify-center text-slate-600 text-xs font-mono">
                      Görsel Yok
                    </div>
                  )}

                  {/* Karakter İsmi */}
                  <h2 className="text-xl font-black text-white group-hover:text-indigo-400 transition">
                    {char.name}
                  </h2>

                  {/* Rozetler */}
                  <div className="flex flex-wrap gap-1.5">
                    {char.job && (
                      <span className="text-[11px] bg-slate-800/90 text-slate-300 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                        💼 {char.job}
                      </span>
                    )}
                    {char.gang && (
                      <span className="text-[11px] bg-indigo-950/90 text-indigo-300 border border-indigo-800/40 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                        🗡️ {char.gang}
                      </span>
                    )}
                    {(char.current_city || char.currentCity) && (
                      <span className="text-[11px] bg-slate-800/60 text-slate-400 px-2.5 py-1 rounded-lg font-medium inline-flex items-center gap-1">
                        🏙️ {char.current_city || char.currentCity}
                      </span>
                    )}
                  </div>

                  {/* Özet Hikaye */}
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed pt-1">
                    {char.story || 'Hikaye eklenmemiş.'}
                  </p>
                </div>

                {/* Alt Kısım */}
                <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  {/* Profil Yönlendirme Linki */}
                  <Link
                    href={`/profile/${char.profiles?.id}`}
                    className="flex items-center gap-2 group/profile cursor-pointer"
                  >
                    <div className="w-5 h-5 rounded-full bg-slate-800 overflow-hidden ring-1 ring-slate-700/50 group-hover/profile:ring-indigo-500 transition">
                      {char.profiles?.avatar_url ? (
                        <img src={char.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[9px] text-slate-400">@</div>
                      )}
                    </div>
                    <span className="text-slate-400 group-hover/profile:text-indigo-400 font-medium text-[11px] transition">
                      @{char.profiles?.username || 'Vatandaş'}
                    </span>
                  </Link>

                  {/* Sadece karakter sahibi ise "Düzenle" butonunu göster */}
                  {canEdit && (
                    <Link
                      href={`/characters/${char.id}/edit`}
                      className="text-xs bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white px-2.5 py-1 rounded-lg font-semibold transition border border-slate-700/60"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ✏️ Düzenle
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center text-slate-500 bg-[#0e1322] border border-slate-800/80 rounded-3xl">
          Arşivde henüz kayıtlı bir karakter bulunmuyor.
        </div>
      )}

      {/* DETAY POPUP MODAL */}
      {selectedCharacter && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedCharacter(null)}
        >
          <div
            className="bg-[#0e1322] border border-slate-800/80 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative flex flex-col space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Kapat & Düzenle Butonları */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              {/* Sadece sahibi görebilir */}
              {isOwner(selectedCharacter) && (
                <Link
                  href={`/characters/${selectedCharacter.id}/edit`}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-full shadow-md transition"
                >
                  ✏️ Düzenle
                </Link>
              )}
              <button
                onClick={() => setSelectedCharacter(null)}
                className="w-8 h-8 bg-slate-950/80 hover:bg-black text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-700/60 transition backdrop-blur-md cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* FOTOĞRAFLAR */}
            {modalImages.length > 0 ? (
              <div className="space-y-2">
                <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/50 shadow-lg">
                  <img
                    src={modalImages[activeImageIndex] || modalImages[0]}
                    alt={selectedCharacter.name}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>

                {modalImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1 pt-1">
                    {modalImages.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setActiveImageIndex(index)}
                        className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition flex-shrink-0 ${
                          activeImageIndex === index
                            ? 'border-indigo-500 scale-105'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full h-36 rounded-2xl bg-slate-950 border border-slate-800/50 flex items-center justify-center text-slate-600 text-xs font-mono">
                Görsel Eklenmemiş
              </div>
            )}

            {/* İsim ve Detaylar */}
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {selectedCharacter.name}
              </h2>

              <div className="flex flex-wrap gap-2">
                {selectedCharacter.job && (
                  <span className="text-xs bg-slate-800/90 text-slate-200 border border-slate-700/60 px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1.5">
                    💼 Meslek: {selectedCharacter.job}
                  </span>
                )}
                {selectedCharacter.gang && (
                  <span className="text-xs bg-indigo-950/90 text-indigo-300 border border-indigo-800/60 px-3 py-1.5 rounded-xl font-semibold inline-flex items-center gap-1.5">
                    🗡️ Oluşum: {selectedCharacter.gang}
                  </span>
                )}
                {(selectedCharacter.birth_date || selectedCharacter.birthDate) && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    📅 Doğum Tarihi: {selectedCharacter.birth_date || selectedCharacter.birthDate}
                  </span>
                )}
                {(selectedCharacter.birth_place || selectedCharacter.birthPlace) && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    📍 Doğum Yeri: {selectedCharacter.birth_place || selectedCharacter.birthPlace}
                  </span>
                )}
                {(selectedCharacter.current_city || selectedCharacter.currentCity) && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    🏙️ Şehir: {selectedCharacter.current_city || selectedCharacter.currentCity}
                  </span>
                )}
                {selectedCharacter.height && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    📏 Boy: {selectedCharacter.height}
                  </span>
                )}
                {selectedCharacter.weight && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    ⚖️ Kilo: {selectedCharacter.weight}
                  </span>
                )}
                {(selectedCharacter.hair_color || selectedCharacter.hairColor) && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    💈 Saç: {selectedCharacter.hair_color || selectedCharacter.hairColor}
                  </span>
                )}
                {(selectedCharacter.eye_color || selectedCharacter.eyeColor) && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    👁️ Göz: {selectedCharacter.eye_color || selectedCharacter.eyeColor}
                  </span>
                )}
                {(selectedCharacter.physical_build || selectedCharacter.physicalBuild) && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    💪 Yapı: {selectedCharacter.physical_build || selectedCharacter.physicalBuild}
                  </span>
                )}
              </div>
            </div>

            {/* Hikaye */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <span className="text-[11px] font-bold text-indigo-400 tracking-wider uppercase block px-1">
                KARAKTER DOSYASI & TAM BİYOGRAFİSİ
              </span>

              <div className="bg-[#080d19] border border-slate-800/80 rounded-2xl p-5 text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-wrap font-normal">
                {renderFormattedText(selectedCharacter.story)}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}