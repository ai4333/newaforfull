# Deployment Checklist - MVP v2

1. **Database Migration**: Switch Prisma provider to `postgresql`.
2. **Schema Synchronization**: Run `npx prisma migrate deploy` for production database (Supabase).
3. **Environment Verification**: Ensure all IDs and secrets are correctly set in the Vercel dashboard.
4. **Security Audit**: Verify that `docs/production/SECURITY_RULES.md` are followed in all API routes.
5. **SSL/HTTPS**: Confirm HTTPS is enforced (default on Vercel).
6. **Payment Phase 1**: Test Razorpay in **Test Mode** with small amounts.
7. **Signature Check**: Verify that `ActivityLog` entries are created for successful payment signatures.
8. **Payment Phase 2**: Switch to **Live Mode** ONLY after 100% verification of HMAC logic.
9. **Log Management**: Disable `console.log` in production environment.
10. **Role Check**: Test a Student login to ensure they cannot access the `admin.*` subdomain.
