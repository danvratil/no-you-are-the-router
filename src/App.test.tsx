import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders the game title', () => {
    render(<App />)
    expect(screen.getByText('No, YOU Are the Router!')).toBeDefined()
  })

  it('renders the description', () => {
    render(<App />)
    expect(screen.getByText(/educational game about networking/i)).toBeDefined()
  })

  it('renders the counter button', () => {
    render(<App />)
    expect(screen.getByRole('button')).toBeDefined()
  })
})
