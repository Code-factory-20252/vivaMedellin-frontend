import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const supabase = await createClient(cookies());
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    return NextResponse.redirect(new URL('/error', request.url));
  }

  const redirectUrl = new URL('/dashboard', request.url);
  redirectUrl.searchParams.set('msg', 'login_success');
  redirectUrl.searchParams.set('desc', 'Has iniciado sesión con éxito');
  return NextResponse.redirect(redirectUrl);
}
