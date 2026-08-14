'use client';
import { useState } from 'react';

export default function ProfileView({ profile, character }: { profile: any, character: any }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const bannerBg = profile.banner_url ? `url(${profile.banner_url})` : 'linear-gradient(to right, #000000, #0f172a, #000000)';

  return (
    
      {/* Neon Işıklandırmalar */}
      
      
      
        
      

      
        
          
          
            
              
              
                
                  {character?.name || 'Karakter Adı Yok'}
                
                @{profile.username}
              
            

            {profile.profile_music && (
              
                 setIsPlaying(!isPlaying)} className="w-12 h-12 bg-blue-600 rounded-full hover:bg-blue-500 transition-all flex items-center justify-center">
                  {isPlaying ? '⏸' : '▶'}
                
                
                  <span>Tema Müziği</span>
                
                {isPlaying && }
              
            )}
          

          
            
              <span>DOSYA BİLGİLERİ
              
                
                 <span> Meslek</span>
                  {character?.job || 'Bilinmiyor'}
                
                
                  Organizasyon
                  {character?.gang || 'Bağımsız'}
                
              
            

            
              <span>Karakter Hikayesi</span>
              
                {character?.story ? (
                  
                ) : (
                  Hikaye henüz girilmemiş.
                )}
              
            
          
        
      
    
  );
}