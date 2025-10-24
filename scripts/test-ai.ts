#!/usr/bin/env tsx
/**
 * Quick test to verify Gemini API is working
 * Usage: npx tsx scripts/test-ai.ts
 */

import { geminiService } from '../lib/ai/gemini-service'

async function testAI() {
  console.log('🧪 Testing Gemini AI API...\n')
  
  // Check if API key is set
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY
  if (!apiKey) {
    console.error('❌ ERROR: No API key found!')
    console.error('   Set GEMINI_API_KEY or GOOGLE_AI_API_KEY in .env\n')
    console.log('Get your free key: https://aistudio.google.com/app/apikey')
    process.exit(1)
  }
  
  console.log('✅ API key found:', apiKey.substring(0, 10) + '...')
  console.log('📡 Testing translation...\n')
  
  try {
    const result = await geminiService.generateText(
      'Translate this text from English to Spanish: Hello, world!'
    )
    
    if (result.success) {
      console.log('✅ SUCCESS! Translation works!')
      console.log('   Result:', result.data)
      console.log('   Model:', result.model)
      console.log('\n🎉 Your Gemini API is configured correctly!')
      console.log('   You can now run: pnpm i18n:seed\n')
    } else {
      console.error('❌ FAILED! Translation returned error:')
      console.error('   ', result.error)
      console.log('\n🔍 Possible causes:')
      console.log('   - Invalid API key')
      console.log('   - API key doesn\'t have Gemini access')
      console.log('   - Network issues')
      console.log('   - Rate limit exceeded\n')
    }
  } catch (error: any) {
    console.error('❌ EXCEPTION:', error.message)
    console.log('\n🔍 Check:')
    console.log('   1. API key is correct')
    console.log('   2. Internet connection is working')
    console.log('   3. No firewall blocking requests\n')
  }
}

testAI()
