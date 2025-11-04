import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';

export async function checkUsernameExists(username: string): Promise<boolean> {
  const supabase = await createClient(cookies());

  const { data, error } = await supabase
    .from('perfil')
    .select('id')
    .eq('username', username)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return !!data;
}

export async function checkEmailExists(email: string): Promise<boolean> {
  return false;
}

export async function createUserProfile(userId: string, username: string, email: string) {
  const supabase = await createClient(cookies());

  const { error } = await supabase.from('perfil').insert([
    {
      id: userId,
      username: username,
      email: email,
      verificado: false,
      completed: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    throw error;
  }
}

export async function updateUserProfile(
  userId: string,
  profileData: {
    nombre?: string;
    edad?: number;
    ubicacion?: string;
    bio?: string;
    preferencias_notificacion?: any;
    intereses?: any;
    interes_otro?: string;
    avatar_url?: string;
  }
) {
  const supabase = await createClient(cookies());

  const { error } = await supabase
    .from('perfil')
    .update({
      ...profileData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (error) {
    throw error;
  }
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient(cookies());

  const { data, error } = await supabase.from('perfil').select('*').eq('id', userId).single();

  if (error && error.code !== 'PGRST116') {
    throw error;
  }

  return data;
}

export async function isProfileComplete(userId: string): Promise<boolean> {
  const supabase = await createClient(cookies());

  const { data, error } = await supabase
    .from('perfil')
    .select('completed')
    .eq('id', userId)
    .single();

  if (error) {
    throw error;
  }

  return data?.completed || false;
}
