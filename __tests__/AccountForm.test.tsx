import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AccountForm from '@/components/ui/AccountForm'
import { createClient as createClientClient } from '@/lib/supabase/client'

// 🧩 Mock del cliente Supabase
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn()
}))

// Evita los alerts reales
global.alert = jest.fn()

describe('AccountForm Component', () => {
  const mockUpsert = jest.fn()
  const mockSelect = jest.fn()

  const mockSupabase = {
    from: jest.fn(() => ({
      select: mockSelect,
      upsert: mockUpsert
    }))
  }

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com'
  }

  beforeEach(() => {
    ;(createClientClient as jest.Mock).mockReturnValue(mockSupabase)
    jest.clearAllMocks()
  })

  test('✅ Renderiza correctamente los campos del formulario', async () => {
    // Arrange
    mockSelect.mockReturnValueOnce({
      data: { full_name: 'Juan Pérez', username: 'juanp', website: 'https://test.com', avatar_url: '' },
      error: null,
      status: 200
    })

    // Act
    render(<AccountForm user={mockUser as any} />)

    // Assert
    expect(await screen.findByDisplayValue('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByDisplayValue('juanp')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://test.com')).toBeInTheDocument()
  })

  test('✏️ Permite editar los campos y actualizar el perfil', async () => {
    // Arrange
    mockSelect.mockReturnValueOnce({ data: {}, error: null, status: 200 })
    mockUpsert.mockResolvedValueOnce({ error: null })

    render(<AccountForm user={mockUser as any} />)

    const fullNameInput = await screen.findByLabelText('Full Name')
    fireEvent.change(fullNameInput, { target: { value: 'Nuevo Nombre' } })

    const updateButton = screen.getByRole('button', { name: /update/i })

    // Act
    fireEvent.click(updateButton)

    // Assert
    await waitFor(() => {
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles')
      expect(mockUpsert).toHaveBeenCalled()
      expect(global.alert).toHaveBeenCalledWith('Profile updated!')
    })
  })

  test('⚠️ Muestra alerta si hay error en la actualización', async () => {
    // Arrange
    mockSelect.mockReturnValueOnce({ data: {}, error: null, status: 200 })
    mockUpsert.mockResolvedValueOnce({ error: new Error('DB error') })

    render(<AccountForm user={mockUser as any} />)

    const button = await screen.findByRole('button', { name: /update/i })
    fireEvent.click(button)

    // Assert
    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Error updating the data!')
    })
  })
})
