import crypto from "crypto";

/**
 * FIXED COMMISSION MODEL (MVP v2)
 * Vendor commission: 11%
 * Student service fee: 11%
 */
const COMMISSION_RATE = 0.11;

export interface PriceBreakdown {
    baseAmount: number;      // Vendor base price
    studentFee: number;      // baseAmount * 0.11
    vendorFee: number;       // baseAmount * 0.11
    totalPaid: number;       // baseAmount + studentFee
    vendorEarning: number;   // baseAmount - vendorFee
    platformRevenue: number; // studentFee + vendorFee
}

/**
 * Calculates the full financial breakdown for an order.
 * This MUST only be called server-side.
 */
export function calculateOrderBreakdown(baseAmount: number): PriceBreakdown {
    const studentFee = parseFloat((baseAmount * COMMISSION_RATE).toFixed(2));
    const vendorFee = parseFloat((baseAmount * COMMISSION_RATE).toFixed(2));

    const totalPaid = parseFloat((baseAmount + studentFee).toFixed(2));
    const vendorEarning = parseFloat((baseAmount - vendorFee).toFixed(2));
    const platformRevenue = parseFloat((studentFee + vendorFee).toFixed(2));

    return {
        baseAmount,
        studentFee,
        vendorFee,
        totalPaid,
        vendorEarning,
        platformRevenue
    };
}

/**
 * Verifies the Razorpay payment signature using HMAC SHA256.
 * Mandatory for security in MVP v2.
 */
export function verifyRazorpaySignature(
    razorpayOrderId: string,
    razorpayPaymentId: string,
    signature: string,
    secret: string
): boolean {
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body.toString())
        .digest("hex");

    return expectedSignature === signature;
}
