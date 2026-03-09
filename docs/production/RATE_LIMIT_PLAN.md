# Rate Limiting Plan - MVP v2

To prevent DDoS and financial spamming, the following limits must be applied using **Upstash Redis**:

## Critical Endpoints

### Order Creation
- **Target**: `POST /api/order/create`
- **Limit**: 5 per minute per user.
- **Action**: Return 429 Too Many Requests.

### Payment Initiation
- **Target**: `POST /api/payment/create`
- **Limit**: 5 per minute per user.
- **Action**: Return 429 Too Many Requests.

### Login Attempts
- **Target**: Auth.js sign-in page/callback.
- **Limit**: 5 attempts per minute per IP.

## Implementation Notes
- Use `@upstash/ratelimit` for serverless optimization on Vercel.
- Identity should be tracked via `session.user.id` for logged-in users and `req.ip` for public routes.
