import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ReviewForm } from '@/components/reviews/review-form'

vi.mock('@/lib/api-client', () => ({
  submitReview: vi.fn(async (data) => ({
    success: true,
    review: { id: 'rev1', ...data }
  }))
}))

describe('ReviewForm Component', () => {
  const mockProps = {
    productId: 'prod1',
    onSuccess: vi.fn()
  }

  it('renders form elements', () => {
    render(<ReviewForm {...mockProps} />)
    
    expect(screen.getByLabelText(/rating/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/review/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    render(<ReviewForm {...mockProps} />)
    
    const submitBtn = screen.getByRole('button', { name: /submit/i })
    fireEvent.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/rating is required/i)).toBeInTheDocument()
    })
  })

  it('submits review successfully', async () => {
    const user = userEvent.setup()
    const { submitReview } = require('@/lib/api-client')
    
    render(<ReviewForm {...mockProps} />)
    
    // Select rating
    const star5 = screen.getByRole('button', { name: /5 stars/i })
    await user.click(star5)
    
    // Enter review text
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Great product! Highly recommend.')
    
    // Submit
    const submitBtn = screen.getByRole('button', { name: /submit/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(submitReview).toHaveBeenCalledWith({
        productId: 'prod1',
        rating: 5,
        comment: 'Great product! Highly recommend.'
      })
    })
    
    expect(mockProps.onSuccess).toHaveBeenCalled()
  })

  it('displays error message on submission failure', async () => {
    const { submitReview } = require('@/lib/api-client')
    submitReview.mockRejectedValueOnce(new Error('Network error'))
    
    const user = userEvent.setup()
    render(<ReviewForm {...mockProps} />)
    
    const star5 = screen.getByRole('button', { name: /5 stars/i })
    await user.click(star5)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test review')
    
    const submitBtn = screen.getByRole('button', { name: /submit/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/failed to submit/i)).toBeInTheDocument()
    })
  })

  it('disables submit button while submitting', async () => {
    const user = userEvent.setup()
    render(<ReviewForm {...mockProps} />)
    
    const star5 = screen.getByRole('button', { name: /5 stars/i })
    await user.click(star5)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Test review')
    
    const submitBtn = screen.getByRole('button', { name: /submit/i })
    await user.click(submitBtn)
    
    expect(submitBtn).toBeDisabled()
  })

  it('validates minimum review length', async () => {
    const user = userEvent.setup()
    render(<ReviewForm {...mockProps} />)
    
    const star5 = screen.getByRole('button', { name: /5 stars/i })
    await user.click(star5)
    
    const textarea = screen.getByRole('textbox')
    await user.type(textarea, 'Too short')
    
    const submitBtn = screen.getByRole('button', { name: /submit/i })
    await user.click(submitBtn)
    
    await waitFor(() => {
      expect(screen.getByText(/review must be at least/i)).toBeInTheDocument()
    })
  })

  it('allows rating selection via star clicks', async () => {
    const user = userEvent.setup()
    render(<ReviewForm {...mockProps} />)
    
    const star3 = screen.getByRole('button', { name: /3 stars/i })
    await user.click(star3)
    
    // Visual feedback for selected rating
    expect(star3).toHaveClass('text-yellow-400')
  })
})
