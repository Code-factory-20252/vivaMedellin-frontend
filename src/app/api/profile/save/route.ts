import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const nameRegex = /^[A-Za-zÀ-ÿ\s]+$/
const lettersOnly = /^[A-Za-zÀ-ÿ\s]+$/

const schema = z.object({
  nombre: z.string().min(1).regex(nameRegex),
  edad: z.preprocess((v) => Number(v), z.number().int().min(1).max(120)),
  intereses: z.array(z.string()),
  interes_otro: z.string().max(40).optional(),
  ubicacion: z.string().min(1),
  biografia: z.string().max(500).optional(),
  avatar_url: z.string().url().optional(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ ok: false, errors: parsed.error.flatten() }, { status: 400 })

  const supabase = await createClient(cookies())
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // Supabase auth user id is typically a UUID string. Keep it as string to avoid invalid coercion.
  const userId = String(user.id)

  const values = parsed.data

  // if intereses contains 'Otros', require interes_otro
  if (values.intereses.includes('Otros') && (!values.interes_otro || !lettersOnly.test(values.interes_otro))) {
    return NextResponse.json({ ok: false, message: 'Interés "Otros" requiere texto válido (solo letras, max 40).' }, { status: 400 })
  }

  // upsert into perfil
  type ProfilePayload = {
    id_usuario: string
    nombre: string
    edad: number
    ubicacion: string
    biografia: string | null
    foto_url: string | null
    intereses: string[] | null
    interes_otro: string | null
    verificado: boolean
    completed: boolean
    updated_at: string
  }

  const payload: ProfilePayload = {
    id_usuario: userId,
    nombre: values.nombre,
    edad: values.edad,
    ubicacion: values.ubicacion,
    biografia: values.biografia ?? null,
    foto_url: values.avatar_url ?? null,
    intereses: values.intereses ?? null,
    interes_otro: values.interes_otro ?? null,
    verificado: true,
    completed: true,
    updated_at: new Date().toISOString(),
  }

  // try update first
  const { error: updateErr } = await supabase.from('perfil').update(payload).eq('id_usuario', userId)
  if (updateErr) {
    // try insert
    const { error: insertErr } = await supabase.from('perfil').insert(payload)
    if (insertErr) return NextResponse.json({ ok: false, error: insertErr.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
