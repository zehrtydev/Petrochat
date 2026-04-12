/**
 * Tests para Message component.
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Message from '../components/Message'
import { User, Bot } from 'lucide-react'

vi.mock('lucide-react', () => ({
  User: ({ size }) => <svg data-testid="user-icon" width={size} height={size} />,
  Bot: ({ size }) => <svg data-testid="bot-icon" width={size} height={size} />,
}))

describe('Message', () => {
  it('renderiza mensaje de usuario', () => {
    const mensaje = {
      rol: 'usuario',
      texto: 'Hola, necesito información sobre Petrochat',
    }

    const { container } = render(<Message mensaje={mensaje} />)

    expect(container.textContent).toContain('Hola, necesito información sobre Petrochat')
  })

  it('renderiza mensaje de bot', () => {
    const mensaje = {
      rol: 'bot',
      texto: 'Soy el asistente de Petrochat',
    }

    const { container } = render(<Message mensaje={mensaje} />)

    expect(container.textContent).toContain('Soy el asistente de Petrochat')
  })

  it('renderiza estado vacío cuando no hay mensaje', () => {
    const mensaje = {
      rol: 'bot',
      texto: '',
    }

    const { container } = render(<Message mensaje={mensaje} />)

    expect(container.textContent.trim()).toBe('')
  })
})