# API Routes Required

POST /api/order/create
- Role: STUDENT
- Calculates commission
- Creates order with PAYMENT_PENDING

POST /api/payment/create
- Role: STUDENT
- Creates Razorpay order
- Returns Razorpay order ID

POST /api/payment/verify
- Role: STUDENT
- Verifies signature
- Updates order to PAID

GET /api/vendor/orders
- Role: VENDOR
- Fetch vendor orders

PATCH /api/vendor/order-status
- Role: VENDOR
- Accept / Reject / Ready / Complete

GET /api/admin/metrics
- Role: ADMIN
- Revenue summary
- Order stats
- Vendor payout summary
