'use client';

import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

const RELATION_TYPES = [
  'kardeş',
  'eş',
  'dost',
  'arkadaş',
  'düşman',
  'sevgili',
  'aile',
  'görev arkadaşı'
];

export default function EditCharacterPage() {
  const params = useParams();
  const router = useRouter();
  const characterId = params.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [allCharacters, setAllCharacters] = useState<any[]>([]);
  const [characterRelations, setCharacterRelations] = useState<any[]>([]);
  
  // Çoklu Fotoğraflar Listesi ve Yeni URL Input'u
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState('');

  // Yeni ilişki ekleme form state'leri
  const [selectedTargetId, setSelectedTargetId] = useState('');
  const [selectedRelationType, setSelectedRelationType] = useState('arkadaş');
  const [relationDescription, setRelationDescription] = useState('');

  // Karakter form alanları
  const [formData, setFormData] = useState({
    name: '',
    job: '',
    gang: '',
    birth_date: '',
    birth_place: '',
    current_city: '',
    height: '',
    weight: '',
    hair_color: '',
    eye_color: '',
    physical_build: '',
    story: '',
  });

  useEffect(() => {
    async function fetchEditData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // 1. Karakteri çek ve yetki kontrolü yap
      const { data: charData, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single();

      if (error || !charData) {
        alert('Karakter bulunamadı.');
        router.push('/');
        return;
      }

      if (charData.user_id !== session.user.id) {
        alert('Bu karakteri düzenleme yetkiniz yok!');
        router.push(`/characters/${characterId}`);
        return;
      }

      setFormData({
        name: charData.name || '',
        job: charData.job || '',
        gang: charData.gang || '',
        birth_date: charData.birth_date || charData.birthDate || '',
        birth_place: charData.birth_place || charData.birthPlace || '',
        current_city: charData.current_city || charData.currentCity || '',
        height: charData.height || '',
        weight: charData.weight || '',
        hair_color: charData.hair_color || charData.hairColor || '',
        eye_color: charData.eye_color || charData.eyeColor || '',
        physical_build: charData.physical_build || charData.physicalBuild || '',
        story: charData.story || '',
      });

      // Çoklu resimleri veya eski tekil resmi listeye dahil et
      let imgs: string[] = [];
      if (Array.isArray(charData.image_urls) && charData.image_urls.length > 0) {
        imgs = charData.image_urls;
      } else {
        const oldImg = charData.image_url || charData.image || charData.photo_url || charData.photo;
        if (oldImg) imgs.push(oldImg);
      }
      setImageUrls(imgs);

      // 2. Sistemdeki diğer karakterleri çek (Kendisi hariç)
      const { data: charsData } = await supabase
        .from('characters')
        .select('id, name, image_url')
        .neq('id', characterId);

      if (charsData) {
        setAllCharacters(charsData);
      }

      // 3. Mevcut ilişkileri çek
      const { data: relsData } = await supabase
        .from('character_relations')
        .select('*, target_character:characters!target_character_id(id, name, image_url)')
        .eq('character_id', characterId);

      if (relsData) {
        setCharacterRelations(relsData);
      }

      setLoading(false);
    }

    if (characterId) {
      fetchEditData();
    }
  }, [characterId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // URL İle Fotoğraf Ekleme
  const handleAddUrl = () => {
    if (!newUrlInput.trim()) return;
    setImageUrls((prev) => [...prev, newUrlInput.trim()]);
    setNewUrlInput('');
  };

  // Fotoğraf Silme
  const handleRemoveImage = (indexToRemove: number) => {
    setImageUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Yeni İlişki Ekleme Fonksiyonu
  const handleAddRelation = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!selectedTargetId) {
      alert('Lütfen bir karakter seçin.');
      return;
    }

    if (selectedTargetId === characterId) {
      alert('Bir karakter kendisiyle ilişki kuramaz!');
      return;
    }

    const { error: insertError } = await supabase
      .from('character_relations')
      .insert([
        {
          character_id: characterId,
          target_character_id: selectedTargetId,
          relation_type: selectedRelationType,
          description: relationDescription || null,
        }
      ]);

    if (insertError) {
      alert('İlişki eklenirken hata oluştu: ' + insertError.message);
      return;
    }

    const { data: relsData, error: fetchError } = await supabase
      .from('character_relations')
      .select('*, target_character:characters!target_character_id(id, name, image_url)')
      .eq('character_id', characterId);

    if (fetchError) {
      alert('İlişki eklendi ancak liste yenilenirken hata oluştu: ' + fetchError.message);
    } else if (relsData) {
      setCharacterRelations(relsData);
      setSelectedTargetId('');
      setRelationDescription('');
      setSelectedRelationType('arkadaş');
    }
  };

  // İlişki Silme Fonksiyonu
  const handleDeleteRelation = async (relationId: string) => {
    const { error } = await supabase
      .from('character_relations')
      .delete()
      .eq('id', relationId);

    if (!error) {
      setCharacterRelations(characterRelations.filter(r => r.id !== relationId));
    } else {
      alert('İlişki silinemedi.');
    }
  };

  // Genel Güncelleme Kaydetme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedData = {
      ...formData,
      image_urls: imageUrls,
      image_url: imageUrls[0] || null, // Geriye dönük uyumluluk için ilk görsel
    };

    const { error } = await supabase
      .from('characters')
      .update(updatedData)
      .eq('id', characterId);

    setSaving(false);

    if (error) {
      alert('Güncelleme sırasında hata oluştu: ' + error.message);
    } else {
      router.push(`/characters/${characterId}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        Düzenleme paneli yükleniyor...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <Link
            href={`/characters/${characterId}`}
            className="text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-indigo-500/50 px-4 py-2 rounded-xl text-slate-300 transition flex items-center gap-2"
          >
            ← Karakter Sayfasına Dön
          </Link>
          <h1 className="text-xl font-black text-white">Karakter Dosyasını Düzenle</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#0e1322] border border-slate-800/90 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          
          {/* FOTOĞRAF YÖNETİMİ BÖLÜMÜ (Sadece URL) */}
          <div className="space-y-4 pb-6 border-b border-slate-800">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
              🖼️ Karakter Fotoğrafları ({imageUrls.length})
            </h2>

            {/* Yüklenmiş/Eklenmiş Resimler Galerisi */}
            {imageUrls.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-32">
                    <img src={url} alt={`Karakter Resim ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-600/90 hover:bg-red-700 text-white rounded-full flex items-center justify-center text-xs shadow-lg transition"
                      title="Sil"
                    >
                      ✕
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-2 left-2 text-[10px] bg-indigo-600/90 text-white px-2 py-0.5 rounded-md">
                        Kapak
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* URL İle Fotoğraf Ekleme Alanı */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-300 block">
                🔗 Görsel URL'si İle Ekle
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://i.imgur.com/..."
                  value={newUrlInput}
                  onChange={(e) => setNewUrlInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition"
                >
                  Ekle
                </button>
              </div>
            </div>
          </div>

          {/* Temel Bilgiler */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Genel Bilgiler</h2>
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Karakter Adı</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Meslek</label>
                <input
                  type="text"
                  name="job"
                  value={formData.job}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Oluşum / Gang</label>
                <input
                  type="text"
                  name="gang"
                  value={formData.gang}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Fiziksel ve Kişisel Diğer Alanlar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Doğum Tarihi</label>
                <input
                  type="text"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Doğum Yeri</label>
                <input
                  type="text"
                  name="birth_place"
                  value={formData.birth_place}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Yaşadığı Şehir</label>
                <input
                  type="text"
                  name="current_city"
                  value={formData.current_city}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Boy</label>
                <input
                  type="text"
                  name="height"
                  value={formData.height}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Kilo</label>
                <input
                  type="text"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Saç Rengi</label>
                <input
                  type="text"
                  name="hair_color"
                  value={formData.hair_color}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Göz Rengi</label>
                <input
                  type="text"
                  name="eye_color"
                  value={formData.eye_color}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2 col-span-2 md:col-span-1">
                <label className="text-xs font-semibold text-slate-300">Fiziksel Yapı</label>
                <input
                  type="text"
                  name="physical_build"
                  value={formData.physical_build}
                  onChange={handleChange}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* İlişkiler Yönetim Paneli */}
          <div className="space-y-4 pt-6 border-t border-slate-800">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Karakter İlişkileri & Bağları</h2>
            
            {/* Mevcut İlişkiler Listesi */}
            <div className="space-y-2">
              {characterRelations.length > 0 ? (
                characterRelations.map((rel) => (
                  <div key={rel.id} className="flex items-center justify-between bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      {rel.target_character?.image_url && (
                        <img src={rel.target_character.image_url} alt="" className="w-10 h-10 rounded-lg object-cover bg-slate-950" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-white">{rel.target_character?.name}</p>
                        <p className="text-[11px] text-indigo-400 capitalize font-medium">Bağ: {rel.relation_type} {rel.description && `- ${rel.description}`}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteRelation(rel.id)}
                      className="text-xs bg-red-950/50 hover:bg-red-900/80 text-red-300 border border-red-800/50 px-3 py-1.5 rounded-lg transition"
                    >
                      Kaldır
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 italic">Henüz eklenmiş bir ilişki yok.</p>
              )}
            </div>

            {/* Yeni İlişki Ekleme Formu */}
            <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-2xl space-y-3">
              <p className="text-xs font-bold text-slate-300">➕ Yeni İlişki Ekle</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Hedef Karakter</label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Karakter Seçin...</option>
                    {allCharacters.map((char) => (
                      <option key={char.id} value={char.id}>
                        {char.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">İlişki Türü</label>
                  <select
                    value={selectedRelationType}
                    onChange={(e) => setSelectedRelationType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white capitalize focus:outline-none focus:border-indigo-500"
                  >
                    {RELATION_TYPES.map((type) => (
                      <option key={type} value={type} className="capitalize">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Açıklama / Not (Opsiyonel)</label>
                <input
                  type="text"
                  placeholder="Örn: Eski ortaklar, kan bağı vb."
                  value={relationDescription}
                  onChange={(e) => setRelationDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <button
                type="button"
                onClick={handleAddRelation}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl transition"
              >
                İlişkiyi Listeye Ekle
              </button>
            </div>
          </div>

          {/* Biyografi / Hikaye Alanı */}
          <div className="space-y-2 pt-6 border-t border-slate-800">
            <h2 className="text-sm font-bold text-indigo-400 uppercase tracking-wider">Karakter Hikayesi</h2>
            <textarea
              name="story"
              rows={6}
              value={formData.story}
              onChange={handleChange}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Kaydetme Butonu */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-indigo-600/20 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </form>
      </div>
    </main>
  );
}