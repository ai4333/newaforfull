# AforPrint - The Ultimate Campus Printing Ecosystem 🖨️🎓

Welcome to the **AforPrint** project! This is a comprehensive, full-stack Next.js application designed to revolutionize how university students and campus print shops interact.

---

## 🌟 What is AforPrint?

AforPrint eliminates the need for students to wait in long lines at campus print shops with USB drives. 
Instead, they can upload their documents online, customize their print specifications (B&W, Color, Paper Type, Copies), pay securely via Razorpay, and track their order status in real-time.

It features three distinct portals:

1. **👨‍🎓 Student Portal**: Where users upload files, place orders, make payments, and track deliveries.
2. **🏪 Vendor (Print Shop) Portal**: Where shop owners receive orders, update statuses (Pending -> Printing -> Ready -> Delivered), manage pricing, and track their earnings.
3. **👑 Admin Dashboard**: A premium, "Vintage Parchment" styled control panel for platform owners to oversee all users, monitor platform revenue, resolve disputes, and manage payouts.

---

## 🏗️ Technical Architecture

This project is built using modern, industry-standard web technologies:

- **Framework**: [Next.js (App Router)](https://nextjs.org/) - Provides both the frontend React components and the backend API routes.
- **Database**: [PostgreSQL via Supabase](https://supabase.com/) - A robust relational database for storing users, orders, and shop profiles.
- **ORM**: [Prisma](https://www.prisma.io/) - The bridge between the JavaScript codebase and the PostgreSQL database.
- **Authentication**: [NextAuth.js (Auth.js)](https://authjs.dev/) - Handles secure login using Google OAuth.
- **Payments**: [Razorpay](https://razorpay.com/) - Secure payment gateway for Indian Rupees (₹).
- **Styling**: Vanilla CSS (`globals.css`) for absolute control, featuring a unified, premium "Vintage Parchment" aesthetic.

---

## 🛠️ How to Run the Project Locally

Follow these steps to get the platform running on your own machine.

### 1. Install Dependencies
Open your terminal in the project folder and run:
```bash
npm install
```

### 2. Configure Environment Variables
Ensure you have a `.env` file in the root directory. It must contain your active database connection and authentication secrets:
- `DATABASE_URL` (Points to Supabase)
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` (For Google Login)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` (For Payments)

### 3. Sync the Database
If you ever change the `schema.prisma` file, sync it with Supabase by running:
```bash
npx prisma db push
npx prisma generate
```

### 4. Start the Development Server
```bash
npm run dev
```
The platform will now be live on your computer.

---

## 🗺️ Platform Navigation Guide

Once the server is running (`npm run dev`), you can access the different parts of the application:

### Public Pages
- **Landing Page**: [http://localhost:3000](http://localhost:3000)
- **Login Portal**: [http://localhost:3000/auth/login](http://localhost:3000/auth/login)

### The Admin Dashboard 👑
You must be logged in with an account that has the `ADMIN` role in the database.
- **Overview Analytics**: [http://localhost:3000/admin/dashboard](http://localhost:3000/admin/dashboard)
- **User Registry**: [http://localhost:3000/admin/users](http://localhost:3000/admin/users)
- **Shop Management**: [http://localhost:3000/admin/shops](http://localhost:3000/admin/shops)
- **Order Oversight**: [http://localhost:3000/admin/orders](http://localhost:3000/admin/orders)
- **Logistics & Delivery**: [http://localhost:3000/admin/delivery](http://localhost:3000/admin/delivery)
- **File Storage**: [http://localhost:3000/admin/files](http://localhost:3000/admin/files)
- **Support & Disputes**: [http://localhost:3000/admin/support](http://localhost:3000/admin/support)
- **System Logs**: [http://localhost:3000/admin/logs](http://localhost:3000/admin/logs)

*(Note: While development allows `/admin/*` access directly on localhost, production environments require using the `admin.yourdomain.com` subdomain as configured in `src/middleware.ts`.)*

### Student Area 👨‍🎓
- **Place an Order**: [http://localhost:3000/student/new-order](http://localhost:3000/student/new-order)
- **Track Orders**: [http://localhost:3000/student/orders](http://localhost:3000/student/orders)

### Vendor Area 🏪
- **Incoming OrdersQueue**: [http://localhost:3000/vendor/orders](http://localhost:3000/vendor/orders)
- **Manage Pricing**: [http://localhost:3000/vendor/pricing](http://localhost:3000/vendor/pricing)
- **Track Earnings**: [http://localhost:3000/vendor/earnings](http://localhost:3000/vendor/earnings)

---

## 💡 Troubleshooting Common Issues

**"The Admin Dashboard shows $0 revenue and 0 users, but I know they exist!"**
- **Fix Applied**: This was a static caching issue. Next.js was caching the empty dashboard at build time. We have applied `export const dynamic = 'force-dynamic';` to all admin pages so they always fetch live data from the database.

**"Prisma throw a 'column does not exist' error."**
- **Fix**: Run `npx prisma db push` to push any new schema changes (like adding timestamps to vendors) to your Supabase PostgreSQL instance.

**"I can't access the Admin dashboard after logging in."**
- **Fix**: Your Google account must be manually designated as an ADMIN. Access your Supabase SQL editor and run `UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@gmail.com';`

---

## Next Steps for Production
1. Swap Razorpay Test keys for Live keys.
2. Deploy to Vercel (recommended for Next.js).
3. Connect your custom domain and configure the `admin.*` subdomain routing in your DNS.
