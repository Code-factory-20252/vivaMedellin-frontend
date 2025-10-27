import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

/**
 * Verifica si un username ya existe en la base de datos
 */
export async function checkUsernameExists(username: string): Promise<boolean> {
  const supabase = await createClient(cookies())

  const { data, error } = await supabase
    .from('perfil')
    .select('id')
    .eq('username', username)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 es "not found"
    throw error
  }

  return !!data
}

/**
 * Verifica si un email ya está registrado intentando crear un usuario temporal
 * Nota: Esta función no es necesaria ya que Supabase Auth maneja la validación automáticamente
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  // No necesitamos esta función ya que Supabase Auth ya valida emails existentes
  // y devuelve errores específicos cuando intentamos registrar un email ya existente
  return false
}

/**
 * Crea un perfil de usuario después del registro exitoso
 */
export async function createUserProfile(userId: string, username: string, email: string) {
  const supabase = await createClient(cookies())

  const { error } = await supabase
    .from('perfil')
    .insert([
      {
        id: userId,
        username: username,
        email: email,
        verificado: false,
        completed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ])

  if (error) {
    throw error
  }
}

/**
 * Actualiza la información del perfil del usuario
 */
export async function updateUserProfile(userId: string, profileData: {
  nombre_completo?: string;
  edad?: number;
  ubicacion?: string;
  bio?: string;
  preferencias_notificacion?: any;
  intereses?: any;
  interes_otro?: string;
  avatar_url?: string;
}) {
  const supabase = await createClient(cookies())

  const { error } = await supabase
    .from('perfil')
    .update({
      ...profileData,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (error) {
    throw error
  }
}

/**
 * Obtiene la información del perfil del usuario
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient(cookies())

  const { data, error } = await supabase
    .from('perfil')
    .select('*')
    .eq('id', userId)
    .single()

  if (error && error.code !== 'PGRST116') {
    throw error
  }

  return data
}

/**
 * Verifica si el perfil del usuario está completo
 */
export async function isProfileComplete(userId: string): Promise<boolean> {
  const supabase = await createClient(cookies())

  const { data, error } = await supabase
    .from('perfil')
    .select('completed')
    .eq('id', userId)
    .single()

  if (error) {
    throw error
  }

  return data?.completed || false
}
