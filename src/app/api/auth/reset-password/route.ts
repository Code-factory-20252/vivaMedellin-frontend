import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

/**
 * POST /api/auth/reset-password
 * Reset password with new password
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password, confirmPassword } = body;

    if (!password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Password and confirmation are required', success: false },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Las contraseñas no coinciden', success: false },
        { status: 400 }
      );
    }

    // Validate password requirements - allow: # * _ / - . % ?
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[#*_/\-.%?])[A-Za-z\d#*_/\-.%?]{8,}$/;
    if (!passwordRegex.test(password)) {
      return NextResponse.json(
        {
          error:
            'La contraseña debe tener mínimo 8 caracteres, con mayúsculas, minúsculas, números y caracteres especiales( #, *, _, /, -, ., %, ?)',
          success: false,
        },
        { status: 400 }
      );
    }

    const supabase = await createClient(cookies());

    // Update the user's password
    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      console.error('Password update error:', error);
      return NextResponse.json(
        { error: 'Failed to update password', success: false },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Se cambió la contraseña',
    });
  } catch (error) {
    console.error('Unexpected error in reset password:', error);
    return NextResponse.json({ error: 'Internal server error', success: false }, { status: 500 });
  }
}
