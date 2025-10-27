import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { checkUsernameExists, createUserProfile } from '@/lib/auth-utils'

export async function POST(request: Request) {
  const formData = await request.formData()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const username = formData.get('username') as string

  // Validaciones básicas
  if (!email || !password || !username) {
    const redirectUrl = new URL('/register', request.url)
    redirectUrl.searchParams.set('error', 'Todos los campos son obligatorios')
    return NextResponse.redirect(redirectUrl)
  }

  // Validar formato del email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    const redirectUrl = new URL('/register', request.url)
    redirectUrl.searchParams.set('error', 'El formato del correo electrónico no es válido')
    redirectUrl.searchParams.set('field', 'email')
    return NextResponse.redirect(redirectUrl)
  }

  // Validar username (solo caracteres alfanuméricos y guiones bajos)
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username) || username.length < 3 || username.length > 20) {
    const redirectUrl = new URL('/register', request.url)
    redirectUrl.searchParams.set('error', 'El nombre de usuario debe tener entre 3 y 20 caracteres, y solo puede contener letras, números y guiones bajos')
    redirectUrl.searchParams.set('field', 'username')
    return NextResponse.redirect(redirectUrl)
  }

  try {
    // Verificar si el username ya existe
    const usernameExists = await checkUsernameExists(username)
    if (usernameExists) {
      const redirectUrl = new URL('/register', request.url)
      redirectUrl.searchParams.set('error', 'El nombre de usuario ya está en uso')
      redirectUrl.searchParams.set('field', 'username')
      return NextResponse.redirect(redirectUrl)
    }

    const supabase = await createClient(cookies())

    // Intentar crear el usuario en Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username
        }
      }
    })

    if (error) {
      let errorMessage = 'Error en el registro'
      let errorField = null

      // Manejar errores específicos de Supabase
      if (error.message.includes('User already registered')) {
        errorMessage = 'El correo electrónico ya está registrado'
        errorField = 'email'
      } else if (error.message.includes('Password should be at least')) {
        errorMessage = 'La contraseña no cumple con los requisitos mínimos'
        errorField = 'password'
      } else if (error.message.includes('Invalid email')) {
        errorMessage = 'El formato del correo electrónico no es válido'
        errorField = 'email'
      } else if (error.message.includes('Signup is disabled')) {
        errorMessage = 'El registro de usuarios está temporalmente deshabilitado'
      }

      const redirectUrl = new URL('/register', request.url)
      redirectUrl.searchParams.set('error', errorMessage)
      if (errorField) {
        redirectUrl.searchParams.set('field', errorField)
      }
      return NextResponse.redirect(redirectUrl)
    }

    // Si el usuario se creó exitosamente, crear el perfil
    if (data.user) {
      try {
        await createUserProfile(data.user.id, username, email)
      } catch (profileError) {
        console.error('Error creando perfil:', profileError)
        // No fallar el registro si hay error en el perfil, pero loguear el error
      }
    }

    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('msg', 'signup_success')
    redirectUrl.searchParams.set('desc', 'Te has registrado con éxito. Revisa tu correo para activar la cuenta.')
    return NextResponse.redirect(redirectUrl)

  } catch (error) {
    console.error('Error en registro:', error)
    const redirectUrl = new URL('/register', request.url)
    redirectUrl.searchParams.set('error', 'Error interno del servidor')
    return NextResponse.redirect(redirectUrl)
  }
}
