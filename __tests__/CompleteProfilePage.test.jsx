/**
 * @jest-environment jsdom
 */

import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import CompleteProfilePage from '@/app/complete-profile/page' // ajusta la ruta real
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

// --- Mock de dependencias ---
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('next/headers', () => ({
  cookies: jest.fn(),
}))

jest.mock('@/components/ui/CompleteProfileForm', () => () => (
  <div data-testid="mock-form">Formulario de perfil</div>
))

describe('CompleteProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  // ---------- Caso 1: Usuario no autenticado ----------
  test('muestra mensaje de login si el usuario no está autenticado', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({ data: { user: null } }),
      },
    }
    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(cookies as jest.Mock).mockReturnValue({})

    // Act
    const Page = await CompleteProfilePage()
    render(Page)

    // Assert
    expect(screen.getByText(/Please login to continue/i)).toBeInTheDocument()
  })

  // ---------- Caso 2: Perfil ya completado ----------
  test('muestra mensaje si el perfil ya está completo', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '123' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { completed: true } }),
      }),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(cookies as jest.Mock).mockReturnValue({})

    // Act
    const Page = await CompleteProfilePage()
    render(Page)

    // Assert
    await waitFor(() =>
      expect(screen.getByText(/Tu perfil ya está completo/i)).toBeInTheDocument()
    )
  })

  // ---------- Caso 3: Usuario autenticado con perfil incompleto ----------
  test('renderiza el formulario si el perfil no está completo', async () => {
    // Arrange
    const mockSupabase = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: { id: '456' } },
        }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: { completed: false } }),
      }),
    }

    ;(createClient as jest.Mock).mockResolvedValue(mockSupabase)
    ;(cookies as jest.Mock).mockReturnValue({})

    // Act
    const Page = await CompleteProfilePage()
    render(Page)

    // Assert
    expect(screen.getByRole('heading', { name: /Completa tu perfil/i })).toBeInTheDocument()
    expect(screen.getByTestId('mock-form')).toBeInTheDocument()
  })
})
