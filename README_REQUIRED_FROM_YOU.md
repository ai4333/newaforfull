# AforPrint - Required Inputs From You

This file lists everything needed from you to complete and launch the project.

## 1) Environment Variables (.env)

Set these values in your local/prod `.env` file:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_STORAGE_BUCKET` (optional, defaults to `order-files`)

Important:
- Never commit `.env`.
- Never share secrets in chat/messages.

## 2) Google OAuth Setup

In Google Cloud Console:

- Create OAuth credentials (Web application).
- Add redirect URI:
  - `http://localhost:3000/api/auth/callback/google`
- Add production redirect URI later for your live domain.
- Ensure consent screen is configured.

## 3) Supabase Setup

- Ensure PostgreSQL project is active.
- Ensure storage bucket exists (default: `order-files`).
- Verify service role key and anon key are correct.

## 4) Razorpay Setup

- Provide valid test/live keys.
- Keep secret key server-only.
- Confirm account is active for order creation + payment verification flow.

## 5) Upstash Redis Setup

- Provide REST URL + token.
- This is required for API rate-limiting in production.

## 6) Database Schema Sync (One-time)

Run these commands after `.env` is set:

```bash
npx prisma db push
npx prisma generate
```

## 7) Final Verification You Should Run

```bash
npm install
npm run build
npm run dev
```

Then verify:

- Student login -> upload -> order -> payment -> order status.
- Vendor login -> orders -> status updates -> settings/pricing/inventory save.
- Admin login -> users moderation -> payouts -> order oversight + dispute notes.

## 8) Optional But Recommended

- Share final business rules if you want stricter enforcement:
  - dispute resolution policy
  - cancellation policy
  - payout schedule
