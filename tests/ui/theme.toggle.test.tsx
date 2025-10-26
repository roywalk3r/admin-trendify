import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { ThemeToggle } from '@/components/theme-toggle'

// Basic render test ensuring no nested <button> elements (trigger uses asChild)
describe('ThemeToggle', () => {
  it('does not render nested buttons', () => {
    const { container } = render(<ThemeToggle />)
    const nested = container.querySelectorAll('button button')
    expect(nested.length).toBe(0)
  })
})
