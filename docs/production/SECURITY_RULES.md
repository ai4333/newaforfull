# Security Rules (Non-Negotiable) - MVP v2

1. **Server-Side Truth**: All money calculations (fees, earnings, revenue) must happen only server-side.
2. **Zero Trust**: Never trust frontend for payment status. Verify with Razorpay.
3. **Hardened Verification**: Razorpay signature must be verified using `crypto.createHmac("sha256", RAZORPAY_KEY_SECRET)`.
4. **API Validation**: All API routes must:
   - Validate input with **Zod**.
   - Check session exists.
   - Verify user exists in Prisma DB.
   - Check role matches route (STUDENT/VENDOR/ADMIN).
5. **Isolation**: Admin routes must be strictly role protected and isolated via subdomains.
6. **Secret Management**: No sensitive keys (RAZORPAY_SECRET, UPSTASH_TOKEN) exposed to client.
7. **Rate Limiting**: Mandatory protection on:
   - `POST /api/order/create` (5/min)
   - `POST /api/payment/create` (5/min)
8. **Financial Integrity**: Use Prisma transactions for all financial updates.
9. **Audit Trail**: Store IP and detailed action in `ActivityLog`.
10. **Role Policing**: Never allow status change (e.g., PENDING -> PAID) without role verification.
