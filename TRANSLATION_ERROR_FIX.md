# 🔴 Translation Seeding Failing - Quick Fix

## What You're Seeing

```
✅ FR: 1 translations saved
⚠️  98 translations failed
```

Most translations are failing. This means the Gemini AI API is not working.

## 🔍 Step 1: Test Your API Key

Run this command to test if Gemini API is configured correctly:

```bash
pnpm i18n:test
```

### Expected Output (if working):
```
✅ API key found: AIzaSyBXXX...
📡 Testing translation...
✅ SUCCESS! Translation works!
   Result: ¡Hola, mundo!
🎉 Your Gemini API is configured correctly!
```

### If You See Errors:

#### Error: "No API key found"
```bash
# Add to .env.local (create if doesn't exist)
echo "GEMINI_API_KEY=your_actual_key_here" >> .env.local

# Restart dev server
# Ctrl+C, then:
pnpm dev
```

Get your free API key: https://aistudio.google.com/app/apikey

#### Error: "AI service not configured"
- Your API key is invalid or expired
- Get a new key from: https://aistudio.google.com/app/apikey
- Make sure to copy the entire key

#### Error: "Rate limit exceeded"
- Free tier has limits (50 requests/minute)
- Wait a minute and try again
- Or upgrade to paid tier

#### Error: Network/Connection issues
- Check your internet connection
- Check if firewall is blocking Google AI Studio
- Try: `curl https://generativelanguage.googleapis.com`

## 🔧 Step 2: Check Server Logs

Look at your terminal where `pnpm dev` is running. You should see detailed errors like:

```
[i18n] Translation failed for key "home.hero.title" (fr): AI service not configured
```

This tells you exactly what's wrong.

## ✅ Step 3: After Fixing API Key

1. **Stop the seed script** (Ctrl+C if still running)
2. **Restart dev server**:
   ```bash
   # Terminal 1: Stop with Ctrl+C, then:
   pnpm dev
   ```
3. **Test AI again**:
   ```bash
   pnpm i18n:test
   ```
4. **If test passes, run seed again**:
   ```bash
   pnpm i18n:seed
   ```

## 📊 Expected Success Output

When working correctly, you should see:

```
🌍 Seeding translations for: FR
✅ FR: 127 translations saved

🌍 Seeding translations for: ES  
✅ ES: 127 translations saved

🌍 Seeding translations for: ZH
✅ ZH: 127 translations saved
```

## 🎯 Quick Checklist

- [ ] API key added to `.env.local`
- [ ] Dev server restarted after adding key
- [ ] `pnpm i18n:test` shows success
- [ ] Server logs show no errors
- [ ] Re-run `pnpm i18n:seed`

## 💡 Alternative: Use Without AI (Temporary)

If you can't get Gemini API working right now, you can:

1. **Use English everywhere** - Just don't switch languages yet
2. **Manually edit cache files** - Edit `lib/i18n/cache/es.json` etc. with translations
3. **Skip seeding** - Translations will show English fallback (still works, just not translated)

## 🆘 Still Not Working?

Check these files for errors:
1. `lib/ai/gemini-service.ts` - Should show API key warning if not set
2. Terminal with `pnpm dev` - Shows detailed errors
3. Browser console - May show network errors

### Common Mistakes:

1. **Typo in .env.local**:
   ```bash
   # WRONG:
   GEMENI_API_KEY=xxx  # Typo in GEMINI
   
   # CORRECT:
   GEMINI_API_KEY=xxx
   ```

2. **API key has quotes**:
   ```bash
   # WRONG:
   GEMINI_API_KEY="AIzaSy..."  # Remove quotes
   
   # CORRECT:
   GEMINI_API_KEY=AIzaSy...
   ```

3. **Wrong .env file**:
   - Use `.env.local` (not `.env`)
   - File must be in project root (next to package.json)

## 📝 Verify API Key Format

Gemini API keys look like:
```
AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

- Starts with `AIzaSy`
- About 39 characters long
- Only letters, numbers, and dashes

If yours looks different, it might be wrong.

## ✨ Success Checklist

Once everything works, you should be able to:
- [ ] Switch to Spanish in dropdown
- [ ] See translated text (not raw keys)
- [ ] Visit `/es/...` routes with translated content
- [ ] Run `pnpm i18n:status` shows 100% for all locales

---

**Next Step**: Run `pnpm i18n:test` and follow the output instructions.
