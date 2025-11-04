import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import Page from '../app/(auth)/register/page' 

// Mock del componente RegisterForm para que no interfiera en la prueba
jest.mock('../../../components/ui/RegisterForm', () => () => (
  <div data-testid="mock-register-form">Mock RegisterForm</div>
))

describe('Página de Registro', () => {
  test('Renderiza correctamente el título, el texto y el formulario (AAA)', () => {
    // 👉 Arrange
    const expectedTitle = 'Crea tu cuenta'
    const expectedSubtitle = 'Únete a la comunidad de eventos más vibrante de Medellín.'

    // 👉 Act
    render(<Page />)

    // 👉 Assert
    expect(screen.getByText(expectedTitle)).toBeInTheDocument()
    expect(screen.getByText(expectedSubtitle)).toBeInTheDocument()
    expect(screen.getByTestId('mock-register-form')).toBeInTheDocument()
  })
})
