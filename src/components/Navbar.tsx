'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import LoginButton from './LoginButton';
import { User as UserIcon, Settings, LogOut, BookOpen } from 'lucide-react';

export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function getUserData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setProfile(prof);
      }
    }
    getUserData();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    
      
        
          
            
          
          
            LORE WIKI
          
        

        
          {user ? (
            
               setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 p-1.5 bg-blue-950/40 border border-blue-800/40 rounded-full hover:border-blue-500/60 transition"
              >
                
                
                  {profile?.username || 'Oyuncu'}
                
              

              {/* Dropdown Menu */}
              {menuOpen && (
                
                   setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-blue-900/40 hover:text-blue-300 transition"
                  >
                    
                    Karakter Profilim
                  
                   setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-blue-900/40 hover:text-blue-300 transition"
                  >
                    
                    Dosya Düzenle
                  
                  
                  
                    
                    Çıkış Yap
                  
                
              )}
            
          ) : (
            
          )}
        
      
    
  );
}