import AccountForm from './account-form'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'

export default async function Account() {
  const supabase = await createClient(cookies())
  const { data } = await supabase.auth.getUser()
  return <AccountForm user={data.user ?? null} />
}
