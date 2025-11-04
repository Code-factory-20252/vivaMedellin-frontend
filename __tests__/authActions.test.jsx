/**
 * @jest-environment node
 */

import { login, signup } from '../path/to/authActions' // ajusta la ruta real
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

// --- Mocks ---
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

describe('Auth actions (login & signup)', () => {

  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ---------- TEST LOGIN ----------
  test('login - redirige a /account si el inicio de sesión es exitoso', async () => {
    // Arrange
    const mockFormData = new FormData()
    mockFormData.set('email', 'test@example.com')
    mockFormData.set('password', '123456')

    const mockSupabase = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ error: null })
      }
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(cookies as jest.Mock).mockReturnValue({})

    // Act
    await login(mockFormData)

    // Assert
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: '123456',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/account')
  })

  test('login - redirige a /error si ocurre un error', async () => {
    // Arrange
    const mockFormData = new FormData()
    mockFormData.set('email', 'fail@example.com')
    mockFormData.set('password', 'wrong')

    const mockSupabase = {
      auth: {
        signInWithPassword: jest.fn().mockResolvedValue({ error: { message: 'Invalid' } })
      }
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(cookies as jest.Mock).mockReturnValue({})

    // Act
    await login(mockFormData)

    // Assert
    expect(redirect).toHaveBeenCalledWith('/error')
  })

  // ---------- TEST SIGNUP ----------
  test('signup - redirige a /account si el registro es exitoso', async () => {
    // Arrange
    const mockFormData = new FormData()
    mockFormData.set('email', 'newuser@example.com')
    mockFormData.set('password', 'abcdef')

    const mockSupabase = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ error: null })
      }
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(cookies as jest.Mock).mockReturnValue({})

    // Act
    await signup(mockFormData)

    // Assert
    expect(mockSupabase.auth.signUp).toHaveBeenCalledWith({
      email: 'newuser@example.com',
      password: 'abcdef',
    })
    expect(revalidatePath).toHaveBeenCalledWith('/', 'layout')
    expect(redirect).toHaveBeenCalledWith('/account')
  })

  test('signup - redirige a /error si ocurre un error en el registro', async () => {
    // Arrange
    const mockFormData = new FormData()
    mockFormData.set('email', 'error@example.com')
    mockFormData.set('password', '123')

    const mockSupabase = {
      auth: {
        signUp: jest.fn().mockResolvedValue({ error: { message: 'Email exists' } })
      }
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(cookies as jest.Mock).mockReturnValue({})

    // Act
    await signup(mockFormData)

    // Assert
    expect(redirect).toHaveBeenCalledWith('/error')
  })
})
