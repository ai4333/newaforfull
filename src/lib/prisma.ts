import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

function withConnectionLimit(url?: string) {
    if (!url) return undefined;

    try {
        const parsed = new URL(url);
        if (!parsed.searchParams.get("connection_limit")) {
            parsed.searchParams.set("connection_limit", "1");
        }
        if (!parsed.searchParams.get("pool_timeout")) {
            parsed.searchParams.set("pool_timeout", "20");
        }
        return parsed.toString();
    } catch {
        return url;
    }
}

const datasourceUrl = withConnectionLimit(process.env.DATABASE_URL);

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
        datasourceUrl,
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
