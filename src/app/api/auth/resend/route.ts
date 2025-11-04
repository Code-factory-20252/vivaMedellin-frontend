import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const formData = await request.formData();
  const email = formData.get('email') as string;
  if (!email) return NextResponse.json({ error: 'missing_email' }, { status: 400 });

  const supabase = await createClient(cookies());
  // Attempt to send a magic link / OTP email to the user
  const { data, error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      // ensure confirmation link returns to our confirm endpoint
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/confirm`,
    },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
