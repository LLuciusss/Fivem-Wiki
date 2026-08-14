import { createServerClient } from '@supabase/ssr';
import { cookies } from 'headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  if (!session || !session.provider_token) {
    return NextResponse.json({ success: false, message: 'Oturum veya token bulunamadı.' }, { status: 401 });
  }

  try {
    const res = await fetch('https://discord.com/api/v10/users/@me', {
      headers: {
        Authorization: `Bearer ${session.provider_token}`,
      },
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, message: 'Discord API hatası.' }, { status: res.status });
    }

    const discordUser = await res.json();
    
    let bannerUrl = '';
    if (discordUser.banner) {
      const ext = discordUser.banner.startsWith('a_') ? 'gif' : 'png';
      bannerUrl = `https://cdn.discordapp.com/banners/${discordUser.id}/${discordUser.banner}.${ext}?size=1024`;
    }

    let avatarUrl = '';
    if (discordUser.avatar) {
      const ext = discordUser.avatar.startsWith('a_') ? 'gif' : 'png';
      avatarUrl = `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.${ext}?size=512`;
    }

    const themeColor = discordUser.accent_color 
      ? `#${discordUser.accent_color.toString(16).padStart(6, '0')}` 
      : '#4f46e5';

    // Veritabanını güncelle
    await supabase.from('profiles').upsert({
      id: session.user.id,
      username: discordUser.global_name || discordUser.username,
      avatar_url: avatarUrl,
      banner_url: bannerUrl || null,
      theme_color: themeColor,
      updated_at: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}