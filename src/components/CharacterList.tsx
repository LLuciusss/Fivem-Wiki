'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface CharacterListProps {
  characters: any[];
  currentUserId?: string; // Giriş yapmış kullanıcının ID'si
}

export default function CharacterList({ characters, currentUserId }: CharacterListProps) {
  const router = useRouter();

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
  onClick={() => router.push(`/characters/${char.id}`)} // <- Buradaki 'character' kelimesini 'characters' yaptık
  className="bg-[#0e1322] border border-slate-800/90 hover:border-indigo-500/50 rounded-3xl p-4 flex flex-col justify-between space-y-4 hover:scale-[1.01] transition duration-200 group shadow-xl relative cursor-pointer"
>
                <div className="space-y-3">
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
                    onClick={(e) => e.stopPropagation()}
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
    </>
  );
}