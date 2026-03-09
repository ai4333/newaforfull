# AforPrint Production Architecture

## Objective
Build a secure marketplace platform for campus printing with:
- Student login
- Vendor login
- Admin dashboard
- Razorpay payments
- 11% vendor commission
- 11% student service fee

## Infrastructure (FINAL)

Frontend + API:
- Next.js (App Router)
- Hosted on Vercel

Database:
- PostgreSQL (Supabase)

Storage:
- Supabase Storage (signed URLs only)

Authentication:
- Auth.js (Google OAuth)

Payments:
- Razorpay Orders API
- Backend signature verification

Rate Limiting:
- Upstash Redis

Validation:
- Zod

ORM:
- Prisma

## Deployment Rules

- No local SQLite in production
- All secrets in environment variables
- HTTPS enforced (Vercel default)
- No direct DB exposure
- No client-side amount calculation
