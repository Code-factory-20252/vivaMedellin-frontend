import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/forgot-password
 * Request a password reset email
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient(cookies());

    // Check if user exists with this email
    const { data: profile } = await supabase
      .from('perfil')
      .select('email')
      .eq('email', email)
      .single();

    if (!profile) {
      return NextResponse.json(
        {
          error: 'Este usuario no existe, por favor regístrese',
          success: false,
        },
        { status: 404 }
      );
    }

    // Send password reset email using Supabase auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);

      // Handle specific error cases
      if (error.status === 429 || error.message?.includes('rate limit')) {
        return NextResponse.json(
          {
            error:
              'Ha excedido el límite de solicitudes. Por favor espere unos minutos antes de intentar nuevamente.',
            success: false,
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: 'No se pudo enviar el correo de recuperación. Intente más tarde.',
          success: false,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        'Se ha enviado un correo electrónico con instrucciones para restablecer su contraseña',
    });
  } catch (error) {
    console.error('Unexpected error in forgot password:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
