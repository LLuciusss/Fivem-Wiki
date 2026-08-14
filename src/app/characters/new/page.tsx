'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateCharacterPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);

  // Form State'leri
  const [name, setName] = useState('');
  const [job, setJob] = useState('');
  const [gang, setGang] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [currentCity, setCurrentCity] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [hairColor, setHairColor] = useState('');
  const [eyeColor, setEyeColor] = useState('');
  const [physicalBuild, setPhysicalBuild] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [story, setStory] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Karakter oluşturmak için giriş yapmalısınız.');
      setLoading(false);
      return;
    }

    const { error } = await supabase.from('characters').insert({
      user_id: session.user.id,
      name,
      job,
      gang,
      birth_date: birthDate,
      birth_place: birthPlace,
      current_city: currentCity,
      height,
      weight,
      hair_color: hairColor,
      eye_color: eyeColor,
      physical_build: physicalBuild,
      image_url: imageUrl,
      story,
    });

    setLoading(false);

    if (error) {
      alert('Hata oluştu: ' + error.message);
    } else {
      router.push(`/profile/${session.user.id}`);
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen bg-[#080c14] text-slate-100 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-2xl bg-[#0e1322] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Başlık ve İptal Button */}
        <div className="flex justify-between items-start border-b border-slate-800/80 pb-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Yeni Karakter Oluştur</h1>
            <p className="text-xs text-slate-400 mt-1">Şehirdeki karakter dosyanı arşive ekle.</p>
          </div>
          <Link href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition">
            ← İptal Et
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Karakter Adı */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Karakter Adı ve Soyadı <span className="text-indigo-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Örn: Niko Morris"
              className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Meslek & Çete */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Meslek / İş</label>
              <input
                type="text"
                value={job}
                onChange={(e) => setJob(e.target.value)}
                placeholder="Örn: Polis / Sivil / Mekanik"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Çete / Oluşum</label>
              <input
                type="text"
                value={gang}
                onChange={(e) => setGang(e.target.value)}
                placeholder="Örn: Ballas / Sivil"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Kimlik & Köken Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Doğum Tarihi</label>
              <input
                type="text"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder="Örn: 08/08/1998"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Doğum Yeri</label>
              <input
                type="text"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="Örn: New York, ABD"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Bulunduğu Şehir / Nereli</label>
              <input
                type="text"
                value={currentCity}
                onChange={(e) => setCurrentCity(e.target.value)}
                placeholder="Örn: Los Angeles"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Fiziksel Özellikler */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Boy</label>
              <input
                type="text"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="Örn: 1.85m"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Kilo</label>
              <input
                type="text"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Örn: 78 KG"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Saç Rengi</label>
              <input
                type="text"
                value={hairColor}
                onChange={(e) => setHairColor(e.target.value)}
                placeholder="Örn: Siyah"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Göz Rengi</label>
              <input
                type="text"
                value={eyeColor}
                onChange={(e) => setEyeColor(e.target.value)}
                placeholder="Örn: Ela / Kahve"
                className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Fiziksel Yapı Özeti</label>
            <input
              type="text"
              value={physicalBuild}
              onChange={(e) => setPhysicalBuild(e.target.value)}
              placeholder="Örn: Atletik, uzun boylu ve hareketli bir gelişime sahip."
              className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Görsel URL */}
          <div className="pt-2 border-t border-slate-800/60">
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Karakter Görseli (Fotoğraf URL)</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://i.imgur.com/... veya resim bağlantısı"
              className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Hikaye */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Karakter Hikayesi & Geçmişi</label>
            <textarea
              rows={4}
              value={story}
              onChange={(e) => setStory(e.target.value)}
              placeholder="Karakterinizin geçmişi, kişiliği ve şehirdeki rolleri..."
              className="w-full bg-[#080c14] border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-xs transition shadow-lg shadow-indigo-600/30 cursor-pointer mt-4"
          >
            {loading ? 'Karakter Kaydediliyor...' : 'Karakteri Arşive Ekle'}
          </button>
        </form>

      </div>
    </main>
  );
}