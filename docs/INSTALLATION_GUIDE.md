# Trendify - Installation Guide

**Status:** Week 1 Implementation Complete ✅  
**Issue:** Package manager not found - Need to install Node.js first

---

## 🔧 Prerequisites Installation

### Step 1: Install Node.js (Required)

You need Node.js 18 or later. Choose one method:

#### Option A: Using nvm (Recommended)

```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Reload shell
source ~/.bashrc  # or source ~/.zshrc

# Install Node.js LTS
nvm install 20
nvm use 20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

#### Option B: Direct Download

Visit: https://nodejs.org/en/download/  
Download and install Node.js 20 LTS for your system.

#### Option C: Using apt (Ubuntu/Debian)

```bash
# Update package list
sudo apt update

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version
npm --version
```

---

## 📦 Step 2: Install Dependencies

Once Node.js is installed, run:

```bash
# Navigate to project
cd /home/rseann/projects/Nextjs/trendify

# Install dependencies (this will fix the peer dependency issue)
npm install

# Install new packages
npm install pino pino-pretty nanoid

# Or install everything at once
npm install
```

**Note:** I've already updated Next.js to 14.2.25+ in `package.json` to fix the Clerk compatibility issue.

---

## 🗄️ Step 3: Database Setup

### Option 1: Use Existing Database

If you already have a PostgreSQL database:

```bash
# Make sure DATABASE_URL is in .env
# Format: postgresql://username:password@localhost:5432/trendify

# Generate Prisma Client
npx prisma generate

# Apply migrations
npx prisma migrate deploy
```

### Option 2: Setup New Database

```bash
# Install PostgreSQL (Ubuntu)
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql
postgres=# CREATE DATABASE trendify;
postgres=# CREATE USER trendify_user WITH PASSWORD 'your_password';
postgres=# GRANT ALL PRIVILEGES ON DATABASE trendify TO trendify_user;
postgres=# \q

# Add to .env
echo 'DATABASE_URL="postgresql://trendify_user:your_password@localhost:5432/trendify"' >> .env
```

---

## 🔄 Step 4: Redis Setup

### Option 1: Use Upstash (Free Cloud Redis)

1. Go to https://upstash.com
2. Create account and new database
3. Copy the Redis URL
4. Add to `.env`:
```bash
VALKEY_URL="redis://your-upstash-url"
```

### Option 2: Local Redis

```bash
# Install Redis (Ubuntu)
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Test
redis-cli ping  # Should return PONG

# Add to .env
echo 'VALKEY_URL="redis://localhost:6379"' >> .env
```

---

## ⚙️ Step 5: Configure Environment Variables

```bash
# Copy template
cp env.example.txt .env

# Edit with your values
nano .env

# REQUIRED variables:
# DATABASE_URL - PostgreSQL connection string
# VALKEY_URL - Redis connection string
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - From clerk.com
# CLERK_SECRET_KEY - From clerk.com
# CRON_SECRET - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚀 Step 6: Run Application

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start development server
npm run dev
```

Visit: http://localhost:3000

---

## ✅ Verification

Run these commands to verify everything is working:

```bash
# 1. Check Node.js version
node --version
# Expected: v18.x.x or v20.x.x

# 2. Check npm
npm --version
# Expected: 9.x.x or 10.x.x

# 3. Check database connection
npx prisma db pull
# Should connect successfully

# 4. Check Redis
redis-cli ping
# Expected: PONG

# 5. Type check
npm run type-check
# Should complete without errors

# 6. Build
npm run build
# Should succeed
```

---

## 🧪 Test New Features

Once everything is running:

### Test Guest Checkout

```bash
curl -X POST http://localhost:3000/api/checkout/guest \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "items": [{"productId": "test-product-id", "quantity": 1}],
    "shippingAddress": {
      "fullName": "John Doe",
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "US",
      "phone": "5555555555"
    }
  }'
```

### Test Stock Alerts

```bash
curl -X POST http://localhost:3000/api/stock-alerts \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "productId": "test-product-id"
  }'
```

### Test SEO

```bash
curl http://localhost:3000/sitemap.xml
curl http://localhost:3000/robots.txt
```

---

## 🚨 Troubleshooting

### Issue: "npm: command not found"

**Solution:** Install Node.js using one of the methods above.

### Issue: "Error: Cannot find module 'next'"

**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Prisma errors

**Solution:**
```bash
# Reset and regenerate
npx prisma generate
npx prisma migrate reset  # Development only!
npx prisma migrate deploy
```

### Issue: Redis connection failed

**Solution:**
```bash
# Check if Redis is running
redis-cli ping

# If not, start it
sudo systemctl start redis-server

# Or use Upstash cloud Redis
```

### Issue: Port 3000 already in use

**Solution:**
```bash
# Kill process using port 3000
kill $(lsof -t -i:3000)

# Or use different port
PORT=3001 npm run dev
```

---

## 📊 What's Changed

### Package.json Updates

**Added dependencies:**
```json
{
  "pino": "^8.17.2",
  "pino-pretty": "^10.3.1",
  "nanoid": "^5.0.4"
}
```

**Updated:**
```json
{
  "next": "^14.2.25"  // Was 14.2.16
}
```

**Added scripts:**
```json
{
  "lint": "next lint",
  "lint:fix": "next lint --fix",
  "type-check": "tsc --noEmit",
  "db:migrate": "prisma migrate dev",
  "db:push": "prisma db push",
  "db:studio": "prisma studio"
}
```

### Database Schema Updates

**New tables:**
- `guest_sessions` - Guest checkout support
- `stock_alerts` - Stock notification system
- `abandoned_carts` - Cart recovery tracking
- `returns` - Returns management

---

## 📈 Implementation Summary

### ✅ Completed (Week 1)

1. Removed test files (security fix)
2. Fixed rate limiting (Redis-based)
3. Added structured logging (Pino)
4. Created guest checkout API
5. Built stock alert system
6. Implemented abandoned cart tracking
7. Added SEO optimization (sitemap + robots)
8. Set up cron infrastructure

### ⏳ Next Steps (Week 2)

1. Get Sentry account for error tracking
2. Get Resend API key for emails
3. Create email templates
4. Test all new endpoints
5. Deploy to staging

---

## 🎯 Success Criteria

After installation, you should be able to:

- ✅ Start dev server without errors
- ✅ Access http://localhost:3000
- ✅ Call guest checkout API
- ✅ Call stock alerts API
- ✅ View sitemap.xml
- ✅ View robots.txt
- ✅ See structured logs in console
- ✅ Rate limiting works (429 on 6th request)

---

## 📚 Additional Resources

- [Node.js Official Docs](https://nodejs.org/docs)
- [npm Documentation](https://docs.npmjs.com/)
- [Prisma Setup Guide](https://www.prisma.io/docs/getting-started)
- [Redis Installation](https://redis.io/docs/getting-started/installation/)
- [Upstash Redis](https://upstash.com/docs/redis)

---

## 🆘 Need Help?

**Quick command reference:**

```bash
# Install everything
npm install

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint

# Build for production
npm run build

# View database
npx prisma studio
```

---

**Last Updated:** October 21, 2025  
**Status:** Ready for installation once Node.js is available
