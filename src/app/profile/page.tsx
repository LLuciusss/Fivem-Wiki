import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfileRedirectPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/');
  }

  // Kullanıcıyı kendi ID'sine sahip dinamik profile yönlendir
  redirect(`/profile/${user.id}`);
}