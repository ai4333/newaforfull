import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

function getAdminEmails() {
    const raw = process.env.ADMIN_EMAILS || "";
    return raw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

function isAdminAllowlisted(email?: string | null) {
    if (!email) return false;
    return getAdminEmails().includes(email.toLowerCase());
}

export const authConfig = {
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id ?? token.id;
                const incomingRole = (user as { role?: string } | undefined)?.role;
                if (incomingRole) {
                    token.role = incomingRole;
                }
            }

            if (isAdminAllowlisted(typeof token.email === "string" ? token.email : null)) {
                token.role = "ADMIN";
            } else if (token.role === "ADMIN") {
                token.role = "STUDENT";
            } else if (!token.role) {
                token.role = "STUDENT";
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = (token.id as string) || (token.sub as string);
                session.user.role = token.role as "STUDENT" | "VENDOR" | "ADMIN";
            }
            return session;
        },
    },
} satisfies NextAuthConfig;
