import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchBar } from '@/components/search/search-bar'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams()
}))

describe('SearchBar Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders search input', () => {
    render(<SearchBar />)
    
    const input = screen.getByPlaceholderText(/search products/i)
    expect(input).toBeInTheDocument()
  })

  it('updates input value on typing', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test query')
    
    expect(input).toHaveValue('test query')
  })

  it('navigates to search results on submit', async () => {
    const { useRouter } = require('next/navigation')
    const push = vi.fn()
    useRouter.mockReturnValue({ push })

    render(<SearchBar />)
    
    const input = screen.getByRole('textbox')
    const form = input.closest('form')
    
    await userEvent.type(input, 'laptop')
    fireEvent.submit(form!)
    
    expect(push).toHaveBeenCalledWith(expect.stringContaining('search=laptop'))
  })

  it('does not submit empty search', () => {
    const { useRouter } = require('next/navigation')
    const push = vi.fn()
    useRouter.mockReturnValue({ push })

    render(<SearchBar />)
    
    const input = screen.getByRole('textbox')
    const form = input.closest('form')
    
    fireEvent.submit(form!)
    
    expect(push).not.toHaveBeenCalled()
  })

  it('shows search suggestions on focus', async () => {
    render(<SearchBar />)
    
    const input = screen.getByRole('textbox')
    await userEvent.click(input)
    
    await waitFor(() => {
      expect(screen.getByText(/popular searches/i)).toBeInTheDocument()
    })
  })

  it('filters suggestions based on input', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'phone')
    
    await waitFor(() => {
      const suggestions = screen.getAllByRole('option')
      expect(suggestions.length).toBeGreaterThan(0)
    })
  })

  it('clears input when clear button clicked', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'test')
    
    const clearBtn = screen.getByRole('button', { name: /clear/i })
    await user.click(clearBtn)
    
    expect(input).toHaveValue('')
  })

  it('handles keyboard navigation in suggestions', async () => {
    const user = userEvent.setup()
    render(<SearchBar />)
    
    const input = screen.getByRole('textbox')
    await user.type(input, 'phone')
    
    await waitFor(() => {
      expect(screen.getAllByRole('option').length).toBeGreaterThan(0)
    })
    
    await user.keyboard('{ArrowDown}')
    await user.keyboard('{Enter}')
    
    // Should navigate to selected suggestion
    const { useRouter } = require('next/navigation')
    expect(useRouter().push).toHaveBeenCalled()
  })
})
