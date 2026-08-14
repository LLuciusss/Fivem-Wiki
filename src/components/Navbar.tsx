'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import LoginButton from './LoginButton';
import { User as UserIcon, Settings, LogOut, BookOpen } from 'lucide-react';

export default function Navbar() {
  const supabase = createClient();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
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
    <nav className="bg-black/80 border-b border-blue-900/40 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <span>LORE WIKI</span>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 p-1.5 bg-blue-950/40 border border-blue-800/40 rounded-full hover:border-blue-500/60 transition"
              >
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {profile?.username?.[0] || 'O'}
                </div>
                <span className="text-white text-sm font-medium pr-2">
                  {profile?.username || 'Oyuncu'}
                </span>
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-black/90 border border-blue-900/50 rounded-xl shadow-xl overflow-hidden z-50">
                  <Link
                    href={`/profile/${user.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-blue-900/40 hover:text-blue-300 transition"
                  >
                    <UserIcon className="w-4 h-4 text-blue-400" />
                    Karakter Profilim
                  </Link>
                  <Link
                    href="/settings"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-200 hover:bg-blue-900/40 hover:text-blue-300 transition"
                  >
                    <Settings className="w-4 h-4 text-blue-400" />
                    Dosya Düzenle
                  </Link>
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/40 transition text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
          ) : (
            <LoginButton />
          )}
        </div>
      </div>
    </nav>
  );
}