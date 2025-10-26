import { describe, it, expect } from 'vitest'
import { formatPrice, formatDate, calculateDiscount, validateEmail, slugify } from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatPrice', () => {
    it('formats price correctly', () => {
      expect(formatPrice(1000)).toBe('₵1,000.00')
      expect(formatPrice(99.99)).toBe('₵99.99')
      expect(formatPrice(0)).toBe('₵0.00')
    })

    it('handles negative prices', () => {
      expect(formatPrice(-50)).toBe('-₵50.00')
    })

    it('handles large numbers', () => {
      expect(formatPrice(1000000)).toBe('₵1,000,000.00')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const formatted = formatDate(date)
      expect(formatted).toContain('2024')
      expect(formatted).toContain('Jan')
    })

    it('handles date strings', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toBeDefined()
    })
  })

  describe('calculateDiscount', () => {
    it('calculates percentage discount', () => {
      const result = calculateDiscount(100, 'PERCENTAGE', 10)
      expect(result).toBe(10)
    })

    it('calculates fixed discount', () => {
      const result = calculateDiscount(100, 'FIXED', 25)
      expect(result).toBe(25)
    })

    it('does not exceed original price', () => {
      const result = calculateDiscount(100, 'FIXED', 150)
      expect(result).toBeLessThanOrEqual(100)
    })

    it('handles zero discount', () => {
      const result = calculateDiscount(100, 'PERCENTAGE', 0)
      expect(result).toBe(0)
    })
  })

  describe('validateEmail', () => {
    it('validates correct email', () => {
      expect(validateEmail('test@example.com')).toBe(true)
      expect(validateEmail('user.name@domain.co')).toBe(true)
    })

    it('rejects invalid email', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('test@')).toBe(false)
      expect(validateEmail('@example.com')).toBe(false)
      expect(validateEmail('')).toBe(false)
    })
  })

  describe('slugify', () => {
    it('converts text to slug', () => {
      expect(slugify('Test Product')).toBe('test-product')
      expect(slugify('Nike Air Max 90')).toBe('nike-air-max-90')
    })

    it('handles special characters', () => {
      expect(slugify('Product: Special Edition!')).toBe('product-special-edition')
    })

    it('handles multiple spaces', () => {
      expect(slugify('Too   Many    Spaces')).toBe('too-many-spaces')
    })

    it('handles unicode characters', () => {
      expect(slugify('Café Latté')).toBe('cafe-latte')
    })
  })
})
