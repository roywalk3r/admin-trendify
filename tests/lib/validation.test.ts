import { describe, it, expect } from 'vitest'
import { z } from 'zod'

// Common validation schemas used across the app
const emailSchema = z.string().email()
const phoneSchema = z.string().regex(/^\+?[1-9]\d{6,14}$/)
const passwordSchema = z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
const priceSchema = z.number().positive()
const quantitySchema = z.number().int().positive()

describe('Validation Schemas', () => {
  describe('Email Validation', () => {
    it('validates correct email', () => {
      expect(emailSchema.safeParse('test@example.com').success).toBe(true)
      expect(emailSchema.safeParse('user.name+tag@example.co.uk').success).toBe(true)
    })

    it('rejects invalid email', () => {
      expect(emailSchema.safeParse('invalid').success).toBe(false)
      expect(emailSchema.safeParse('test@').success).toBe(false)
      expect(emailSchema.safeParse('@example.com').success).toBe(false)
      expect(emailSchema.safeParse('test @example.com').success).toBe(false)
    })
  })

  describe('Phone Validation', () => {
    it('validates international phone numbers', () => {
      expect(phoneSchema.safeParse('+233123456789').success).toBe(true)
      expect(phoneSchema.safeParse('+1234567890').success).toBe(true)
      expect(phoneSchema.safeParse('1234567890').success).toBe(true)
    })

    it('rejects invalid phone numbers', () => {
      expect(phoneSchema.safeParse('123').success).toBe(false)
      expect(phoneSchema.safeParse('+0123456789').success).toBe(false)
      expect(phoneSchema.safeParse('abc123').success).toBe(false)
    })
  })

  describe('Password Validation', () => {
    it('validates strong passwords', () => {
      expect(passwordSchema.safeParse('Password123').success).toBe(true)
      expect(passwordSchema.safeParse('SecureP@ss1').success).toBe(true)
    })

    it('rejects weak passwords', () => {
      expect(passwordSchema.safeParse('short').success).toBe(false)
      expect(passwordSchema.safeParse('nouppercase123').success).toBe(false)
      expect(passwordSchema.safeParse('NOLOWERCASE123').success).toBe(false)
      expect(passwordSchema.safeParse('NoNumbers').success).toBe(false)
    })
  })

  describe('Price Validation', () => {
    it('validates positive prices', () => {
      expect(priceSchema.safeParse(10.99).success).toBe(true)
      expect(priceSchema.safeParse(0.01).success).toBe(true)
      expect(priceSchema.safeParse(1000).success).toBe(true)
    })

    it('rejects invalid prices', () => {
      expect(priceSchema.safeParse(0).success).toBe(false)
      expect(priceSchema.safeParse(-10).success).toBe(false)
      expect(priceSchema.safeParse('10').success).toBe(false)
    })
  })

  describe('Quantity Validation', () => {
    it('validates positive integers', () => {
      expect(quantitySchema.safeParse(1).success).toBe(true)
      expect(quantitySchema.safeParse(100).success).toBe(true)
    })

    it('rejects invalid quantities', () => {
      expect(quantitySchema.safeParse(0).success).toBe(false)
      expect(quantitySchema.safeParse(-1).success).toBe(false)
      expect(quantitySchema.safeParse(1.5).success).toBe(false)
      expect(quantitySchema.safeParse('1').success).toBe(false)
    })
  })

  describe('Address Validation', () => {
    const addressSchema = z.object({
      fullName: z.string().min(2),
      street: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      zipCode: z.string().min(3),
      country: z.string().length(2),
      phone: phoneSchema
    })

    it('validates complete address', () => {
      const validAddress = {
        fullName: 'John Doe',
        street: '123 Main Street',
        city: 'Accra',
        state: 'GA',
        zipCode: '00000',
        country: 'GH',
        phone: '+233123456789'
      }
      expect(addressSchema.safeParse(validAddress).success).toBe(true)
    })

    it('rejects incomplete address', () => {
      const invalidAddress = {
        fullName: 'J',
        street: '123',
        city: 'A',
        state: '',
        zipCode: '00',
        country: 'GHA',
        phone: '123'
      }
      expect(addressSchema.safeParse(invalidAddress).success).toBe(false)
    })
  })

  describe('Product Review Validation', () => {
    const reviewSchema = z.object({
      rating: z.number().int().min(1).max(5),
      comment: z.string().min(10).max(500),
      productId: z.string().min(1)
    })

    it('validates correct review', () => {
      const validReview = {
        rating: 5,
        comment: 'This is an excellent product!',
        productId: 'prod123'
      }
      expect(reviewSchema.safeParse(validReview).success).toBe(true)
    })

    it('rejects invalid rating', () => {
      const invalidReview = {
        rating: 6,
        comment: 'Great product',
        productId: 'prod123'
      }
      expect(reviewSchema.safeParse(invalidReview).success).toBe(false)
    })

    it('rejects short comments', () => {
      const invalidReview = {
        rating: 5,
        comment: 'Good',
        productId: 'prod123'
      }
      expect(reviewSchema.safeParse(invalidReview).success).toBe(false)
    })
  })

  describe('Coupon Code Validation', () => {
    const couponSchema = z.string()
      .min(4)
      .max(20)
      .regex(/^[A-Z0-9]+$/)

    it('validates correct coupon codes', () => {
      expect(couponSchema.safeParse('SAVE10').success).toBe(true)
      expect(couponSchema.safeParse('WELCOME2024').success).toBe(true)
    })

    it('rejects invalid coupon codes', () => {
      expect(couponSchema.safeParse('abc').success).toBe(false)
      expect(couponSchema.safeParse('save10').success).toBe(false)
      expect(couponSchema.safeParse('SAVE-10').success).toBe(false)
    })
  })
})
