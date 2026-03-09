# 🌐 GoDaddy Domain Setup Guide

Since you've bought your domain on GoDaddy, you need to configure the DNS records to point to your hosting provider (e.g., Vercel, Netlify, or AWS).

## 1. Primary Domain Setup
In your GoDaddy DNS Management console, you will typically need two records for the main site:

| Type | Name | Value |
| :--- | :--- | :--- |
| **A** | `@` | [IP Address from your host] |
| **CNAME** | `www` | [Your host's designated domain] |

## 2. Admin Subdomain Setup (CRITICAL)
Your app's security and routing rely on the `admin` subdomain. You **MUST** create a CNAME record for this:

| Type | Name | Value |
| :--- | :--- | :--- |
| **CNAME** | `admin` | [Same value as your 'www' record] |

## 3. Redirects
- Ensure that `yourdomain.com` and `www.yourdomain.com` both point to the same app.
- Ensure `admin.yourdomain.com` also points to the same app. The **Middleware** I wrote will handle the internal switching based on the URL.

---

## 🔑 Deployment Steps
1. **Host the App**: Push your code to Vercel or your chosen host.
2. **Add Domains in Host**: In your host's dashboard, add:
   - `yourdomain.com`
   - `admin.yourdomain.com`
3. **Update `.env`**: Once live, change `NEXTAUTH_URL` in your `.env` to `https://yourdomain.com`.
4. **Google Console**: Add `https://yourdomain.com/api/auth/callback/google` and `https://admin.yourdomain.com/api/auth/callback/google` to your Authorized Redirect URIs.
