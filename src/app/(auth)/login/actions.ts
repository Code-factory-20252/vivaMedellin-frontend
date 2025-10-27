'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function login(formData: FormData) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)
  const data = {
    email: (formData.get('email') as string) ?? '',
    password: (formData.get('password') as string) ?? '',
  }

  const { error } = await supabase.auth.signInWithPassword(data)
  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}

export async function signup(formData: FormData) {
  const cookieStore = cookies()
  const supabase = await createClient(cookieStore)
  // type-casting here for convenience - validate in production
  const data = {
    email: (formData.get('email') as string) ?? '',
    password: (formData.get('password') as string) ?? '',
  }

  const { error } = await supabase.auth.signUp(data)
  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/account')
}
