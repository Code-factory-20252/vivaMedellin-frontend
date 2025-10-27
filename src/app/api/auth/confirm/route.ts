import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// Creating a handler to a GET request to route /auth/confirm
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = (searchParams.get('type') as EmailOtpType | null)
  const next = '/account'
  // Create redirect link without the secret token
  const redirectTo = request.nextUrl.clone()
  redirectTo.pathname = next
  redirectTo.searchParams.delete('token_hash')
  redirectTo.searchParams.delete('type')
  if (token_hash && type) {
    const supabase = await createClient(cookies())
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    })
    if (!error) {
      // on success redirect to dashboard with success message
      const successUrl = request.nextUrl.clone()
      successUrl.pathname = '/auth/login'
      successUrl.searchParams.set('msg', 'confirm_success')
      successUrl.searchParams.set('desc', 'Tu cuenta ha sido activada con éxito. Ya puedes iniciar sesión.')
      return NextResponse.redirect(successUrl)
    } else {
      // include error details so the UI can show an actionable message
      // cast to unknown and read fields defensively to satisfy lint rules
      const errObj = error as unknown
      let code = 'access_denied'
      let name = 'error'
      let message = 'Email link is invalid or has expired'
      try {
        if (typeof errObj === 'object' && errObj !== null) {
          const e = errObj as Record<string, unknown>
          if (typeof e.status === 'number') code = String(e.status)
          if (typeof e.name === 'string') name = e.name
          if (typeof e.message === 'string') message = e.message
        }
      } catch {
        // ignore error reading
      }
      redirectTo.pathname = '/error'
      redirectTo.searchParams.set('error', 'access_denied')
      redirectTo.searchParams.set('error_code', name ?? code)
      redirectTo.searchParams.set('error_description', message)
      return NextResponse.redirect(redirectTo)
    }
  }
  // return the user to an error page with some instructions
  redirectTo.pathname = '/error'
  return NextResponse.redirect(redirectTo)
}
