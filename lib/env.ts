import { z } from "zod"

// Define environment variables schema
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1),

  // Upstash Redis
  UPSTASH_REDIS_REST_URL: z.string().min(1),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

  // Clerk Auth
  CLERK_SECRET_KEY: z.string().min(1),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1),

  // Appwrite
  NEXT_PUBLIC_APPWRITE_ENDPOINT: z.string().min(1),
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_APPWRITE_BUCKET_ID: z.string().min(1),

  // Webhook signing secret
  SIGNING_SECRET: z.string().min(1),

  // Optional: Stripe (for payment processing)
  STRIPE_SECRET_KEY: z.string().optional(),
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
})

// Parse and validate environment variables
const _env = envSchema.safeParse({
  DATABASE_URL: process.env.DATABASE_URL,
  UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
  UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  NEXT_PUBLIC_APPWRITE_ENDPOINT: process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT,
  NEXT_PUBLIC_APPWRITE_PROJECT_ID: process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID,
  NEXT_PUBLIC_APPWRITE_BUCKET_ID: process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID,
  SIGNING_SECRET: process.env.SIGNING_SECRET,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  NODE_ENV: process.env.NODE_ENV,
})

// Handle validation errors
if (!_env.success) {
  console.error("❌ Invalid environment variables:", _env.error.format())
  throw new Error("Invalid environment variables")
}

// Export validated environment variables
export const env = _env.data
