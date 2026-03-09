import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

function getAdminEmails() {
    const raw = process.env.ADMIN_EMAILS || "";
    return raw
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);
}

function shouldBeAdmin(email?: string | null) {
    if (!email) return false;
    return getAdminEmails().includes(email.toLowerCase());
}

import { authConfig } from "./auth.config";

export const { handlers, auth, signIn, signOut } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    callbacks: {
        ...authConfig.callbacks,
        async jwt({ token, user }) {
            if (user?.id) {
                token.id = user.id;
            }

            const userId = (token.id as string | undefined) ?? token.sub;
            if (!userId) {
                return token;
            }

            const dbUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { role: true, email: true },
            });

            if (dbUser) {
                token.id = userId;
                token.role = shouldBeAdmin(dbUser.email) ? "ADMIN" : dbUser.role;
            }

            return token;
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.id = ((token.id as string | undefined) ?? token.sub) as string;
                session.user.role = ((token.role as Role | undefined) ?? "STUDENT") as Role;
            }

            return session;
        },
        async signIn({ user, account }) {
            if (user.id) {
                const existingUser = await prisma.user.findUnique({ where: { id: user.id } });
                if (existingUser) {
                    const resolvedEmail = user.email ?? existingUser.email;
                    const role: Role = shouldBeAdmin(resolvedEmail) ? "ADMIN" : existingUser.role;

                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            name: user.name ?? existingUser.name,
                            image: user.image ?? existingUser.image,
                            email: resolvedEmail,
                            role,
                        },
                    });

                    await prisma.activityLog.create({
                        data: {
                            userId: user.id,
                            action: "LOGIN",
                            details: `Logged in via ${account?.provider}`,
                        },
                    });
                }
            }
            return true;
        },
    },
    events: {
        async createUser({ user }) {
            if (!user.id) {
                return;
            }

            if (shouldBeAdmin(user.email)) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { role: "ADMIN" },
                });
            }

            await prisma.activityLog.create({
                data: {
                    userId: user.id,
                    action: "USER_REGISTERED",
                    details: "Created account via Google OAuth",
                },
            });
        },
    },
});
