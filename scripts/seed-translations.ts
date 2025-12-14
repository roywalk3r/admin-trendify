#!/usr/bin/env tsx
/**
 * Script to pre-seed all translations for all locales
 * Usage: npx tsx scripts/seed-translations.ts
 */

const API_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
const locales = ['fr', 'es', 'zh', 'hi', 'ar'] // Skip 'en' as it's the source

async function seedLocale(locale: string) {
  console.log(`\n🌍 Seeding translations for: ${locale.toUpperCase()}`)
  
  try {
    const response = await fetch(`${API_URL}/api/i18n/preseed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetLang: locale, sourceLang: 'en' }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`HTTP ${response.status}: ${error}`)
    }

    const result = await response.json()
    console.log(`✅ ${locale.toUpperCase()}: ${result.successCount || result.count} translations saved`)
    if (result.failCount > 0) {
      console.warn(`⚠️  ${result.failCount} translations failed`)
    }
    return result
  } catch (error: any) {
    console.error(`❌ ${locale.toUpperCase()} failed:`, error.message)
    return null
  }
}

async function main() {
  console.log('🚀 Starting translation seeding for all locales...\n')
  console.log('⚙️  Target locales:', locales.join(', '))
  console.log('📡 API URL:', API_URL)
  console.log('=' .repeat(60))

  const results: Array<{ locale: string; result: any }> = []
  for (const locale of locales) {
    const result = await seedLocale(locale)
    results.push({ locale, result })
    // Small delay to avoid rate limits
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 Summary:')
  results.forEach(({ locale, result }) => {
    if (result) {
      console.log(`  ${locale}: ✅ ${result.successCount || result.count} translations`)
    } else {
      console.log(`  ${locale}: ❌ Failed`)
    }
  })
  console.log('\n✨ Done!')
}

main().catch(console.error)
