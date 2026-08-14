'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserProfilePage() {
  const params = useParams();
  const targetUserId = params.id as string;
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userCharacters, setUserCharacters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Büyük Açılır Görünüm (Modal) State'i
  const [selectedCharacter, setSelectedCharacter] = useState<any>(null);

  // Profil State'leri
  const [username, setUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [themeColor, setThemeColor] = useState('#4f46e5');
  const [bio, setBio] = useState('');

  // Sosyal Medya State'leri
  const [socialDiscord, setSocialDiscord] = useState('');
  const [socialKick, setSocialKick] = useState('');
  const [socialTwitch, setSocialTwitch] = useState('');
  const [socialInstagram, setSocialInstagram] = useState('');
  const [socialTwitter, setSocialTwitter] = useState('');
  const [socialSteam, setSocialSteam] = useState('');

  const isOwnProfile = currentUser?.id === targetUserId;

  // Biyografideki **kalın** yazıları JSX olarak biçimlendiren yardımcı fonksiyon
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

  useEffect(() => {
    async function loadDataAndAutoSync() {
      // 1. Oturum ve Kullanıcı Verisini Al
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user || null;
      setCurrentUser(user);

      // 2. Veritabanındaki Profil Verisini Çek
      const { data: profData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetUserId)
        .single();

      let currentBanner = profData?.banner_url || '';
      let currentAvatar = profData?.avatar_url || user?.user_metadata?.avatar_url || '';
      let currentTheme = profData?.theme_color || '#4f46e5';

      if (profData) {
        setProfile(profData);
        setUsername(profData.username || user?.user_metadata?.custom_claims?.global_name || 'Vatandaş');
        setBio(profData.bio || '');
        setSocialDiscord(profData.social_discord || '');
        setSocialKick(profData.social_kick || '');
        setSocialTwitch(profData.social_twitch || '');
        setSocialInstagram(profData.social_instagram || '');
        setSocialTwitter(profData.social_twitter || '');
        setSocialSteam(profData.social_steam || '');
      }

      // 3. TAM OTOMATİK DISCORD BANNER & AVATAR SENKRONİZASYONU
      if (user && user.id === targetUserId && session?.provider_token) {
        try {
          const res = await fetch('https://discord.com/api/v10/users/@me', {
            headers: {
              Authorization: `Bearer ${session.provider_token}`,
            },
          });

          if (res.ok) {
            const discordUser = await res.json();

            if (discordUser.banner) {
              const ext = discordUser.banner.startsWith('a_') ? 'gif' : 'png';
              currentBanner = `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.${ext}?size=1024`;
            }

            if (discordUser.avatar) {
              const ext = discordUser.avatar.startsWith('a_') ? 'gif' : 'png';
              currentAvatar = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${ext}?size=512`;
            }

            if (discordUser.accent_color) {
              currentTheme = `#${discordUser.accent_color.toString(16).padStart(6, '0')}`;
            }

            await supabase.from('profiles').upsert({
              id: user.id,
              username: profData?.username || user.user_metadata?.custom_claims?.global_name || 'Vatandaş',
              avatar_url: currentAvatar,
              banner_url: currentBanner,
              theme_color: currentTheme,
              bio: profData?.bio || '',
              social_discord: profData?.social_discord || '',
              social_kick: profData?.social_kick || '',
              social_twitch: profData?.social_twitch || '',
              social_instagram: profData?.social_instagram || '',
              social_twitter: profData?.social_twitter || '',
              social_steam: profData?.social_steam || '',
            });
          }
        } catch (err) {
          console.error('Otomatik Discord senkronizasyon hatası:', err);
        }
      }

      setAvatarUrl(currentAvatar);
      setBannerUrl(currentBanner);
      setThemeColor(currentTheme);

      // 4. Kullanıcının Karakterlerini Çek
      const { data: chars } = await supabase
        .from('characters')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });

      setUserCharacters(chars || []);
      setLoading(false);
    }

    if (targetUserId) {
      loadDataAndAutoSync();
    }
  }, [targetUserId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('profiles').upsert({
      id: currentUser.id,
      username,
      avatar_url: avatarUrl,
      banner_url: bannerUrl,
      theme_color: themeColor,
      bio,
      social_discord: socialDiscord,
      social_kick: socialKick,
      social_twitch: socialTwitch,
      social_instagram: socialInstagram,
      social_twitter: socialTwitter,
      social_steam: socialSteam,
    });

    setSaving(false);
    if (!error) {
      alert('Profil güncellendi!');
      setIsEditing(false);
      window.location.reload();
    } else {
      alert('Hata oluştu: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Profil yükleniyor...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100 max-w-5xl mx-auto space-y-8 relative">
      {/* Üst Navigasyon & Butonlar */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition flex items-center gap-2">
          ← Ana Sayfaya Dön
        </Link>
        {isOwnProfile && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl transition cursor-pointer"
            >
              {isEditing ? 'Düzenlemeyi Kapat' : '✏️ Profili Düzenle'}
            </button>
            
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-xs font-semibold bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60 rounded-xl transition cursor-pointer flex items-center gap-1.5"
            >
              🚪 Çıkış Yap
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol Kolon: Discord Tarzı Profil Kartı */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl relative">
            {/* Banner Görseli */}
            <div 
              className="h-36 w-full bg-cover bg-center transition-all"
              style={{ 
                backgroundImage: bannerUrl ? `url(${bannerUrl})` : 'none',
                backgroundColor: themeColor 
              }}
            />

            {/* Avatar */}
            <div className="px-6 relative flex justify-between items-end -mt-12 mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-slate-900 overflow-hidden bg-slate-800 shadow-2xl">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={username} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-indigo-400 text-2xl">
                    {username[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Profil İçeriği */}
            <div className="p-6 pt-0 space-y-4">
              <div>
                <h1 className="text-2xl font-black text-white">@{username}</h1>
                <p className="text-xs text-indigo-400 font-semibold mt-0.5">Vatandaş / Oyuncu</p>
              </div>

              {/* Biyografi / Hakkında */}
              <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Hakkında / Biyografi</span>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {bio || 'Henüz bir biyografi eklenmemiş.'}
                </p>
              </div>

              {/* Sosyal Medya Bağlantıları */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sosyal Bağlantılar</span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {socialDiscord && (
                    <span className="text-xs bg-indigo-950/80 border border-indigo-800/60 text-indigo-300 px-3 py-1.5 rounded-xl font-medium flex items-center gap-1.5">
                      💬 {socialDiscord}
                    </span>
                  )}
                  {socialKick && (
                    <a href={socialKick.startsWith('http') ? socialKick : `https://kick.com/${socialKick}`} target="_blank" rel="noreferrer" className="text-xs bg-green-950/80 border border-green-800/60 text-green-300 px-3 py-1.5 rounded-xl font-medium hover:opacity-80 transition">
                      🟢 Kick
                    </a>
                  )}
                  {socialTwitch && (
                    <a href={socialTwitch.startsWith('http') ? socialTwitch : `https://twitch.tv/${socialTwitch}`} target="_blank" rel="noreferrer" className="text-xs bg-purple-950/80 border border-purple-800/60 text-purple-300 px-3 py-1.5 rounded-xl font-medium hover:opacity-80 transition">
                      💜 Twitch
                    </a>
                  )}
                  {socialInstagram && (
                    <a href={socialInstagram.startsWith('http') ? socialInstagram : `https://instagram.com/${socialInstagram}`} target="_blank" rel="noreferrer" className="text-xs bg-pink-950/80 border border-pink-800/60 text-pink-300 px-3 py-1.5 rounded-xl font-medium hover:opacity-80 transition">
                      📸 Instagram
                    </a>
                  )}
                  {socialTwitter && (
                    <a href={socialTwitter.startsWith('http') ? socialTwitter : `https://x.com/${socialTwitter}`} target="_blank" rel="noreferrer" className="text-xs bg-sky-950/80 border border-sky-800/60 text-sky-300 px-3 py-1.5 rounded-xl font-medium hover:opacity-80 transition">
                      🐦 X / Twitter
                    </a>
                  )}
                  {socialSteam && (
                    <a href={socialSteam.startsWith('http') ? socialSteam : `https://steamcommunity.com/id/${socialSteam}`} target="_blank" rel="noreferrer" className="text-xs bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-xl font-medium hover:opacity-80 transition">
                      🎮 Steam
                    </a>
                  )}
                  {!socialDiscord && !socialKick && !socialTwitch && !socialInstagram && !socialTwitter && !socialSteam && (
                    <p className="text-xs text-slate-500 italic">Sosyal medya adresi eklenmemiş.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Düzenleme Formu */}
          {isOwnProfile && isEditing && (
            <form onSubmit={handleSave} className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 space-y-4 shadow-xl">
              <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Profili ve Sosyal Medyayı Düzenle</h2>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Biyografi / Açıklama</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Kendinizden veya rol tarzınızdan bahsedin..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Banner Görsel URL (Özel Değiştirmek İstersen)</label>
                <input
                  type="text"
                  value={bannerUrl}
                  onChange={(e) => setBannerUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Sosyal Medya Alanları */}
              <div className="border-t border-slate-800/80 pt-3 space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Sosyal Medya Adresleri</span>
                
                <input
                  type="text"
                  value={socialDiscord}
                  onChange={(e) => setSocialDiscord(e.target.value)}
                  placeholder="Discord Kullanıcı Adı"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={socialKick}
                  onChange={(e) => setSocialKick(e.target.value)}
                  placeholder="Kick Kanal Adı veya Link"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={socialTwitch}
                  onChange={(e) => setSocialTwitch(e.target.value)}
                  placeholder="Twitch Kullanıcı Adı veya Link"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={socialInstagram}
                  onChange={(e) => setSocialInstagram(e.target.value)}
                  placeholder="Instagram Kullanıcı Adı"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={socialTwitter}
                  onChange={(e) => setSocialTwitter(e.target.value)}
                  placeholder="X / Twitter Kullanıcı Adı"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <input
                  type="text"
                  value={socialSteam}
                  onChange={(e) => setSocialSteam(e.target.value)}
                  placeholder="Steam Profil URL"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
          )}
        </div>

        {/* Sağ Kolon: Oluşturulan Karakterler */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h2 className="text-xl font-bold text-white">
              @{username} Tarafından Oluşturulan Karakterler
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {userCharacters.length} Dosya
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userCharacters.length > 0 ? (
              userCharacters.map((char) => (
                <div
                  key={char.id}
                  onClick={() => setSelectedCharacter(char)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden p-5 space-y-3 cursor-pointer hover:border-indigo-500/50 hover:scale-[1.02] transition-all duration-200 group shadow-lg"
                >
                  {char.image_url && (
                    <div className="overflow-hidden rounded-xl border border-slate-800">
                      <img
                        src={char.image_url}
                        alt={char.name}
                        className="w-full h-36 object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition">
                      {char.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {char.job && (
                        <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                          💼 {char.job}
                        </span>
                      )}
                      {char.gang && (
                        <span className="text-[11px] bg-indigo-950 text-indigo-300 border border-indigo-800/40 px-2 py-0.5 rounded">
                          🗡️ {char.gang}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {char.story || 'Hikaye girilmemiş.'}
                  </p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-500 bg-slate-900/40 border border-slate-800/60 rounded-2xl">
                Bu kullanıcının henüz kayıtlı bir karakteri bulunmuyor.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KARAKTER POPUP MODAL */}
      {selectedCharacter && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6"
          onClick={() => setSelectedCharacter(null)}
        >
          <div 
            className="bg-[#0e1322] border border-slate-800/80 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl relative flex flex-col space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Fotoğraf ve Kapatma Butonu */}
            {selectedCharacter.image_url && (
              <div className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/50">
                <img
                  src={selectedCharacter.image_url}
                  alt={selectedCharacter.name}
                  className="w-full h-64 sm:h-80 object-cover"
                />
                
                {/* Görsel Üstündeki Kapatma Butonu */}
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="absolute top-3 right-3 z-10 w-8 h-8 bg-slate-950/70 hover:bg-black text-slate-300 hover:text-white rounded-full flex items-center justify-center border border-slate-700/50 transition backdrop-blur-md cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Karakter İsmi ve Yan Yana Eklenen Tüm Özellik Rozetleri */}
            <div className="space-y-3">
              <h2 className="text-3xl font-black text-white tracking-tight">
                {selectedCharacter.name}
              </h2>

              {/* Mesleğin Yanında Tüm Özellikler Yan Yana Rozet Olarak Sıralanıyor */}
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
                {selectedCharacter.birth_date && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    📅 Doğum Tarihi: {selectedCharacter.birth_date}
                  </span>
                )}
                {selectedCharacter.birth_place && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    📍 Doğum Yeri: {selectedCharacter.birth_place}
                  </span>
                )}
                {selectedCharacter.current_city && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    🏙️ Şehir: {selectedCharacter.current_city}
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
                {selectedCharacter.hair_color && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    💈 Saç: {selectedCharacter.hair_color}
                  </span>
                )}
                {selectedCharacter.eye_color && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    👁️ Göz: {selectedCharacter.eye_color}
                  </span>
                )}
                {selectedCharacter.physical_build && (
                  <span className="text-xs bg-slate-800/80 text-slate-300 border border-slate-700/50 px-3 py-1.5 rounded-xl font-medium inline-flex items-center gap-1.5">
                    💪 Yapı: {selectedCharacter.physical_build}
                  </span>
                )}
              </div>
            </div>

            {/* Biyografi ve Karakter Dosyası */}
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
    </main>
  );
}