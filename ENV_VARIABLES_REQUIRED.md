# Required Environment Variables

Copy these to your `.env` file and fill in the values:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/trendify"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_xxxxx"
CLERK_SECRET_KEY="sk_test_xxxxx"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL="/"
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL="/"

# Clerk Webhook Secret (for user sync)
CLERK_WEBHOOK_SECRET="whsec_xxxxx"

# Appwrite (Media Storage)
NEXT_PUBLIC_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
NEXT_PUBLIC_APPWRITE_PROJECT_ID="your_project_id"
APPWRITE_API_KEY="your_api_key"
NEXT_PUBLIC_APPWRITE_BUCKET_ID="your_bucket_id"

# Arcjet (Bot Protection)
ARCJET_KEY="ajkey_xxxxx"

# Redis (Caching)
REDIS_URL="redis://localhost:6379"
# OR for Upstash Redis
# UPSTASH_REDIS_REST_URL="https://xxxxx.upstash.io"
# UPSTASH_REDIS_REST_TOKEN="xxxxx"

# Paystack Payment
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY="pk_test_xxxxx"
PAYSTACK_SECRET_KEY="sk_test_xxxxx"

# Stripe Payment (if adding)
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_xxxxx"
# STRIPE_SECRET_KEY="sk_test_xxxxx"
# STRIPE_WEBHOOK_SECRET="whsec_xxxxx"

# App URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

# Google AI (for chatbot/recommendations)
GOOGLE_AI_API_KEY="your_gemini_api_key"

# Email Service (choose one)
# SendGrid
# SENDGRID_API_KEY="SG.xxxxx"
# SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Mailgun
# MAILGUN_API_KEY="xxxxx"
# MAILGUN_DOMAIN="mg.yourdomain.com"

# Environment
NODE_ENV="development"

# Optional - for production monitoring
# SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
# SENTRY_AUTH_TOKEN="xxxxx"

# Optional - Analytics
# NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

## Production-Only Variables

Add these only in production:

```bash
# Production URLs
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_API_URL="https://yourdomain.com/api"

# Production Database (separate from development)
DATABASE_URL="postgresql://prod_user:prod_pass@prod-host:5432/trendify_prod"

# Error Tracking
SENTRY_DSN="https://xxxxx@sentry.io/xxxxx"
SENTRY_AUTH_TOKEN="xxxxx"
SENTRY_ORG="your-org"
SENTRY_PROJECT="trendify"

# Log Management (optional)
# DATADOG_API_KEY="xxxxx"
# LOGFLARE_API_KEY="xxxxx"
```

## Security Notes

1. **NEVER commit `.env` files to git** (already in .gitignore ✓)
2. **Use strong, unique passwords** for database and services
3. **Rotate secrets regularly** (every 90 days minimum)
4. **Use different credentials** for development, staging, and production
5. **Store production secrets** in a secure vault (Vercel env vars, AWS Secrets Manager, etc.)
6. **Audit git history** to ensure no secrets were ever committed
   ```bash
   git log -p | grep -E "DATABASE_URL|SECRET_KEY|API_KEY"
   ```

## Getting API Keys

### Clerk
1. Go to https://clerk.com
2. Create a new application
3. Copy the publishable and secret keys

### Appwrite
1. Go to https://appwrite.io
2. Create a new project
3. Create a storage bucket
4. Generate API key with appropriate permissions

### Arcjet
1. Go to https://arcjet.com
2. Create account and get API key

### Paystack
1. Go to https://paystack.com
2. Sign up and verify your account
3. Get test keys from dashboard

### Redis
- **Local:** Install Redis locally
- **Upstash:** https://upstash.com (free tier available)
- **Redis Cloud:** https://redis.com/cloud

### Google AI (Gemini)
1. Go to https://ai.google.dev
2. Generate API key

## Vercel Deployment

When deploying to Vercel, add all environment variables in:
**Project Settings → Environment Variables**

Separate configurations for:
- Production
- Preview
- Development
