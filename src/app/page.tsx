import { createClient } from '@/utils/supabase/server';

import Link from 'next/link';

import LoginButton from '@/components/LoginButton';

import CharacterList from '@/components/CharacterList';



export default async function HomePage() {

  const supabase = createClient();



  const { data: { user } } = await supabase.auth.getUser();



  let profile = null;

  if (user) {

    const { data } = await supabase

      .from('profiles')

      .select('*')

      .eq('id', user.id)

      .single();

    profile = data;

  }



  const { data: characters } = await supabase
    .from('characters')
    .select('*, profiles(id, username, avatar_url)') // id eklendi
    .order('created_at', { ascending: false });



  const avatarUrl = profile?.avatar_url || user?.user_metadata?.avatar_url;

  const username = profile?.username || user?.user_metadata?.custom_claims?.global_name || 'Vatandaş';



  return (

    <main className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">

      {/* Navbar */}

      <nav className="max-w-6xl mx-auto flex justify-between items-center pb-6 border-b border-slate-800 mb-10">

        <Link href="/" className="font-extrabold text-2xl tracking-wider text-slate-100 flex items-center gap-2">

          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-600/30">

            V

          </div>

          <span>FIVEM <span className="text-indigo-400">KARAKTER WIKI</span></span

         

        </Link>



        <div className="flex items-center gap-4">

          {user ? (

            <>

              <Link

                href="/characters/new"

                className="px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition shadow-md shadow-indigo-600/20 flex items-center gap-2"

              >

                <span>+</span> Karakter Ekle

              </Link>



              <Link

                href="/profile"

                className="flex items-center gap-3 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 px-3 py-1.5 rounded-xl transition group"

              >

                {avatarUrl ? (

                  <img

                    src={avatarUrl}

                    alt={username}

                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/40"

                  />

                ) : (

                  <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-xs text-indigo-300">

                    {username[0]?.toUpperCase()}

                  </div>

                )}

                <span className="text-sm font-medium text-slate-200 group-hover:text-indigo-400 transition">

                  @{username}

                </span>

              </Link>

            </>

          ) : (

            <LoginButton />

          )}

        </div>

      </nav>



      {/* Başlık */}

      <header className="max-w-6xl mx-auto mb-10">

        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3">

          KARAKTER ARŞİVİ

        </h1>

        <p className="text-slate-400 text-lg">

          Şehirdeki tüm vatandaşların gizli dosyaları ve hikayeleri.

        </p>

      </header>



      {/* Karakter Kartları Listesi (currentUserId gönderiliyor) */}

      <div className="max-w-6xl mx-auto">

        <CharacterList characters={characters || []} currentUserId={user?.id} />

      </div>

    </main>

  );

} 

