'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function EditCharacterPage() {
  const router = useRouter();
  const params = useParams();
  const characterId = params?.id as string;
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form Verileri
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

  // Çoklu Fotoğraflar Listesi ve Yeni URL Input'u
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newUrlInput, setNewUrlInput] = useState('');

  // Karakter Verisini Getir
  useEffect(() => {
    async function fetchCharacter() {
      if (!characterId) return;

      const { data, error } = await supabase
        .from('characters')
        .select('*')
        .eq('id', characterId)
        .single();

      if (error || !data) {
        alert('Karakter bulunamadı!');
        router.push('/');
        return;
      }

      setFormData({
        name: data.name || '',
        job: data.job || '',
        gang: data.gang || '',
        birth_date: data.birth_date || data.birthDate || '',
        birth_place: data.birth_place || data.birthPlace || '',
        current_city: data.current_city || data.currentCity || '',
        height: data.height || '',
        weight: data.weight || '',
        hair_color: data.hair_color || data.hairColor || '',
        eye_color: data.eye_color || data.eyeColor || '',
        physical_build: data.physical_build || data.physicalBuild || '',
        story: data.story || '',
      });

      // Eski tekli resim varsa onu da listeye dahil et
      let imgs: string[] = [];
      if (Array.isArray(data.image_urls) && data.image_urls.length > 0) {
        imgs = data.image_urls;
      } else {
        const oldImg = data.image_url || data.image || data.photo_url || data.photo;
        if (oldImg) imgs.push(oldImg);
      }

      setImageUrls(imgs);
      setLoading(false);
    }

    fetchCharacter();
  }, [characterId]);

  // Cihazdan Fotoğraf Yükleme Fonksiyonu
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `${characterId}_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Supabase Storage Bucket'ına Yükle
        const { error: uploadError } = await supabase.storage
          .from('character-images')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Yükleme Hatası:', uploadError.message);
          alert(`Resim yüklenemedi: ${file.name}`);
          continue;
        }

        // Yüklenen Resmin Public URL'sini Al
        const { data: publicUrlData } = supabase.storage
          .from('character-images')
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) {
          uploadedUrls.push(publicUrlData.publicUrl);
        }
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
    } catch (err: any) {
      alert('Dosya yüklenirken bir sorun oluştu.');
    } finally {
      setUploading(false);
      e.target.value = ''; // Input'u sıfırla
    }
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

  // Güncelleme İşlemini Kaydet
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const updatedData = {
      ...formData,
      image_urls: imageUrls,
      // Geriye dönük uyumluluk için ilk resmi image_url olarak da kaydedelim
      image_url: imageUrls[0] || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('characters')
      .update(updatedData)
      .eq('id', characterId);

    setSaving(false);

    if (error) {
      alert('Güncelleme sırasında hata oluştu: ' + error.message);
    } else {
      alert('Karakter başarıyla güncellendi!');
      router.push('/');
      router.refresh();
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8 flex items-center justify-center text-slate-300">
        Karakter verileri yükleniyor...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Üst Başlık & Geri Dön */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Karakter Düzenle</h1>
            <p className="text-sm text-slate-400">{formData.name || 'Karakter Bilgileri'}</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-sm bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
          >
            ← İptal ve Geri Dön
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* FOTOĞRAF YÖNETİMİ BÖLÜMÜ */}
          <div className="bg-[#0e1322] border border-slate-800 p-6 rounded-3xl space-y-5">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
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

            {/* Fotoğraf Ekleme Seçenekleri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-800/80">
              {/* Cihazdan Yükleme */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  📁 Cihazdan / Dosyadan Yükle
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 file:cursor-pointer cursor-pointer border border-slate-800 rounded-xl bg-slate-900/50 p-1"
                />
                {uploading && <p className="text-xs text-indigo-400">Resim yükleniyor, lütfen bekleyin...</p>}
              </div>

              {/* URL İle Ekleme */}
              <div className="space-y-2">
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
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Ekle
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* TEMEL BİLGİLER */}
          <div className="bg-[#0e1322] border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white">👤 Temel Bilgiler</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Meslek</label>
                <input
                  type="text"
                  value={formData.job}
                  onChange={(e) => setFormData({ ...formData, job: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Oluşum / Çete</label>
                <input
                  type="text"
                  value={formData.gang}
                  onChange={(e) => setFormData({ ...formData, gang: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-3 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* FİZİKSEL & KİŞİSEL BİLGİLER */}
          <div className="bg-[#0e1322] border border-slate-800 p-6 rounded-3xl space-y-4">
            <h2 className="text-lg font-bold text-white">📋 Detaylı Özellikler</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Doğum Tarihi</label>
                <input
                  type="text"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Doğum Yeri</label>
                <input
                  type="text"
                  value={formData.birth_place}
                  onChange={(e) => setFormData({ ...formData, birth_place: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Bulunduğu Şehir</label>
                <input
                  type="text"
                  value={formData.current_city}
                  onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Boy</label>
                <input
                  type="text"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Kilo</label>
                <input
                  type="text"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Saç Rengi</label>
                <input
                  type="text"
                  value={formData.hair_color}
                  onChange={(e) => setFormData({ ...formData, hair_color: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Göz Rengi</label>
                <input
                  type="text"
                  value={formData.eye_color}
                  onChange={(e) => setFormData({ ...formData, eye_color: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Vücut Yapısı</label>
                <input
                  type="text"
                  value={formData.physical_build}
                  onChange={(e) => setFormData({ ...formData, physical_build: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-white outline-none"
                />
              </div>
            </div>
          </div>

          {/* HİKAYE & BİYOGRAFİ */}
          <div className="bg-[#0e1322] border border-slate-800 p-6 rounded-3xl space-y-3">
            <h2 className="text-lg font-bold text-white">📖 Hikaye / Biyografi</h2>
            <textarea
              rows={8}
              value={formData.story}
              onChange={(e) => setFormData({ ...formData, story: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 rounded-2xl p-4 text-xs sm:text-sm text-white outline-none leading-relaxed"
              placeholder="Karakterinizin hikayesini yazın..."
            />
          </div>

          {/* KAYDET BUTONU */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 cursor-pointer"
            >
              {saving ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}