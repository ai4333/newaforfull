# 🏛️ AforPrint: Project Manifesto (MVP v2)

This document serves as the official record of the AforPrint platform's journey, its technical foundation, and the premium design philosophy governing its development.

---

## 🛠️ Technology Stack (MVP v2 - Production Ready)
Our stack is now fully hardened for real-money transactions and production-scale security.

| Technology | Role | Rationale |
| :--- | :--- | :--- |
| **Next.js 16** | Core Engine | App Router & Turbopack provide cinematic speeds and modern SSR. |
| **TypeScript** | Language | Ensures zero runtime "undefined" errors across all business logic. |
| **Prisma 6** | ORM | PostgreSQL-backed management with a clear, readable schema. |
| **Auth.js v5** | Auth | Secure, modern way to handle Google OAuth 2.0 with mandatory DB syncing. |
| **Vanilla CSS** | Styling | Total control over the "Vintage Parchment" design; zero Tailwind bloat. |
| **PostgreSQL** | Database | Supabase-hosted reliable storage for production scale. |
| **Razorpay** | Payments | 11% fixed commission engine with HMAC SHA256 signature verification. |
| **SVG Icons** | Visuals | High-precision 2px stroke consistency for a mature aesthetic. |

---

## 🚀 Milestones & Progress (MVP v2 Upgrade)

### ✅ Phase 1: Foundation (COMPLETED)
- [x] Initial design system (Parchment, Ink, Wax Red) implemented.
- [x] Global typography engine (Fraunces, Lora, Outfit) integrated.

### ✅ Phase 2: User Interfaces (COMPLETED)
- [x] **Student Dashboard**: Edge-to-edge layout with information-dense activity cards.
- [x] **New Order Engine**: 4-step wizard with persistent live-summary sidebar.
- [x] **Vendor Console**: Operations suite for order processing, inventory, and analytics.
- [x] **Admin Dashboard**: Metrics visualization for campus performance.

### ✅ Phase 3: Intelligence & Security (COMPLETED)
- [x] **Google Login**: Full OAuth 2.0 integration via NextAuth.
- [x] **Persistence Strategy**: Database-backed sessions; the app "remembers" you via PostgreSQL.
- [x] **Admin Subdomain**: Isolated administrative tools on `admin.localhost` via Middleware.

### ✅ Phase 4: Production v2 Hardening (COMPLETED)
- [x] **PostgreSQL Migration**: Switched from SQLite to Production-Ready Postgres.
- [x] **Fixed Commission**: Implemented 11% Student Fee + 11% Vendor Commission logic.
- [x] **Payment Security**: Built HMAC SHA256 verification for Razorpay signatures.
- [x] **Granular Tracking**: Added models for `OrderFile`, `Payout`, and `PayoutStatus`.
- [x] **Documentation Suite**: Created `docs/production/` with non-negotiable security and deployment rules.

---

## 🏗️ Architectural Core

### 1. Data Persistence
Using **Prisma**, we've defined a robust schema in `prisma/schema.prisma` that covers:
- **Financial Details**: `baseAmount`, `studentFee`, `vendorFee`, `totalPaid`, `vendorEarning`, `platformRevenue`.
- **Payout Management**: Manual payout tracking for vendor earnings.
- **File Integrity**: Storage of Supabase signed URLs for order PDFs/Docs.

### 2. Isolated Security
- **Internal Rewrites**: `admin.localhost` maps to `/admin` internally.
- **HMAC Verification**: Signatures verified server-side with `crypto.createHmac`.

---

## 📂 Key File Map
- `src/middleware.ts`: Subdomain and access logic.
- `src/lib/payments.ts`: V2 Commission and HMAC verification engine.
- `docs/production/`: Full production-grade rule set.
- `prisma/schema.prisma`: Production PostgreSQL schema.
