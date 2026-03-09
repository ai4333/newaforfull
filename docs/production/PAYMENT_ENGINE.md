# Payment & Commission Engine - MVP v2

## Commission Model (FIXED)

- **Vendor commission**: 11%
- **Student service fee**: 11%

## Calculation Logic

All calculations are performed only on the server to prevent manipulation.

- `baseAmount` = Price set by the vendor for the specific job.
- `studentFee` = `baseAmount * 0.11`
- `vendorFee` = `baseAmount * 0.11`
- `totalPaid` = `baseAmount + studentFee` (What the student pays via Razorpay)
- `vendorEarning` = `baseAmount - vendorFee` (What the vendor receives)
- `platformRevenue` = `studentFee + vendorFee` (Total platform profit)

## Payment Flow (MANDATORY)

1. **Order Initiation**: Student creates order; server calculates all 5 amounts and stores them in Prisma.
2. **RZP Order**: Server creates a Razorpay Order and returns the ID.
3. **Payment Completion**: Student pays via Razorpay checkout.
4. **Signature Verification**: Server receives `razorpay_payment_id` and `razorpay_signature`; verifies them using **HMAC SHA256** and `RAZORPAY_KEY_SECRET`.
5. **Status Update**: Only upon successful verification, status is updated to `PAID`.
6. **Logging**: All verification attempts (success or failure) are logged in `ActivityLog`.
