# Security + Reliability Plan

Last updated: 2026-03-04

## Objective

Build AforPrint as a security-first, production-stable application with strict access control, safe payment handling, auditable actions, and graceful failure behavior.

## Threat Model (Practical)

- Unauthorized access to admin/vendor/student data.
- Order/payment tampering (amount/status/signature abuse).
- API abuse (spam, brute force, scripted calls).
- Data leaks from weak logs, weak error handling, or misconfigured secrets.
- Operational outages due to unhandled exceptions or external provider failures.

## Security Principles Being Enforced

1. **Deny by default**: every route checks auth + role.
2. **Server is source of truth**: all money/status logic server-side only.
3. **Strict input validation**: all mutation APIs validated with `zod`.
4. **Transition integrity**: finite-state transitions for order lifecycle.
5. **Rate limiting**: sensitive routes protected from abuse.
6. **Auditability**: action logs for critical operations.
7. **Least privilege secrets**: no secrets in client; env-only.

## Current Hardening Status

### Already Implemented
- Role-based auth checks across core APIs.
- Razorpay signature verification on payment confirm.
- Order status transition guards in vendor status API.
- Rate limiting utility integrated for critical payment/order routes.
- Activity logs for auth/order/payment/payout events.
- Server-side guarded student/vendor layouts.

### In This Security Sprint
- Patch any unguarded admin screens.
- Add rate limiting to remaining mutation APIs.
- Standardize robust error responses for external failures.

## Remaining Security Backlog (After Current Sprint)

1. Webhook-driven payment reconciliation (Razorpay webhook + replay protection).
2. CSRF strategy review for all state-changing browser calls.
3. Secure headers policy (CSP, HSTS, frame-ancestors, referrer policy).
4. Optional 2FA for admin role.
5. IP + device fingerprint enrichment in audit logs.
6. Background retry jobs for provider downtime (idempotent queue pattern).

## Reliability Controls

- Build must pass before each delivery.
- External API calls guarded with failure handling and safe user-facing messages.
- No irreversible operations without status checks.
- Idempotent behavior for payment verification and payout updates.

## Definition of "Production Safe" for this project

- All admin/vendor/student routes protected.
- No payment can be marked successful without valid signature.
- Invalid order status transitions are blocked.
- Sensitive mutations are rate-limited.
- Auditable trail exists for all critical actions.
- Build is green and app boots with valid env config.
