import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '@/components/ui/button'

// Example test for UI components
describe('Button Component', () => {
  it('renders a button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it('applies variant classes correctly', () => {
    render(<Button variant="destructive">Delete</Button>)
    const button = screen.getByRole('button', { name: /delete/i })
    expect(button).toHaveClass('bg-destructive')
  })

  it('handles click events', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole('button', { name: /click me/i })
    
    button.click()
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})

// Example test for utility functions
describe('Utility Functions', () => {
  it('should validate email format', () => {
    const validEmail = 'test@example.com'
    const invalidEmail = 'invalid-email'
    
    // This would test your validation functions
    expect(validEmail).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
    expect(invalidEmail).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
  })
})

// Example test for Zustand store
import { useAppStore } from '@/lib/store'
import { renderHook, act } from '@testing-library/react'

describe('App Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useAppStore.getState().logout()
  })

  it('should set user correctly', () => {
    const { result } = renderHook(() => useAppStore())
    
    act(() => {
      result.current.setUser({
        id: '123',
        email: 'test@example.com',
        name: 'Test User'
      })
    })

    expect(result.current.user).toEqual({
      id: '123',
      email: 'test@example.com',
      name: 'Test User'
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should logout correctly', () => {
    const { result } = renderHook(() => useAppStore())
    
    // First set a user
    act(() => {
      result.current.setUser({
        id: '123',
        email: 'test@example.com'
      })
    })

    // Then logout
    act(() => {
      result.current.logout()
    })

    expect(result.current.user).toBe(null)
    expect(result.current.isAuthenticated).toBe(false)
  })
})