import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/;
const lettersOnly = /^[A-Za-zÀ-ÿ\s]+$/;

const schema = z.object({
  nombre: z.string().min(1).regex(nameRegex),
  edad: z.preprocess((v) => Number(v), z.number().int().min(1).max(120)),
  intereses: z.array(z.string()),
  interes_otro: z.string().max(40).optional(),
  ubicacion: z.string().min(1),
  biografia: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
});

export async function POST(req: Request) {
  return handleProfileRequest(req, 'POST');
}

export async function PATCH(req: Request) {
  return handleProfileRequest(req, 'PATCH');
}

async function handleProfileRequest(req: Request, method: 'POST' | 'PATCH') {
  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 });

  const supabase = await createClient(cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });

  const userId = String(user.id);

  const values = parsed.data;

  if (
    values.intereses.includes('Otros') &&
    (!values.interes_otro || !lettersOnly.test(values.interes_otro))
  ) {
    return NextResponse.json(
      {
        ok: false,
        message: 'Interés "Otros" requiere texto válido (solo letras, max 40).',
      },
      { status: 400 }
    );
  }

  const { data: existingProfile, error: fetchError } = await supabase
    .from('perfil')
    .select('id')
    .eq('id', userId)
    .single();

  const profileData = {
    id: userId,
    username: user.user_metadata.username as string,
    email: user.email as string,
    nombre: values.nombre,
    edad: values.edad,
    ubicacion: values.ubicacion,
    biografia: values.biografia ?? null,
    avatar_url: values.avatar_url ?? null,
    intereses: values.intereses ?? null,
    interes_otro: values.interes_otro ?? null,
    verificado: true,
    completed: true,
    updated_at: new Date().toISOString(),
  };

  let error;

  if (existingProfile) {
    const { error: updateError } = await supabase
      .from('perfil')
      .update(profileData)
      .eq('id', userId);
    error = updateError;
  } else {
    const { error: insertError } = await supabase
      .from('perfil')
      .insert([{ ...profileData, id: undefined }]); // No incluir el ID para que se genere automáticamente
    error = insertError;
  }

  if (error) {
    console.error('Error al guardar el perfil:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Error al guardar el perfil',
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
