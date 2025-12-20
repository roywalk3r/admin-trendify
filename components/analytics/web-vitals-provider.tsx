"use client"

import { useEffect } from 'react'
import { initPerformanceMonitoring } from '@/lib/performance/web-vitals'

interface WebVitalsProviderProps {
  children: React.ReactNode
}

export default function WebVitalsProvider({ children }: WebVitalsProviderProps) {
  useEffect(() => {
    // Initialize performance monitoring on client side only
    if (typeof window !== 'undefined') {
      initPerformanceMonitoring()
    }
  }, [])

  return <>{children}</>
}
