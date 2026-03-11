# System Repair Report

Date: 2026-03-09

## Objective

Stabilize and connect end-to-end platform flows across student onboarding, vendor onboarding and approvals, order lifecycle, admin controls, analytics, and auth hardening without redesigning the architecture.

## Implemented Changes

### 1) Student onboarding

- Added `StudentProfile` model and relation in Prisma schema.
- Added student profile API:
  - `GET /api/student/profile`
  - `PATCH /api/student/profile`
- Added student onboarding UI: `src/app/student/onboarding/page.tsx`.
- Updated role sync and student dashboard redirects to enforce onboarding completion before dashboard usage.

### 2) Vendor onboarding and approval workflow

- Added vendor onboarding fields to `VendorProfile`:
  - owner/contact/location/business/pricing/payment fields
- Added `VendorApprovalStatus` enum with:
  - `PENDING_APPROVAL`
  - `APPROVED`
  - `REJECTED`
- Added vendor onboarding API:
  - `GET /api/vendor/onboarding`
  - `PATCH /api/vendor/onboarding`
- Added vendor onboarding page: `src/app/auth/vendor-onboarding/page.tsx`.
- Enforced approval gate in vendor layout and role sync routing.
- Added admin vendor status update API: `PATCH /api/admin/vendors/status`.
- Added admin vendor approval UI action component: `src/components/admin/AdminVendorApprovalAction.tsx`.

### 3) Order schema and create flow hardening

- Added `DeliveryType` enum (`PICKUP`, `DELIVERY`).
- Added `PRINTING` to `OrderStatus` enum.
- Added order fields for lifecycle/spec completeness:
  - `binding`
  - `deliveryType`
- Updated order create API to accept and persist required order attributes.
- Updated student new-order client payload to include lifecycle-required fields.

### 4) Payment/order status lifecycle enforcement

- Updated payment create API to allow payment initiation only from `PAYMENT_PENDING`.
- Removed incorrect unconditional payment status reset behavior.
- Updated vendor/admin order status handling to include `PRINTING` transition path.
- Updated vendor orders UI to represent and trigger the updated flow.

Target lifecycle now enforced in code paths:

`PAYMENT_PENDING -> PAID -> ACCEPTED -> PRINTING -> READY -> COMPLETED`

With terminal failure path:

`REJECTED`

### 5) Admin visibility and control

- Expanded admin shops flow with approval-status actions.
- Added admin analytics API: `GET /api/admin/analytics` returning:
  - orders/day
  - revenue/day
  - active approved vendors
  - top vendors by order count
  - top colleges by student count
- Updated admin dashboard metrics and top-college computation.

### 6) Auth/session hardening and suspension enforcement

- Extended NextAuth session typing with `isSuspended`.
- Updated auth callbacks to carry suspension state through JWT/session.
- Added/used `requireActiveUser` guard for suspension-aware authorization in sensitive APIs.
- Added profile upserts in auth flows for student/vendor baseline profile creation.

### 7) File upload and role data route updates

- Updated supporting student/vendor/admin route logic to use stronger auth helpers and consistent access checks.
- Updated upload/order-related paths to align with revised order lifecycle and role expectations.

## Schema + Runtime Validation

### Prisma

- Ran `npx prisma db push` successfully.
- Ran `npx prisma generate` successfully.

### Build

- Ran `npm run build` successfully after repairs.
- App routes compile and render without TypeScript build errors.

## Known Follow-ups

1. Lint baseline remains noisy in UI files unrelated to this repair scope (existing unescaped apostrophe/quote text and some `any` usage).
2. Automated integration test suite is not yet present in this repository (`package.json` has no test script). Recommended to add API + flow integration tests next.

## Files Added in This Repair

- `docs/system-architecture.md`
- `docs/system-repair-report.md`
- `src/app/api/student/profile/route.ts`
- `src/app/student/onboarding/page.tsx`
- `src/app/api/vendor/onboarding/route.ts`
- `src/app/auth/vendor-onboarding/page.tsx`
- `src/app/api/admin/vendors/status/route.ts`
- `src/components/admin/AdminVendorApprovalAction.tsx`
- `src/app/api/admin/analytics/route.ts`

## Final Status

Core functional goals for onboarding, vendor approval gating, lifecycle-safe order progression, admin analytics/actionability, and schema synchronization are implemented and build-validated.
