# AforPrint Quickstart 🚀

Use this guide for the fastest path to run and test the app locally.
For a complete architectural overview and project details, please read the main [README.md](./README.md).

---

## 1) Install Dependencies

```bash
npm install
```

## 2) Set Environment Variables

Create or update your `.env` file with the required keys:

- `DATABASE_URL` (Use Supabase Session Pooler URI for IPv4 compatibility)
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXTAUTH_SECRET` (Run `openssl rand -base64 32` to generate one)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `RAZORPAY_KEY_ID` (For Payments)
- `RAZORPAY_KEY_SECRET`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_STORAGE_BUCKET=order-files` (Optional)

## 3) Sync the Database

Ensure your Supabase database schema is up-to-date with your Prisma models:

```bash
npx prisma db push
npx prisma generate
```

## 4) Start the App

```bash
npm run dev
```

The app is now running! 
- **Main Home**: [http://localhost:3000](http://localhost:3000)
- **Login Portal**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)
- **Admin Login**: [http://localhost:3000/admin/login](http://localhost:3000/admin/login)
- **Admin Dashboard**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)

---

## 5) Platform Access & Portals

### 👨‍🎓 Student Portal
- **Dashboard**: `http://localhost:3000/student/dashboard`
- **Place Order**: `http://localhost:3000/student/new-order`

### 🏪 Vendor Portal
- **Orders Queue**: `http://localhost:3000/vendor/orders`
- **Pricing Configuration**: `http://localhost:3000/vendor/pricing`

### ADMIN ACCESS

Admin login page:

`http://localhost:3000/admin/login`

Only emails listed in `ADMIN_EMAILS` can access admin dashboard.

Example:

```env
ADMIN_EMAILS="admin@gmail.com"
```

Steps to enable admin locally:

1. Add your email to `ADMIN_EMAILS` in `.env`
2. Restart dev server
3. Login via `/admin/login`

Admin dashboard routes:

- `/admin/dashboard`
- `/admin/users`
- `/admin/orders`
- `/admin/shops`
- `/admin/payouts`

Normal users cannot access these pages.

---

## 6) Quick Validation

Run a build check to ensure everything works before deploying:

```bash
npm run build
```

Optional runtime checks:

```bash
npx prisma db pull --print
curl -i http://localhost:3000/admin/login
curl -i http://localhost:3000/api/auth/signin
```

If admin pages show empty blocks, verify these first:
- You are logged in with an allowlisted admin email from `ADMIN_EMAILS`
- Database connectivity is healthy (`npx prisma db pull --print` should succeed)
- You restarted the dev server after `.env` changes (`npm run dev`)

**Note on Payments:**
If your Razorpay keys are not set, the login and dashboard flows will still work perfectly, but the final payment checkout step will fail.
