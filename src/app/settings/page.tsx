'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '', job: '', gang: '', birth_date: '', story: '', profile_music: '', banner_url: ''
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/');
      
      setUserId(user.id);
      
      const { data: profile } = await supabase.from('profiles').select('banner_url, profile_music, characters(*)').eq('id', user.id).single();
      
      if (profile) {
        const char = profile.characters?.[0] || {};
        setFormData({
          name: char.name || '',
          job: char.job || '',
          gang: char.gang || '',
          birth_date: char.birth_date || '',
          story: char.story || '',
          profile_music: profile.profile_music || '',
          banner_url: profile.banner_url || ''
        });
      }
      setLoading(false);
    }
    loadData();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.from('profiles').update({
      profile_music: formData.profile_music,
      banner_url: formData.banner_url
    }).eq('id', userId);

    const { data: existingChar } = await supabase.from('characters').select('id').eq('user_id', userId).single();
    
    const charPayload = {
      user_id: userId,
      name: formData.name,
      job: formData.job,
      gang: formData.gang,
      birth_date: formData.birth_date,
      story: formData.story
    };

    if (existingChar) {
      await supabase.from('characters').update(charPayload).eq('id', existingChar.id);
    } else {
      await supabase.from('characters').insert(charPayload);
    }

    alert('Kayıtlar başarıyla güncellendi!');
    router.push(`/profile/${userId}`);
  };

  if (loading) return <div>Yükleniyor...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Karakter Dosyasını Güncelle</h1>
      
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Karakter Adı Soyadı</label>
            <input 
              type="text" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
              className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
              required 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Doğum Tarihi</label>
            <input 
              type="text" 
              value={formData.birth_date} 
              onChange={(e) => setFormData({...formData, birth_date: e.target.value})} 
              className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
              placeholder="Örn: 16.01.1998" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Meslek</label>
            <input 
              type="text" 
              value={formData.job} 
              onChange={(e) => setFormData({...formData, job: e.target.value})} 
              className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Organizasyon/Çete</label>
            <input 
              type="text" 
              value={formData.gang} 
              onChange={(e) => setFormData({...formData, gang: e.target.value})} 
              className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Profil Tema Müziği (URL)</label>
            <input 
              type="text" 
              value={formData.profile_music} 
              onChange={(e) => setFormData({...formData, profile_music: e.target.value})} 
              className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
              placeholder="Örn: .mp3 linki" 
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Özel Banner Görseli (URL)</label>
            <input 
              type="text" 
              value={formData.banner_url} 
              onChange={(e) => setFormData({...formData, banner_url: e.target.value})} 
              className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" 
              placeholder="Görsel linki yapıştır" 
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Karakter Hikayesi (Wiki Lore)</label>
          <textarea 
            value={formData.story} 
            onChange={(e) => setFormData({...formData, story: e.target.value})} 
            rows={10} 
            className="w-full bg-black/50 border border-blue-900 rounded-lg p-4 text-white focus:border-blue-500 outline-none" 
            placeholder="Buraya karakterin detaylı geçmişini yazabilirsin..."
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
          {loading ? 'Kaydediliyor...' : 'Dosyayı Güncelle'}
        </button>
      </form>
    </div>
  );
}