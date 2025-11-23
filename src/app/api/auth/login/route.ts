import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient(cookies());
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.redirect(new URL('/error', request.url));
  }

  // Check if profile is completed
  const userId = data.user?.id;
  let isCompleted = false;

  if (userId) {
    const { data: profile } = await supabase
      .from('perfil')
      .select('completed')
      .eq('id', userId)
      .single();

    isCompleted = profile?.completed || false;
  }

  // Redirect based on profile completion status
  const redirectPath = isCompleted ? '/dashboard' : '/account/complete';
  const redirectUrl = new URL(redirectPath, request.url);

  if (isCompleted) {
    redirectUrl.searchParams.set('msg', 'login_success');
    redirectUrl.searchParams.set('desc', 'Has iniciado sesión con éxito');
  }

  return NextResponse.redirect(redirectUrl);
}
