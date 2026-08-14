'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '', job: '', gang: '', birth_date: '', story: '', profile_music: '', banner_url: ''
  });

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/');
      
      setUserId(user.id);
      
      // Profil ve karakter verisini çek
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

    // Profil tablosunu güncelle (Müzik ve Banner)
    await supabase.from('profiles').update({
      profile_music: formData.profile_music,
      banner_url: formData.banner_url
    }).eq('id', userId);

    // Karakter tablosunu Upsert yap (Varsa güncelle, yoksa ekle)
    const { data: existingChar } = await supabase.from('characters').select('id').eq('user_id', userId).single();
    
    const charPayload = {
      user_id: userId,
      name: formData.name,
      job: formData.job,
      gang: formData.gang,
      birth_date: formData.birth_date,
      story: formData.story // HTML destekli yazdırabilirsin
    };

    if (existingChar) {
      await supabase.from('characters').update(charPayload).eq('id', existingChar.id);
    } else {
      await supabase.from('characters').insert(charPayload);
    }

    alert('Kayıtlar başarıyla güncellendi!');
    router.push(`/profile/${userId}`);
  };

  if (loading) return Yükleniyor...;

  return (
    
      Karakter Dosyasını Güncelle
      
        
        
          
            Karakter Adı Soyadı
             setFormData({...formData, name: e.target.value})} className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" required />
          
          
            Doğum Tarihi
             setFormData({...formData, birth_date: e.target.value})} className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Örn: 16.01.1998" />
          
          
            Meslek
             setFormData({...formData, job: e.target.value})} className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
          
          
            Organizasyon/Çete
             setFormData({...formData, gang: e.target.value})} className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" />
          
        

        
          
            Profil Tema Müziği (URL)
             setFormData({...formData, profile_music: e.target.value})} className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Örn: .mp3 linki" />
          
          
            Özel Banner Görseli (URL)
             setFormData({...formData, banner_url: e.target.value})} className="w-full bg-black/50 border border-blue-900 rounded-lg p-3 text-white focus:border-blue-500 outline-none" placeholder="Görsel linki yapıştır" />
          
        

        
          Karakter Hikayesi (Wiki Lore)
           setFormData({...formData, story: e.target.value})} 
            rows={10} 
            className="w-full bg-black/50 border border-blue-900 rounded-lg p-4 text-white focus:border-blue-500 outline-none" 
            placeholder="Buraya karakterin detaylı geçmişini yazabilirsin (HTML etiketleri kullanılarak zenginleştirilebilir)..."
          />
        </div>

        <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
          {loading ? 'Kaydediliyor...' : 'Dosyayı Güncelle'}
        </button>
      </form>
    </div>
  );
}