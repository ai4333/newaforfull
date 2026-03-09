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

- `DATABASE_URL` (Your Supabase PostgreSQL Connection String)
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

---

## 5) Platform Access & Portals

### 👨‍🎓 Student Portal
- **Dashboard**: `http://localhost:3000/student/dashboard`
- **Place Order**: `http://localhost:3000/student/new-order`

### 🏪 Vendor Portal
- **Orders Queue**: `http://localhost:3000/vendor/orders`
- **Pricing Configuration**: `http://localhost:3000/vendor/pricing`

### 👑 Admin Permissions
To access the Admin Dashboard, your logged-in Google account **must** have the `ADMIN` role. 
If this is your first time logging in, go to your Supabase SQL Editor and run:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';
```

Then visit:
- **Admin Dashboard**: `http://localhost:3000/admin/dashboard`
*(Note: In production environments, admin access is restricted to the `admin.yourdomain.com` subdomain via `middleware.ts`, but in local development `localhost:3000/admin` is allowed for convenience).*

---

## 6) Quick Validation

Run a build check to ensure everything works before deploying:

```bash
npm run build
```

**Note on Payments:**
If your Razorpay keys are not set, the login and dashboard flows will still work perfectly, but the final payment checkout step will fail.
