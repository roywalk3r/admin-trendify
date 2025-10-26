import { describe, it, expect } from 'vitest'
import { calculateShipping, getShippingMethods, estimateDelivery } from '@/lib/shipping'

describe('Shipping Utils', () => {
  describe('calculateShipping', () => {
    it('calculates standard shipping', () => {
      const cost = calculateShipping('standard', 'GH', 100)
      expect(cost).toBeGreaterThan(0)
    })

    it('calculates express shipping (higher cost)', () => {
      const standard = calculateShipping('standard', 'GH', 100)
      const express = calculateShipping('express', 'GH', 100)
      expect(express).toBeGreaterThan(standard)
    })

    it('offers free shipping above threshold', () => {
      const cost = calculateShipping('standard', 'GH', 1000)
      expect(cost).toBe(0)
    })

    it('charges international shipping for non-GH countries', () => {
      const domestic = calculateShipping('standard', 'GH', 100)
      const international = calculateShipping('standard', 'US', 100)
      expect(international).toBeGreaterThan(domestic)
    })

    it('handles invalid shipping method', () => {
      expect(() => calculateShipping('invalid', 'GH', 100)).toThrow()
    })
  })

  describe('getShippingMethods', () => {
    it('returns available shipping methods', () => {
      const methods = getShippingMethods('GH')
      expect(Array.isArray(methods)).toBe(true)
      expect(methods.length).toBeGreaterThan(0)
      expect(methods[0]).toHaveProperty('id')
      expect(methods[0]).toHaveProperty('name')
      expect(methods[0]).toHaveProperty('price')
    })

    it('includes standard and express methods', () => {
      const methods = getShippingMethods('GH')
      const hasStandard = methods.some(m => m.id === 'standard')
      const hasExpress = methods.some(m => m.id === 'express')
      expect(hasStandard).toBe(true)
      expect(hasExpress).toBe(true)
    })

    it('adjusts for international shipping', () => {
      const domestic = getShippingMethods('GH')
      const international = getShippingMethods('US')
      expect(international[0].price).toBeGreaterThan(domestic[0].price)
    })
  })

  describe('estimateDelivery', () => {
    it('estimates delivery date for standard shipping', () => {
      const estimate = estimateDelivery('standard', 'GH')
      expect(estimate).toHaveProperty('min')
      expect(estimate).toHaveProperty('max')
      expect(estimate.max).toBeGreaterThan(estimate.min)
    })

    it('estimates faster delivery for express', () => {
      const standard = estimateDelivery('standard', 'GH')
      const express = estimateDelivery('express', 'GH')
      expect(express.max).toBeLessThan(standard.max)
    })

    it('adds days for international shipping', () => {
      const domestic = estimateDelivery('standard', 'GH')
      const international = estimateDelivery('standard', 'US')
      expect(international.max).toBeGreaterThan(domestic.max)
    })
  })
})
