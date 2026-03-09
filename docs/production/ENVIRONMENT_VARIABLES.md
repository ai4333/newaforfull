# Required Environment Variables - MVP v2

## Core
- `DATABASE_URL`: Supabase/PostgreSQL connection string.
- `NEXTAUTH_SECRET`: Used for session encryption.
- `NEXTAUTH_URL`: e.g., `http://localhost:3000`.

## Google OAuth
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

## Payments (Razorpay)
- `RAZORPAY_KEY_ID`: Your public key.
- `RAZORPAY_KEY_SECRET`: **MANDATORY** for HMAC verification.

## Protection (Upstash Redis)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

## File Storage (Supabase Storage)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_STORAGE_BUCKET` (optional, defaults to `order-files`)

---
> [!WARNING]
> NEVER expose `RAZORPAY_KEY_SECRET` or `UPSTASH` tokens to the client-side code (`use client` components or public API responses).
